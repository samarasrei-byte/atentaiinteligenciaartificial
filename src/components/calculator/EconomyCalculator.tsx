import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  Calculator,
  Loader2,
  CheckCircle,
  Lightbulb,
  AlertCircle,
  Zap,
  TrendingDown,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

// Alíquota base da reforma (EC 132/2023)
const BASE_TAX_RATE = 26.5; // 26,5%

// Categorias de despesas que geram crédito
const EXPENSE_CATEGORIES = [
  { id: 'aluguel', label: 'Aluguel de imóvel comercial' },
  { id: 'energia', label: 'Energia elétrica' },
  { id: 'agua', label: 'Água e saneamento' },
  { id: 'telefone_internet', label: 'Telefone e internet' },
  { id: 'materiais', label: 'Materiais e insumos' },
  { id: 'servicos_terceiros', label: 'Serviços de terceiros (PJ)' },
  { id: 'manutencao', label: 'Manutenção e reparos' },
  { id: 'transporte', label: 'Transporte e frete' },
];

interface CalculationResult {
  monthlyIncome: number;
  taxWithoutCredits: number;
  totalExpenses: number;
  totalCredits: number;
  taxWithCredits: number;
  monthlySavings: number;
  annualSavings: number;
  creditPercentage: number;
  recommendation: {
    type: 'good' | 'improvement';
    message: string;
  };
}

// Formata número para moeda brasileira
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formata input de moeda
const formatCurrencyInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const cents = parseInt(numbers || '0', 10);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

// Converte string formatada para número
const parseCurrencyInput = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return parseInt(numbers || '0', 10) / 100;
};

export function EconomyCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [selectedExpenses, setSelectedExpenses] = useState<Record<string, { checked: boolean; value: string }>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleExpenseToggle = (id: string, checked: boolean) => {
    setSelectedExpenses(prev => ({
      ...prev,
      [id]: { ...prev[id], checked, value: prev[id]?.value || '' }
    }));
  };

  const handleExpenseValue = (id: string, value: string) => {
    setSelectedExpenses(prev => ({
      ...prev,
      [id]: { ...prev[id], value: formatCurrencyInput(value) }
    }));
  };

  const calculateEconomy = async () => {
    setIsCalculating(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 800));

    const income = parseCurrencyInput(monthlyIncome);
    
    // 1. Calcular imposto estimado SEM economia (alíquota base de 26,5%)
    const taxWithoutCredits = income * (BASE_TAX_RATE / 100);
    
    // 2. Calcular créditos tributários
    // Para cada despesa marcada, 100% do valor gera crédito
    // Crédito = soma das despesas × 26,5%
    let totalExpenses = 0;
    
    Object.entries(selectedExpenses).forEach(([id, expense]) => {
      if (expense.checked && expense.value) {
        const value = parseCurrencyInput(expense.value);
        totalExpenses += value;
      }
    });
    
    const totalCredits = totalExpenses * (BASE_TAX_RATE / 100);
    
    // 3. Calcular imposto líquido
    // Imposto líquido = imposto estimado – créditos (nunca negativo)
    const taxWithCredits = Math.max(0, taxWithoutCredits - totalCredits);
    
    // 4. Calcular economia
    const monthlySavings = taxWithoutCredits - taxWithCredits;
    const annualSavings = monthlySavings * 12;
    
    // 5. Calcular percentual de créditos
    const creditPercentage = taxWithoutCredits > 0 
      ? (totalCredits / taxWithoutCredits) * 100 
      : 0;
    
    // 6. Determinar recomendação
    let recommendation: CalculationResult['recommendation'];
    if (creditPercentage > 20) {
      recommendation = {
        type: 'good',
        message: 'Você está aproveitando bem seus créditos tributários!'
      };
    } else {
      recommendation = {
        type: 'improvement',
        message: 'Você pode aumentar sua economia organizando melhor suas despesas dedutíveis.'
      };
    }
    
    setResult({
      monthlyIncome: income,
      taxWithoutCredits,
      totalExpenses,
      totalCredits,
      taxWithCredits,
      monthlySavings,
      annualSavings,
      creditPercentage,
      recommendation,
    });
    
    setIsCalculating(false);
  };

  const resetCalculator = () => {
    setResult(null);
    setMonthlyIncome('');
    setSelectedExpenses({});
  };

  // Verifica se pelo menos uma despesa está marcada com valor
  const hasAnyExpense = Object.values(selectedExpenses).some(e => e.checked && e.value && parseCurrencyInput(e.value) > 0);

  // Tela de Resultado
  if (result) {
    return (
      <Card className="bg-gradient-to-br from-emerald-500/5 via-background to-primary/5 border-emerald-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32" />
        
        <CardContent className="pt-6 relative space-y-6">
          {/* Header de Sucesso */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm mb-4">
              <CheckCircle className="h-4 w-4" />
              Cálculo Concluído
            </div>
          </div>

          {/* Card Principal - Economia Anual em Destaque */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 text-center">
            <p className="text-sm text-muted-foreground mb-2">Economia anual estimada</p>
            <p className="text-4xl md:text-5xl font-bold text-emerald-600">
              {formatCurrency(result.annualSavings)}
            </p>
            <p className="text-sm text-emerald-600/80 mt-2">
              {formatCurrency(result.monthlySavings)}/mês
            </p>
          </div>

          {/* Grid de Comparação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <p className="text-xs text-muted-foreground">Imposto sem planejamento</p>
              </div>
              <p className="text-xl font-bold text-red-500">
                {formatCurrency(result.taxWithoutCredits)}<span className="text-sm font-normal">/mês</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <p className="text-xs text-muted-foreground">Novo imposto estimado</p>
              </div>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(result.taxWithCredits)}<span className="text-sm font-normal">/mês</span>
              </p>
            </div>
          </div>

          {/* Detalhes dos Créditos */}
          {result.totalCredits > 0 && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Total de créditos aplicados</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(result.totalCredits)}/mês</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {result.creditPercentage.toFixed(1)}% do imposto
                </Badge>
              </div>
            </div>
          )}

          {/* Melhor Cenário */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <p className="font-semibold text-foreground">Melhor cenário aplicado automaticamente</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Aproveitamento de créditos tributários sobre suas despesas dedutíveis.
            </p>
          </div>

          {/* Recomendação */}
          <div className={`p-4 rounded-xl border ${
            result.recommendation.type === 'good' 
              ? 'bg-emerald-500/5 border-emerald-500/20' 
              : 'bg-amber-500/5 border-amber-500/20'
          }`}>
            <div className="flex items-start gap-3">
              {result.recommendation.type === 'good' ? (
                <Sparkles className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-medium text-foreground text-sm">Recomendação</p>
                <p className="text-sm text-muted-foreground">{result.recommendation.message}</p>
              </div>
            </div>
          </div>

          {/* Botão de Novo Cálculo */}
          <Button onClick={resetCalculator} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Fazer novo cálculo
          </Button>

          {/* Aviso Legal Fixo */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Valores estimados com base na EC 132/2023. Resultados sujeitos à regulamentação final.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tela de Entrada
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-primary shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Economize com a Reforma
              <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Automático</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Calcule sua economia em um único clique
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        {/* Renda Mensal */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Renda/Faturamento mensal</Label>
          <Input
            placeholder="R$ 0,00"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(formatCurrencyInput(e.target.value))}
            className="text-lg h-12"
          />
          <p className="text-xs text-muted-foreground">
            Informe sua renda bruta mensal para calcular o imposto base
          </p>
        </div>

        {/* Despesas Dedutíveis */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Despesas dedutíveis (opcional)</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Marque as despesas que geram crédito tributário
            </p>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-muted/30 border border-border">
            {EXPENSE_CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <Checkbox
                  id={cat.id}
                  checked={selectedExpenses[cat.id]?.checked || false}
                  onCheckedChange={(checked) => handleExpenseToggle(cat.id, !!checked)}
                />
                <label 
                  htmlFor={cat.id} 
                  className="text-sm flex-1 cursor-pointer text-foreground"
                >
                  {cat.label}
                </label>
                {selectedExpenses[cat.id]?.checked && (
                  <Input
                    placeholder="R$ 0,00"
                    value={selectedExpenses[cat.id]?.value || ''}
                    onChange={(e) => handleExpenseValue(cat.id, e.target.value)}
                    className="w-28 h-8 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Calcular */}
        <Button 
          onClick={calculateEconomy} 
          disabled={!monthlyIncome || parseCurrencyInput(monthlyIncome) === 0 || isCalculating}
          className="w-full h-12 text-base bg-gradient-to-r from-emerald-500 to-primary hover:from-emerald-600 hover:to-primary/90"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Calculando economia...
            </>
          ) : (
            <>
              <Calculator className="h-5 w-5 mr-2" />
              Calcular Economia
            </>
          )}
        </Button>

        {/* Info */}
        <p className="text-[11px] text-muted-foreground text-center">
          ⚖️ Alíquota base: {BASE_TAX_RATE}% (CBS + IBS conforme EC 132/2023)
        </p>
      </CardContent>
    </Card>
  );
}
