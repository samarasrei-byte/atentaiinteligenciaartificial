import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Percent,
  Crown,
  Zap,
  Bot,
  MessageCircle,
  Building2,
  User,
  Star,
  Clock,
  Award,
} from 'lucide-react';

interface LimpaNomePromoCardProps {
  variant?: 'full' | 'compact' | 'banner';
  showAIFeature?: boolean;
}

export const LimpaNomePromoCard: React.FC<LimpaNomePromoCardProps> = ({ 
  variant = 'full',
  showAIFeature = true
}) => {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  
  const isSubscribed = subscription?.subscribed || false;
  const basePrice = 97000; // R$ 970,00
  const discountPercent = 15;
  const discountedPrice = Math.round(basePrice * (1 - discountPercent / 100));

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const features = [
    'Análise em 8 plataformas (SPC, Serasa, Quod, Cenprot...)',
    'Especialista dedicado ao seu caso',
    'Atendimento personalizado via WhatsApp',
    'Carta de quitação + relatório completo',
    'Acompanhamento por 90 dias',
    'Garantia de resultado',
  ];

  const bureaus = ['SPC', 'Serasa', 'SCPC', 'Boa Vista', 'Quod', 'Cenprot', 'Registrato', 'CADIN'];

  if (variant === 'banner') {
    return (
      <Card className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border-rose-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">Limpa Nome</h3>
                  <Badge className="bg-rose-500/20 text-rose-600 border-rose-500/30 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    CPF & CNPJ
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Regularize seu CPF ou CNPJ com IA + Especialista • Resultado em 30 dias
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                {isSubscribed ? (
                  <>
                    <span className="text-xl font-bold text-green-600">{formatPrice(discountedPrice)}</span>
                    <span className="text-sm text-muted-foreground line-through ml-2">{formatPrice(basePrice)}</span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-foreground">{formatPrice(basePrice)}</span>
                )}
              </div>
              <Button 
                onClick={() => navigate('/limpa-nome')}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
              >
                Limpar Nome
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="bg-card border-border hover:border-rose-500/30 transition-all group cursor-pointer" onClick={() => navigate('/limpa-nome')}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Limpa Nome</h3>
                <Badge className="bg-rose-500/20 text-rose-600 border-rose-500/30 text-xs">CPF & CNPJ</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                IA + Especialista • Resultado garantido
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className="bg-card border-rose-500/30 hover:border-rose-500/50 transition-all overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      {/* Popular Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-rose-500 text-white border-0 text-xs">
          <Award className="h-3 w-3 mr-1" />
          PREMIUM
        </Badge>
      </div>
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              Limpa Nome
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              CPF ou CNPJ • Todos os bureaus
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Target badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">
            <User className="h-3 w-3 mr-1" />
            Pessoa Física
          </Badge>
          <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/30 text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            Autônomos
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            Empresas
          </Badge>
        </div>

        {/* Human Feature Highlight */}
        {showAIFeature && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Empresa Especializada Dedicada</p>
              <p className="text-xs text-muted-foreground">
                Atendimento 100% humano • Resultado em 30 dias
              </p>
            </div>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">4.9/5 • 500+ atendidos</span>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {features.slice(0, 4).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="space-y-2 pt-2 border-t border-border">
          {isSubscribed ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">{formatPrice(discountedPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatPrice(basePrice)}</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{formatPrice(basePrice)}</span>
            </div>
          )}
          <p className="text-sm font-semibold text-rose-500">
            ou 4x de {formatPrice(Math.round((isSubscribed ? discountedPrice : basePrice) / 4))} sem juros
          </p>
          {isSubscribed ? (
            <div className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                {discountPercent}% de desconto aplicado
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs text-amber-600 font-medium">
                Assine e ganhe {discountPercent}% OFF
              </span>
            </div>
          )}
        </div>

        <Button 
          onClick={() => navigate('/limpa-nome')}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Limpar Meu Nome
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          🔒 Garantia de resultado ou dinheiro de volta
        </p>
      </CardContent>
    </Card>
  );
};
