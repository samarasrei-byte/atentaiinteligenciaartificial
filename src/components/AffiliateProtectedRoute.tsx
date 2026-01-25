import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AffiliateProtectedRouteProps {
  children: React.ReactNode;
}

export function AffiliateProtectedRoute({ children }: AffiliateProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const [isAffiliate, setIsAffiliate] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

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

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando permissões de afiliado...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Este painel é exclusivo para <strong>Afiliados</strong> cadastrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Você não possui cadastro como afiliado. Deseja se tornar um afiliado?
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link to="/afiliado/cadastro">Cadastrar como Afiliado</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/dashboard">Ir para meu Painel</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
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
