import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Smart router that redirects users to their appropriate panel based on role:
 * - Admin → /admin
 * - Contador → /contador
 * - Autônomo → /autonomo
 * - Empresa (user default) → /empresa
 */
const DashboardRouter = () => {
  const navigate = useNavigate();
  const { user, loading, hasRole, roles } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Priority-based routing: admin > contador > autonomo > empresa
    if (hasRole('admin')) {
      navigate('/admin', { replace: true });
    } else if (hasRole('contador')) {
      navigate('/contador', { replace: true });
    } else if (hasRole('autonomo')) {
      navigate('/autonomo', { replace: true });
    } else {
      // Default to empresa panel for regular users
      navigate('/empresa', { replace: true });
    }
  }, [user, loading, hasRole, roles, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Redirecionando para seu painel...</p>
      </div>
    </div>
  );
};

export default DashboardRouter;
