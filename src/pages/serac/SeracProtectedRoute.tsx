import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function SeracProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B3A5C] to-[#2563EB] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B7280] text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/serac/login" replace />;
  }

  return <Outlet />;
}
