import { Badge } from "@/components/ui/badge";
import { useScrollAnimation, useCountUp } from "@/hooks/useScrollAnimation";
import { Users, MessageSquare, TrendingUp, Building2 } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 12847,
    suffix: "+",
    label: "Usuários Ativos",
    description: "Profissionais utilizando a plataforma",
    gradient: "from-primary to-primary/70",
    bgGradient: "from-primary/10 to-primary/5",
    iconColor: "text-primary-foreground",
    accentColor: "text-primary"
  },
  {
    icon: MessageSquare,
    value: 247635,
    suffix: "+",
    label: "Consultas IA",
    description: "Perguntas respondidas pela IA",
    gradient: "from-accent to-accent/70",
    bgGradient: "from-accent/10 to-accent/5",
    iconColor: "text-accent-foreground",
    accentColor: "text-accent"
  },
  {
    icon: TrendingUp,
    value: 153,
    prefix: "R$",
    suffix: "M",
    label: "Economia Gerada",
    description: "Valor economizado pelos clientes",
    gradient: "from-success to-success/70",
    bgGradient: "from-success/10 to-success/5",
    iconColor: "text-success-foreground",
    accentColor: "text-success"
  },
  {
    icon: Building2,
    value: 2847,
    suffix: "+",
    label: "Empresas",
    description: "Empresas utilizando o simulador",
    gradient: "from-info to-info/70",
    bgGradient: "from-info/10 to-info/5",
    iconColor: "text-info-foreground",
    accentColor: "text-info"
  }
];

function StatCard({ stat, isVisible, index }: { 
  stat: typeof stats[0]; 
  isVisible: boolean;
  index: number;
}) {
  const count = useCountUp(stat.value, 2500, isVisible);
  const Icon = stat.icon;

  return (
    <div 
      className={`relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 text-center transition-all duration-700 hover:shadow-xl hover:scale-105 group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
      
      <div className="relative z-10">
        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className={`h-8 w-8 ${stat.iconColor}`} />
        </div>
        
        <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 tabular-nums">
          {stat.prefix && <span className={stat.accentColor}>{stat.prefix}</span>}
          <span className="inline-block min-w-[80px]">{count.toLocaleString('pt-BR')}</span>
          {stat.suffix && <span className={stat.accentColor}>{stat.suffix}</span>}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {stat.label}
        </h3>
        
        <p className="text-sm text-muted-foreground">
          {stat.description}
        </p>
      </div>
    </div>
  );
}

export function StatsSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/2 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Estatísticas
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Números que impressionam
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Veja o impacto do AtentAI na preparação para a reforma tributária
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard 
              key={stat.label} 
              stat={stat} 
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
