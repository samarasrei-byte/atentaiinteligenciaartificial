import { Card, CardContent } from "@/components/ui/card";
import { Calculator, MessageCircle, Users, BookOpen, Shield, Zap, TrendingUp, Globe } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);

  return (
    <section ref={ref} className="py-20 md:py-32 overflow-hidden relative">
      {/* Parallax Background Elements */}
      <motion.div 
        className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        style={{ y: y1 }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none"
        style={{ y: y2 }}
      />
      
      <div ref={containerRef} className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ opacity }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Tudo que Você Precisa
            <span className="gradient-text"> em um Lugar</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas para entender, simular e se preparar para a maior 
            mudança tributária da história do Brasil.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <Card 
                variant="elevated"
                className="group hover:-translate-y-2 transition-all duration-500 h-full"
              >
                <CardContent className="p-6">
                  <motion.div 
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-medium`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
