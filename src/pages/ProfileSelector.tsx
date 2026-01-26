import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Calculator, 
  Users, 
  Briefcase, 
  Building2, 
  User, 
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { logAuditEvent } from '@/hooks/useAuditLog';

interface ProfileOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  available: boolean;
}

const ProfileSelector = () => {
  const navigate = useNavigate();
  const { user, loading, hasRole, checkAffiliateStatus, checkPartnerStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [availableProfiles, setAvailableProfiles] = useState<ProfileOption[]>([]);

  useEffect(() => {
    let mounted = true;
    
    const loadProfiles = async () => {
      if (loading) return;
      
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      setIsLoading(true);

      try {
        // Run status checks with timeout to prevent hanging
        const checkWithTimeout = async <T,>(promise: Promise<T>, fallback: T, timeout = 5000): Promise<T> => {
          return Promise.race([
            promise,
            new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeout))
          ]);
        };

        const [isAffiliate, isPartner] = await Promise.all([
          checkWithTimeout(checkAffiliateStatus(), false),
          checkWithTimeout(checkPartnerStatus(), false)
        ]);

        if (!mounted) return;

        const profiles: ProfileOption[] = [];

        // Add available profiles based on roles
        if (hasRole('admin')) {
          profiles.push({
            id: 'admin',
            label: 'Administrador',
            description: 'Painel administrativo completo com métricas e gestão',
            icon: <Shield className="h-6 w-6" />,
            route: '/admin',
            color: 'bg-red-500',
            available: true
          });
        }

        if (hasRole('contador')) {
          profiles.push({
            id: 'contador',
            label: 'Contador',
            description: 'Gerenciamento de clientes e serviços contábeis',
            icon: <Calculator className="h-6 w-6" />,
            route: '/contador',
            color: 'bg-blue-500',
            available: true
          });
        }

        if (isPartner) {
          profiles.push({
            id: 'parceiro',
            label: 'Parceiro',
            description: 'Dashboard de parceiro com solicitações e comissões',
            icon: <Users className="h-6 w-6" />,
            route: '/parceiro',
            color: 'bg-emerald-500',
            available: true
          });
        }

        if (isAffiliate || hasRole('affiliate')) {
          profiles.push({
            id: 'afiliado',
            label: 'Afiliado',
            description: 'Painel de afiliados com links e comissões',
            icon: <Sparkles className="h-6 w-6" />,
            route: '/afiliado/painel',
            color: 'bg-purple-500',
            available: true
          });
        }

        if (hasRole('autonomo')) {
          profiles.push({
            id: 'autonomo',
            label: 'Autônomo',
            description: 'Simulador tributário e gestão financeira pessoal',
            icon: <Briefcase className="h-6 w-6" />,
            route: '/autonomo',
            color: 'bg-orange-500',
            available: true
          });
        }

        // Always add empresa/user option
        profiles.push({
          id: 'empresa',
          label: 'Empresa / Usuário',
          description: 'Acesse serviços, consultas e acompanhe suas solicitações',
          icon: <Building2 className="h-6 w-6" />,
          route: '/empresa',
          color: 'bg-slate-600',
          available: true
        });

        if (!mounted) return;
        setAvailableProfiles(profiles);

        // If only one profile, redirect directly
        if (profiles.length === 1) {
          await logAuditEvent({
            userId: user.id,
            userEmail: user.email,
            actionType: 'route_access_allowed',
            routeAttempted: profiles[0].route,
            metadata: { auto_redirect: true, profile: profiles[0].id }
          });
          navigate(profiles[0].route, { replace: true });
          return;
        }

      } catch (error) {
        console.error('Error loading profiles:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfiles();
    
    return () => {
      mounted = false;
    };
  }, [user, loading, hasRole, navigate]);

  const handleSelectProfile = async (profile: ProfileOption) => {
    await logAuditEvent({
      userId: user?.id,
      userEmail: user?.email,
      actionType: 'route_access_allowed',
      routeAttempted: profile.route,
      metadata: { profile_selected: profile.id, manual_selection: true }
    });
    navigate(profile.route, { replace: true });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-white/60 font-medium">Carregando seus perfis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-10">
          <img 
            src="/logo-atentai.png" 
            alt="AtentAI" 
            className="h-14 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Selecionar Perfil</h1>
          <p className="text-white/60 text-lg">
            Você possui acesso a múltiplos perfis. Escolha qual deseja acessar:
          </p>
        </div>

        <div className="grid gap-4">
          {availableProfiles.map((profile) => (
            <div 
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className="group relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${profile.color} text-white shadow-lg`}>
                  {profile.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {profile.label}
                    </h3>
                    <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                      Disponível
                    </Badge>
                  </div>
                  <p className="text-white/50 mt-1">
                    {profile.description}
                  </p>
                </div>
                <ChevronRight className="h-6 w-6 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white/40 hover:text-white/60 hover:bg-white/5"
          >
            Voltar para o início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;
