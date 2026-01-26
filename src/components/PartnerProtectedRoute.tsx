import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/hooks/useAuditLog';

interface PartnerProtectedRouteProps {
  children: React.ReactNode;
}

export function PartnerProtectedRoute({ children }: PartnerProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const [isPartner, setIsPartner] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const loggedRef = useRef(false);

  useEffect(() => {
    const checkPartnerAccess = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        // Admins can access partner panel
        if (hasRole('admin')) {
          setIsPartner(true);
          setIsChecking(false);
          return;
        }

        // Check credit_repair_partner_users table directly
        // NOTE: User can have multiple partner records - use .limit(1) to avoid errors
        const { data, error } = await supabase
          .from('credit_repair_partner_users')
          .select('partner_id')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking partner status:', error);
          setIsPartner(false);
        } else {
          // Data is an array - check if any records exist
          setIsPartner(Array.isArray(data) && data.length > 0);
        }
      } catch (error) {
        console.error('Error checking partner access:', error);
        setIsPartner(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (!loading) {
      checkPartnerAccess();
    }
  }, [user, loading, hasRole]);

  // Log access attempt once
  useEffect(() => {
    if (!isChecking && isPartner !== null && user && !loggedRef.current) {
      loggedRef.current = true;
      logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        actionType: isPartner ? 'route_access_allowed' : 'route_access_denied',
        routeAttempted: location.pathname,
        success: isPartner,
        failureReason: isPartner ? undefined : 'Not a partner',
        metadata: { access_type: 'partner_panel' }
      });
    }
  }, [isChecking, isPartner, user, location.pathname]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-white/60 font-medium">Verificando permissões de parceiro...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to partner login (dedicated login page)
  if (!user) {
    return <Navigate to="/parceiro/login" state={{ from: location }} replace />;
  }

  // Not a partner - show access denied
  if (!isPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>
        
        <div className="relative z-10 max-w-md w-full">
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
              <ShieldX className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Acesso Restrito</h2>
            <p className="text-white/60 mb-6">
              Este painel é exclusivo para <strong className="text-white">Parceiros</strong> autorizados.
            </p>
            <p className="text-sm text-white/40 mb-8">
              Sua conta não está vinculada a nenhum parceiro. Entre em contato com o administrador para receber um convite.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full h-12 rounded-xl font-semibold">
                <Link to="/dashboard">Ir para meu Painel</Link>
              </Button>
              <Button variant="outline" asChild className="w-full h-12 rounded-xl border-white/20 text-white/80 hover:bg-white/10">
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
