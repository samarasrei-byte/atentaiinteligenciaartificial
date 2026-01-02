import { useState } from 'react';
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
  User,
  Briefcase
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
  { icon: Building2, title: 'Empresa Especializada Dedicada', desc: 'Atendimento 100% humano com especialistas em recuperação de crédito' },
  { icon: Clock, title: 'Resultado em até 30 dias', desc: 'Processo ágil com acompanhamento em tempo real via WhatsApp' },
  { icon: FileCheck, title: 'Carta de Quitação Digital', desc: 'Documento oficial + relatório completo de regularização' },
  { icon: Shield, title: 'Garantia de Resultado', desc: 'Seu dinheiro de volta se não limparmos seu nome' },
];

const included = [
  'Análise completa CPF ou CNPJ em 8 bureaus',
  'Especialista dedicado ao seu caso',
  'Atendimento personalizado via chat e WhatsApp',
  'Consulta Registrato (Banco Central)',
  'Verificação protestos (Cenprot)',
  'Carta de quitação digital',
  'Acompanhamento por 90 dias',
  'Suporte prioritário WhatsApp',
  'Relatório final detalhado',
  'Orientação para melhoria de score',
  'Garantia de resultado',
];

const clientTypes = [
  { 
    id: 'pf', 
    icon: User, 
    title: 'Pessoa Física (CPF)', 
    color: 'blue',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    borderColor: 'border-blue-500/30 hover:border-blue-500/50',
    iconColor: 'text-blue-500'
  },
  { 
    id: 'autonomo', 
    icon: Building2, 
    title: 'Autônomos (CPF/CNPJ)', 
    color: 'violet',
    bgColor: 'bg-violet-500/10 hover:bg-violet-500/20',
    borderColor: 'border-violet-500/30 hover:border-violet-500/50',
    iconColor: 'text-violet-500'
  },
  { 
    id: 'empresa', 
    icon: Building2, 
    title: 'Empresas (CNPJ)', 
    color: 'emerald',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
    iconColor: 'text-emerald-500'
  },
];

export function LimpaNomeSection() {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const isSubscribed = subscription.subscribed;
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const basePrice = 970;
  const discountedPrice = isSubscribed ? 824 : 970;

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    // Scroll suave para o card de preço
    setTimeout(() => {
      document.getElementById('limpa-nome-price-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

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
        <div className="text-center mb-12">
          <Badge className="mb-6 bg-rose-500/20 text-rose-600 border-rose-500/30 px-6 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            EMPRESA ESPECIALIZADA • RESULTADO GARANTIDO
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent italic">Limpa Nome</span>
            <span className="block mt-2 text-foreground">Para CPF e CNPJ</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Regularize seu CPF ou CNPJ com atendimento <strong className="text-foreground">100% humano</strong>. 
            Empresa especializada dedicada ao seu caso, do início ao fim.
          </p>
          
          {/* Client Type Selection - Interactive Cards */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {clientTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelectType(type.id)}
                className={`
                  group px-6 py-4 rounded-full border-2 transition-all duration-300 cursor-pointer
                  ${type.bgColor} ${type.borderColor}
                  ${selectedType === type.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105' : ''}
                  hover:scale-105 hover:shadow-lg
                `}
              >
                <div className="flex items-center gap-3">
                  <type.icon className={`h-5 w-5 ${type.iconColor} group-hover:scale-110 transition-transform`} />
                  <span className="font-medium text-foreground">{type.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Type Indicator */}
          {selectedType && (
            <div className="mt-6 animate-fade-in">
              <Badge className="bg-green-500/20 text-green-600 border-green-500/30 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                {clientTypes.find(t => t.id === selectedType)?.title} selecionado - Role para continuar!
              </Badge>
            </div>
          )}
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
          <div 
            id="limpa-nome-price-card"
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <Card className="relative overflow-hidden border-2 border-rose-500/30 shadow-2xl">
              {/* Decorative Top */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
              
              {/* Popular Badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-rose-500 text-white border-0">
                  <Award className="h-3 w-3 mr-1" />
                  EMPRESA ESPECIALIZADA
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

                {/* Empresa Especializada Info */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Empresa Especializada</p>
                      <p className="text-xs text-muted-foreground">Parceiro oficial em recuperação de crédito</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contamos com parceiros especializados em negociação de dívidas, com mais de 10 anos de experiência no mercado brasileiro.
                  </p>
                </div>

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
                      Empresa Especializada
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
