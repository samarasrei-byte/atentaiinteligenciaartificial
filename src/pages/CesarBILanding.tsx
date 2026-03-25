import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, TrendingUp, Clock, CheckCircle2, 
  BarChart3, Brain, Users, Award, ArrowRight,
  Target, Lightbulb, PieChart, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Paleta de Cores Elite
const COLORS = {
  primary: '#0A1931',
  secondary: '#FFC300',
  text: '#FFFFFF',
  subtext: '#A0AEC0',
  danger: '#E53E3E',
};

// Hook para Countdown Timer
const useCountdown = (initialSeconds: number) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return formatTime(timeLeft);
};

// Hero Section
const HeroSection = () => {
  const navigate = useNavigate();
  const countdown = useCountdown(3600);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Preencha todos os campos');
      return;
    }
    toast.success('Diagnóstico solicitado com sucesso!');
    navigate('/bi-contabilidade/onboarding');
  };

  return (
    <section 
      className="min-h-[90vh] flex items-center relative overflow-hidden"
      style={{ backgroundColor: COLORS.primary }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${COLORS.secondary}22 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, ${COLORS.secondary}11 0%, transparent 50%)`
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Copywriting Column */}
          <motion.div 
            className="lg:w-3/5 space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-4">
              <Brain className="w-5 h-5" style={{ color: COLORS.secondary }} />
              <span className="text-sm font-medium text-white">AtentAI • Especialista BI+</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              O Fim do Caos Financeiro.{' '}
              <span style={{ color: COLORS.secondary }}>
                O Início da Sua Liberdade.
              </span>
            </h1>

            <p className="text-xl max-w-xl mx-auto lg:mx-0" style={{ color: COLORS.subtext }}>
              Transforme sua empresa em uma máquina de lucro previsível. Receba o{' '}
              <span className="font-bold text-white">Diagnóstico Estratégico de R$ 500,00</span>{' '}
              totalmente gratuito.
            </p>

            {/* Urgency Timer */}
            <div 
              className="flex items-center justify-center lg:justify-start gap-3 text-lg font-bold"
              style={{ color: COLORS.secondary }}
            >
              <Clock className="w-6 h-6" />
              <span>Restam 3 Vagas: {countdown}</span>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex items-center gap-2 text-white/80">
                <Shield className="w-5 h-5" style={{ color: COLORS.secondary }} />
                <span className="text-sm">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Award className="w-5 h-5" style={{ color: COLORS.secondary }} />
                <span className="text-sm">+500 Empresas</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle2 className="w-5 h-5" style={{ color: COLORS.secondary }} />
                <span className="text-sm">Resultados Garantidos</span>
              </div>
            </div>
          </motion.div>

          {/* Form Column */}
          <motion.div 
            className="lg:w-2/5 w-full max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-white shadow-2xl border-t-4" style={{ borderTopColor: COLORS.secondary }}>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: COLORS.primary, color: COLORS.secondary }}
                  >
                    CC
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                    Diagnóstico Gratuito
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Com especialistas AtentAI
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Seu Nome Completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 border-gray-300 focus:ring-2"
                    style={{ '--tw-ring-color': COLORS.secondary } as any}
                  />
                  <Input
                    type="email"
                    placeholder="Seu Melhor E-mail"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 border-gray-300 focus:ring-2"
                    style={{ '--tw-ring-color': COLORS.secondary } as any}
                  />
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-extrabold shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: COLORS.secondary, 
                      color: COLORS.primary,
                      boxShadow: `0 10px 40px -10px ${COLORS.secondary}80`
                    }}
                  >
                    Quero Meu Diagnóstico Gratuito
                  </Button>
                </form>

                <p className="text-xs text-center text-gray-500 mt-4">
                  🔒 Seus dados estão protegidos e não serão compartilhados.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Authority Bar
const AuthorityBar = () => (
  <section className="bg-gray-900 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-center mb-6" style={{ color: COLORS.subtext }}>
        Metodologia Validada por Líderes de Mercado
      </p>
      <div className="flex justify-center items-center flex-wrap gap-8 md:gap-16">
        {['PMEs', 'Startups', 'Indústrias', 'Varejo', 'Serviços'].map((segment) => (
          <div 
            key={segment}
            className="text-lg font-semibold opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: COLORS.subtext }}
          >
            {segment}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Problem Section
const ProblemSection = () => {
  const problems = [
    {
      icon: Zap,
      title: '60% das Empresas Fecham',
      description: 'Por má gestão financeira em até 5 anos. Não seja a próxima estatística.'
    },
    {
      icon: Clock,
      title: 'Caos Operacional',
      description: 'Perda de produtividade e atrasos devido à fragmentação de processos.'
    },
    {
      icon: TrendingUp,
      title: 'Crescimento Sem Lucro',
      description: 'Faturamento alto, mas margem de lucro baixa. Você está trabalhando para pagar contas.'
    }
  ];

  return (
    <section className="py-20 text-white" style={{ backgroundColor: COLORS.primary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Você Sabe Onde Seu Dinheiro Está Indo?
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: COLORS.subtext }}>
            Se você sente que está trabalhando mais para lucrar menos, você está pagando o{' '}
            <span className="font-bold text-red-500">Custo da Ineficiência</span>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              className="bg-gray-900 p-8 rounded-xl border-t-4 border-red-500 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <problem.icon className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
              <p style={{ color: COLORS.subtext }}>{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Method Section (4 Stages)
const MethodSection = () => {
  const stages = [
    { 
      number: 1, 
      title: 'Diagnóstico', 
      description: 'Análise 360° para identificar gargalos e oportunidades de lucro imediato.',
      icon: Target
    },
    { 
      number: 2, 
      title: 'Reestruturação', 
      description: 'Implantação de sistemas de controle (P&L, GMD) e automação de processos.',
      icon: Lightbulb
    },
    { 
      number: 3, 
      title: 'Otimização', 
      description: 'Maximização da performance, redução de custos e foco no crescimento sustentável.',
      icon: PieChart
    },
    { 
      number: 4, 
      title: 'Captura de Valor', 
      description: 'Preparação para M&A, captação de investidores e captura do Equity Value.',
      icon: TrendingUp
    }
  ];

  return (
    <section className="bg-gray-900 py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            O Método{' '}
            <span style={{ color: COLORS.secondary }}>BI+ Contabilidade™</span>{' '}
            de 4 Estágios
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.number}
              className="relative p-6 rounded-xl shadow-xl border-l-4"
              style={{ backgroundColor: COLORS.primary, borderLeftColor: COLORS.secondary }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className="absolute -top-5 left-6 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl"
                style={{ backgroundColor: COLORS.secondary, color: COLORS.primary }}
              >
                {stage.number}
              </div>
              <stage.icon className="w-8 h-8 mt-4 mb-4" style={{ color: COLORS.secondary }} />
              <h3 className="text-xl font-bold mb-2">{stage.title}</h3>
              <p className="text-sm" style={{ color: COLORS.subtext }}>{stage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonial Section
const TestimonialSection = () => {
  const testimonials = [
    {
      quote: 'Em 6 meses, reduzimos 30% dos custos operacionais e aumentamos nosso EBITDA em 20%. A metodologia BI+ nos deu o mapa para a liberdade financeira.',
      author: 'Roberto Mendes',
      role: 'CEO, TechSolutions',
      initials: 'RM'
    },
    {
      quote: 'O diagnóstico revelou problemas que eu nem sabia que existiam. Hoje temos clareza total sobre onde investir e onde cortar.',
      author: 'Carla Fernandes',
      role: 'Diretora Financeira, Varejo Plus',
      initials: 'CF'
    },
    {
      quote: 'César e sua equipe transformaram nossa gestão. Passamos de lucro zero para margem de 15% em apenas um ano.',
      author: 'Paulo Silveira',
      role: 'Fundador, Indústria Nova',
      initials: 'PS'
    }
  ];

  return (
    <section className="py-20 text-white" style={{ backgroundColor: COLORS.primary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Histórias Reais de Transformação
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              className="bg-gray-900 p-8 rounded-xl shadow-xl border-l-4"
              style={{ borderLeftColor: COLORS.secondary }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-lg italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: COLORS.secondary, color: COLORS.primary }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm" style={{ color: COLORS.subtext }}>{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Offer Section
const OfferSection = () => {
  const navigate = useNavigate();
  
  const plans = [
    {
      name: 'Diagnóstico',
      description: 'Para quem precisa de clareza e um plano de ação imediato.',
      price: 'Grátis',
      originalPrice: 'R$ 500',
      features: ['Análise Financeira Completa', 'Identificação de Gargalos', 'Plano de Ação Personalizado'],
      highlighted: false,
      cta: 'Solicitar Diagnóstico'
    },
    {
      name: 'BI+ Performance',
      description: 'Consultoria completa para reestruturação e eficiência operacional.',
      price: 'R$ 1.990',
      originalPrice: null,
      features: ['Mapeamento de Processos', 'Implantação de P&L e KPIs', 'Redução de Custos Garantida', 'Suporte por 90 dias'],
      highlighted: true,
      cta: 'Quero BI+ Performance'
    },
    {
      name: 'Elite Partnership',
      description: 'Mentoria exclusiva para crescimento acelerado e captura de valor.',
      price: 'Sob Consulta',
      originalPrice: null,
      features: ['Mentoria Mensal Exclusiva', 'Estratégia de M&A/IPO', 'Governança Corporativa', 'Acesso VIP ao César'],
      highlighted: false,
      cta: 'Solicitar Proposta'
    }
  ];

  return (
    <section className="bg-gray-900 py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Escolha Seu Caminho para a Performance
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative p-8 rounded-xl shadow-xl border-t-4 ${plan.highlighted ? 'scale-105' : ''}`}
              style={{ 
                backgroundColor: COLORS.primary, 
                borderTopColor: plan.highlighted ? COLORS.secondary : '#6B7280' 
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 -right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full rotate-6">
                  MAIS POPULAR
                </div>
              )}

              <h3 
                className="text-2xl font-bold mb-2"
                style={{ color: plan.highlighted ? COLORS.secondary : 'white' }}
              >
                {plan.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: COLORS.subtext }}>{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.originalPrice && (
                  <span className="text-lg line-through ml-2 text-red-500">{plan.originalPrice}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{ color: COLORS.secondary }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate('/bi-contabilidade/onboarding')}
                className="w-full font-bold py-3 transition-all duration-300"
                style={{
                  backgroundColor: plan.highlighted ? COLORS.secondary : '#4B5563',
                  color: plan.highlighted ? COLORS.primary : 'white'
                }}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Guarantee Section
const GuaranteeSection = () => (
  <section className="py-16 text-white" style={{ backgroundColor: COLORS.primary }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.secondary }} />
        <h2 className="text-3xl font-bold mb-4">
          Risco Zero. Resultados Garantidos.
        </h2>
        <p className="text-xl max-w-3xl mx-auto" style={{ color: COLORS.subtext }}>
          Se em 90 dias você não tiver clareza sobre como reduzir custos e aumentar a lucratividade, 
          nós trabalhamos de graça até que você tenha.{' '}
          <span className="font-bold" style={{ color: COLORS.secondary }}>
            Seu sucesso é nossa única métrica.
          </span>
        </p>
      </motion.div>
    </div>
  </section>
);

// Final CTA Section
const FinalCTASection = () => {
  const navigate = useNavigate();
  const countdown = useCountdown(3600);

  return (
    <section className="bg-gray-900 py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Não Deixe Seu Concorrente Agir Primeiro.
          </h2>
          <p className="text-xl mb-8" style={{ color: COLORS.subtext }}>
            Restam apenas <span className="font-bold text-red-500">3 vagas</span> para o Diagnóstico Gratuito desta semana.
          </p>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-3 text-4xl font-extrabold text-red-500 mb-8">
            <Clock className="w-10 h-10" />
            <span>{countdown}</span>
          </div>

          <Button
            onClick={() => navigate('/bi-contabilidade/onboarding')}
            size="xl"
            className="font-extrabold text-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              backgroundColor: COLORS.secondary, 
              color: COLORS.primary,
              boxShadow: `0 10px 40px -10px ${COLORS.secondary}80`
            }}
          >
            Garantir Minha Vaga Antes que Acabe
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-gray-900 py-8 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Brain className="w-6 h-6" style={{ color: COLORS.secondary }} />
        <span className="font-bold text-white">AtentAI • BI+ Contabilidade™</span>
      </div>
      <p className="text-sm" style={{ color: COLORS.subtext }}>
        © 2024 AtentAI. Todos os direitos reservados. |{' '}
        <a href="/privacidade" className="hover:underline">Política de Privacidade</a> |{' '}
        <a href="/termos" className="hover:underline">Termos de Uso</a>
      </p>
    </div>
  </footer>
);

// Main Page Component
const CesarBILanding = () => {
  return (
    <div className="antialiased min-h-screen" style={{ backgroundColor: COLORS.primary }}>
      <HeroSection />
      <AuthorityBar />
      <ProblemSection />
      <MethodSection />
      <TestimonialSection />
      <OfferSection />
      <GuaranteeSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default CesarBILanding;
