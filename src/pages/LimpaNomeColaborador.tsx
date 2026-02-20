import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { GuilhermeChatHub } from '@/components/admin/GuilhermeChatHub';

/**
 * Limpa Nome Colaborador - Painel dedicado para a equipe do Guilherme (equipe_guilherme)
 * Réplica exata do GuilhermeChatHub do admin, mas acessível via rota própria.
 */
export default function LimpaNomeColaborador() {
  const { user, loading: authLoading, hasRole } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <GuilhermeChatHub />
    </div>
  );
}
