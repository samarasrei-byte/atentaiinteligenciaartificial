import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Building2, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Calculator,
  Users,
  ArrowRight,
  Shield,
  Clock,
  TrendingUp,
  CreditCard,
  Star,
  Zap,
  FileText,
  Phone
} from 'lucide-react';
import MEIFlow from '@/components/abertura/MEIFlow';
import AutonomoMEFlow from '@/components/abertura/AutonomoMEFlow';
import GuestCompanyOpeningForm from '@/components/abertura/GuestCompanyOpeningForm';

const AberturaEmpresa: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFlow, setSelectedFlow] = useState<'selection' | 'mei' | 'autonomo-me' | 'guest'>('selection');

  // If user is logged in, show normal flows. If not, show guest checkout option
  if (selectedFlow === 'mei' && user) {
    return <MEIFlow onBack={() => setSelectedFlow('selection')} />;
  }

  if (selectedFlow === 'autonomo-me' && user) {
    return <AutonomoMEFlow onBack={() => setSelectedFlow('selection')} />;
  }

  // Guest checkout flow (works without login)
  if (selectedFlow === 'guest' || (selectedFlow !== 'selection' && !user)) {
    return <GuestCompanyOpeningForm onBack={() => setSelectedFlow('selection')} />;
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-12 lg:py-20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container relative mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                <Building2 className="w-3 h-3 mr-1" />
                Abertura de Empresa
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Formalize seu negócio com
                <span className="text-primary"> suporte especializado</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Abra sua empresa de forma rápida e segura, com diagnóstico inteligente 
                do melhor regime tributário para você.
              </p>
            </motion.div>

            {/* Reform Alert */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 mb-10">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                        Reforma Tributária 2024/2025
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300/80 leading-relaxed">
                        Com as mudanças trazidas pela <strong>EC 132/2023</strong> e <strong>LC 214/2025</strong>, 
                        a formalização traz benefícios significativos: simplificação de impostos e aproveitamento de créditos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Options Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-6 mb-10">
              {/* Guest Checkout Card - Show prominently if not logged in */}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <Card 
                    className="bg-gradient-to-r from-emerald-50 to-primary/5 dark:from-emerald-950/30 dark:to-primary/10 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group overflow-hidden shadow-lg"
                    onClick={() => setSelectedFlow('guest')}
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center shrink-0">
                            <Zap className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-foreground">
                                Abertura Rápida
                              </h3>
                              <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-0">
                                Sem Login
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-4">
                              Comece agora sem precisar criar conta. Diagnóstico IA gratuito!
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Diagnóstico IA grátis
                              </span>
                              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Conta criada automaticamente
                              </span>
                              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Acompanhamento completo
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0">
                          Começar Agora
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* MEI Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card 
                  className="h-full border-border hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group hover:shadow-lg"
                  onClick={() => user ? setSelectedFlow('mei') : setSelectedFlow('guest')}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-3">
                        <User className="h-7 w-7 text-white" />
                      </div>
                      <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-0">
                        100% Digital
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">Abrir MEI</CardTitle>
                    <CardDescription>Microempreendedor Individual</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        'Faturamento até R$ 81.000/ano',
                        'Processo 100% automatizado',
                        'Sem necessidade de contador',
                        'Emissão de NFS-e inclusa'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-emerald-500" />
                          <span>~15 minutos</span>
                        </div>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                          Começar
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Autônomo / ME Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card 
                  className="h-full border-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg"
                  onClick={() => user ? setSelectedFlow('autonomo-me') : setSelectedFlow('guest')}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3">
                        <Building2 className="h-7 w-7 text-white" />
                      </div>
                      <Badge className="bg-primary/10 text-primary border-0">
                        Assistido
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">Autônomo / ME</CardTitle>
                    <CardDescription>Microempresa ou Profissional Liberal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        'Faturamento acima de R$ 81.000/ano',
                        'Diagnóstico inteligente do regime',
                        'Contadores parceiros especializados',
                        'Acompanhamento completo'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          <span>Com contador</span>
                        </div>
                        <Button className="gap-2">
                          Iniciar Análise
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Por que formalizar com a Reforma Tributária?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: TrendingUp,
                        color: 'text-primary bg-primary/10',
                        title: 'Aproveitamento de Créditos',
                        desc: 'O novo IVA permite recuperar créditos de impostos, reduzindo sua carga tributária.'
                      },
                      {
                        icon: Calculator,
                        color: 'text-emerald-500 bg-emerald-500/10',
                        title: 'Simplicidade Tributária',
                        desc: 'Menos impostos, menos burocracia. IBS e CBS substituem 5 tributos diferentes.'
                      },
                      {
                        icon: Shield,
                        color: 'text-amber-500 bg-amber-500/10',
                        title: 'Segurança Jurídica',
                        desc: 'Empresa formalizada tem proteção legal, emite notas e acessa linhas de crédito.'
                      },
                    ].map((benefit, i) => (
                      <div key={i} className="space-y-3">
                        <div className={`h-10 w-10 rounded-lg ${benefit.color} flex items-center justify-center`}>
                          <benefit.icon className="h-5 w-5" />
                        </div>
                        <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA for logged out users */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-10 text-center"
              >
                <p className="text-muted-foreground mb-4">
                  Já tem conta? Faça login para acessar todas as funcionalidades.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/auth">Entrar na minha conta</Link>
                </Button>
              </motion.div>
            )}

            {/* Disclaimer */}
            <p className="text-center text-xs text-muted-foreground mt-10">
              O sistema auxilia no processo de formalização, mas não substitui orientação jurídica ou contábil quando necessário.
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default AberturaEmpresa;