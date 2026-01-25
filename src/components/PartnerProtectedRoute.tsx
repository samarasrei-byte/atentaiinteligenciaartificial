import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PartnerProtectedRouteProps {
  children: React.ReactNode;
}

export function PartnerProtectedRoute({ children }: PartnerProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const [isPartner, setIsPartner] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

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
        const { data, error } = await supabase
          .from('credit_repair_partner_users')
          .select('partner_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking partner status:', error);
          setIsPartner(false);
        } else {
          setIsPartner(!!data);
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

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando permissões de parceiro...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to partner login
  if (!user) {
    return <Navigate to="/parceiro/login" state={{ from: location }} replace />;
  }

  // Not a partner - show access denied
  if (!isPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Este painel é exclusivo para <strong>Parceiros</strong> autorizados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Sua conta não está vinculada a nenhum parceiro. Entre em contato com o administrador para receber um convite.
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
