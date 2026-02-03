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
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
    isComingSoon: false,
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
    isComingSoon: false,
  },
  {
    type: 'contadores-ia',
    title: 'Em breve',
    subtitle: 'Contadores + IA',
    description: 'Uma nova experiência que combina a expertise de contadores com inteligência artificial para análises ainda mais precisas.',
    icon: Calculator,
    gradient: 'from-teal-500 to-emerald-500',
    bgGradient: 'from-teal-500/10 to-emerald-500/10',
    benefits: [
      { icon: Brain, text: 'IA avançada com supervisão humana' },
      { icon: Users, text: 'Acesso a rede de contadores especializados' },
      { icon: FileText, text: 'Análises fiscais automatizadas' },
      { icon: TrendingUp, text: 'Recomendações personalizadas' },
    ],
    cta: 'Em breve',
    route: '#',
    isComingSoon: true,
  },
];

export function ProfilesSection() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={containerRef} id="profiles" className="py-24 bg-background relative overflow-hidden">
      {/* Parallax Background */}
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"
        style={{ y: y1 }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"
        style={{ y: y2 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Soluções Personalizadas
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Uma plataforma para cada perfil
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Seja você empresário, autônomo ou contador, temos as ferramentas certas para te ajudar a navegar pela Reforma Tributária.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/planos-perfil')}
            className="border-primary text-primary hover:bg-primary/10"
          >
            Ver planos por perfil
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {profiles.map((profile, index) => {
            const Icon = profile.icon;
            
            return (
              <motion.div
                key={profile.type}
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ y: -10 }}
              >
                <Card className="relative overflow-hidden border-border/50 hover:border-border transition-all hover:shadow-xl group h-full">
                  {/* Background gradient */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${profile.bgGradient} opacity-50`}
                    whileHover={{ opacity: 0.7 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <CardHeader className="relative pb-4">
                    <motion.div 
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>
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
                      {profile.benefits.map((benefit, benefitIndex) => {
                        const BenefitIcon = benefit.icon;
                        return (
                          <motion.li 
                            key={benefitIndex} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + benefitIndex * 0.1 }}
                          >
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${profile.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <BenefitIcon className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm text-foreground">{benefit.text}</span>
                          </motion.li>
                        );
                      })}
                    </ul>

                    <Button
                      onClick={() => !profile.isComingSoon && navigate(profile.route)}
                      disabled={profile.isComingSoon}
                      className={`w-full bg-gradient-to-r ${profile.gradient} hover:opacity-90 text-white group/btn ${profile.isComingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {profile.cta}
                      {!profile.isComingSoon && (
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
