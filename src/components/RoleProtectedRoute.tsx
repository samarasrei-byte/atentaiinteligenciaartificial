import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { logAuditEvent } from '@/hooks/useAuditLog';

type AppRole = 'admin' | 'contador' | 'autonomo' | 'user' | 'affiliate' | 'equipe_guilherme';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: AppRole;
}

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  contador: 'Contador',
  autonomo: 'Autônomo',
  user: 'Empresa',
  affiliate: 'Afiliado',
  equipe_guilherme: 'Equipe Guilherme'
};

export function RoleProtectedRoute({ children, requiredRole }: RoleProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const loggedRef = useRef(false);

  // Check if user has the required role OR is admin (admins can access all panels)
  // SPECIAL CASE: 'user' role (Empresa panel) is accessible to ALL authenticated users
  // This ensures anyone who logs in can access the basic empresa panel as a fallback
  // SPECIAL CASE: 'equipe_guilherme' can access admin panel (chat-only mode enforced by UI)
  const hasAccess = requiredRole === 'user' 
    ? !!user 
    : requiredRole === 'admin'
      ? (hasRole('admin') || hasRole('equipe_guilherme'))
      : (hasRole(requiredRole) || hasRole('admin'));

  // Log access attempt once
  useEffect(() => {
    if (!loading && user && !loggedRef.current) {
      loggedRef.current = true;
      logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        actionType: hasAccess ? 'route_access_allowed' : 'route_access_denied',
        routeAttempted: location.pathname,
        success: hasAccess,
        failureReason: hasAccess ? undefined : `Missing role: ${requiredRole}`,
        metadata: { required_role: requiredRole, user_roles: user.user_metadata }
      });
    }
  }, [loading, user, hasAccess, location.pathname, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-white/60 font-medium">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login
  if (!user) {
    // Admin routes go to dedicated admin login
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (!hasAccess) {
    // For admin routes, redirect to admin login so user can sign in with admin account
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>
        
        <div className="relative z-10 max-w-md w-full">
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6">
              <ShieldX className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Acesso Restrito</h2>
            <p className="text-white/60 mb-6">
              Este painel é exclusivo para usuários com perfil de <strong className="text-white">{roleLabels[requiredRole]}</strong>.
            </p>
            <p className="text-sm text-white/40 mb-8">
              Você não possui as permissões necessárias para acessar esta área.
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
