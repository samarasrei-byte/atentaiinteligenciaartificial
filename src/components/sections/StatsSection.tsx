import { Badge } from "@/components/ui/badge";
import { useScrollAnimation, useCountUp } from "@/hooks/useScrollAnimation";
import { Users, MessageSquare, TrendingUp, Building2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 text-center group"
    >
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        whileHover={{ opacity: 1 }}
      />
      
      <div className="relative z-10">
        <motion.div 
          className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Icon className={`h-8 w-8 ${stat.iconColor}`} />
        </motion.div>
        
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
    </motion.div>
  );
}

export function StatsSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.2 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section ref={ref} className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Parallax Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"
          style={{ y: y1 }}
        />
        <motion.div 
          className="absolute bottom-1/2 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]"
          style={{ y: y2 }}
        />
      </div>

      <div ref={containerRef} className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ scale }}
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Estatísticas
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Números que impressionam
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Veja o impacto do AtentAI na preparação para a reforma tributária
          </p>
        </motion.div>

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
