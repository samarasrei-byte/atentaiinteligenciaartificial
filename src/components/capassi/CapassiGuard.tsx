import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const ALLOWED_EMAIL = 'cesas@atentai.com.br';

interface CapassiGuardProps {
  children: React.ReactNode;
}

export function CapassiGuard({ children }: CapassiGuardProps) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) { setTimedOut(false); return; }
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0F1A' }}>
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#55FFAA] mx-auto" />
          <p className="text-white/60 font-medium">Verificando acesso Capassi...</p>
        </div>
      </div>
    );
  }

  if (!user || user.email !== ALLOWED_EMAIL) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Also accept admin or equipe_cesar roles
  const hasAccess = hasRole('equipe_cesar') || hasRole('admin');
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
