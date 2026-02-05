import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { logAuditEvent } from '@/hooks/useAuditLog';
import { isContadorEnabled } from '@/lib/featureFlags';

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms (${label})`));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) window.clearTimeout(timeoutId);
  }) as Promise<T>;
}

/**
 * Smart router that redirects users to their appropriate panel based on role:
 * - Admin → /admin
 * - Contador → /contador
 * - Autônomo → /autonomo
 * - Afiliado → /afiliado/painel
 * - Empresa (user default) → /empresa
 * 
 * Priority order ensures users with multiple roles go to the most appropriate panel.
 */
const DashboardRouter = () => {
  const navigate = useNavigate();
  const { user, loading, hasRole, roles, checkAffiliateStatus } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const hasNavigatedRef = useRef(false);
  const latestLoadingRef = useRef(loading);

  useEffect(() => {
    latestLoadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasNavigatedRef.current = false;

    const determineDestination = async () => {
      // If auth is still resolving, keep showing loading UI.
      // But never let it hang indefinitely.
      if (loading) {
        // Safety: if loading gets stuck, force the user back to auth after a short delay.
        window.setTimeout(() => {
          if (!hasNavigatedRef.current && latestLoadingRef.current) {
            hasNavigatedRef.current = true;
            navigate('/auth', { replace: true });
          }
        }, 10000);
        return;
      }
      
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      // FAST-TRACK: Admin users with admin role go directly to admin panel
      // This prevents unnecessary delays for known admin accounts
      if (hasRole('admin')) {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate('/admin', { replace: true });
        }
        return;
      }

      // FAST-TRACK: equipe_guilherme users go directly to admin (chat-only access)
      if (hasRole('equipe_guilherme')) {
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate('/admin?tab=chat', { replace: true });
        }
        return;
      }

      setIsChecking(true);

      try {
        // Global safety timeout to avoid infinite spinner
        await withTimeout(
          (async () => {
            // Check affiliate status (bounded)
            const isAffiliate = await withTimeout(checkAffiliateStatus(), 3000, 'checkAffiliateStatus');

            // Count special profiles (NOT including empresa/user as it's always available as fallback)
            // Note: admin and equipe_guilherme are handled via fast-track above, so they won't reach here
            let specialProfilesCount = 0;
            const availableProfiles: string[] = [];

            // Only count contador if feature is enabled
            if (isContadorEnabled() && hasRole('contador')) {
              specialProfilesCount++;
              availableProfiles.push('contador');
            }
            if (isAffiliate || hasRole('affiliate')) {
              specialProfilesCount++;
              availableProfiles.push('afiliado');
            }
            if (hasRole('autonomo')) {
              specialProfilesCount++;
              availableProfiles.push('autonomo');
            }
            
            // Add empresa as last option
            availableProfiles.push('empresa');

            // Log routing decision (fire-and-forget; never block routing)
            void withTimeout(
              logAuditEvent({
                userId: user.id,
                userEmail: user.email,
                actionType: 'dashboard_route',
                routeAttempted: '/dashboard',
                metadata: {
                  available_profiles: availableProfiles,
                  profile_count: specialProfilesCount,
                },
              }),
              1500,
              'logAuditEvent'
            ).catch(() => {
              // Intentionally ignore logging failures/timeouts
            });

            // If user has 2+ special profiles, go to profile selector to let them choose
            if (specialProfilesCount >= 2) {
              if (!hasNavigatedRef.current) {
                hasNavigatedRef.current = true;
                navigate('/selecionar-perfil', { replace: true });
              }
              return;
            }

            // Priority-based routing: contador > affiliate > autonomo > empresa
            // Note: admin is already handled via fast-track at the top
            
            // Only route to contador if feature is enabled
            if (isContadorEnabled() && hasRole('contador')) {
              if (!hasNavigatedRef.current) {
                hasNavigatedRef.current = true;
                navigate('/contador', { replace: true });
              }
              return;
            }

            if (isAffiliate || hasRole('affiliate')) {
              if (!hasNavigatedRef.current) {
                hasNavigatedRef.current = true;
                navigate('/afiliado/painel', { replace: true });
              }
              return;
            }

            if (hasRole('autonomo')) {
              if (!hasNavigatedRef.current) {
                hasNavigatedRef.current = true;
                navigate('/autonomo', { replace: true });
              }
              return;
            }

            // IMPORTANT: Never redirect existing users to /bem-vindo
            // The /bem-vindo page is only for brand-new signups that come from the Auth page
            // with a freshly created account (handled in Auth.tsx via selectedUserType).
            // For existing users logging in, we always send them to their panel directly.
            // This prevents the bug where clicking "Entrar" leads to the profile selection page.

            // Default user goes to empresa panel
            if (!hasNavigatedRef.current) {
              hasNavigatedRef.current = true;
              navigate('/empresa', { replace: true });
            }
          })(),
          8000,
          'determineDestination'
        );
      } catch (error) {
        console.error('Error determining destination:', error);
        if (!hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          navigate('/empresa', { replace: true });
        }
      } finally {
        setIsChecking(false);
      }
    };

    determineDestination();
  }, [user, loading, hasRole, roles, navigate, checkAffiliateStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-white/60 font-medium">
          {loading ? 'Carregando sua sessão...' : isChecking ? 'Redirecionando para seu painel...' : 'Quase lá...'}
        </p>
      </div>
    </div>
  );
};

export default DashboardRouter;
