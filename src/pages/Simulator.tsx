import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  ArrowLeft, 
  Calculator,
  TrendingDown,
  TrendingUp,
  Lock,
  Loader2,
  ArrowRight,
  Download,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import {
  sectors,
  companyTypes,
  brazilianStates,
  stateICMSRates,
  calculateTaxes,
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  SimulationResult,
} from '@/lib/taxData';
import { exportSimulationToPdf } from '@/lib/exportPdf';
import { exportSimulationToExcel } from '@/lib/exportExcel';
import { TaxComparisonChart } from '@/components/simulator/TaxComparisonChart';
import { TransitionTimeline } from '@/components/simulator/TransitionTimeline';
import { TaxTransitionTimeline, TransitionDisclaimer } from '@/components/simulator/TaxTransitionTimeline';
import { YearSelector, TRANSITION_RATES, TransitionYear, calculateTransitionTax } from '@/components/simulator/YearSelector';
import { SimulatorSkeleton } from '@/components/ui/skeleton-loaders';

const Simulator = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [revenue, setRevenue] = useState('');
  const [sector, setSector] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [state, setState] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selectedYear, setSelectedYear] = useState<TransitionYear>(2033);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAccess();
    }
  }, [user]);

  const checkAccess = async () => {
    // TEMPORARY: Allow access for testing
    setHasAccess(true);
    return;
  };

  const selectedSector = sectors.find(s => s.value === sector);
  const showStateSelector = selectedSector && selectedSector.icms > 0;

  const handleSimulate = async () => {
    if (!revenue || !sector || !companyType) {
      toast({
        variant: 'destructive',
        title: 'Preencha todos os campos',
        description: 'Informe o faturamento, setor e regime tributário',
      });
      return;
    }

    const revenueValue = parseCurrencyInput(revenue);
    if (isNaN(revenueValue) || revenueValue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'Informe um faturamento válido',
      });
      return;
    }

    setIsSimulating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const simulationResult = calculateTaxes({
      revenue: revenueValue,
      sector,
      companyType,
      state: state || undefined,
    });
    
    setResult(simulationResult);

    // Save simulation to database
    await supabase.from('tax_simulations').insert({
      user_id: user!.id,
      revenue_cents: Math.round(revenueValue * 100),
      tax_type: 'comparison',
      icms_cents: Math.round(simulationResult.beforeTaxes.icms * 100),
      iss_cents: Math.round(simulationResult.beforeTaxes.iss * 100),
      pis_cents: Math.round(simulationResult.beforeTaxes.pis * 100),
      cofins_cents: Math.round(simulationResult.beforeTaxes.cofins * 100),
      ibs_cents: Math.round(simulationResult.afterTaxes.ibs * 100),
      cbs_cents: Math.round(simulationResult.afterTaxes.cbs * 100),
      is_cents: Math.round(simulationResult.afterTaxes.is * 100),
      total_tax_cents: Math.round(simulationResult.afterTaxes.total * 100),
    });

    setIsSimulating(false);
    toast({
      title: 'Simulação concluída!',
      description: 'Veja os resultados abaixo',
    });
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRevenue(formatCurrencyInput(e.target.value));
  };

  const handleExportPdf = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      await exportSimulationToPdf(result);
      toast({ title: 'PDF exportado!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao exportar PDF' });
    }
    setIsExporting(false);
  };

  const handleExportExcel = () => {
    if (!result) return;
    try {
      exportSimulationToExcel(result);
      toast({ title: 'Excel exportado!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao exportar Excel' });
    }
  };

  if (authLoading || hasAccess === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <SimulatorSkeleton />
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
        <Card className="max-w-md bg-slate-800/50 border-slate-700 p-8 text-center">
          <Lock className="h-16 w-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Premium</h2>
          <p className="text-slate-400 mb-6">
            Você precisa de uma assinatura ativa para usar o Simulador de Impostos.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/pricing')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              Ver Planos
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="w-full text-slate-400 hover:text-white"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </Card>
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
            <Calculator className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">Simulador de Impostos</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Dados da Empresa</CardTitle>
              <CardDescription className="text-slate-400">
                Informe os dados para simular o impacto da reforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="revenue" className="text-slate-300">Faturamento Mensal</Label>
                <Input
                  id="revenue"
                  placeholder="R$ 0,00"
                  value={revenue}
                  onChange={handleRevenueChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector" className="text-slate-300">Setor de Atuação</Label>
                <Select value={sector} onValueChange={(value) => { setSector(value); setState(''); }}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 z-[200]">
                    {sectors.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyType" className="text-slate-300">Regime Tributário</Label>
                <Select value={companyType} onValueChange={setCompanyType}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 z-[200]">
                    {companyTypes.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showStateSelector && (
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Estado (Alíquota ICMS)
                  </Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o estado (opcional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60 z-[200]">
                      <SelectItem value="default">Usar alíquota padrão ({selectedSector?.icms}%)</SelectItem>
                      {brazilianStates.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label} ({stateICMSRates[s.value]}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state && (
                    <p className="text-xs text-cyan-400">
                      Alíquota de ICMS para {brazilianStates.find(s => s.value === state)?.label}: {stateICMSRates[state]}%
                    </p>
                  )}
                </div>
              )}

              {/* Year Selector */}
              <YearSelector 
                value={selectedYear} 
                onChange={setSelectedYear}
              />

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
                    Simular Impostos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-white">Resultado da Simulação</CardTitle>
                  <CardDescription className="text-slate-400">
                    Comparativo antes e depois da reforma
                  </CardDescription>
                </div>
                <div className="flex gap-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportExcel}
                    className="border-green-500 text-green-400 hover:bg-green-500/10"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="ml-1">Excel</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Taxes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Sistema Atual
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {result.beforeTaxes.icms > 0 && (
                      <>
                        <span className="text-slate-400">ICMS:</span>
                        <span className="text-white text-right">{formatCurrency(result.beforeTaxes.icms)}</span>
                      </>
                    )}
                    {result.beforeTaxes.iss > 0 && (
                      <>
                        <span className="text-slate-400">ISS:</span>
                        <span className="text-white text-right">{formatCurrency(result.beforeTaxes.iss)}</span>
                      </>
                    )}
                    <span className="text-slate-400">PIS:</span>
                    <span className="text-white text-right">{formatCurrency(result.beforeTaxes.pis)}</span>
                    <span className="text-slate-400">COFINS:</span>
                    <span className="text-white text-right">{formatCurrency(result.beforeTaxes.cofins)}</span>
                    {result.beforeTaxes.ipi > 0 && (
                      <>
                        <span className="text-slate-400">IPI:</span>
                        <span className="text-white text-right">{formatCurrency(result.beforeTaxes.ipi)}</span>
                      </>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="font-semibold text-slate-300">Total Atual:</span>
                    <span className="text-xl font-bold text-orange-400">{formatCurrency(result.beforeTaxes.total)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-slate-500" />
                </div>

                {/* New Taxes - with year selection */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Novo Sistema ({selectedYear}) - {TRANSITION_RATES[selectedYear].phase}
                  </h4>
                  {(() => {
                    const yearTaxes = calculateTransitionTax(
                      parseCurrencyInput(revenue),
                      selectedYear,
                      0 // No credit factor for now
                    );
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-slate-400">IBS ({TRANSITION_RATES[selectedYear].ibs}%):</span>
                          <span className="text-white text-right">{formatCurrency(yearTaxes.ibs)}</span>
                          <span className="text-slate-400">CBS ({TRANSITION_RATES[selectedYear].cbs}%):</span>
                          <span className="text-white text-right">{formatCurrency(yearTaxes.cbs)}</span>
                          {result.afterTaxes.is > 0 && (
                            <>
                              <span className="text-slate-400">Imp. Seletivo:</span>
                              <span className="text-white text-right">{formatCurrency(result.afterTaxes.is)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                          <span className="font-semibold text-slate-300">Total {selectedYear}:</span>
                          <span className="text-xl font-bold text-cyan-400">
                            {formatCurrency(yearTaxes.total + (result.afterTaxes.is || 0))}
                          </span>
                        </div>
                        {TRANSITION_RATES[selectedYear].percentImplemented > 0 && 
                         TRANSITION_RATES[selectedYear].percentImplemented < 100 && (
                          <p className="text-xs text-amber-400 text-center">
                            {TRANSITION_RATES[selectedYear].percentImplemented}% do novo sistema implementado
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Difference - recalculated for selected year */}
                {(() => {
                  const companyData = companyTypes.find(c => c.value === companyType);
                  const creditFactor = companyData?.creditFactor || 0;
                  const multiplier = companyData?.multiplier || 1;
                  const yearTaxes = calculateTransitionTax(
                    parseCurrencyInput(revenue) * multiplier,
                    selectedYear,
                    creditFactor
                  );
                  const yearTotal = yearTaxes.total + (result.afterTaxes.is || 0);
                  const yearDiff = yearTotal - result.beforeTaxes.total;
                  const yearPercent = result.beforeTaxes.total > 0 ? (yearDiff / result.beforeTaxes.total) * 100 : 0;
                  
                  return (
                    <div className={`p-4 rounded-lg ${yearDiff < 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Diferença ({selectedYear}):</span>
                        <div className="flex items-center gap-2">
                          {yearDiff < 0 ? (
                            <TrendingDown className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-red-400" />
                          )}
                          <span className={`text-xl font-bold ${yearDiff < 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {yearDiff < 0 ? '-' : '+'}{formatCurrency(Math.abs(yearDiff))}
                          </span>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <span className={`text-sm ${yearDiff < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {yearPercent > 0 ? '+' : ''}{yearPercent.toFixed(1)}% em relação ao atual
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Charts Section */}
        {result && (
          <div className="mt-8 space-y-8">
            <TaxComparisonChart result={result} />
            <TransitionDisclaimer />
            <TransitionTimeline result={result} />
            <TaxTransitionTimeline />
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-8 bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Brain className="h-8 w-8 text-teal-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Precisa de ajuda para entender os resultados?
                </h3>
                <p className="text-slate-400 mb-4">
                  Nossa IA pode explicar em detalhes o impacto da reforma para o seu negócio.
                </p>
                <Button
                  onClick={() => navigate('/ai-chat')}
                  variant="outline"
                  className="border-teal-500 text-teal-400 hover:bg-teal-500/10"
                >
                  Conversar com IA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Simulator;
