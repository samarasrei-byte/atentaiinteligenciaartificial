import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { calculateTransitionTax, TRANSITION_RATES, TransitionYear } from '@/components/simulator/YearSelector';
import { companyTypes, formatCurrency, selectiveTaxRates, SimulationResult } from '@/lib/taxData';
import { Calendar, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface TransitionTimelineProps {
  result: SimulationResult;
}

export const TransitionTimeline: React.FC<TransitionTimelineProps> = ({ result }) => {
  const [selectedYear, setSelectedYear] = useState<TransitionYear>(2026);

  const companyData = companyTypes.find((type) => type.value === result.input.companyType);
  const multiplier = companyData?.multiplier || 1;
  const creditFactor = companyData?.creditFactor || 0;
  const selectiveRate = selectiveTaxRates[result.input.sector] || 0;
  const adjustedRevenue = result.input.revenue * multiplier;

  const calculateYearlyTax = (year: TransitionYear) => {
    const yearRates = TRANSITION_RATES[year];
    const oldSystemFactor = 1 - yearRates.percentImplemented / 100;
    const oldTax = result.beforeTaxes.total * oldSystemFactor;

    const transitionTax = calculateTransitionTax(adjustedRevenue, year, creditFactor);
    const selectiveTax = adjustedRevenue * (selectiveRate / 100);
    const newTax = transitionTax.total + selectiveTax;
    const totalTax = oldTax + newTax;
    
    return {
      year: Number(year),
      phase: yearRates.phase,
      oldSystem: oldTax,
      newSystem: newTax,
      total: totalTax,
      oldPercent: yearRates.percentImplemented === 0 ? 100 : Math.max(0, 100 - yearRates.percentImplemented),
      newPercent: yearRates.total,
      implementedPercent: yearRates.percentImplemented,
    };
  };

  const timelineData = (Object.keys(TRANSITION_RATES) as unknown as TransitionYear[]).map(calculateYearlyTax);
  const currentYearData = timelineData.find(d => d.year === selectedYear);
  
  const currentYear = new Date().getFullYear();
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Teste': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case '10%':
      case '20%':
      case '40%':
      case '70%':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Definitivo': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const yearData = timelineData.find(d => d.year === label);
      return (
        <div className="bg-card border border-border p-4 rounded-lg shadow-lg">
          <p className="text-foreground font-bold text-lg mb-2">{label}</p>
          <Badge className={`${getPhaseColor(yearData?.phase || '')} mb-3`}>
            {yearData?.phase}
          </Badge>
          <div className="space-y-1">
            <p className="text-destructive text-sm">
              Sistema Atual remanescente: {formatCurrency(payload[0]?.value || 0)} ({yearData?.oldPercent}%)
            </p>
            <p className="text-primary text-sm">
              IBS/CBS + IS: {formatCurrency(payload[1]?.value || 0)} (alíquota {yearData?.newPercent}%)
            </p>
            <p className="text-foreground font-medium pt-1 border-t border-border mt-2">
              Total: {formatCurrency(yearData?.total || 0)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card/70 border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl text-foreground">Transição 2026-2033</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Simulação ano a ano da carga tributária durante a transição
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="year" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => (
                <span className="text-muted-foreground text-sm">
                  {value === 'oldSystem' ? 'Sistema Atual' : 'Novo Sistema'}
                </span>
              )}
            />
            <Area 
              type="monotone" 
              dataKey="oldSystem" 
              stackId="1" 
                stroke="hsl(var(--destructive))" 
                fill="hsl(var(--destructive))" 
              fillOpacity={0.6}
              name="oldSystem"
            />
            <Area 
              type="monotone" 
              dataKey="newSystem" 
              stackId="1" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
              fillOpacity={0.6}
              name="newSystem"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Year Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Selecione o ano:</span>
              <span className="text-foreground font-bold text-lg">{selectedYear}</span>
          </div>
          <Slider
            value={[selectedYear]}
              onValueChange={(value) => setSelectedYear(value[0] as TransitionYear)}
            min={2026}
            max={2033}
            step={1}
            className="w-full"
          />
            <div className="flex justify-between text-xs text-muted-foreground">
            <span>2026</span>
            <span>2033</span>
          </div>
        </div>

        {/* Selected Year Details */}
        {currentYearData && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground font-semibold">Detalhes de {selectedYear}</h4>
              <Badge className={getPhaseColor(currentYearData.phase)}>
                {currentYearData.phase}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-destructive/10 rounded-lg p-3">
                <p className="text-destructive text-xs mb-1">Sistema Atual ({currentYearData.oldPercent}%)</p>
                <p className="text-foreground font-bold">{formatCurrency(currentYearData.oldSystem)}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-primary text-xs mb-1">Novo Sistema (alíquota {currentYearData.newPercent}%)</p>
                <p className="text-foreground font-bold">{formatCurrency(currentYearData.newSystem)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-muted-foreground">Carga Total Estimada:</span>
              <span className="text-xl font-bold text-foreground">{formatCurrency(currentYearData.total)}</span>
            </div>

            {/* Strategic Alert */}
            {selectedYear <= 2028 && (
              <div className="flex items-start gap-2 bg-blue-500/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-blue-300 text-sm">
                  Período de teste/adaptação. Aproveite para ajustar processos e sistemas.
                </p>
              </div>
            )}
            {selectedYear >= 2029 && selectedYear <= 2032 && (
              <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-amber-300 text-sm">
                  Período crítico de transição. Monitore créditos, caixa e preço final.
                </p>
              </div>
            )}
            {selectedYear === 2033 && (
              <div className="flex items-start gap-2 bg-green-500/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-green-300 text-sm">
                  Regime definitivo implementado. Sistema antigo completamente substituído.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Savings/Cost Comparison */}
        <div className={`p-4 rounded-lg ${result.difference < 0 ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.difference < 0 ? (
              <TrendingDown className="h-5 w-5 text-green-400" />
            ) : (
              <TrendingUp className="h-5 w-5 text-red-400" />
            )}
            <span className={`font-medium ${result.difference < 0 ? 'text-green-400' : 'text-red-400'}`}>
              {result.difference < 0 ? 'Economia estimada' : 'Aumento estimado'} no ano simulado
            </span>
          </div>
          <p className={`text-2xl font-bold ${result.difference < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(Math.abs(result.difference))} / mês
          </p>
          <p className={`text-sm ${result.difference < 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
            {formatCurrency(Math.abs(result.difference * 12))} / ano
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
