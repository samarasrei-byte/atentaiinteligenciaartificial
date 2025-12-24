import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Briefcase, 
  Calculator, 
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Brain,
  FileText,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const profiles = [
  {
    type: 'empresa',
    title: 'Para Empresas',
    subtitle: 'MEI, ME, LTDA, EPP e mais',
    description: 'Simule o impacto da reforma tributária na sua empresa e tome decisões estratégicas com base em dados precisos.',
    icon: Building2,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    benefits: [
      { icon: TrendingUp, text: 'Simulação de impacto nos impostos CBS e IBS' },
      { icon: Brain, text: 'IA especializada para dúvidas tributárias' },
      { icon: FileText, text: 'Comparativo entre regimes tributários' },
      { icon: Clock, text: 'Acompanhamento das mudanças legais' },
    ],
    cta: 'Simular Impostos',
    route: '/comecar',
  },
  {
    type: 'autonomo',
    title: 'Para Autônomos',
    subtitle: 'Profissionais liberais e freelancers',
    description: 'Descubra se vale a pena abrir uma empresa ou continuar como pessoa física com nossa análise personalizada.',
    icon: Briefcase,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    benefits: [
      { icon: CheckCircle, text: 'Análise PF vs PJ personalizada' },
      { icon: TrendingUp, text: 'Cálculo de economia real com abertura de empresa' },
      { icon: Shield, text: 'Recomendação de regime ideal (MEI, ME, etc.)' },
      { icon: Zap, text: 'Simulador específico para sua profissão' },
    ],
    cta: 'Fazer Análise',
    route: '/comecar',
  },
  {
    type: 'contador',
    title: 'Para Contadores',
    subtitle: 'Profissionais da contabilidade',
    description: 'Mantenha-se atualizado sobre a reforma tributária e ofereça consultoria especializada aos seus clientes.',
    icon: Calculator,
    gradient: 'from-teal-500 to-emerald-500',
    bgGradient: 'from-teal-500/10 to-emerald-500/10',
    benefits: [
      { icon: FileText, text: 'Atualizações legais em tempo real' },
      { icon: Users, text: 'Plataforma para atender clientes' },
      { icon: Brain, text: 'IA assistente para consultas rápidas' },
      { icon: TrendingUp, text: 'Ganhe por consulta realizada' },
    ],
    cta: 'Conhecer Plataforma',
    route: '/comecar',
  },
];

export function ProfilesSection() {
  const navigate = useNavigate();

  return (
    <section id="profiles" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Soluções Personalizadas
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Uma plataforma para cada perfil
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seja você empresário, autônomo ou contador, temos as ferramentas certas para te ajudar a navegar pela Reforma Tributária.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {profiles.map((profile) => {
            const Icon = profile.icon;
            
            return (
              <Card 
                key={profile.type}
                className="relative overflow-hidden border-border/50 hover:border-border transition-all hover:shadow-xl group"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${profile.bgGradient} opacity-50`} />
                
                <CardHeader className="relative pb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">{profile.title}</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium">
                    {profile.subtitle}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground mt-2">
                    {profile.description}
                  </p>
                </CardHeader>
                
                <CardContent className="relative space-y-6">
                  <ul className="space-y-3">
                    {profile.benefits.map((benefit, index) => {
                      const BenefitIcon = benefit.icon;
                      return (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${profile.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <BenefitIcon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-sm text-foreground">{benefit.text}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <Button
                    onClick={() => navigate(profile.route)}
                    className={`w-full bg-gradient-to-r ${profile.gradient} hover:opacity-90 text-white group/btn`}
                  >
                    {profile.cta}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
