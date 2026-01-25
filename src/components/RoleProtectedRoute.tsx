import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { logAuditEvent } from '@/hooks/useAuditLog';

type AppRole = 'admin' | 'contador' | 'autonomo' | 'user' | 'affiliate';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: AppRole;
}

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  contador: 'Contador',
  autonomo: 'Autônomo',
  user: 'Empresa',
  affiliate: 'Afiliado'
};

export function RoleProtectedRoute({ children, requiredRole }: RoleProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const loggedRef = useRef(false);

  // Check if user has the required role OR is admin (admins can access all panels)
  const hasAccess = hasRole(requiredRole) || hasRole('admin');

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Este painel é exclusivo para usuários com perfil de <strong>{roleLabels[requiredRole]}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Você não possui as permissões necessárias para acessar esta área.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link to="/dashboard">Ir para meu Painel</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
