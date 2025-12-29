import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, SimulationResult } from '@/lib/taxData';
import { Calendar, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface TransitionTimelineProps {
  result: SimulationResult;
}

// Cronograma de transição da reforma tributária - LC 214/2025
const transitionSchedule = [
  { year: 2026, ibsRate: 0.1, cbsRate: 0.9, oldSystemRate: 100, phase: 'Teste' },
  { year: 2027, ibsRate: 8, cbsRate: 8.8, oldSystemRate: 100, phase: 'Teste + Início' },
  { year: 2028, ibsRate: 10, cbsRate: 8.8, oldSystemRate: 90, phase: 'Transição' },
  { year: 2029, ibsRate: 20, cbsRate: 8.8, oldSystemRate: 80, phase: 'Transição' },
  { year: 2030, ibsRate: 40, cbsRate: 8.8, oldSystemRate: 60, phase: 'Transição' },
  { year: 2031, ibsRate: 60, cbsRate: 8.8, oldSystemRate: 40, phase: 'Transição' },
  { year: 2032, ibsRate: 80, cbsRate: 8.8, oldSystemRate: 20, phase: 'Transição' },
  { year: 2033, ibsRate: 100, cbsRate: 8.8, oldSystemRate: 0, phase: 'Definitivo' },
];

export const TransitionTimeline: React.FC<TransitionTimelineProps> = ({ result }) => {
  const [selectedYear, setSelectedYear] = useState(2026);

  const calculateYearlyTax = (yearData: typeof transitionSchedule[0]) => {
    const revenue = result.input.revenue;
    const oldTax = result.beforeTaxes.total * (yearData.oldSystemRate / 100);
    const newTax = result.afterTaxes.total * ((100 - yearData.oldSystemRate) / 100);
    const totalTax = oldTax + newTax;
    
    return {
      year: yearData.year,
      phase: yearData.phase,
      oldSystem: oldTax,
      newSystem: newTax,
      total: totalTax,
      oldPercent: yearData.oldSystemRate,
      newPercent: 100 - yearData.oldSystemRate,
    };
  };

  const timelineData = transitionSchedule.map(calculateYearlyTax);
  const currentYearData = timelineData.find(d => d.year === selectedYear);
  
  const currentYear = new Date().getFullYear();
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Teste': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Teste + Início': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Transição': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Definitivo': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const yearData = timelineData.find(d => d.year === label);
      return (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-lg">
          <p className="text-white font-bold text-lg mb-2">{label}</p>
          <Badge className={`${getPhaseColor(yearData?.phase || '')} mb-3`}>
            {yearData?.phase}
          </Badge>
          <div className="space-y-1">
            <p className="text-orange-400 text-sm">
              Sistema Atual: {formatCurrency(payload[0]?.value || 0)} ({yearData?.oldPercent}%)
            </p>
            <p className="text-cyan-400 text-sm">
              Novo Sistema: {formatCurrency(payload[1]?.value || 0)} ({yearData?.newPercent}%)
            </p>
            <p className="text-white font-medium pt-1 border-t border-slate-600 mt-2">
              Total: {formatCurrency(yearData?.total || 0)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <CardTitle className="text-xl text-white">Transição 2026-2033</CardTitle>
        </div>
        <CardDescription className="text-slate-400">
          Simulação ano a ano da carga tributária durante a transição
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#94a3b8' }}
            />
            <YAxis 
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => (
                <span className="text-slate-300 text-sm">
                  {value === 'oldSystem' ? 'Sistema Atual' : 'Novo Sistema'}
                </span>
              )}
            />
            <Area 
              type="monotone" 
              dataKey="oldSystem" 
              stackId="1" 
              stroke="#f97316" 
              fill="#f97316" 
              fillOpacity={0.6}
              name="oldSystem"
            />
            <Area 
              type="monotone" 
              dataKey="newSystem" 
              stackId="1" 
              stroke="#14b8a6" 
              fill="#14b8a6" 
              fillOpacity={0.6}
              name="newSystem"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Year Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Selecione o ano:</span>
            <span className="text-white font-bold text-lg">{selectedYear}</span>
          </div>
          <Slider
            value={[selectedYear]}
            onValueChange={(value) => setSelectedYear(value[0])}
            min={2026}
            max={2033}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>2026</span>
            <span>2033</span>
          </div>
        </div>

        {/* Selected Year Details */}
        {currentYearData && (
          <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold">Detalhes de {selectedYear}</h4>
              <Badge className={getPhaseColor(currentYearData.phase)}>
                {currentYearData.phase}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-500/10 rounded-lg p-3">
                <p className="text-orange-400 text-xs mb-1">Sistema Atual ({currentYearData.oldPercent}%)</p>
                <p className="text-white font-bold">{formatCurrency(currentYearData.oldSystem)}</p>
              </div>
              <div className="bg-cyan-500/10 rounded-lg p-3">
                <p className="text-cyan-400 text-xs mb-1">Novo Sistema ({currentYearData.newPercent}%)</p>
                <p className="text-white font-bold">{formatCurrency(currentYearData.newSystem)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <span className="text-slate-400">Carga Total Estimada:</span>
              <span className="text-xl font-bold text-white">{formatCurrency(currentYearData.total)}</span>
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
                  Período crítico de transição. Monitore o impacto nos créditos tributários.
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
              {result.difference < 0 ? 'Economia estimada' : 'Aumento estimado'} no regime definitivo
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
