import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Scale,
  Calculator,
  Loader2,
  Check,
  Trophy,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput, sectors } from '@/lib/taxData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const REGIME_DATA = {
  simples: {
    name: 'Simples Nacional',
    limit: 4800000,
    advantages: ['Tributação simplificada', 'Guia única (DAS)', 'Menos obrigações'],
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
    limit: 78000000,
    advantages: ['Cálculo simplificado', 'Previsibilidade', 'Menos controles'],
    getTaxRate: (revenue: number, sector: string) => {
      const presumptionRate = sector === 'servicos' ? 32 : 8;
      const irpj = (presumptionRate / 100) * 15;
      const csll = (presumptionRate / 100) * 9;
      return irpj + csll + 0.65 + 3;
    },
    creditFactor: 0.4,
  },
  lucro_real: {
    name: 'Lucro Real',
    limit: null,
    advantages: ['Compensa prejuízos', 'Créditos PIS/COFINS', 'Base é lucro efetivo'],
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
  newSystemTax: number;
  newSystemRate: number;
}

export function EmbeddedRegimeComparator() {
  const { toast } = useToast();
  
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [sector, setSector] = useState('');
  const [marginRate, setMarginRate] = useState('15');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<RegimeResult[] | null>(null);

  const calculateRegimeComparison = () => {
    const revenue = parseCurrencyInput(annualRevenue);
    const margin = parseFloat(marginRate) || 15;
    
    const results: RegimeResult[] = [];
    
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
        newSystemTax,
        newSystemRate,
      });
    }
    
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
        newSystemTax,
        newSystemRate,
      });
    }
    
    const realTaxRate = REGIME_DATA.lucro_real.getTaxRate(revenue, sector, margin);
    const realTaxAmount = revenue * (realTaxRate / 100);
    const realNewSystemRate = (17.7 + 8.8) * (1 - REGIME_DATA.lucro_real.creditFactor);
    const realNewSystemTax = revenue * (realNewSystemRate / 100);
    
    results.push({
      regime: 'lucro_real',
      name: REGIME_DATA.lucro_real.name,
      taxAmount: realTaxAmount,
      taxRate: realTaxRate,
      newSystemTax: realNewSystemTax,
      newSystemRate: realNewSystemRate,
    });
    
    return results.sort((a, b) => a.taxAmount - b.taxAmount);
  };

  const handleSimulate = async () => {
    if (!annualRevenue || !sector) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos' });
      return;
    }

    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const comparisonResults = calculateRegimeComparison();
    setResults(comparisonResults);
    
    setIsSimulating(false);
    toast({ title: 'Comparação concluída!' });
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Comparador de Regimes</h2>
        <p className="text-muted-foreground">Compare Simples Nacional, Lucro Presumido e Lucro Real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Dados da Empresa</CardTitle>
            <CardDescription>Informe os dados para comparação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Faturamento Anual</Label>
              <Input
                placeholder="R$ 0,00"
                value={annualRevenue}
                onChange={handleRevenueChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Setor de Atuação</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Margem de Lucro (%)</Label>
              <Input
                type="number"
                value={marginRate}
                onChange={(e) => setMarginRate(e.target.value)}
                min="1"
                max="100"
              />
            </div>

            <Button onClick={handleSimulate} disabled={isSimulating} className="w-full">
              {isSimulating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Comparando...</>
              ) : (
                <><Calculator className="h-4 w-4 mr-2" />Comparar Regimes</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        {results && (
          <div className="lg:col-span-2 space-y-4">
            {bestRegime && (
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-primary text-sm">Melhor opção</p>
                      <h3 className="text-xl font-bold text-foreground">{bestRegime.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        Economia de <span className="text-success font-bold">{formatCurrency(savings)}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">Comparativo de Carga Tributária</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="atual" name="Sistema Atual" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="reforma" name="Reforma 2026" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {results.map((result, index) => {
                const regimeInfo = REGIME_DATA[result.regime as keyof typeof REGIME_DATA];
                const isBest = index === 0;
                
                return (
                  <Card key={result.regime} className={`border ${isBest ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-foreground">{result.name}</CardTitle>
                        {isBest && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Melhor</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-muted-foreground text-xs">Imposto Atual</p>
                        <p className="text-destructive font-bold text-sm">{formatCurrency(result.taxAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Reforma 2026</p>
                        <p className="text-primary font-bold text-sm">{formatCurrency(result.newSystemTax)}</p>
                      </div>
                      <div className={`p-1.5 rounded text-center text-xs ${result.newSystemTax < result.taxAmount ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {result.newSystemTax < result.taxAmount ? (
                          <><TrendingDown className="h-3 w-3 inline mr-1" />{formatCurrency(result.taxAmount - result.newSystemTax)}</>
                        ) : (
                          <><TrendingUp className="h-3 w-3 inline mr-1" />+{formatCurrency(result.newSystemTax - result.taxAmount)}</>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}