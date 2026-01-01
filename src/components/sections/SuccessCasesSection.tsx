import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Building2, 
  Stethoscope, 
  ShoppingCart, 
  Laptop, 
  Utensils,
  ArrowRight,
  CheckCircle2,
  Calculator
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useNavigate } from "react-router-dom";

const successCases = [
  {
    icon: ShoppingCart,
    segment: "Varejo",
    company: "Rede de Supermercados",
    location: "São Paulo, SP",
    revenue: "R$ 2,4M/ano",
    oldRegime: "Lucro Presumido",
    newRegime: "Simples Nacional",
    annualSavings: 84720,
    monthySavings: 7060,
    percentSaved: 23,
    testimonial: "Com o AtentAI identificamos que estávamos no regime errado há 3 anos.",
    highlights: ["Migração de regime", "Redução de DAS", "Planejamento 2026"],
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10"
  },
  {
    icon: Stethoscope,
    segment: "Saúde",
    company: "Clínica Médica",
    location: "Rio de Janeiro, RJ",
    revenue: "R$ 1,8M/ano",
    oldRegime: "Lucro Presumido",
    newRegime: "Lucro Presumido Otimizado",
    annualSavings: 52440,
    monthySavings: 4370,
    percentSaved: 18,
    testimonial: "A simulação mostrou que nosso fator R estava sendo calculado errado.",
    highlights: ["Fator R otimizado", "Créditos recuperados", "Anexo V → III"],
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10"
  },
  {
    icon: Laptop,
    segment: "Tecnologia",
    company: "Startup SaaS",
    location: "Florianópolis, SC",
    revenue: "R$ 960K/ano",
    oldRegime: "MEI + PF",
    newRegime: "ME - Simples Nacional",
    annualSavings: 31200,
    monthySavings: 2600,
    percentSaved: 35,
    testimonial: "Descobrimos que já tínhamos ultrapassado o limite MEI sem saber.",
    highlights: ["Migração MEI→ME", "Split de sócios", "Planejamento IBS/CBS"],
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/10"
  },
  {
    icon: Building2,
    segment: "Construção",
    company: "Construtora",
    location: "Belo Horizonte, MG",
    revenue: "R$ 4,2M/ano",
    oldRegime: "Lucro Real",
    newRegime: "Lucro Presumido",
    annualSavings: 126840,
    monthySavings: 10570,
    percentSaved: 15,
    testimonial: "A análise do AtentAI mostrou que Lucro Presumido era mais vantajoso para nosso perfil.",
    highlights: ["Mudança de regime", "Redução IRPJ/CSLL", "Preparação reforma"],
    gradient: "from-orange-500 to-amber-500",
    bgGradient: "from-orange-500/10 to-amber-500/10"
  },
  {
    icon: Utensils,
    segment: "Alimentação",
    company: "Restaurante",
    location: "Curitiba, PR",
    revenue: "R$ 720K/ano",
    oldRegime: "Simples Nacional",
    newRegime: "Simples otimizado + Split",
    annualSavings: 18960,
    monthySavings: 1580,
    percentSaved: 22,
    testimonial: "Estruturamos melhor a empresa para aproveitar créditos da reforma.",
    highlights: ["Cashback tributário", "Cesta básica isenta", "Simulação 2026-2033"],
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-500/10 to-pink-500/10"
  }
];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function SuccessCasesSection() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  const totalSavings = successCases.reduce((acc, c) => acc + c.annualSavings, 0);

  return (
    <section ref={ref} id="cases" className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-10 md:mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="mb-4 border-success/30 text-success text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Cases de Sucesso
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 md:mb-4 px-2">
            Economia <span className="text-success">Real</span> dos Nossos Clientes
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 md:mb-6 px-4">
            Veja quanto empresas economizaram com o AtentAI
          </p>
          
          {/* Total savings highlight */}
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl md:rounded-2xl bg-gradient-to-r from-success/20 to-emerald-500/20 border border-success/30">
            <Calculator className="w-6 h-6 md:w-8 md:h-8 text-success flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs md:text-sm text-muted-foreground">Economia total</p>
              <p className="text-lg md:text-2xl font-bold text-success">{formatCurrency(totalSavings)}<span className="text-xs md:text-base font-normal text-muted-foreground">/ano</span></p>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {successCases.map((caseItem, index) => {
            const Icon = caseItem.icon;
            const iconColor = caseItem.gradient.includes('blue') ? '#3b82f6' : caseItem.gradient.includes('emerald') ? '#10b981' : caseItem.gradient.includes('violet') ? '#8b5cf6' : caseItem.gradient.includes('orange') ? '#f97316' : '#f43f5e';
            return (
              <Card 
                key={index}
                className={`relative overflow-hidden border-border/50 hover:shadow-xl transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Top gradient bar */}
                <div className={`h-1 bg-gradient-to-r ${caseItem.gradient}`} />
                
                <CardContent className="p-4 md:p-6">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3 md:mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${caseItem.bgGradient} flex-shrink-0`}>
                      <Icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: iconColor }} />
                    </div>
                    <div className="min-w-0">
                      <Badge variant="secondary" className="text-[9px] md:text-[10px] mb-1">{caseItem.segment}</Badge>
                      <p className="font-semibold text-foreground text-xs md:text-sm truncate">{caseItem.company}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{caseItem.location}</p>
                    </div>
                  </div>

                  {/* Savings highlight */}
                  <div className={`rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4 bg-gradient-to-br ${caseItem.bgGradient} border border-border/30`}>
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Economia anual</p>
                        <p className="text-lg md:text-2xl font-bold text-foreground truncate">{formatCurrency(caseItem.annualSavings)}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">{formatCurrency(caseItem.monthySavings)}/mês</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full bg-success/20 text-success text-xs md:text-sm font-bold">
                          <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          -{caseItem.percentSaved}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Regime change */}
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs mb-3 p-2 rounded-lg bg-muted/50 overflow-hidden">
                    <span className="text-muted-foreground truncate">{caseItem.oldRegime}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-semibold text-foreground truncate">{caseItem.newRegime}</span>
                  </div>

                  {/* Quote */}
                  <p className="text-xs md:text-sm text-muted-foreground italic mb-3 line-clamp-2">
                    "{caseItem.testimonial}"
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1">
                    {caseItem.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center gap-0.5 text-[9px] md:text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-success flex-shrink-0" />
                        <span className="truncate">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className={`text-center transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} style={{ transitionDelay: '600ms' }}>
          <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 px-4">
            Descubra quanto <span className="text-foreground font-semibold">sua empresa</span> pode economizar
          </p>
          <Button 
            size="default"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-sm md:text-base px-6"
            onClick={() => navigate('/comecar')}
          >
            Fazer Minha Simulação Grátis
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}