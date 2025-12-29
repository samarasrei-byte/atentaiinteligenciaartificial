import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/lib/stripe';

type AppRole = 'admin' | 'contador' | 'user' | 'autonomo';

interface SubscriptionInfo {
  subscribed: boolean;
  plan: PlanType | null;
  subscriptionEnd: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  profile: any | null;
  subscription: SubscriptionInfo;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  checkSubscription: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    subscribed: false,
    plan: null,
    subscriptionEnd: null,
  });

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesData) {
        setRoles(rolesData.map(r => r.role as AppRole));
      }

      // Fetch profile (0 rows should not throw)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Expose refresh function for after role changes
  const refreshUserData = async () => {
    if (user?.id) {
      await fetchUserData(user.id);
    }
  };

  const checkSubscription = async (retryCount = 0, maxRetries = 3): Promise<void> => {
    // Get fresh session to ensure we have valid token
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !currentSession?.access_token) {
      // If session not ready yet and we have retries left, wait and retry
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff: 1s, 2s, 4s (max 5s)
        console.log(`Session not ready, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return checkSubscription(retryCount + 1, maxRetries);
      }
      console.log('No valid session for subscription check after retries');
      setSubscription({ subscribed: false, plan: null, subscriptionEnd: null });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });
      
      if (error) {
        // If auth error and we have retries left, wait and retry
        if (error.message?.includes('Auth session missing') && retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`Auth session missing, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return checkSubscription(retryCount + 1, maxRetries);
        }
        
        // Don't log auth errors as they're expected during session transitions
        if (!error.message?.includes('Auth session missing')) {
          console.error('Error checking subscription:', error);
        }
        return;
      }

      if (data) {
        setSubscription({
          subscribed: data.subscribed || false,
          plan: data.plan || null,
          subscriptionEnd: data.subscription_end || null,
        });
      }
    } catch (error: any) {
      // Network or other transient errors - retry with backoff
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        console.log(`Subscription check failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return checkSubscription(retryCount + 1, maxRetries);
      }
      console.error('Error checking subscription after retries:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setRoles([]);
          setProfile(null);
          setSubscription({ subscribed: false, plan: null, subscriptionEnd: null });
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  // Check subscription when session changes
  useEffect(() => {
    if (session?.access_token) {
      checkSubscription();
    }
  }, [session]);

  // Refresh subscription periodically (every minute)
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [session]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setProfile(null);
    setSubscription({ subscribed: false, plan: null, subscriptionEnd: null });
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      roles,
      profile,
      subscription,
      signUp,
      signIn,
      signOut,
      hasRole,
      checkSubscription,
      refreshUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
