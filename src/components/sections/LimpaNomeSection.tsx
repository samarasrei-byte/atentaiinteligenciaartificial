import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  Star,
  TrendingDown,
  Bot,
  Clock,
  FileCheck,
  Award,
  Users,
  Zap,
  Building2,
  User
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/contexts/AuthContext";

const bureaus = [
  { name: 'SPC', color: 'bg-blue-500' },
  { name: 'Serasa', color: 'bg-red-500' },
  { name: 'SCPC', color: 'bg-green-500' },
  { name: 'Boa Vista', color: 'bg-purple-500' },
  { name: 'Quod', color: 'bg-amber-500' },
  { name: 'Cenprot', color: 'bg-cyan-500' },
  { name: 'Registrato', color: 'bg-indigo-500' },
  { name: 'CADIN', color: 'bg-pink-500' },
];

const benefits = [
  { icon: Bot, title: 'IA + Contador 24h', desc: 'Atendimento inteligente com IA e contador especializado dedicado' },
  { icon: Clock, title: 'Resultado em até 30 dias', desc: 'Processo ágil com acompanhamento em tempo real via WhatsApp' },
  { icon: FileCheck, title: 'Carta de Quitação Digital', desc: 'Documento oficial + relatório completo de regularização' },
  { icon: Shield, title: 'Garantia de Resultado', desc: 'Seu dinheiro de volta se não limparmos seu nome' },
];

const included = [
  'Análise completa CPF ou CNPJ em 8 bureaus',
  'Chat ilimitado 24h com IA + Contador',
  'Consulta Registrato (Banco Central)',
  'Verificação protestos (Cenprot)',
  'Orientação personalizada por contador',
  'Carta de quitação digital',
  'Acompanhamento por 90 dias',
  'Suporte prioritário WhatsApp',
  'Relatório final detalhado',
  'Orientação para melhoria de score',
  'Garantia de resultado',
];

export function LimpaNomeSection() {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const isSubscribed = subscription.subscribed;
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const basePrice = 999;
  const discountedPrice = isSubscribed ? 849 : 999;

  return (
    <section 
      ref={ref} 
      className="py-20 md:py-32 relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-primary/5" />
      
      {/* Animated Orbs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-rose-500/20 text-rose-600 border-rose-500/30 px-6 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            SERVIÇO PREMIUM • RESULTADO GARANTIDO
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Limpa Nome</span>
            <span className="block mt-2 text-foreground">Para CPF e CNPJ</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Regularize seu CPF ou CNPJ em todos os bureaus de crédito do Brasil. 
            Atendimento exclusivo com inteligência artificial e contador especializado.
          </p>
          
          {/* Target Audience Tags */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Badge variant="outline" className="px-4 py-2 text-base border-2 border-blue-500/30 bg-blue-500/10">
              <User className="h-4 w-4 mr-2 text-blue-500" />
              Pessoa Física (CPF)
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-base border-2 border-violet-500/30 bg-violet-500/10">
              <Building2 className="h-4 w-4 mr-2 text-violet-500" />
              Autônomos (CPF/CNPJ)
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-base border-2 border-emerald-500/30 bg-emerald-500/10">
              <Building2 className="h-4 w-4 mr-2 text-emerald-500" />
              Empresas (CNPJ)
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content - Benefits */}
          <div className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            {/* Bureaus Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
              <p className="w-full text-sm text-muted-foreground mb-2">Limpamos seu nome em:</p>
              {bureaus.map((bureau, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="px-4 py-2 text-sm font-medium border-2 bg-background"
                >
                  <div className={`w-2 h-2 rounded-full ${bureau.color} mr-2`} />
                  {bureau.name}
                </Badge>
              ))}
            </div>

            {/* Benefits Grid */}
            <div className="grid gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-rose-500/30 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 shrink-0">
                    <benefit.icon className="h-6 w-6 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="text-center">
                <p className="text-3xl font-bold text-rose-500">500+</p>
                <p className="text-xs text-muted-foreground">Clientes Atendidos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-rose-500">98%</p>
                <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-rose-500">30</p>
                <p className="text-xs text-muted-foreground">Dias em Média</p>
              </div>
            </div>
          </div>

          {/* Right Card - Pricing */}
          <div className={`transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <Card className="relative overflow-hidden border-2 border-rose-500/30 shadow-2xl">
              {/* Decorative Top */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
              
              {/* Popular Badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-rose-500 text-white border-0">
                  <Award className="h-3 w-3 mr-1" />
                  MAIS VENDIDO
                </Badge>
              </div>
              
              <CardContent className="p-8 pt-10">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    4.9/5 • Avaliação dos clientes
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Investimento único</p>
                  <div className="flex items-baseline gap-3">
                    {isSubscribed && (
                      <span className="text-2xl text-muted-foreground line-through">
                        R$ {basePrice}
                      </span>
                    )}
                    <span className="text-5xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                      R$ {discountedPrice}
                    </span>
                  </div>
                  <p className="text-lg text-foreground font-semibold mt-2">
                    ou <span className="text-rose-500">4x de R$ {Math.round(discountedPrice / 4)}</span> sem juros
                  </p>
                  {isSubscribed ? (
                    <Badge className="mt-2 bg-green-500/10 text-green-600 border-green-500/30">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      15% de desconto aplicado
                    </Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      ou até <span className="font-semibold text-foreground">12x de R$ {Math.round(discountedPrice / 12)}</span>
                    </p>
                  )}
                </div>

                {/* What's Included */}
                <div className="space-y-3 mb-8">
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-rose-500" />
                    Tudo que está incluso:
                  </p>
                  <div className="grid gap-2">
                    {included.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Button 
                  size="lg"
                  onClick={() => navigate('/limpa-nome')}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 glow-accent group"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Limpar Meu Nome Agora
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Trust Badge */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-green-500" />
                      Pagamento seguro
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      Suporte especializado
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    🔒 Garantia de resultado ou seu dinheiro de volta
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
