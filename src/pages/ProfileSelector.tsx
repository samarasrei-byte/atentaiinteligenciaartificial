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
    const loadProfiles = async () => {
      if (loading) return;
      
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      setIsLoading(true);

      try {
        const [isAffiliate, isPartner] = await Promise.all([
          checkAffiliateStatus(),
          checkPartnerStatus()
        ]);

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
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, [user, loading, hasRole, navigate, checkAffiliateStatus, checkPartnerStatus]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-white/60">Carregando seus perfis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Selecionar Perfil</h1>
          </div>
          <p className="text-white/60">
            Você possui acesso a múltiplos perfis. Escolha qual deseja acessar:
          </p>
        </div>

        <div className="grid gap-4">
          {availableProfiles.map((profile) => (
            <Card 
              key={profile.id}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              onClick={() => handleSelectProfile(profile)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${profile.color} text-white`}>
                    {profile.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg text-white">
                        {profile.label}
                      </CardTitle>
                      <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                        Disponível
                      </Badge>
                    </div>
                    <CardDescription className="text-white/50 mt-1">
                      {profile.description}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white/60 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white/40 hover:text-white/60"
          >
            Voltar para o início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;
