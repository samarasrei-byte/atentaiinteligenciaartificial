import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Calculator, TrendingDown, Wallet, PiggyBank, Loader2, Download, Scale, Trophy } from 'lucide-react';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/taxData';
import { TRANSITION_RATES } from './YearSelector';
import { exportTransitionProjectionToPdf } from '@/lib/exportTransitionPdf';
import { useToast } from '@/hooks/use-toast';

/**
 * Alíquotas estimadas por regime tributário
 */
const REGIME_TAX_RATES = {
  simples: { name: 'Simples Nacional', rate: 9.5, description: 'Faixa média até R$ 720k/ano' },
  presumido: { name: 'Lucro Presumido', rate: 16.33, description: 'PIS/COFINS + IRPJ/CSLL presunção 32%' },
  real: { name: 'Lucro Real', rate: 24.25, description: 'PIS/COFINS não-cumulativo + IRPJ/CSLL' },
};

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

interface RegimeResult {
  regime: string;
  regimeName: string;
  currentTaxRate: number;
  yearlyData: AccumulatedSavingsResult[];
  totalSavings: number;
}

interface AccumulatedSavingsCalculatorProps {
  className?: string;
}

export function AccumulatedSavingsCalculator({ className }: AccumulatedSavingsCalculatorProps) {
  const { toast } = useToast();
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [selectedRegime, setSelectedRegime] = useState<string>('all');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [results, setResults] = useState<AccumulatedSavingsResult[] | null>(null);
  const [regimeResults, setRegimeResults] = useState<RegimeResult[] | null>(null);

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyRevenue(formatCurrencyInput(e.target.value));
  };

  const calculateSavings = async () => {
    const revenue = parseCurrencyInput(monthlyRevenue);
    if (!revenue || revenue <= 0) return;

    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const annualRevenue = revenue * 12;
    
    // Calculate for all regimes
    const allRegimeResults: RegimeResult[] = Object.entries(REGIME_TAX_RATES).map(([key, regime]) => {
      const currentRate = regime.rate;
      const currentAnnualTax = annualRevenue * (currentRate / 100);
      let accumulated = 0;
      
      const yearlyData: AccumulatedSavingsResult[] = Object.entries(TRANSITION_RATES).map(([year, rates]) => {
        const newSystemPercent = rates.percentImplemented / 100;
        const oldSystemPercent = 1 - newSystemPercent;
        const newSystemTax = annualRevenue * (rates.total / 100);
        const blendedTax = (currentAnnualTax * oldSystemPercent) + (newSystemTax * newSystemPercent);
        const annualSavings = currentAnnualTax - blendedTax;
        accumulated += annualSavings;

        return {
          year: Number(year),
          currentTax: currentAnnualTax,
          newTax: blendedTax,
          annualSavings,
          accumulatedSavings: accumulated,
          phase: rates.phase,
        };
      });

      return {
        regime: key,
        regimeName: regime.name,
        currentTaxRate: regime.rate,
        yearlyData,
        totalSavings: accumulated,
      };
    });

    setRegimeResults(allRegimeResults);
    
    // Set default view to the selected regime or first one
    const displayRegime = selectedRegime === 'all' 
      ? allRegimeResults[0] 
      : allRegimeResults.find(r => r.regime === selectedRegime) || allRegimeResults[0];
    
    setResults(displayRegime.yearlyData);
    setIsCalculating(false);
  };

  const handleExportPdf = async () => {
    if (!regimeResults || !monthlyRevenue) return;
    
    setIsExporting(true);
    try {
      const revenue = parseCurrencyInput(monthlyRevenue);
      const exportData = regimeResults.map(r => ({
        regime: r.regime,
        regimeName: r.regimeName,
        monthlyRevenue: revenue,
        annualRevenue: revenue * 12,
        currentTaxRate: r.currentTaxRate,
        yearlyData: r.yearlyData,
        totalSavings: r.totalSavings,
      }));
      
      await exportTransitionProjectionToPdf(exportData);
      toast({ title: 'PDF exportado com sucesso!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao exportar PDF' });
    }
    setIsExporting(false);
  };

  const handleRegimeChange = (value: string) => {
    setSelectedRegime(value);
    if (regimeResults) {
      if (value === 'all') {
        setResults(regimeResults[0].yearlyData);
      } else {
        const selected = regimeResults.find(r => r.regime === value);
        if (selected) setResults(selected.yearlyData);
      }
    }
  };

  const displayedRegime = regimeResults?.find(r => 
    selectedRegime === 'all' ? r.regime === 'simples' : r.regime === selectedRegime
  );
  const totalSavings = displayedRegime?.totalSavings || 0;
  const chartData = results?.map(r => ({
    year: r.year,
    economia: r.annualSavings,
    acumulado: r.accumulatedSavings,
    atual: r.currentTax,
    novo: r.newTax,
  }));

  // Best regime calculation
  const bestRegime = regimeResults?.reduce((best, r) => 
    r.totalSavings > best.totalSavings ? r : best, regimeResults[0]
  );

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-green-400" />
            Calculadora de Economia Acumulada
          </CardTitle>
          <CardDescription className="text-slate-400">
            Compare a economia entre Simples, Presumido e Lucro Real
          </CardDescription>
        </div>
        {regimeResults && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span className="ml-1">PDF</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Faturamento Mensal</Label>
            <Input
              placeholder="R$ 0,00"
              value={monthlyRevenue}
              onChange={handleRevenueChange}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
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
                  Comparar Regimes
                </>
              )}
            </Button>
          </div>
        </div>

        {regimeResults && (
          <>
            {/* Best Regime Highlight */}
            {bestRegime && (
              <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Trophy className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-green-400 text-sm">Maior economia durante a transição</p>
                      <h3 className="text-xl font-bold text-white">{bestRegime.regimeName}</h3>
                      <p className="text-green-300">
                        Economia total de <span className="font-bold">{formatCurrency(bestRegime.totalSavings)}</span> até 2033
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Regime Comparison Cards */}
            <div>
              <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                <Scale className="h-4 w-4 text-cyan-400" />
                Comparativo por Regime Tributário
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {regimeResults.map((regime) => (
                  <Card 
                    key={regime.regime}
                    className={`cursor-pointer transition-all ${
                      selectedRegime === regime.regime || (selectedRegime === 'all' && regime.regime === 'simples')
                        ? 'bg-cyan-900/30 border-cyan-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => handleRegimeChange(regime.regime)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">{regime.regimeName}</p>
                        {regime === bestRegime && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">Melhor</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-2">Alíquota atual: {regime.currentTaxRate}%</p>
                      <p className="text-lg font-bold text-green-400">{formatCurrency(regime.totalSavings)}</p>
                      <p className="text-xs text-slate-500">economia 2026-2033</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Regime Selector for detailed view */}
            <div className="flex items-center gap-4">
              <Label className="text-slate-300">Ver detalhes de:</Label>
              <Select value={selectedRegime === 'all' ? 'simples' : selectedRegime} onValueChange={handleRegimeChange}>
                <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(REGIME_TAX_RATES).map(([key, regime]) => (
                    <SelectItem key={key} value={key}>{regime.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                    {formatCurrency(results?.[results.length - 1]?.annualSavings || 0)}
                  </p>
                  <p className="text-xs text-slate-400">por ano</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-900/30 border-amber-700/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-amber-400">Imposto Atual/Ano</p>
                  <p className="text-lg font-bold text-amber-300">
                    {formatCurrency(results?.[0]?.currentTax || 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-slate-400">Imposto 2033/Ano</p>
                  <p className="text-lg font-bold text-slate-300">
                    {formatCurrency(results?.[results.length - 1]?.newTax || 0)}
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
