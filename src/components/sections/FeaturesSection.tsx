import { Card, CardContent } from "@/components/ui/card";
import { Calculator, MessageCircle, Users, BookOpen, Shield, Zap, TrendingUp, Globe } from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Simulador de Impostos",
    description: "Compare seus impostos antes e depois da reforma. Veja o impacto real no seu bolso.",
    color: "from-primary to-primary-glow",
  },
  {
    icon: MessageCircle,
    title: "IA Especializada",
    description: "Tire dúvidas instantaneamente com nossa inteligência artificial treinada na legislação.",
    color: "from-info to-info/80",
  },
  {
    icon: Users,
    title: "Contadores Experts",
    description: "Conecte-se com profissionais certificados para consultoria personalizada.",
    color: "from-accent to-accent/80",
  },
  {
    icon: BookOpen,
    title: "Base de Conhecimento",
    description: "FAQ completo e atualizado com as últimas informações oficiais da reforma.",
    color: "from-success to-success/80",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description: "Suas informações são protegidas com criptografia de ponta a ponta.",
    color: "from-secondary to-secondary/80",
  },
  {
    icon: Zap,
    title: "Respostas Instantâneas",
    description: "Resultados em segundos. Sem espera, sem burocracia, sem complicação.",
    color: "from-destructive to-destructive/80",
  },
  {
    icon: TrendingUp,
    title: "Planejamento Tributário",
    description: "Orientações para otimizar sua carga tributária dentro da lei.",
    color: "from-primary-glow to-primary",
  },
  {
    icon: Globe,
    title: "Sempre Atualizado",
    description: "Acompanhamos todas as mudanças na legislação em tempo real.",
    color: "from-info/80 to-info",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Tudo que Você Precisa
            <span className="gradient-text"> em um Lugar</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas para entender, simular e se preparar para a maior 
            mudança tributária da história do Brasil.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              variant="elevated"
              className="group hover:-translate-y-2 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-medium group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
