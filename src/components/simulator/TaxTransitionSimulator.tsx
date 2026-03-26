import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { 
  Calendar, TrendingDown, TrendingUp, AlertTriangle, 
  Info, Play, ArrowRight, Calculator 
} from 'lucide-react';
import { formatCurrency, parseCurrencyInput, formatCurrencyInput } from '@/lib/taxConstants';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Cronograma oficial da Reforma Tributária (EC 132/2023 e LC 214/2025)
const TRANSITION_DATA = [
  { 
    year: 2025, 
    cbs: 0, 
    ibs: 0, 
    pis_cofins: 9.25, // PIS 1.65% + COFINS 7.6%
    icms_iss: 22, // média
    total: 31.25,
    phase: 'Sistema Atual',
    description: 'Sistema tributário atual vigente'
  },
  { 
    year: 2026, 
    cbs: 0.9, 
    ibs: 0.1, 
    pis_cofins: 9.25,
    icms_iss: 22,
    total: 32.25,
    phase: 'Teste',
    description: 'Início da transição - teste do novo sistema'
  },
  { 
    year: 2027, 
    cbs: 0.9, 
    ibs: 0.1, 
    pis_cofins: 9.25,
    icms_iss: 22,
    total: 32.25,
    phase: 'Coexistência',
    description: 'Novo sistema coexiste com o atual'
  },
  { 
    year: 2028, 
    cbs: 8.8, 
    ibs: 8.0, 
    pis_cofins: 0,
    icms_iss: 22,
    total: 38.8,
    phase: 'PIS/COFINS Zerado',
    description: 'CBS plena, IBS parcial, fim do PIS/COFINS'
  },
  { 
    year: 2029, 
    cbs: 8.8, 
    ibs: 11.0, 
    pis_cofins: 0,
    icms_iss: 17.5,
    total: 37.3,
    phase: 'Redução ICMS/ISS',
    description: 'Início da redução gradual ICMS/ISS (-10%)'
  },
  { 
    year: 2030, 
    cbs: 8.8, 
    ibs: 13.0, 
    pis_cofins: 0,
    icms_iss: 13,
    total: 34.8,
    phase: 'Redução ICMS/ISS',
    description: 'Continuação da redução ICMS/ISS (-25%)'
  },
  { 
    year: 2031, 
    cbs: 8.8, 
    ibs: 15.0, 
    pis_cofins: 0,
    icms_iss: 8.5,
    total: 32.3,
    phase: 'Redução ICMS/ISS',
    description: 'Redução ICMS/ISS (-50%)'
  },
  { 
    year: 2032, 
    cbs: 8.8, 
    ibs: 16.5, 
    pis_cofins: 0,
    icms_iss: 4.25,
    total: 29.55,
    phase: 'Redução ICMS/ISS',
    description: 'Redução ICMS/ISS (-75%)'
  },
  { 
    year: 2033, 
    cbs: 8.8, 
    ibs: 17.7, 
    pis_cofins: 0,
    icms_iss: 0,
    total: 26.5,
    phase: 'Sistema Novo',
    description: 'Novo sistema tributário pleno'
  },
];

// Reduções setoriais
const SECTOR_REDUCTIONS = {
  geral: { name: 'Geral', reduction: 0, description: 'Alíquota cheia' },
  saude: { name: 'Saúde', reduction: 0.6, description: 'Redução de 60%' },
  educacao: { name: 'Educação', reduction: 0.6, description: 'Redução de 60%' },
  transporte: { name: 'Transporte Público', reduction: 0.6, description: 'Redução de 60%' },
  agronegocio: { name: 'Agronegócio', reduction: 0.6, description: 'Redução de 60%' },
  imobiliario: { name: 'Imóveis Novos', reduction: 0.4, description: 'Redução de 40%' },
  profissional_liberal: { name: 'Profissionais Liberais', reduction: 0.3, description: 'Redução de 30%' },
  cesta_basica: { name: 'Cesta Básica', reduction: 1, description: 'Alíquota Zero' },
};

interface TransitionSimulatorProps {
  embedded?: boolean;
}

const TaxTransitionSimulator: React.FC<TransitionSimulatorProps> = ({ embedded = false }) => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [monthlyRevenue, setMonthlyRevenue] = useState('50000');
  const [sector, setSector] = useState<keyof typeof SECTOR_REDUCTIONS>('geral');
  const [showSimulation, setShowSimulation] = useState(false);

  const revenue = parseCurrencyInput(monthlyRevenue) || 50000;
  const annualRevenue = revenue * 12;
  const sectorData = SECTOR_REDUCTIONS[sector];

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setMonthlyRevenue(formatted);
  };

  // Calcula impostos para cada ano com base no setor
  const calculateTaxForYear = (yearData: typeof TRANSITION_DATA[0]) => {
    const baseRate = (yearData.cbs + yearData.ibs) / 100;
    const adjustedRate = baseRate * (1 - sectorData.reduction);
    const monthlyTax = revenue * adjustedRate;
    const annualTax = monthlyTax * 12;
    return { monthlyTax, annualTax, effectiveRate: adjustedRate * 100 };
  };

  const selectedYearData = TRANSITION_DATA.find(d => d.year === selectedYear) || TRANSITION_DATA[0];
  const currentTaxes = calculateTaxForYear(selectedYearData);

  // Dados para o gráfico com simulação de empresa
  const chartData = TRANSITION_DATA.map(d => {
    const taxes = calculateTaxForYear(d);
    return {
      ...d,
      empresaTax: taxes.annualTax,
      empresaRate: taxes.effectiveRate,
      novo_sistema: d.cbs + d.ibs,
      sistema_atual: d.pis_cofins + d.icms_iss,
    };
  });

  // Comparação 2025 vs 2033 - sistema atual vs novo
  // Em 2025 usa-se a carga total (PIS/COFINS + ICMS/ISS), não IBS+CBS que são 0
  const comparison2025 = TRANSITION_DATA[0];
  const comparison2033 = TRANSITION_DATA[8];
  const currentSystemRate2025 = (comparison2025.pis_cofins + comparison2025.icms_iss) / 100;
  const adjustedCurrentRate = currentSystemRate2025 * (1 - sectorData.reduction);
  const tax2025Annual = revenue * adjustedCurrentRate * 12;
  const tax2033 = calculateTaxForYear(comparison2033);
  const savingsAmount = tax2025Annual - tax2033.annualTax;
  const savingsPercent = tax2025Annual > 0 ? (savingsAmount / tax2025Annual * 100) : 0;

  return (
    <div className={`space-y-6 ${embedded ? '' : 'p-6'}`}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Simulador de Transição 2026-2033
          </h2>
        </div>
        <p className="text-muted-foreground">
          Visualize como a Reforma Tributária afetará sua empresa ao longo dos anos
        </p>
      </div>

      {/* Input Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Faturamento Mensal</Label>
              <Input
                value={monthlyRevenue}
                onChange={handleRevenueChange}
                placeholder="R$ 50.000,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Setor de Atividade</Label>
              <Select value={sector} onValueChange={(v) => setSector(v as keyof typeof SECTOR_REDUCTIONS)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SECTOR_REDUCTIONS).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.name} ({data.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ano de Referência</Label>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSITION_DATA.map((d) => (
                    <SelectItem key={d.year} value={String(d.year)}>
                      {d.year} - {d.phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            className="mt-4 w-full md:w-auto"
            onClick={() => setShowSimulation(true)}
          >
            <Play className="h-4 w-4 mr-2" />
            Simular Transição
          </Button>
        </CardContent>
      </Card>

      {/* Year Slider */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Timeline da Transição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={[selectedYear]}
              onValueChange={(v) => setSelectedYear(v[0])}
              min={2025}
              max={2033}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2025</span>
              <span>2026</span>
              <span>2027</span>
              <span>2028</span>
              <span>2029</span>
              <span>2030</span>
              <span>2031</span>
              <span>2032</span>
              <span>2033</span>
            </div>
            
            {/* Year Details */}
            <div className="p-4 bg-muted/50 rounded-xl mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-foreground">{selectedYear}</h3>
                <Badge variant={selectedYearData.phase === 'Sistema Novo' ? 'default' : 'outline'}>
                  {selectedYearData.phase}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{selectedYearData.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">CBS (Federal)</p>
                  <p className="text-lg font-bold text-blue-600">{selectedYearData.cbs}%</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">IBS (Est./Mun.)</p>
                  <p className="text-lg font-bold text-emerald-600">{selectedYearData.ibs}%</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">PIS/COFINS</p>
                  <p className="text-lg font-bold text-amber-600">{selectedYearData.pis_cofins}%</p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">ICMS/ISS</p>
                  <p className="text-lg font-bold text-red-600">{selectedYearData.icms_iss}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução das Alíquotas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução das Alíquotas</CardTitle>
            <CardDescription>Novo sistema vs. sistema atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis unit="%" className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="novo_sistema" 
                    name="IBS + CBS" 
                    stackId="1"
                    fill="hsl(var(--primary))" 
                    stroke="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sistema_atual" 
                    name="ICMS/ISS + PIS/COFINS" 
                    stackId="2"
                    fill="hsl(var(--destructive))" 
                    stroke="hsl(var(--destructive))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Impacto na Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Impacto na Sua Empresa</CardTitle>
            <CardDescription>
              Setor: {sectorData.name} ({sectorData.description})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Imposto Anual']}
                  />
                  <Bar 
                    dataKey="empresaTax" 
                    name="Imposto Anual" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Card */}
      <Card className={`border-2 ${savingsAmount > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 2025 */}
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Sistema Atual (2025)</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(tax2025Annual)}</p>
              <p className="text-sm text-muted-foreground">por ano</p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <ArrowRight className="h-8 w-8 text-primary" />
                <Badge className={savingsAmount > 0 ? 'bg-green-500' : 'bg-red-500'}>
                  {savingsAmount > 0 ? (
                    <><TrendingDown className="h-3 w-3 mr-1" /> Economia</>
                  ) : (
                    <><TrendingUp className="h-3 w-3 mr-1" /> Aumento</>
                  )}
                </Badge>
              </div>
            </div>

            {/* 2033 */}
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Sistema Novo (2033)</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(tax2033.annualTax)}</p>
              <p className="text-sm text-muted-foreground">por ano</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-background rounded-xl text-center">
            <p className="text-lg">
              {savingsAmount > 0 ? 'Economia' : 'Aumento'} estimada:{' '}
              <span className={`text-2xl font-bold ${savingsAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(savingsAmount))}
              </span>{' '}
              <span className="text-muted-foreground">
                ({Math.abs(savingsPercent).toFixed(1)}% ao ano)
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Aviso Legal:</strong> Valores estimados com base na EC 132/2023 e LC 214/2025. 
          Resultados sujeitos à regulamentação final. Não substitui consultoria contábil profissional.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TaxTransitionSimulator;
