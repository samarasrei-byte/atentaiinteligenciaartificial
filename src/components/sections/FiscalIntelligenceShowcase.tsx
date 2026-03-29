import { motion } from 'framer-motion';
import { 
  Calendar, ShieldCheck, TrendingUp, Landmark, 
  ArrowRight, Sparkles, Brain, ChevronRight,
  AlertTriangle, CheckCircle2, BarChart3, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const modules = [
  {
    icon: Calendar,
    title: 'Calendário Fiscal Inteligente',
    subtitle: 'Nunca mais perca um prazo',
    description: 'IA mapeia automaticamente todas as suas obrigações fiscais (DAS, IRPJ, CSLL, PIS, COFINS, FGTS) baseado no seu regime tributário. Alertas automáticos antes do vencimento.',
    features: ['Alertas automáticos', 'Multas calculadas', 'Por regime tributário'],
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/20',
    stat: '12+',
    statLabel: 'obrigações monitoradas',
  },
  {
    icon: ShieldCheck,
    title: 'Score Fiscal & Health Check',
    subtitle: 'Diagnóstico completo em segundos',
    description: 'Nota de 0 a 100 que avalia a saúde tributária da sua empresa em 8 fatores críticos. Recomendações personalizadas pela IA para melhorar seu score.',
    features: ['8 fatores analisados', 'Nota em tempo real', 'Recomendações IA'],
    gradient: 'from-emerald-500 to-green-500',
    bgGlow: 'bg-emerald-500/20',
    stat: '8',
    statLabel: 'fatores analisados',
  },
  {
    icon: TrendingUp,
    title: 'Projeção de Impostos 12 Meses',
    subtitle: 'Antecipe o futuro fiscal',
    description: 'Motor preditivo que projeta sua carga tributária para os próximos 12 meses com 3 cenários de crescimento. Visualize tendências e planeje com antecedência.',
    features: ['3 cenários', 'Sazonalidade por setor', 'Gráficos interativos'],
    gradient: 'from-violet-500 to-purple-500',
    bgGlow: 'bg-violet-500/20',
    stat: '3',
    statLabel: 'cenários de projeção',
  },
  {
    icon: Landmark,
    title: 'Radar Legislativo & Benchmark',
    subtitle: 'Reforma Tributária em tempo real',
    description: 'Monitoramento de mudanças na legislação (LC 214, Split Payment, IBS/CBS) e benchmark da sua carga tributária vs empresas do mesmo setor.',
    features: ['LC 214 monitorada', 'Benchmark setorial', 'Alertas de impacto'],
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/20',
    stat: '27',
    statLabel: 'setores comparados',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export function FiscalIntelligenceShowcase() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold">
            <Brain className="w-4 h-4 mr-1.5" />
            Exclusivo AtentAI
          </Badge>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-5 tracking-tight leading-[1.1]">
            Inteligência Fiscal
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary mt-1">
              que Nenhum Concorrente Tem
            </span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            4 módulos de IA avançada que transformam seu painel em um 
            <span className="text-foreground font-semibold"> copiloto fiscal completo</span>. 
            Antecipe riscos, economize tempo e tome decisões com dados reais.
          </p>
        </motion.div>

        {/* Modules Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16"
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.title}
              variants={item}
              className="group relative"
            >
              <div className="relative h-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 sm:p-8 overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                {/* Glow on hover */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 ${mod.bgGlow} rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                {/* Top row */}
                <div className="flex items-start justify-between mb-5 relative z-10">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${mod.gradient} shadow-lg`}>
                    <mod.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black bg-gradient-to-r ${mod.gradient} bg-clip-text text-transparent`}>
                      {mod.stat}
                    </p>
                    <p className="text-xs text-muted-foreground">{mod.statLabel}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-foreground mb-1">{mod.title}</h3>
                  <p className="text-sm font-medium text-primary mb-3">{mod.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {mod.description}
                  </p>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-2">
                    {mod.features.map((feat) => (
                      <span
                        key={feat}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 text-xs font-medium text-foreground/80"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 backdrop-blur-sm">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-sm font-bold text-foreground">Plano Premium Inteligência Fiscal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Todos os 4 módulos + IA ilimitada + suporte prioritário
              </p>
              <p className="mt-2">
                <span className="text-3xl font-black text-foreground">R$ 157</span>
                <span className="text-muted-foreground">/mês</span>
              </p>
            </div>
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate('/comecar')}
              className="group text-base px-8 py-6 font-bold shadow-xl shadow-accent/30 hover:shadow-accent/50 transition-all"
            >
              Quero Inteligência Fiscal
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
