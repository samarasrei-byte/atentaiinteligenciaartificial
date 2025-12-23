import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator,
  TrendingDown,
  TrendingUp,
  Loader2,
  Home,
  Building,
  User,
  Briefcase,
  Info,
} from 'lucide-react';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/taxData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RENTAL_TAX_RATES = {
  current: {
    pf: { residential: 0, commercial: 0 },
    pj: { residential: 5, commercial: 8.65 },
  },
  reform: {
    cbs: 8.8,
    ibs: 17.7,
    reducedRate: 0.6,
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
  netIncome: { current: number; new: number };
  passThrough: { suggested: number; newRent: number };
}

export function EmbeddedLocacaoSimulator() {
  const { toast } = useToast();
  
  const [monthlyRent, setMonthlyRent] = useState('');
  const [personType, setPersonType] = useState<'pf' | 'pj'>('pf');
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [passThrough, setPassThrough] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<RentalSimulationResult | null>(null);

  const calculateRentalTaxes = (): RentalSimulationResult => {
    const rent = parseCurrencyInput(monthlyRent);
    
    let currentTaxRate = 0;
    if (personType === 'pj') {
      currentTaxRate = propertyType === 'residential' 
        ? RENTAL_TAX_RATES.current.pj.residential 
        : RENTAL_TAX_RATES.current.pj.commercial;
    }
    const currentTax = rent * (currentTaxRate / 100);
    
    const fullRate = RENTAL_TAX_RATES.reform.cbs + RENTAL_TAX_RATES.reform.ibs;
    const newTaxRate = propertyType === 'residential' 
      ? fullRate * (1 - RENTAL_TAX_RATES.reform.reducedRate)
      : fullRate;
    const newTax = rent * (newTaxRate / 100);
    
    const difference = newTax - currentTax;
    const percentChange = currentTax > 0 ? (difference / currentTax) * 100 : (newTax > 0 ? 100 : 0);
    
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
      toast({ variant: 'destructive', title: 'Preencha o valor do aluguel' });
      return;
    }

    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const simulationResult = calculateRentalTaxes();
    setResult(simulationResult);
    
    setIsSimulating(false);
    toast({ title: 'Estimativa calculada', description: 'Valores sujeitos a alterações.' });
  };

  const handleRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyRent(formatCurrencyInput(e.target.value));
  };

  const chartData = result ? [
    { name: 'Atual', value: result.currentTax, fill: 'hsl(var(--destructive))' },
    { name: 'Reforma 2026+', value: result.newTax, fill: 'hsl(var(--primary))' },
  ] : [];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Simulador de Locação</h2>
          <p className="text-muted-foreground">Compare tributação PF vs PJ para locação de imóveis</p>
        </div>

        <div className="p-3 bg-info/10 border border-info/30 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
          <p className="text-sm text-info">
            <strong>Simulação baseada na EC 132/2023.</strong> Alíquotas ainda dependem de regulamentação.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Dados do Imóvel</CardTitle>
              <CardDescription>Estime o impacto tributário da reforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Valor Mensal do Aluguel</Label>
                <Input
                  placeholder="R$ 0,00"
                  value={monthlyRent}
                  onChange={handleRentChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Quem recebe o aluguel?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPersonType('pf')}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      personType === 'pf'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <User className={`h-5 w-5 ${personType === 'pf' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${personType === 'pf' ? 'text-foreground' : 'text-muted-foreground'}`}>Pessoa Física</span>
                  </button>
                  <button
                    onClick={() => setPersonType('pj')}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      personType === 'pj'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Briefcase className={`h-5 w-5 ${personType === 'pj' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${personType === 'pj' ? 'text-foreground' : 'text-muted-foreground'}`}>Pessoa Jurídica</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Imóvel</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPropertyType('residential')}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      propertyType === 'residential'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Home className={`h-5 w-5 ${propertyType === 'residential' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${propertyType === 'residential' ? 'text-foreground' : 'text-muted-foreground'}`}>Residencial</span>
                  </button>
                  <button
                    onClick={() => setPropertyType('commercial')}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      propertyType === 'commercial'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Building className={`h-5 w-5 ${propertyType === 'commercial' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${propertyType === 'commercial' ? 'text-foreground' : 'text-muted-foreground'}`}>Comercial</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label>Calcular ajuste de aluguel</Label>
                  <p className="text-xs text-muted-foreground">Sugere valor para manter renda líquida</p>
                </div>
                <Switch checked={passThrough} onCheckedChange={setPassThrough} />
              </div>

              <Button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full"
              >
                {isSimulating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Calculando...</>
                ) : (
                  <><Calculator className="h-4 w-4 mr-2" />Calcular Estimativa</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados */}
          {result && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Resultado Estimado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} className="fill-muted-foreground" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-destructive/10 rounded-lg p-3">
                    <p className="text-destructive text-xs mb-1">Tributo Atual</p>
                    <p className="text-foreground text-lg font-bold">{formatCurrency(result.currentTax)}</p>
                    <p className="text-destructive/70 text-xs">{result.currentTaxRate.toFixed(2)}%</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-primary text-xs mb-1">Reforma 2026+</p>
                    <p className="text-foreground text-lg font-bold">{formatCurrency(result.newTax)}</p>
                    <p className="text-primary/70 text-xs">{result.newTaxRate.toFixed(2)}%</p>
                  </div>
                </div>

                <div className={`p-3 rounded-lg text-center ${result.difference > 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
                  <p className={`text-sm font-semibold ${result.difference > 0 ? 'text-destructive' : 'text-success'}`}>
                    {result.difference > 0 ? (
                      <><TrendingUp className="h-4 w-4 inline mr-1" />+{formatCurrency(result.difference)}/mês</>
                    ) : (
                      <><TrendingDown className="h-4 w-4 inline mr-1" />{formatCurrency(Math.abs(result.difference))}/mês economia</>
                    )}
                  </p>
                </div>

                {passThrough && result.difference > 0 && (
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Sugestão de reajuste:</p>
                    <p className="text-foreground font-semibold">
                      {formatCurrency(result.monthlyRent)} → {formatCurrency(result.passThrough.newRent)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}