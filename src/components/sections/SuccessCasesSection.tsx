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
    <section ref={ref} id="cases" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="mb-4 border-success/30 text-success">
            <TrendingUp className="w-3 h-3 mr-1" />
            Cases de Sucesso
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Economia <span className="text-success">Real</span> dos Nossos Clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Veja quanto empresas de diferentes segmentos economizaram com análises e simulações do AtentAI
          </p>
          
          {/* Total savings highlight */}
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-success/20 to-emerald-500/20 border border-success/30">
            <Calculator className="w-8 h-8 text-success" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Economia total destes cases</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totalSavings)}<span className="text-base font-normal text-muted-foreground">/ano</span></p>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {successCases.map((caseItem, index) => {
            const Icon = caseItem.icon;
            return (
              <Card 
                key={index}
                className={`relative overflow-hidden border-border/50 hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Top gradient bar */}
                <div className={`h-1.5 bg-gradient-to-r ${caseItem.gradient}`} />
                
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${caseItem.bgGradient}`}>
                        <Icon className={`h-5 w-5 bg-gradient-to-r ${caseItem.gradient} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
                        <Icon className={`h-5 w-5`} style={{ color: caseItem.gradient.includes('blue') ? '#3b82f6' : caseItem.gradient.includes('emerald') ? '#10b981' : caseItem.gradient.includes('violet') ? '#8b5cf6' : caseItem.gradient.includes('orange') ? '#f97316' : '#f43f5e' }} />
                      </div>
                      <div>
                        <Badge variant="secondary" className="text-[10px] mb-1">{caseItem.segment}</Badge>
                        <p className="font-semibold text-foreground text-sm">{caseItem.company}</p>
                        <p className="text-xs text-muted-foreground">{caseItem.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Savings highlight */}
                  <div className={`rounded-xl p-4 mb-4 bg-gradient-to-br ${caseItem.bgGradient} border border-border/30`}>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Economia anual</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(caseItem.annualSavings)}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(caseItem.monthySavings)}/mês</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 text-success text-sm font-bold`}>
                          <TrendingUp className="w-3 h-3" />
                          -{caseItem.percentSaved}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Regime change */}
                  <div className="flex items-center gap-2 text-xs mb-4 p-2 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">{caseItem.oldRegime}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{caseItem.newRegime}</span>
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-muted-foreground italic mb-4 line-clamp-2">
                    "{caseItem.testimonial}"
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5">
                    {caseItem.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        {highlight}
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
          <p className="text-muted-foreground mb-4">
            Descubra quanto <span className="text-foreground font-semibold">sua empresa</span> pode economizar
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => navigate('/comecar')}
          >
            Fazer Minha Simulação Grátis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}