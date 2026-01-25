import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/hooks/useAuditLog';

interface AffiliateProtectedRouteProps {
  children: React.ReactNode;
}

export function AffiliateProtectedRoute({ children }: AffiliateProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const [isAffiliate, setIsAffiliate] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const loggedRef = useRef(false);

  useEffect(() => {
    const checkAffiliateAccess = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        // Check if user has affiliate role OR has record in affiliates table
        if (hasRole('affiliate')) {
          setIsAffiliate(true);
          setIsChecking(false);
          return;
        }

        // Check affiliates table directly
        const { data, error } = await supabase
          .from('affiliates')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking affiliate status:', error);
          setIsAffiliate(false);
        } else {
          setIsAffiliate(!!data);
        }
      } catch (error) {
        console.error('Error checking affiliate access:', error);
        setIsAffiliate(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (!loading) {
      checkAffiliateAccess();
    }
  }, [user, loading, hasRole]);

  // Log access attempt once
  useEffect(() => {
    if (!isChecking && isAffiliate !== null && user && !loggedRef.current) {
      loggedRef.current = true;
      logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        actionType: isAffiliate ? 'route_access_allowed' : 'route_access_denied',
        routeAttempted: location.pathname,
        success: isAffiliate,
        failureReason: isAffiliate ? undefined : 'Not an affiliate',
        metadata: { access_type: 'affiliate_panel' }
      });
    }
  }, [isChecking, isAffiliate, user, location.pathname]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-white/60 font-medium">Verificando permissões de afiliado...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Not an affiliate - show access denied
  if (!isAffiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>
        
        <div className="relative z-10 max-w-md w-full">
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
              <ShieldX className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Acesso Restrito</h2>
            <p className="text-white/60 mb-6">
              Este painel é exclusivo para <strong className="text-white">Afiliados</strong> cadastrados.
            </p>
            <p className="text-sm text-white/40 mb-8">
              Você não possui cadastro como afiliado. Deseja se tornar um afiliado?
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full h-12 rounded-xl font-semibold bg-purple-600 hover:bg-purple-700">
                <Link to="/afiliado/cadastro">Cadastrar como Afiliado</Link>
              </Button>
              <Button variant="outline" asChild className="w-full h-12 rounded-xl border-white/20 text-white/80 hover:bg-white/10">
                <Link to="/dashboard">Ir para meu Painel</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full text-white/40 hover:text-white/60 hover:bg-white/5">
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
