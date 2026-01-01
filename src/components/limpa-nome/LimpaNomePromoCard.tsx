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
  const basePrice = 99900; // R$ 999,00
  const discountPercent = 15;
  const discountedPrice = Math.round(basePrice * (1 - discountPercent / 100));

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const features = [
    'Análise completa do seu CPF',
    'Negociação com todos os bureaus',
    'Chat com IA + Especialista',
    'Acompanhamento em tempo real',
    'SPC, Serasa, SCPC, Boa Vista',
  ];

  const bureaus = ['SPC', 'Serasa', 'SCPC', 'Boa Vista'];

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
                    NOVO
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Limpe seu CPF em todos os bureaus com IA + Especialista
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                {isSubscribed ? (
                  <>
                    <span className="text-xl font-bold text-success">{formatPrice(discountedPrice)}</span>
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
                <Badge className="bg-rose-500/20 text-rose-600 border-rose-500/30 text-xs">NOVO</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Limpe seu CPF com IA + Especialista
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
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                Limpa Nome
                <Badge className="bg-rose-500/20 text-rose-600 border-rose-500/30 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  NOVO SERVIÇO
                </Badge>
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Limpe seu CPF em todos os bureaus de crédito
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* AI Feature Highlight */}
        {showAIFeature && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20">
            <div className="p-2 rounded-lg bg-primary/20">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Chat Inteligente com IA</p>
              <p className="text-xs text-muted-foreground">
                Atendimento 24h com IA + especialista humano
              </p>
            </div>
            <Zap className="h-4 w-4 text-accent" />
          </div>
        )}

        {/* Bureaus */}
        <div className="flex flex-wrap gap-2">
          {bureaus.map((bureau) => (
            <Badge 
              key={bureau} 
              variant="outline" 
              className="bg-muted/50 text-muted-foreground border-border"
            >
              {bureau}
            </Badge>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-2">
          {features.slice(0, 4).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="space-y-2 pt-2 border-t border-border">
          {isSubscribed ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-success">{formatPrice(discountedPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatPrice(basePrice)}</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{formatPrice(basePrice)}</span>
            </div>
          )}
          {isSubscribed ? (
            <div className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-success font-medium">
                {discountPercent}% de desconto para assinantes
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-accent font-medium">
                Assine e ganhe {discountPercent}% de desconto
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
      </CardContent>
    </Card>
  );
};
