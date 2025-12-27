import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Calculator, TrendingDown, Wallet, PiggyBank, Loader2 } from 'lucide-react';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/taxData';
import { TRANSITION_RATES } from './YearSelector';

/**
 * Dados do cronograma de transição para o gráfico
 */
const TRANSITION_CHART_DATA = Object.entries(TRANSITION_RATES).map(([year, rates]) => ({
  year: Number(year),
  ibs: rates.ibs,
  cbs: rates.cbs,
  total: rates.total,
  percentImplemented: rates.percentImplemented,
  phase: rates.phase,
}));

interface TransitionEvolutionChartProps {
  className?: string;
}

export function TransitionEvolutionChart({ className }: TransitionEvolutionChartProps) {
  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-cyan-400" />
          Evolução das Alíquotas (2026-2033)
        </CardTitle>
        <CardDescription className="text-slate-400">
          Curva de implementação progressiva do IBS + CBS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={TRANSITION_CHART_DATA}>
            <defs>
              <linearGradient id="colorIbs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorCbs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
            />
            <YAxis 
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
              domain={[0, 30]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)}%`, 
                name === 'ibs' ? 'IBS' : name === 'cbs' ? 'CBS' : 'Total'
              ]}
              labelFormatter={(label) => `Ano ${label}`}
            />
            <Legend 
              formatter={(value) => value === 'ibs' ? 'IBS (Estadual/Municipal)' : value === 'cbs' ? 'CBS (Federal)' : 'Total'}
              wrapperStyle={{ color: '#94a3b8' }}
            />
            <Area 
              type="stepAfter" 
              dataKey="ibs" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorIbs)"
              strokeWidth={2}
            />
            <Area 
              type="stepAfter" 
              dataKey="cbs" 
              stroke="#22c55e" 
              fillOpacity={1} 
              fill="url(#colorCbs)"
              strokeWidth={2}
            />
            <Line 
              type="stepAfter" 
              dataKey="total" 
              stroke="#14b8a6" 
              strokeWidth={3}
              dot={{ fill: '#14b8a6', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Phase indicators */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          <Badge variant="outline" className="border-amber-500 text-amber-400">
            2026-2028: Teste (1%)
          </Badge>
          <Badge variant="outline" className="border-cyan-500 text-cyan-400">
            2029-2032: Transição
          </Badge>
          <Badge variant="outline" className="border-green-500 text-green-400">
            2033: Definitivo (26,5%)
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface AccumulatedSavingsResult {
  year: number;
  currentTax: number;
  newTax: number;
  annualSavings: number;
  accumulatedSavings: number;
  phase: string;
}

interface AccumulatedSavingsCalculatorProps {
  className?: string;
}

export function AccumulatedSavingsCalculator({ className }: AccumulatedSavingsCalculatorProps) {
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [currentTaxRate, setCurrentTaxRate] = useState('25');
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<AccumulatedSavingsResult[] | null>(null);

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyRevenue(formatCurrencyInput(e.target.value));
  };

  const calculateSavings = async () => {
    const revenue = parseCurrencyInput(monthlyRevenue);
    if (!revenue || revenue <= 0) return;

    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const annualRevenue = revenue * 12;
    const currentRate = parseFloat(currentTaxRate) || 25;
    const currentAnnualTax = annualRevenue * (currentRate / 100);

    let accumulated = 0;
    const yearResults: AccumulatedSavingsResult[] = [];

    Object.entries(TRANSITION_RATES).forEach(([year, rates]) => {
      // During transition, we pay both systems proportionally
      const newSystemPercent = rates.percentImplemented / 100;
      const oldSystemPercent = 1 - newSystemPercent;
      
      // New system tax
      const newSystemTax = annualRevenue * (rates.total / 100);
      
      // Blended tax during transition
      const blendedTax = (currentAnnualTax * oldSystemPercent) + (newSystemTax * newSystemPercent);
      
      // Savings compared to full current system
      const annualSavings = currentAnnualTax - blendedTax;
      accumulated += annualSavings;

      yearResults.push({
        year: Number(year),
        currentTax: currentAnnualTax,
        newTax: blendedTax,
        annualSavings,
        accumulatedSavings: accumulated,
        phase: rates.phase,
      });
    });

    setResults(yearResults);
    setIsCalculating(false);
  };

  const totalSavings = results?.reduce((sum, r) => sum + r.annualSavings, 0) || 0;
  const chartData = results?.map(r => ({
    year: r.year,
    economia: r.annualSavings,
    acumulado: r.accumulatedSavings,
    atual: r.currentTax,
    novo: r.newTax,
  }));

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-green-400" />
          Calculadora de Economia Acumulada
        </CardTitle>
        <CardDescription className="text-slate-400">
          Simule quanto sua empresa economizará durante a transição tributária
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Faturamento Mensal</Label>
            <Input
              placeholder="R$ 0,00"
              value={monthlyRevenue}
              onChange={handleRevenueChange}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Alíquota Atual (%)</Label>
            <Input
              type="number"
              value={currentTaxRate}
              onChange={(e) => setCurrentTaxRate(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white"
              min="1"
              max="50"
            />
            <p className="text-xs text-slate-500">Carga tributária atual sobre consumo</p>
          </div>
          <div className="flex items-end">
            <Button
              onClick={calculateSavings}
              disabled={isCalculating || !monthlyRevenue}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Economia
                </>
              )}
            </Button>
          </div>
        </div>

        {results && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-green-900/30 border-green-700/50">
                <CardContent className="p-4 text-center">
                  <Wallet className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-xs text-green-400">Economia Total</p>
                  <p className="text-lg font-bold text-green-300">{formatCurrency(totalSavings)}</p>
                  <p className="text-xs text-slate-400">2026-2033</p>
                </CardContent>
              </Card>
              <Card className="bg-cyan-900/30 border-cyan-700/50">
                <CardContent className="p-4 text-center">
                  <TrendingDown className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-xs text-cyan-400">Economia em 2033</p>
                  <p className="text-lg font-bold text-cyan-300">
                    {formatCurrency(results[results.length - 1]?.annualSavings || 0)}
                  </p>
                  <p className="text-xs text-slate-400">por ano</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-900/30 border-amber-700/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-amber-400">Imposto Atual/Ano</p>
                  <p className="text-lg font-bold text-amber-300">
                    {formatCurrency(results[0]?.currentTax || 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-slate-400">Imposto 2033/Ano</p>
                  <p className="text-lg font-bold text-slate-300">
                    {formatCurrency(results[results.length - 1]?.newTax || 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Accumulated Savings Chart */}
            <div>
              <h4 className="text-white font-medium mb-4">Economia Acumulada por Ano</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar 
                    dataKey="economia" 
                    name="Economia Anual" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="acumulado" 
                    name="Economia Acumulada" 
                    fill="#14b8a6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Year by Year Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400">Ano</th>
                    <th className="text-left py-2 text-slate-400">Fase</th>
                    <th className="text-right py-2 text-slate-400">Imposto Atual</th>
                    <th className="text-right py-2 text-slate-400">Imposto Novo</th>
                    <th className="text-right py-2 text-green-400">Economia/Ano</th>
                    <th className="text-right py-2 text-cyan-400">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.year} className="border-b border-slate-700/50">
                      <td className="py-2 text-white font-medium">{r.year}</td>
                      <td className="py-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            r.phase === 'Teste' 
                              ? 'border-amber-500 text-amber-400'
                              : r.phase === 'Definitivo'
                                ? 'border-green-500 text-green-400'
                                : 'border-cyan-500 text-cyan-400'
                          }`}
                        >
                          {r.phase}
                        </Badge>
                      </td>
                      <td className="py-2 text-right text-slate-300">{formatCurrency(r.currentTax)}</td>
                      <td className="py-2 text-right text-slate-300">{formatCurrency(r.newTax)}</td>
                      <td className="py-2 text-right text-green-400 font-medium">
                        {r.annualSavings > 0 ? '+' : ''}{formatCurrency(r.annualSavings)}
                      </td>
                      <td className="py-2 text-right text-cyan-400 font-medium">
                        {formatCurrency(r.accumulatedSavings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500 text-center">
              * Valores estimados considerando transição gradual. A economia real depende do seu regime tributário e setor de atuação.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
