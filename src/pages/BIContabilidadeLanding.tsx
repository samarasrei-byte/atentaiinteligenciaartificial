import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BIPricingSection } from '@/components/bi/BIPricingSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  User, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  Bell,
  BarChart3,
  Zap,
  CheckCircle2,
  ArrowRight,
  Lock,
  History,
  Search,
  Target,
  Sparkles,
  PieChart,
  LineChart,
  Activity,
  Eye,
  Clock,
  MessageSquare,
  Shield,
  Award,
  Layers,
  GitBranch,
  Database,
  Cpu,
  Globe,
  Users,
  Building2,
  Briefcase,
  TrendingDown,
  DollarSign,
  Calculator,
  FileCheck,
  Lightbulb,
  Rocket,
  Star,
  Play,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const BIContabilidadeLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeMetric, setActiveMetric] = useState(0);

  const handleCTA = () => {
    navigate('/bi-contabilidade/onboarding');
  };

  const scrollToSection = (section: string) => {
    if (section === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Animated metrics
  const metrics = [
    { label: 'Análises Realizadas', value: '2.847', suffix: '+', icon: BarChart3 },
    { label: 'Economia Identificada', value: 'R$ 4.2M', suffix: '', icon: DollarSign },
    { label: 'Clientes Ativos', value: '156', suffix: '', icon: Users },
    { label: 'Tempo Médio Resposta', value: '4h', suffix: '', icon: Clock },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboards Financeiros',
      description: 'DRE, fluxo de caixa, impostos e KPIs em tempo real com visualizações interativas',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Brain,
      title: 'IA Explicativa',
      description: 'Variações, tendências e comparações traduzidas em linguagem clara e acionável',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: AlertTriangle,
      title: 'Detecção de Anomalias',
      description: 'Alertas preditivos antes que o problema aconteça — IA + supervisão humana',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: Bell,
      title: 'Alertas Inteligentes',
      description: 'Margem, caixa, prazo e risco sob monitoramento contínuo 24/7',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: FileText,
      title: 'Relatórios Acionáveis',
      description: 'Documentos claros com recomendações práticas e embasamento técnico',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: User,
      title: 'Validação Humana',
      description: 'Especialistas revisando cada análise — nada automático, tudo conferido',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  const capabilities = [
    { icon: PieChart, label: 'Análise DRE' },
    { icon: LineChart, label: 'Fluxo de Caixa' },
    { icon: TrendingUp, label: 'Projeções' },
    { icon: Calculator, label: 'Impostos' },
    { icon: Activity, label: 'KPIs Financeiros' },
    { icon: FileCheck, label: 'Compliance' },
    { icon: TrendingDown, label: 'Redução de Custos' },
    { icon: Lightbulb, label: 'Insights' },
  ];

  const steps = [
    {
      number: '01',
      title: 'Crie sua conta',
      description: 'Gratuito, sem cartão. Acesso imediato à plataforma.',
      icon: User,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '02',
      title: 'Envie sua solicitação',
      description: 'Descreva o que precisa. Anexe documentos se necessário.',
      icon: FileText,
      color: 'from-violet-500 to-purple-500'
    },
    {
      number: '03',
      title: 'IA + Humano analisam',
      description: 'Nossa IA processa, especialistas validam cada detalhe.',
      icon: Brain,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      number: '04',
      title: 'Receba a resposta',
      description: 'Relatório documentado com rastreabilidade completa.',
      icon: CheckCircle2,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const trustPoints = [
    {
      icon: Lock,
      title: 'Zero Automação Cega',
      description: 'Toda análise passa por validação humana antes de chegar a você',
      stat: '100%'
    },
    {
      icon: History,
      title: 'Histórico Completo',
      description: 'Cada ação, alteração e decisão registrada e auditável',
      stat: '360°'
    },
    {
      icon: Eye,
      title: 'Transparência Total',
      description: 'Você acompanha cada etapa do processo em tempo real',
      stat: '24/7'
    },
    {
      icon: Award,
      title: 'Responsável Identificado',
      description: 'Sempre sabe quem analisou e validou seu caso',
      stat: '1:1'
    }
  ];

  const useCases = [
    {
      icon: Building2,
      title: 'Empresas',
      description: 'Gestão financeira completa com análise de DRE, fluxo de caixa e planejamento tributário.',
      color: 'bg-blue-500'
    },
    {
      icon: Briefcase,
      title: 'Autônomos',
      description: 'Controle de receitas, despesas e otimização fiscal para profissionais liberais.',
      color: 'bg-violet-500'
    },
    {
      icon: Users,
      title: 'Startups',
      description: 'Métricas SaaS, burn rate, runway e preparação para investidores.',
      color: 'bg-emerald-500'
    },
    {
      icon: Globe,
      title: 'E-commerce',
      description: 'Análise de margens, custos de aquisição e performance por canal.',
      color: 'bg-amber-500'
    }
  ];

  const testimonials = [
    {
      quote: "Finalmente entendo meus números. O relatório não é só dados, é direcionamento claro.",
      author: "Marina Santos",
      role: "CEO, TechFlow",
      avatar: "M"
    },
    {
      quote: "A combinação de IA com análise humana é o diferencial. Nunca me senti tão seguro nas decisões.",
      author: "Ricardo Mendes",
      role: "Diretor Financeiro",
      avatar: "R"
    },
    {
      quote: "Identificaram uma economia de 23% em impostos que meu contador anterior nunca viu.",
      author: "Ana Paula Costa",
      role: "Empresária",
      avatar: "A"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onNavigate={scrollToSection} />

      {/* Hero Section - Ultra Modern */}
      <section className="relative pt-20 pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px]" />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="text-left">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-xl px-4 py-2 text-sm shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                    Sistema Online
                  </Badge>
                  <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 backdrop-blur-xl px-4 py-2 text-sm">
                    <Brain className="h-4 w-4 mr-2" />
                    IA Assistiva
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 backdrop-blur-xl px-4 py-2 text-sm">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Validação Humana
                  </Badge>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="text-white">BI +</span>
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                    Contabilidade™
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-indigo-200/90 mb-4 font-light">
                  Inteligência artificial com análise humana
                </p>
                <p className="text-lg text-slate-400 mb-8 max-w-xl">
                  Não é só dashboard. É um método próprio que analisa seus números, 
                  detecta riscos e entrega respostas claras — com tecnologia e especialistas.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    onClick={handleCTA}
                    size="lg"
                    className="bg-white text-indigo-900 hover:bg-indigo-100 font-bold px-8 py-6 text-lg rounded-2xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 group"
                  >
                    <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Solicitar análise gratuita
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg rounded-2xl"
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Ver como funciona
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    100% Gratuito
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Sem compromisso
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Resposta em 24h
                  </div>
                </div>
              </div>

              {/* Right - Dashboard Preview */}
              <div className="hidden lg:block relative">
                {/* Glassmorphism Dashboard Card */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-3xl blur-xl" />
                  
                  <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Dashboard BI+</p>
                          <p className="text-xs text-slate-400">Atualizado agora</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                        Ao vivo
                      </Badge>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {metrics.map((metric, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-2xl transition-all duration-500 ${
                            activeMetric === index 
                              ? 'bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-400/30' 
                              : 'bg-white/5 border border-white/5'
                          }`}
                        >
                                        <div className="flex items-center gap-2 mb-2">
                                          <metric.icon className={`h-4 w-4 ${activeMetric === index ? 'text-indigo-200' : 'text-indigo-300'}`} />
                                          <p className={`text-xs font-medium ${activeMetric === index ? 'text-indigo-100' : 'text-indigo-200'}`}>{metric.label}</p>
                                        </div>
                                        <p className={`text-2xl font-bold ${activeMetric === index ? 'text-white' : 'text-white/90'}`}>
                                          {metric.value}{metric.suffix}
                                        </p>
                                      </div>
                                    ))}
                    </div>

                    {/* Chart Placeholder */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-300">Performance Mensal</p>
                        <Badge className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                          +23.5%
                        </Badge>
                      </div>
                      <div className="h-24 flex items-end gap-2">
                        {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-indigo-500/50 to-violet-500/50 rounded-t-lg transition-all hover:from-indigo-500/70 hover:to-violet-500/70"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis Badge */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-xl border border-indigo-400/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-indigo-200 font-medium">Análise IA detectou</p>
                        <p className="text-sm text-white">3 oportunidades de economia</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-indigo-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Capabilities Bar */}
      <section className="py-8 bg-muted/30 border-y border-border/50 relative -mt-16 z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {capabilities.map((cap, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <cap.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{cap.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section - Modern */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.05)_0%,transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-400/20">
                O Problema
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Seus números existem.
                <br />
                <span className="text-muted-foreground">Ninguém explica eles direito.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { problem: 'Relatórios que chegam tarde', icon: Clock, stat: '72%', desc: 'dos gestores recebem dados defasados' },
                { problem: 'Dashboards sem contexto', icon: BarChart3, stat: '85%', desc: 'não entendem as métricas' },
                { problem: 'Riscos fiscais invisíveis', icon: AlertTriangle, stat: '40%', desc: 'das empresas pagam multas evitáveis' },
                { problem: 'Decisões no escuro', icon: Eye, stat: '3x', desc: 'mais erros em escolhas financeiras' }
              ].map((item, index) => (
                <Card key={index} className="group border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent hover:border-destructive/40 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0 group-hover:bg-destructive/20 transition-colors">
                        <item.icon className="h-7 w-7 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-foreground mb-1">{item.problem}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-destructive">{item.stat}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section - 3 Pillars */}
      <section className="py-24 bg-gradient-to-br from-indigo-50/50 via-violet-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:via-violet-950/20 dark:to-purple-950/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-400/20">
              A Solução
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              O que é o BI+ Contabilidade™?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um sistema proprietário que combina três pilares para entregar clareza financeira com responsabilidade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: BarChart3,
                title: 'BI Financeiro',
                description: 'Dashboards interativos com métricas em tempo real. DRE, fluxo de caixa, impostos — tudo visual.',
                gradient: 'from-blue-500 to-cyan-500',
                features: ['Dashboards ao vivo', 'Métricas customizáveis', 'Exportação automática']
              },
              {
                icon: Brain,
                title: 'Inteligência Artificial',
                description: 'Análise automática de padrões, detecção de anomalias e sugestões contextualizadas.',
                gradient: 'from-violet-500 to-purple-500',
                features: ['Detecção de padrões', 'Alertas preditivos', 'Linguagem natural']
              },
              {
                icon: User,
                title: 'Análise Humana',
                description: 'Especialistas validando cada decisão. Nada automático, tudo conferido e assinado.',
                gradient: 'from-emerald-500 to-teal-500',
                features: ['Validação obrigatória', 'Responsável identificado', 'Auditoria completa']
              }
            ].map((pillar, index) => (
              <Card key={index} className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-2xl bg-background">
                {/* Gradient Top Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${pillar.gradient}`} />
                
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <pillar.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{pillar.title}</h3>
                  <p className="text-muted-foreground mb-6">{pillar.description}</p>
                  
                  <div className="space-y-3">
                    {pillar.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tagline */}
          <div className="text-center mt-12">
            <p className="text-2xl font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400">IA acelera.</span>{' '}
              <span className="text-emerald-600 dark:text-emerald-400">Humano decide.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid - Modern */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-400/20">
              Funcionalidades
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              O que só esse serviço faz
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all hover:-translate-y-2 overflow-hidden border-0 bg-gradient-to-br from-background to-muted/30">
                <CardContent className="p-6 relative">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-muted/30 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/20">
              Para Quem
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Quem pode usar o BI+?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all text-center border-2 hover:border-primary/30">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${useCase.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <useCase.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Timeline */}
      <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.05)_0%,transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-400/20">
              Como Funciona
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Simples. Direto. Eficaz.
            </h2>
            <p className="text-lg text-muted-foreground">
              Sem promessas mágicas. Só clareza e resultado.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative flex gap-8 mb-12 last:mb-0">
                {/* Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[31px] top-20 w-0.5 h-full bg-gradient-to-b from-primary/50 to-primary/10" />
                )}
                
                {/* Step Number */}
                <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>

                {/* Content */}
                <Card className="flex-1 hover:shadow-lg transition-all group">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity`}>
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-400/20">
              <Shield className="h-3 w-3 mr-1" />
              Confiança
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Isso não é "IA solta".
              <br />
              <span className="text-emerald-600 dark:text-emerald-400">É método.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {trustPoints.map((point, index) => (
              <Card key={index} className="text-center border-2 border-emerald-200/50 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400/50 transition-all hover:shadow-lg bg-background/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <point.icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{point.stat}</p>
                  <h3 className="font-bold text-foreground mb-2">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-400/20">
              <Star className="h-3 w-3 mr-1" />
              Depoimentos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Quem usa, recomenda
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative border-2 hover:border-primary/30 transition-all hover:shadow-xl">
                <CardContent className="p-8">
                  {/* Quote Mark */}
                  <div className="absolute top-4 right-4 text-6xl font-serif text-primary/10">"</div>
                  
                  <p className="text-foreground mb-6 relative z-10 italic">"{testimonial.quote}"</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BI Pricing Plans Section */}
      <BIPricingSection />

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />
        
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm px-6 py-2">
              <Rocket className="h-4 w-4 mr-2" />
              Comece agora mesmo
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Veja seus números
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                com clareza total.
              </span>
            </h2>
            
            <p className="text-xl text-indigo-200/80 mb-10 max-w-2xl mx-auto">
              Método próprio. IA + Humano. Resultados documentados e auditáveis.
            </p>
            
            <Button 
              onClick={handleCTA}
              size="lg"
              className="bg-white text-indigo-900 hover:bg-indigo-100 font-bold px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-black/30 hover:shadow-black/50 transition-all hover:scale-105 group"
            >
              <Sparkles className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
              Solicitar análise no BI+ Contabilidade™
              <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex items-center justify-center gap-8 mt-10 text-indigo-300/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>100% Gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Resposta em 24h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default BIContabilidadeLanding;
