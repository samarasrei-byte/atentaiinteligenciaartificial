import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Calculator, Briefcase, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserType = 'empresa' | 'autonomo' | 'contador';

interface UserTypeOption {
  type: UserType;
  title: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  route: string;
  gradient: string;
  iconBg: string;
}

const userTypeOptions: UserTypeOption[] = [
  {
    type: 'empresa',
    title: 'Empresa',
    description: 'MEI, ME, LTDA ou outra empresa',
    features: ['Simulador de impostos', 'Comparador de regimes', 'Consultoria especializada'],
    icon: Building2,
    route: '/onboarding',
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500/10 text-blue-500',
  },
  {
    type: 'autonomo',
    title: 'Autônomo',
    description: 'Profissional liberal ou freelancer',
    features: ['Análise PF vs PJ', 'Simulador MEI', 'Orientação tributária'],
    icon: Briefcase,
    route: '/autonomo-onboarding',
    gradient: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-500/10 text-purple-500',
  },
  {
    type: 'contador',
    title: 'Contador',
    description: 'Ofereça serviços na plataforma',
    features: ['Captação de clientes', 'Agenda integrada', 'Sistema de saques'],
    icon: Calculator,
    route: '/contador-onboarding',
    gradient: 'from-teal-500 to-emerald-500',
    iconBg: 'bg-teal-500/10 text-teal-500',
  },
];

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = React.useState<UserType | null>(null);

  const handleSelectType = (option: UserTypeOption) => {
    setSelectedType(option.type);
  };

  const handleContinue = () => {
    const option = userTypeOptions.find(o => o.type === selectedType);
    if (option) {
      sessionStorage.setItem('selectedUserType', option.type);
      navigate(option.route);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          {/* Title Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Começar é simples
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Qual é o seu perfil?
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Selecione a opção que melhor descreve você para personalizarmos sua experiência
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {userTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.type;
              
              return (
                <button
                  key={option.type}
                  onClick={() => handleSelectType(option)}
                  className={cn(
                    "relative text-left p-6 rounded-2xl border-2 transition-all duration-300",
                    "hover:shadow-lg hover:-translate-y-1",
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
                      <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative">
              <Button
                size="lg"
                disabled={!selectedType}
                onClick={handleContinue}
                className="w-full sm:w-auto min-w-[200px] h-12 text-base"
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              {!selectedType && (
                <p className="absolute -bottom-6 left-0 right-0 text-center text-xs text-muted-foreground">
                  Selecione um perfil acima
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              className="text-muted-foreground mt-4 sm:mt-0"
              onClick={() => navigate('/auth')}
            >
              Já tenho uma conta
            </Button>
          </div>
          
          {/* Quick links */}
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-3">Quer conhecer mais antes de começar?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="link" size="sm" onClick={() => navigate('/planos-perfil')}>
                Ver todos os planos
              </Button>
              <Button variant="link" size="sm" onClick={() => navigate('/faq')}>
                Perguntas frequentes
              </Button>
              <Button variant="link" size="sm" onClick={() => navigate('/servicos')}>
                Nossos serviços
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
