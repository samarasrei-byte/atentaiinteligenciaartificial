import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function SeracLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
        return;
      }

      toast.success('Login realizado com sucesso!');
      navigate('/serac', { replace: true });
    } catch {
      toast.error('Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-8">
          {/* SERAC Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B3A5C] to-[#2563EB] flex items-center justify-center mb-4 shadow-md">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-[#1B3A5C] font-bold text-2xl tracking-tight">SERAC</h1>
            <p className="text-[#6B7280] text-sm mt-1">Intelligence Platform</p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E5E7EB] mb-6" />

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151]">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-[#D1D5DB] focus-visible:ring-[#2563EB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151]">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-[#D1D5DB] focus-visible:ring-[#2563EB] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-[#1B3A5C] to-[#2563EB] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar na Plataforma
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-[#E5E7EB]">
            <p className="text-[10px] text-[#9CA3AF] text-center">Powered by AtentAI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
