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
  ArrowRight
} from 'lucide-react';

interface SimulationResult {
  current: {
    icms: number;
    iss: number;
    pis: number;
    cofins: number;
    total: number;
  };
  new: {
    ibs: number;
    cbs: number;
    is: number;
    total: number;
  };
  difference: number;
  percentChange: number;
}

const Simulator = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [revenue, setRevenue] = useState('');
  const [sector, setSector] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

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
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .single();
    
    setHasAccess(!!data);
  };

  const calculateTaxes = (revenueValue: number, sectorType: string): SimulationResult => {
    // Current tax rates (simplified)
    const currentRates = {
      comercio: { icms: 0.18, iss: 0, pis: 0.0165, cofins: 0.076 },
      servicos: { icms: 0, iss: 0.05, pis: 0.0165, cofins: 0.076 },
      industria: { icms: 0.12, iss: 0, pis: 0.0165, cofins: 0.076 },
      tecnologia: { icms: 0, iss: 0.02, pis: 0.0165, cofins: 0.076 },
    };

    // New tax rates (2026+)
    const newRates = {
      comercio: { ibs: 0.175, cbs: 0.088, is: 0 },
      servicos: { ibs: 0.175, cbs: 0.088, is: 0 },
      industria: { ibs: 0.175, cbs: 0.088, is: 0.02 },
      tecnologia: { ibs: 0.175, cbs: 0.088, is: 0 },
    };

    const currentRate = currentRates[sectorType as keyof typeof currentRates] || currentRates.comercio;
    const newRate = newRates[sectorType as keyof typeof newRates] || newRates.comercio;

    const current = {
      icms: revenueValue * currentRate.icms,
      iss: revenueValue * currentRate.iss,
      pis: revenueValue * currentRate.pis,
      cofins: revenueValue * currentRate.cofins,
      total: 0,
    };
    current.total = current.icms + current.iss + current.pis + current.cofins;

    const newTaxes = {
      ibs: revenueValue * newRate.ibs,
      cbs: revenueValue * newRate.cbs,
      is: revenueValue * newRate.is,
      total: 0,
    };
    newTaxes.total = newTaxes.ibs + newTaxes.cbs + newTaxes.is;

    const difference = newTaxes.total - current.total;
    const percentChange = current.total > 0 ? ((difference / current.total) * 100) : 0;

    return {
      current,
      new: newTaxes,
      difference,
      percentChange,
    };
  };

  const handleSimulate = async () => {
    if (!revenue || !sector) {
      toast({
        variant: 'destructive',
        title: 'Preencha todos os campos',
        description: 'Informe o faturamento e o setor da empresa',
      });
      return;
    }

    const revenueValue = parseFloat(revenue.replace(/\D/g, '')) / 100;
    if (isNaN(revenueValue) || revenueValue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'Informe um faturamento válido',
      });
      return;
    }

    setIsSimulating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const simulationResult = calculateTaxes(revenueValue, sector);
    setResult(simulationResult);

    // Save simulation to database
    await supabase.from('tax_simulations').insert({
      user_id: user!.id,
      revenue_cents: Math.round(revenueValue * 100),
      tax_type: 'comparison',
      icms_cents: Math.round(simulationResult.current.icms * 100),
      iss_cents: Math.round(simulationResult.current.iss * 100),
      pis_cents: Math.round(simulationResult.current.pis * 100),
      cofins_cents: Math.round(simulationResult.current.cofins * 100),
      ibs_cents: Math.round(simulationResult.new.ibs * 100),
      cbs_cents: Math.round(simulationResult.new.cbs * 100),
      is_cents: Math.round(simulationResult.new.is * 100),
      total_tax_cents: Math.round(simulationResult.new.total * 100),
    });

    setIsSimulating(false);
    toast({
      title: 'Simulação concluída!',
      description: 'Veja os resultados abaixo',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(value) / 100;
    if (!isNaN(numValue)) {
      setRevenue(formatCurrency(numValue));
    } else {
      setRevenue('');
    }
  };

  if (authLoading || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
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
            <Calculator className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold text-white">Simulador de Impostos</span>
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
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="comercio">Comércio</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="industria">Indústria</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  </SelectContent>
                </Select>
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
                    Simular Impostos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Resultado da Simulação</CardTitle>
                <CardDescription className="text-slate-400">
                  Comparativo antes e depois da reforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Taxes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Sistema Atual
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-slate-400">ICMS:</span>
                    <span className="text-white text-right">{formatCurrency(result.current.icms)}</span>
                    <span className="text-slate-400">ISS:</span>
                    <span className="text-white text-right">{formatCurrency(result.current.iss)}</span>
                    <span className="text-slate-400">PIS:</span>
                    <span className="text-white text-right">{formatCurrency(result.current.pis)}</span>
                    <span className="text-slate-400">COFINS:</span>
                    <span className="text-white text-right">{formatCurrency(result.current.cofins)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="font-semibold text-slate-300">Total Atual:</span>
                    <span className="text-xl font-bold text-orange-400">{formatCurrency(result.current.total)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-slate-500" />
                </div>

                {/* New Taxes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Novo Sistema (2026+)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-slate-400">IBS:</span>
                    <span className="text-white text-right">{formatCurrency(result.new.ibs)}</span>
                    <span className="text-slate-400">CBS:</span>
                    <span className="text-white text-right">{formatCurrency(result.new.cbs)}</span>
                    <span className="text-slate-400">Imp. Seletivo:</span>
                    <span className="text-white text-right">{formatCurrency(result.new.is)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="font-semibold text-slate-300">Total Novo:</span>
                    <span className="text-xl font-bold text-cyan-400">{formatCurrency(result.new.total)}</span>
                  </div>
                </div>

                {/* Difference */}
                <div className={`p-4 rounded-lg ${result.difference < 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Diferença:</span>
                    <div className="flex items-center gap-2">
                      {result.difference < 0 ? (
                        <TrendingDown className="h-5 w-5 text-green-400" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-red-400" />
                      )}
                      <span className={`text-xl font-bold ${result.difference < 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {result.difference < 0 ? '-' : '+'}{formatCurrency(Math.abs(result.difference))}
                      </span>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className={`text-sm ${result.difference < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {result.percentChange > 0 ? '+' : ''}{result.percentChange.toFixed(1)}% em relação ao atual
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

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
