import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Building2,
  Calculator,
  TrendingDown,
  TrendingUp,
  Loader2,
  Home,
  Building,
  User,
  Briefcase,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/taxData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Alíquotas para locação de imóveis
const RENTAL_TAX_RATES = {
  current: {
    pf: {
      residential: 0, // PF isenta de ISS para locação
      commercial: 0,
    },
    pj: {
      residential: 5, // ISS + PIS/COFINS
      commercial: 8.65, // ISS 5% + PIS 0.65% + COFINS 3%
    },
  },
  reform: {
    cbs: 8.8,
    ibs: 17.7,
    reducedRate: 0.6, // 60% de redução para imóveis
  },
};

interface RentalSimulationResult {
  monthlyRent: number;
  personType: 'pf' | 'pj';
  propertyType: 'residential' | 'commercial';
  currentTax: number;
  currentTaxRate: number;
  newTax: number;
  newTaxRate: number;
  difference: number;
  percentChange: number;
  netIncome: {
    current: number;
    new: number;
  };
  passThrough: {
    suggested: number;
    newRent: number;
  };
}

const LocacaoSimulator = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [monthlyRent, setMonthlyRent] = useState('');
  const [personType, setPersonType] = useState<'pf' | 'pj'>('pf');
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [passThrough, setPassThrough] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<RentalSimulationResult | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const calculateRentalTaxes = (): RentalSimulationResult => {
    const rent = parseCurrencyInput(monthlyRent);
    
    // Imposto atual
    let currentTaxRate = 0;
    if (personType === 'pj') {
      currentTaxRate = propertyType === 'residential' 
        ? RENTAL_TAX_RATES.current.pj.residential 
        : RENTAL_TAX_RATES.current.pj.commercial;
    }
    const currentTax = rent * (currentTaxRate / 100);
    
    // Novo imposto (CBS + IBS)
    // Redução de 60% aplica APENAS para imóveis RESIDENCIAIS
    const fullRate = RENTAL_TAX_RATES.reform.cbs + RENTAL_TAX_RATES.reform.ibs; // 26.5%
    const newTaxRate = propertyType === 'residential' 
      ? fullRate * (1 - RENTAL_TAX_RATES.reform.reducedRate) // 10.6% (com 60% redução)
      : fullRate; // 26.5% (sem redução para comercial)
    const newTax = rent * (newTaxRate / 100);
    
    const difference = newTax - currentTax;
    const percentChange = currentTax > 0 ? (difference / currentTax) * 100 : (newTax > 0 ? 100 : 0);
    
    // Cálculo de repasse
    const suggestedPassThrough = Math.max(0, difference);
    const newRent = rent + (passThrough ? suggestedPassThrough : 0);
    
    return {
      monthlyRent: rent,
      personType,
      propertyType,
      currentTax,
      currentTaxRate,
      newTax,
      newTaxRate,
      difference,
      percentChange,
      netIncome: {
        current: rent - currentTax,
        new: rent - newTax,
      },
      passThrough: {
        suggested: suggestedPassThrough,
        newRent,
      },
    };
  };

  const handleSimulate = async () => {
    if (!monthlyRent) {
      toast({
        variant: 'destructive',
        title: 'Preencha o valor do aluguel',
      });
      return;
    }

    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const simulationResult = calculateRentalTaxes();
    setResult(simulationResult);
    
    setIsSimulating(false);
    toast({
      title: 'Simulação concluída!',
    });
  };

  const handleRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyRent(formatCurrencyInput(e.target.value));
  };

  const chartData = result ? [
    { name: 'Sistema Atual', value: result.currentTax, fill: '#f97316' },
    { name: 'Reforma 2026', value: result.newTax, fill: '#14b8a6' },
  ] : [];

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
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold text-white">Simulador de Locação</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Dados do Imóvel</CardTitle>
              <CardDescription className="text-slate-400">
                Simule o impacto da reforma na locação de imóveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Valor Mensal do Aluguel</Label>
                <Input
                  placeholder="R$ 0,00"
                  value={monthlyRent}
                  onChange={handleRentChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Person Type */}
              <div className="space-y-3">
                <Label className="text-slate-300">Tipo de Locador</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPersonType('pf')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      personType === 'pf'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <User className={`h-6 w-6 ${personType === 'pf' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className={personType === 'pf' ? 'text-white' : 'text-slate-400'}>
                      Pessoa Física
                    </span>
                  </button>
                  <button
                    onClick={() => setPersonType('pj')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      personType === 'pj'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <Briefcase className={`h-6 w-6 ${personType === 'pj' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className={personType === 'pj' ? 'text-white' : 'text-slate-400'}>
                      Pessoa Jurídica
                    </span>
                  </button>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <Label className="text-slate-300">Tipo de Imóvel</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPropertyType('residential')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      propertyType === 'residential'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <Home className={`h-6 w-6 ${propertyType === 'residential' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className={propertyType === 'residential' ? 'text-white' : 'text-slate-400'}>
                      Residencial
                    </span>
                  </button>
                  <button
                    onClick={() => setPropertyType('commercial')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      propertyType === 'commercial'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <Building className={`h-6 w-6 ${propertyType === 'commercial' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className={propertyType === 'commercial' ? 'text-white' : 'text-slate-400'}>
                      Comercial
                    </span>
                  </button>
                </div>
              </div>

              {/* Pass-through toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <Label className="text-slate-300">Simular repasse ao inquilino</Label>
                  <p className="text-xs text-slate-500">Calcular novo valor do aluguel</p>
                </div>
                <Switch
                  checked={passThrough}
                  onCheckedChange={setPassThrough}
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
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Simular
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Resultado da Simulação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Chart */}
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={100} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Tax Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-500/10 rounded-lg p-4">
                      <p className="text-orange-400 text-sm mb-1">Imposto Atual</p>
                      <p className="text-white text-xl font-bold">{formatCurrency(result.currentTax)}</p>
                      <p className="text-orange-400/70 text-xs">{result.currentTaxRate.toFixed(2)}% do aluguel</p>
                    </div>
                    <div className="bg-cyan-500/10 rounded-lg p-4">
                      <p className="text-cyan-400 text-sm mb-1">Imposto Novo</p>
                      <p className="text-white text-xl font-bold">{formatCurrency(result.newTax)}</p>
                      <p className="text-cyan-400/70 text-xs">{result.newTaxRate.toFixed(2)}% do aluguel</p>
                    </div>
                  </div>

                  {/* Difference */}
                  <div className={`p-4 rounded-lg ${result.difference <= 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Diferença:</span>
                      <div className="flex items-center gap-2">
                        {result.difference <= 0 ? (
                          <TrendingDown className="h-5 w-5 text-green-400" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-red-400" />
                        )}
                        <span className={`text-xl font-bold ${result.difference <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {result.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(result.difference))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="space-y-2">
                    <h4 className="text-slate-400 text-sm uppercase tracking-wider">Renda Líquida</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Atual:</span>
                        <span className="text-white ml-2 font-medium">{formatCurrency(result.netIncome.current)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Nova:</span>
                        <span className="text-white ml-2 font-medium">{formatCurrency(result.netIncome.new)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pass-through Suggestion */}
              {passThrough && result.difference > 0 && (
                <Card className="bg-amber-900/20 border-amber-700/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-amber-400 font-medium mb-2">Sugestão de Repasse</h4>
                        <p className="text-slate-300 text-sm mb-4">
                          Para manter a mesma rentabilidade líquida, considere ajustar o aluguel:
                        </p>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-slate-400 text-xs">Aluguel Atual</p>
                            <p className="text-white font-medium">{formatCurrency(result.monthlyRent)}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-amber-400" />
                          <div>
                            <p className="text-slate-400 text-xs">Aluguel Sugerido</p>
                            <p className="text-amber-400 font-bold">{formatCurrency(result.passThrough.newRent)}</p>
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs mt-3">
                          Aumento de {formatCurrency(result.passThrough.suggested)} ({((result.passThrough.suggested / result.monthlyRent) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PF vs PJ Analysis */}
              {personType === 'pf' && propertyType === 'commercial' && (
                <Card className="bg-blue-900/20 border-blue-700/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-blue-400 font-medium mb-2">Análise PF × PJ</h4>
                        <p className="text-slate-300 text-sm">
                          Para locação comercial, considere avaliar se a constituição de PJ pode ser 
                          vantajosa devido aos créditos tributários no novo sistema.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LocacaoSimulator;
