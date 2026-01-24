import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Eye, EyeOff, Loader2, Users, TrendingUp, Wallet, Shield, 
  ArrowRight, CheckCircle2, Zap, Gift, BarChart3, Clock,
  ArrowLeft, Star, BadgeCheck, Sparkles
} from 'lucide-react';
import { MaskedInput } from '@/components/ui/masked-input';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString('pt-BR')}{suffix}</span>;
};

// Custom Briefcase icon to avoid naming conflict
const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

// Services with commission data
const SERVICES = [
  { 
    name: 'Limpa Nome PF', 
    price: 680, 
    commission: 20, 
    icon: Shield,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Limpa Nome CNPJ', 
    price: 890, 
    commission: 20, 
    icon: BriefcaseIcon,
    color: 'from-emerald-500 to-emerald-600'
  },
  { 
    name: 'Análise Fiscal', 
    price: 4500, 
    commission: 15, 
    icon: BarChart3,
    color: 'from-purple-500 to-purple-600'
  },
  { 
    name: 'Abertura de Empresa', 
    price: 500, 
    commission: 15, 
    icon: TrendingUp,
    color: 'from-orange-500 to-orange-600'
  },
];

// Target audience
const AUDIENCES = [
  { 
    title: 'Contadores', 
    description: 'Indique clientes e amplie sua receita',
    icon: BadgeCheck 
  },
  { 
    title: 'Consultores', 
    description: 'Agregue serviços à sua carteira',
    icon: Users 
  },
  { 
    title: 'Influenciadores', 
    description: 'Monetize sua audiência com serviços reais',
    icon: Star 
  },
  { 
    title: 'Autônomos', 
    description: 'Ganhe indicando empresas do seu dia a dia',
    icon: Sparkles 
  },
];

// Trust signals
const TRUST_SIGNALS = [
  { icon: Shield, text: 'Pagamentos garantidos' },
  { icon: Zap, text: 'Sistema automatizado' },
  { icon: CheckCircle2, text: 'Plataforma segura' },
  { icon: BarChart3, text: 'Painel completo' },
];

export default function AffiliateOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    termsAccepted: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Você precisa aceitar os termos de uso');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Create user account with auto-confirm
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/afiliado/painel`,
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create affiliate profile - cpf is required but we'll collect later
        const { error: affiliateError } = await supabase
          .from('affiliates')
          .insert({
            user_id: authData.user.id,
            full_name: formData.fullName,
            cpf: '00000000000', // Will be collected in profile later
            email: formData.email,
            phone: formData.phone.replace(/\D/g, ''),
            terms_accepted_at: new Date().toISOString()
          });

        if (affiliateError) throw affiliateError;

        // Auto sign-in after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (signInError) {
          toast.success('Cadastro realizado! Verifique seu email para confirmar.');
          navigate('/auth');
        } else {
          toast.success('Bem-vindo ao programa de afiliados!');
          navigate('/afiliado/painel');
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      if (error.message?.includes('already registered')) {
        toast.error('Este email já está cadastrado. Faça login.');
      } else {
        toast.error(error.message || 'Erro ao realizar cadastro');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-atentai.png" alt="AtentAI" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link to="/auth">Já sou afiliado</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
          
          <div className="container relative mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Gift className="w-4 h-4" />
                Programa de Afiliados
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                Ganhe dinheiro indicando{' '}
                <span className="text-primary">serviços financeiros</span>{' '}
                que realmente vendem
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Seja afiliado da Atentai e receba comissões recorrentes indicando 
                serviços contábeis, fiscais e de regularização.
              </p>

              {/* Quick highlights */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {[
                  { icon: Wallet, text: 'Comissões atrativas' },
                  { icon: Zap, text: 'Pagamento rápido' },
                  { icon: BarChart3, text: 'Painel completo' },
                  { icon: Users, text: 'Atendimento humano' },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 shadow-sm"
                  >
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  size="lg"
                  onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-14 px-10 text-lg font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Quero ser afiliado agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Como funciona
              </h2>
              <p className="text-lg text-muted-foreground">
                4 passos simples para começar a ganhar
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { step: 1, title: 'Cadastre-se', desc: 'Gratuitamente', icon: Users },
                { step: 2, title: 'Receba seu link', desc: 'Exclusivo', icon: Gift },
                { step: 3, title: 'Indique clientes', desc: 'Compartilhe', icon: TrendingUp },
                { step: 4, title: 'Ganhe comissões', desc: 'Automaticamente', icon: Wallet },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <Card className="h-full border-0 shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold text-xl">
                        {item.step}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings potential */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Quanto você pode ganhar
              </h2>
              <p className="text-lg text-muted-foreground">
                Comissões reais em serviços de alta demanda
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {SERVICES.map((service, i) => {
                const earning = (service.price * service.commission) / 100;
                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                      <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                            <service.icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-foreground">{service.name}</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Valor do serviço</span>
                            <span className="font-medium">R$ {service.price.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Comissão</span>
                            <span className="font-medium text-primary">{service.commission}%</span>
                          </div>
                          <div className="pt-3 border-t border-border">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Você ganha</span>
                              <span className="text-xl font-bold text-primary">
                                R$ {earning.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Who is this for */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Para quem é o programa
              </h2>
              <p className="text-lg text-muted-foreground">
                Ideal para profissionais com rede de contatos empresariais
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {AUDIENCES.map((audience, i) => (
                <motion.div
                  key={audience.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all bg-card">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <audience.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{audience.title}</h3>
                      <p className="text-sm text-muted-foreground">{audience.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8">
              {TRUST_SIGNALS.map((signal, i) => (
                <motion.div
                  key={signal.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <signal.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{signal.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section id="register" className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-md mx-auto"
            >
              <Card className="border-0 shadow-2xl bg-card">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Criar conta de afiliado
                    </h2>
                    <p className="text-muted-foreground">
                      Comece a ganhar em minutos
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome completo</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Seu nome completo"
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp</Label>
                      <MaskedInput
                        id="phone"
                        mask="phone"
                        value={formData.phone}
                        onChange={(value) => setFormData({ ...formData, phone: value })}
                        showValidation={false}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          className="h-12 pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                      />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        Li e aceito os{' '}
                        <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>
                        {' '}e a{' '}
                        <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 text-base font-semibold rounded-xl mt-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        <>
                          Criar minha conta de afiliado
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground mt-6">
                    Já tem conta?{' '}
                    <Link to="/auth" className="text-primary hover:underline font-medium">
                      Fazer login
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-atentai.png" alt="AtentAI" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">© 2024 Atentai</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/termos" className="hover:text-foreground transition-colors">Termos</Link>
              <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}