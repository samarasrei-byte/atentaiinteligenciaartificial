import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { TaxTransitionTimeline } from '@/components/simulator/TaxTransitionTimeline';
import { 
  ArrowLeft, 
  Scale,
  Calculator,
  Loader2,
  Check,
  Trophy,
  AlertCircle,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput, sectors } from '@/lib/taxData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

// Alíquotas e regras por regime tributário
const REGIME_DATA = {
  simples: {
    name: 'Simples Nacional',
    description: 'Regime unificado para micro e pequenas empresas',
    limit: 4800000,
    advantages: ['Tributação simplificada', 'Guia única (DAS)', 'Menos obrigações acessórias'],
    disadvantages: ['Limite de faturamento', 'Créditos limitados', 'Não compensação de prejuízos'],
    getTaxRate: (revenue: number, sector: string) => {
      if (revenue <= 180000) return 4;
      if (revenue <= 360000) return 7.3;
      if (revenue <= 720000) return 9.5;
      if (revenue <= 1800000) return 10.7;
      if (revenue <= 3600000) return 14.3;
      return 19;
    },
    creditFactor: 0.2,
  },
  lucro_presumido: {
    name: 'Lucro Presumido',
    description: 'Base de cálculo presumida sobre o faturamento',
    limit: 78000000,
    advantages: ['Cálculo simplificado', 'Previsibilidade tributária', 'Menos controles contábeis'],
    disadvantages: ['Sem compensação de prejuízos', 'Base presumida pode ser maior que real', 'IRPJ/CSLL sobre presunção'],
    getTaxRate: (revenue: number, sector: string) => {
      const presumptionRate = sector === 'servicos' ? 32 : 8;
      const irpj = (presumptionRate / 100) * 15;
      const csll = (presumptionRate / 100) * 9;
      const pis = 0.65;
      const cofins = 3;
      return irpj + csll + pis + cofins;
    },
    creditFactor: 0.4,
  },
  lucro_real: {
    name: 'Lucro Real',
    description: 'Tributação sobre o lucro efetivo apurado',
    limit: null,
    advantages: ['Compensa prejuízos fiscais', 'Créditos de PIS/COFINS', 'Base é o lucro efetivo'],
    disadvantages: ['Maior complexidade', 'Mais obrigações acessórias', 'Exige contabilidade detalhada'],
    getTaxRate: (revenue: number, sector: string, marginRate: number = 15) => {
      const lucro = revenue * (marginRate / 100);
      const irpj = (lucro * 0.15) + Math.max(0, (lucro - 20000) * 0.1);
      const csll = lucro * 0.09;
      const pis = revenue * 0.0165;
      const cofins = revenue * 0.076;
      return ((irpj + csll + pis + cofins) / revenue) * 100;
    },
    creditFactor: 0.5,
  },
};

interface RegimeResult {
  regime: string;
  name: string;
  taxAmount: number;
  taxRate: number;
  netIncome: number;
  effectiveRate: number;
  newSystemTax: number;
  newSystemRate: number;
}

const RegimeComparator = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [sector, setSector] = useState('');
  const [marginRate, setMarginRate] = useState('15');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<RegimeResult[] | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const calculateRegimeComparison = () => {
    const revenue = parseCurrencyInput(annualRevenue);
    const margin = parseFloat(marginRate) || 15;
    
    const results: RegimeResult[] = [];
    
    // Simples Nacional
    if (revenue <= REGIME_DATA.simples.limit) {
      const taxRate = REGIME_DATA.simples.getTaxRate(revenue, sector);
      const taxAmount = revenue * (taxRate / 100);
      const newSystemRate = (17.7 + 8.8) * (1 - REGIME_DATA.simples.creditFactor);
      const newSystemTax = revenue * (newSystemRate / 100);
      
      results.push({
        regime: 'simples',
        name: REGIME_DATA.simples.name,
        taxAmount,
        taxRate,
        netIncome: revenue - taxAmount,
        effectiveRate: taxRate,
        newSystemTax,
        newSystemRate,
      });
    }
    
    // Lucro Presumido
    if (revenue <= REGIME_DATA.lucro_presumido.limit!) {
      const taxRate = REGIME_DATA.lucro_presumido.getTaxRate(revenue, sector);
      const taxAmount = revenue * (taxRate / 100);
      const newSystemRate = (17.7 + 8.8) * (1 - REGIME_DATA.lucro_presumido.creditFactor);
      const newSystemTax = revenue * (newSystemRate / 100);
      
      results.push({
        regime: 'lucro_presumido',
        name: REGIME_DATA.lucro_presumido.name,
        taxAmount,
        taxRate,
        netIncome: revenue - taxAmount,
        effectiveRate: taxRate,
        newSystemTax,
        newSystemRate,
      });
    }
    
    // Lucro Real
    const realTaxRate = REGIME_DATA.lucro_real.getTaxRate(revenue, sector, margin);
    const realTaxAmount = revenue * (realTaxRate / 100);
    const realNewSystemRate = (17.7 + 8.8) * (1 - REGIME_DATA.lucro_real.creditFactor);
    const realNewSystemTax = revenue * (realNewSystemRate / 100);
    
    results.push({
      regime: 'lucro_real',
      name: REGIME_DATA.lucro_real.name,
      taxAmount: realTaxAmount,
      taxRate: realTaxRate,
      netIncome: revenue - realTaxAmount,
      effectiveRate: realTaxRate,
      newSystemTax: realNewSystemTax,
      newSystemRate: realNewSystemRate,
    });
    
    // Sort by tax amount
    return results.sort((a, b) => a.taxAmount - b.taxAmount);
  };

  const handleSimulate = async () => {
    if (!annualRevenue || !sector) {
      toast({
        variant: 'destructive',
        title: 'Preencha todos os campos',
      });
      return;
    }

    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const comparisonResults = calculateRegimeComparison();
    setResults(comparisonResults);
    
    setIsSimulating(false);
    toast({
      title: 'Comparação concluída!',
    });
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnnualRevenue(formatCurrencyInput(e.target.value));
  };

  const bestRegime = results?.[0];
  const worstRegime = results?.[results.length - 1];
  const savings = worstRegime && bestRegime ? worstRegime.taxAmount - bestRegime.taxAmount : 0;

  const chartData = results?.map(r => ({
    name: r.name.replace(' Nacional', '').replace('Lucro ', ''),
    atual: r.taxAmount,
    reforma: r.newSystemTax,
  })) || [];

  const radarData = results?.map(r => ({
    regime: r.name.replace(' Nacional', '').replace('Lucro ', ''),
    cargaAtual: 100 - (r.taxRate * 2),
    cargaReforma: 100 - (r.newSystemRate * 2),
    creditos: REGIME_DATA[r.regime as keyof typeof REGIME_DATA].creditFactor * 100,
    simplicidade: r.regime === 'simples' ? 90 : r.regime === 'lucro_presumido' ? 70 : 40,
  })) || [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-border bg-white/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <img src="/logo-atentai.png" alt="AtentAI" className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">Comparador de Regimes</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Dados da Empresa</CardTitle>
              <CardDescription className="text-slate-400">
                Compare Simples × Presumido × Real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Faturamento Anual</Label>
                <Input
                  placeholder="R$ 0,00"
                  value={annualRevenue}
                  onChange={handleRevenueChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Setor de Atuação</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {sectors.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Margem de Lucro (%) - Para Lucro Real</Label>
                <Input
                  type="number"
                  value={marginRate}
                  onChange={(e) => setMarginRate(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  min="1"
                  max="100"
                />
              </div>

              <Button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Comparando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Comparar Regimes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <div className="lg:col-span-2 space-y-6">
              {/* Best Option Highlight */}
              {bestRegime && (
                <Card className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-cyan-500/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-cyan-500/20 rounded-full">
                        <Trophy className="h-8 w-8 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-cyan-400 text-sm">Melhor opção para sua empresa</p>
                        <h3 className="text-2xl font-bold text-white">{bestRegime.name}</h3>
                        <p className="text-slate-300">
                          Economia de <span className="text-green-400 font-bold">{formatCurrency(savings)}</span> em comparação ao pior cenário
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comparison Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Comparativo de Carga Tributária</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      />
                      <Legend />
                      <Bar dataKey="atual" name="Sistema Atual" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="reforma" name="Regime Definitivo 2033" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Regime Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.map((result, index) => {
                  const regimeInfo = REGIME_DATA[result.regime as keyof typeof REGIME_DATA];
                  const isBest = index === 0;
                  
                  return (
                    <Card 
                      key={result.regime}
                      className={`border ${isBest ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-slate-800/50 border-slate-700'}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-white">{result.name}</CardTitle>
                          {isBest && <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Melhor</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Imposto Atual</p>
                          <p className="text-orange-400 font-bold">{formatCurrency(result.taxAmount)}</p>
                          <p className="text-slate-500 text-xs">{result.taxRate.toFixed(2)}% efetivo</p>
                        </div>
                        
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Regime Definitivo 2033</p>
                          <p className="text-cyan-400 font-bold">{formatCurrency(result.newSystemTax)}</p>
                          <p className="text-slate-500 text-xs">{result.newSystemRate.toFixed(2)}% efetivo</p>
                        </div>

                        <div className={`p-2 rounded text-center ${result.newSystemTax < result.taxAmount ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                          <p className={`text-sm font-medium ${result.newSystemTax < result.taxAmount ? 'text-green-400' : 'text-red-400'}`}>
                            {result.newSystemTax < result.taxAmount ? (
                              <>
                                <TrendingDown className="h-4 w-4 inline mr-1" />
                                {formatCurrency(result.taxAmount - result.newSystemTax)}
                              </>
                            ) : (
                              <>
                                <TrendingUp className="h-4 w-4 inline mr-1" />
                                +{formatCurrency(result.newSystemTax - result.taxAmount)}
                              </>
                            )}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-slate-400 text-xs uppercase tracking-wider">Vantagens</p>
                          {regimeInfo.advantages.slice(0, 2).map((adv, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Check className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-300 text-xs">{adv}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Alerts */}
              {parseCurrencyInput(annualRevenue) > REGIME_DATA.simples.limit && (
                <Card className="bg-amber-900/20 border-amber-700/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-amber-400 font-medium mb-1">Faturamento excede limite do Simples</h4>
                        <p className="text-slate-300 text-sm">
                          Com faturamento acima de R$ 4,8 milhões/ano, sua empresa não pode optar pelo Simples Nacional.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tax Transition Timeline */}
              <TaxTransitionTimeline compact />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegimeComparator;
