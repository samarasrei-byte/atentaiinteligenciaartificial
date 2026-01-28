import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BIContabilidadeLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigate('/meu-painel');
    } else {
      navigate('/auth?redirect=/meu-painel');
    }
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

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboards Financeiros',
      description: 'DRE, fluxo de caixa, impostos e KPIs em tempo real'
    },
    {
      icon: Brain,
      title: 'IA que Explica',
      description: 'Variações, tendências e comparações com linguagem clara'
    },
    {
      icon: AlertTriangle,
      title: 'Detecção de Anomalias',
      description: 'Alertas automáticos antes do problema acontecer'
    },
    {
      icon: Bell,
      title: 'Alertas Inteligentes',
      description: 'Margem, caixa, prazo e risco sob controle'
    },
    {
      icon: FileText,
      title: 'Relatórios Claros',
      description: 'Documentos acionáveis e fáceis de entender'
    },
    {
      icon: User,
      title: 'Validação Humana',
      description: 'Especialistas revisando cada análise'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Crie sua conta gratuita',
      description: 'Sem cartão de crédito. Acesso imediato.'
    },
    {
      number: '2',
      title: 'Envie sua solicitação',
      description: 'Descreva o que precisa analisar.'
    },
    {
      number: '3',
      title: 'O BI+ Contabilidade™ analisa',
      description: 'IA processa, humano valida.'
    },
    {
      number: '4',
      title: 'Receba a resposta documentada',
      description: 'Clareza total com rastreabilidade.'
    }
  ];

  const trustPoints = [
    {
      icon: Lock,
      title: 'Nenhuma decisão automática',
      description: 'Todo resultado passa por validação humana'
    },
    {
      icon: History,
      title: 'Histórico completo',
      description: 'Cada ação registrada e auditável'
    },
    {
      icon: Search,
      title: 'Auditoria de análises',
      description: 'Transparência total no processo'
    },
    {
      icon: User,
      title: 'Responsável identificado',
      description: 'Você sabe quem analisou seu caso'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={scrollToSection} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="flex justify-center gap-3 mb-8">
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 text-sm">
                <Brain className="h-4 w-4 mr-2" />
                IA Assistiva
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 backdrop-blur-sm px-4 py-2 text-sm">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Validação Humana
              </Badge>
            </div>

            {/* Logo/Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent">
                BI + Contabilidade™
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-indigo-200/90 mb-4 font-light">
              Inteligência artificial com análise humana para
            </p>
            <p className="text-2xl md:text-3xl text-white font-semibold mb-8">
              decisões financeiras seguras
            </p>

            {/* Description */}
            <p className="text-lg text-indigo-300/80 max-w-2xl mx-auto mb-10">
              Não é só dashboard. É um método próprio que analisa seus números, 
              detecta riscos e entrega respostas claras — com tecnologia e especialistas.
            </p>

            {/* CTA */}
            <Button 
              onClick={handleCTA}
              size="xl"
              className="bg-white text-indigo-900 hover:bg-indigo-100 font-bold px-10 py-6 text-lg rounded-2xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Solicitar análise gratuita
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <p className="text-sm text-indigo-400/60 mt-4">
              Sem cartão de crédito • Resposta em até 24h
            </p>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Seus números existem.
              </h2>
              <p className="text-xl text-muted-foreground">
                O problema é que ninguém explica eles direito.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Relatórios que chegam tarde',
                'Dashboards sem contexto',
                'Riscos fiscais invisíveis',
                'Decisões no escuro'
              ].map((problem, index) => (
                <Card key={index} className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <p className="text-lg font-medium text-foreground">{problem}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200">
              A Solução
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que é o BI+ Contabilidade™?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um sistema proprietário que combina BI financeiro, inteligência artificial 
              e análise humana especializada. Tudo documentado, auditável e responsável.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-center p-8 border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">BI Financeiro</h3>
              <p className="text-muted-foreground">
                Dashboards e métricas em tempo real para visão completa
              </p>
            </Card>

            <Card className="text-center p-8 border-2 border-violet-100 hover:border-violet-300 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Inteligência Artificial</h3>
              <p className="text-muted-foreground">
                Análise automática, detecção de padrões e sugestões
              </p>
            </Card>

            <Card className="text-center p-8 border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Análise Humana</h3>
              <p className="text-muted-foreground">
                Especialistas validando cada decisão e relatório
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-violet-100 text-violet-700 border-violet-200">
              Funcionalidades
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que só esse serviço faz
            </h2>
            <p className="text-xl text-muted-foreground">
              <span className="text-indigo-600 font-semibold">IA acelera.</span>{' '}
              <span className="text-emerald-600 font-semibold">Humano decide.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0 group-hover:from-indigo-200 group-hover:to-violet-200 transition-colors">
                      <feature.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-white text-indigo-700 border-indigo-200">
              Como Funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simples e direto
            </h2>
            <p className="text-lg text-muted-foreground">
              Sem promessas mágicas. Só clareza.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-300 to-violet-300" />
                )}
                
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold relative z-10 shadow-lg">
                  {step.number}
                </div>
                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">
              Confiança
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Isso não é "IA solta". É método.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {trustPoints.map((point, index) => (
              <Card key={index} className="text-center p-6 border-2 border-emerald-100">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <point.icon className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{point.title}</h3>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(99,102,241,0.3)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.3)_0%,transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Comece com uma análise gratuita e veja seus números com clareza.
            </h2>
            <p className="text-xl text-indigo-200/80 mb-10">
              Método próprio. IA + Humano. Resultados documentados.
            </p>
            
            <Button 
              onClick={handleCTA}
              size="xl"
              className="bg-white text-indigo-900 hover:bg-indigo-100 font-bold px-12 py-7 text-lg rounded-2xl shadow-2xl shadow-black/30 hover:shadow-black/50 transition-all hover:scale-105"
            >
              <Target className="h-5 w-5 mr-2" />
              Solicitar análise no BI+ Contabilidade™
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-6 mt-8 text-indigo-300/70 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Gratuito
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Sem compromisso
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Resposta em 24h
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
