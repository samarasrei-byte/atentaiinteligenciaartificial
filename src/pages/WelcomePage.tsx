import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Calculator, Briefcase, ArrowRight, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ProfileType = 'empresa' | 'autonomo' | 'contador';

interface ProfileOption {
  type: ProfileType;
  role: 'user' | 'autonomo' | 'contador';
  title: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
}

const profileOptions: ProfileOption[] = [
  {
    type: 'empresa',
    role: 'user',
    title: 'Empresa',
    description: 'MEI, ME, LTDA ou outra empresa',
    features: ['Simulador de impostos', 'Comparador de regimes', 'Consultoria especializada'],
    icon: Building2,
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500/10 text-blue-500',
  },
  {
    type: 'autonomo',
    role: 'autonomo',
    title: 'Autônomo',
    description: 'Profissional liberal ou freelancer',
    features: ['Análise PF vs PJ', 'Simulador MEI', 'Orientação tributária'],
    icon: Briefcase,
    gradient: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-500/10 text-purple-500',
  },
  {
    type: 'contador',
    role: 'contador',
    title: 'Contador',
    description: 'Ofereça serviços na plataforma',
    features: ['Captação de clientes', 'Agenda integrada', 'Sistema de saques'],
    icon: Calculator,
    gradient: 'from-teal-500 to-emerald-500',
    iconBg: 'bg-teal-500/10 text-teal-500',
  },
];

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const handleSelectType = (option: ProfileOption) => {
    setSelectedType(option.type);
  };

  const handleActivateProfile = async () => {
    if (!selectedType || !user) return;
    
    const option = profileOptions.find(o => o.type === selectedType);
    if (!option) return;

    setIsActivating(true);

    try {
      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', option.role)
        .single();

      if (!existingRole) {
        // Add the role to user_roles table
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: option.role
          });

        if (error) throw error;
      }

      // Create profile data based on type
      if (option.type === 'autonomo') {
        const { data: existingProfile } = await supabase
          .from('autonomo_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('autonomo_profiles').insert({
            user_id: user.id,
          });
        }
      } else if (option.type === 'contador') {
        const { data: existingProfile } = await supabase
          .from('contador_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('contador_profiles').insert({
            user_id: user.id,
            available: false,
          });
        }
      }

      // Refresh user data to get new roles
      await refreshUserData();

      toast.success(`Perfil ${option.title} ativado com sucesso!`);

      // Navigate to the appropriate panel
      switch (option.type) {
        case 'empresa':
          navigate('/empresa');
          break;
        case 'autonomo':
          navigate('/autonomo');
          break;
        case 'contador':
          navigate('/contador');
          break;
      }
    } catch (error) {
      console.error('Error activating profile:', error);
      toast.error('Erro ao ativar perfil. Tente novamente.');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          {/* Title Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Bem-vindo ao AtentAI!
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Escolha seu perfil
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Selecione o tipo de perfil que deseja ativar para acessar recursos personalizados
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {profileOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.type;
              
              return (
                <button
                  key={option.type}
                  onClick={() => handleSelectType(option)}
                  disabled={isActivating}
                  className={cn(
                    "relative text-left p-6 rounded-2xl border-2 transition-all duration-300",
                    "hover:shadow-lg hover:-translate-y-1",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  {/* Selection Indicator */}
                  <div className={cn(
                    "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
                    option.iconBg
                  )}>
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {option.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isSelected ? "bg-primary" : "bg-muted-foreground/50"
                        )} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Button
                size="lg"
                disabled={!selectedType || isActivating}
                onClick={handleActivateProfile}
                className="w-full sm:w-auto min-w-[220px] h-12 text-base"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  <>
                    Ativar Perfil
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              {!selectedType && (
                <p className="absolute -bottom-6 left-0 right-0 text-center text-xs text-muted-foreground">
                  Selecione um perfil acima
                </p>
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Você pode adicionar outros perfis depois nas configurações
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
