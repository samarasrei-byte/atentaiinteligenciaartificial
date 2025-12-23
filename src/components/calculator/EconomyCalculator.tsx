import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  TrendingDown,
  Calculator,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Building2,
  User,
  Briefcase,
  Home,
  Building,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/taxData';

// Alíquotas estimadas (EC 132/2023)
const TAX_RATES = {
  cbs: 8.8,
  ibs: 17.7,
  fullRate: 26.5, // 8.8 + 17.7
  residentialReduction: 0.6, // 60% redução
};

// Categorias de despesas com crédito
const EXPENSE_CATEGORIES = [
  { id: 'aluguel_sede', label: 'Aluguel da sede/escritório', creditRate: 0.8 },
  { id: 'energia', label: 'Energia elétrica', creditRate: 0.9 },
  { id: 'telefone_internet', label: 'Telefone e internet', creditRate: 0.9 },
  { id: 'materiais', label: 'Materiais e insumos', creditRate: 1.0 },
  { id: 'servicos_terceiros', label: 'Serviços de terceiros', creditRate: 0.7 },
  { id: 'manutencao', label: 'Manutenção e reparos', creditRate: 0.8 },
];

interface CalculationResult {
  potentialSavings: number;
  currentTax: number;
  newTax: number;
  bestScenario: string;
  recommendations: string[];
  riskLevel: 'baixo' | 'medio' | 'alto';
  creditAmount: number;
  scenarios: {
    name: string;
    savings: number;
    description: string;
  }[];
}

export function EconomyCalculator() {
  const [personType, setPersonType] = useState<'pf' | 'pj'>('pj');
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('commercial');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [selectedExpenses, setSelectedExpenses] = useState<Record<string, { checked: boolean; value: string }>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
    await new Promise(resolve => setTimeout(resolve, 1500));

    const revenue = parseCurrencyInput(monthlyRevenue);
    
    // Camada 1 - Diagnóstico rápido
    const isResidential = propertyType === 'residential';
    const isPJ = personType === 'pj';
    
    // Imposto atual estimado
    let currentTaxRate = 0;
    if (isPJ) {
      currentTaxRate = isResidential ? 5 : 8.65; // ISS + PIS/COFINS
    }
    const currentTax = revenue * (currentTaxRate / 100);
    
    // Camada 2 - Motor de créditos
    let totalExpenses = 0;
    let totalCredits = 0;
    
    Object.entries(selectedExpenses).forEach(([id, expense]) => {
      if (expense.checked && expense.value) {
        const value = parseCurrencyInput(expense.value);
        const category = EXPENSE_CATEGORIES.find(c => c.id === id);
        if (category) {
          totalExpenses += value;
          // Crédito = despesa * alíquota * taxa de aproveitamento
          totalCredits += value * (TAX_RATES.fullRate / 100) * category.creditRate;
        }
      }
    });
    
    // Novo imposto com reforma
    const effectiveRate = isResidential 
      ? TAX_RATES.fullRate * (1 - TAX_RATES.residentialReduction)
      : TAX_RATES.fullRate;
    
    const grossNewTax = revenue * (effectiveRate / 100);
    const netNewTax = Math.max(0, grossNewTax - totalCredits);
    
    // Camada 3 - Estratégia automática (testa cenários)
    const scenarios = [
      {
        name: 'Sem otimização',
        savings: currentTax - grossNewTax,
        description: 'Sem aproveitamento de créditos',
      },
      {
        name: 'Com créditos fiscais',
        savings: currentTax - netNewTax,
        description: 'Aproveitando créditos de despesas',
      },
      {
        name: 'Repasse parcial ao locatário',
        savings: currentTax - (netNewTax * 0.5),
        description: 'Dividindo imposto com inquilino',
      },
    ];

    // Se PF, adicionar cenário de migração para PJ
    if (!isPJ && revenue > 5000) {
      const pjScenario = {
        name: 'Migrar para PJ',
        savings: (revenue * 0.15) - (revenue * (effectiveRate / 100) * 0.6),
        description: 'Operar como holding patrimonial',
      };
      scenarios.push(pjScenario);
    }

    // Camada 4 - Melhor decisão
    const sortedScenarios = [...scenarios].sort((a, b) => b.savings - a.savings);
    const bestScenario = sortedScenarios[0];
    
    const potentialSavings = Math.max(0, bestScenario.savings) * 12; // Anual
    
    // Recomendações baseadas no cenário
    const recommendations: string[] = [];
    if (totalCredits > 0) {
      recommendations.push('Organize comprovantes de despesas para créditos');
    }
    if (!isPJ && revenue > 10000) {
      recommendations.push('Avalie estruturar como holding patrimonial');
    }
    if (isResidential) {
      recommendations.push('Aproveite a redução de 60% para residencial');
    }
    if (recommendations.length < 3) {
      recommendations.push('Consulte um contador para planejamento detalhado');
    }
    
    // Nível de risco
    let riskLevel: 'baixo' | 'medio' | 'alto' = 'baixo';
    if (bestScenario.name.includes('Migrar') || bestScenario.name.includes('Repasse')) {
      riskLevel = 'medio';
    }
    
    setResult({
      potentialSavings,
      currentTax: currentTax * 12,
      newTax: netNewTax * 12,
      bestScenario: bestScenario.name,
      recommendations: recommendations.slice(0, 3),
      riskLevel,
      creditAmount: totalCredits * 12,
      scenarios: sortedScenarios,
    });
    
    setIsCalculating(false);
  };

  const resetCalculator = () => {
    setResult(null);
    setMonthlyRevenue('');
    setSelectedExpenses({});
    setShowDetails(false);
  };

  if (result) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32" />
        
        <CardContent className="pt-6 relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm mb-4">
              <Sparkles className="h-4 w-4" />
              Cálculo Concluído
            </div>
            
            <h3 className="text-lg text-muted-foreground mb-2">Você pode economizar até</h3>
            <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
              {formatCurrency(result.potentialSavings)}
              <span className="text-lg text-muted-foreground font-normal">/ano</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-muted-foreground mb-1">Hoje você paga</p>
              <p className="text-lg font-bold text-destructive">{formatCurrency(result.currentTax)}/ano</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Com a reforma</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(result.newTax)}/ano</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-success/10 border border-success/20 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <p className="font-semibold text-foreground">Melhor cenário aplicado</p>
            </div>
            <p className="text-sm text-muted-foreground">{result.bestScenario}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={result.riskLevel === 'baixo' ? 'default' : 'secondary'} className={
                result.riskLevel === 'baixo' 
                  ? 'bg-success/20 text-success border-success/30' 
                  : 'bg-amber-500/20 text-amber-600 border-amber-500/30'
              }>
                Risco {result.riskLevel}
              </Badge>
              {result.creditAmount > 0 && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Créditos: {formatCurrency(result.creditAmount)}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações recomendadas</p>
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{rec}</span>
              </div>
            ))}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mb-4"
          >
            {showDetails ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
            {showDetails ? 'Ocultar' : 'Ver'} detalhes
          </Button>

          {showDetails && (
            <div className="space-y-2 mb-4 p-4 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Todos os cenários analisados</p>
              {result.scenarios.map((scenario, i) => (
                <div key={i} className={`p-3 rounded-lg border ${i === 0 ? 'bg-success/5 border-success/20' : 'bg-background border-border'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{scenario.name}</span>
                    <span className={`font-bold text-sm ${scenario.savings > 0 ? 'text-success' : 'text-destructive'}`}>
                      {scenario.savings > 0 ? '+' : ''}{formatCurrency(scenario.savings * 12)}/ano
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                </div>
              ))}
            </div>
          )}

          <Button onClick={resetCalculator} className="w-full">
            Fazer novo cálculo
          </Button>

          <p className="text-[10px] text-muted-foreground text-center mt-4">
            Cálculos estimados com base na EC 132/2023. Valores sujeitos à regulamentação.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Economize com a Reforma
              <Badge className="bg-accent/20 text-accent border-accent/30">1-Clique</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Veja quanto você pode economizar automaticamente
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Tipo de pessoa */}
        <div className="space-y-2">
          <Label className="text-xs">Quem recebe a renda?</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPersonType('pf')}
              className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                personType === 'pf'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <User className={`h-4 w-4 ${personType === 'pf' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${personType === 'pf' ? 'text-foreground' : 'text-muted-foreground'}`}>Pessoa Física</span>
            </button>
            <button
              onClick={() => setPersonType('pj')}
              className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                personType === 'pj'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Briefcase className={`h-4 w-4 ${personType === 'pj' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${personType === 'pj' ? 'text-foreground' : 'text-muted-foreground'}`}>Pessoa Jurídica</span>
            </button>
          </div>
        </div>

        {/* Tipo de imóvel */}
        <div className="space-y-2">
          <Label className="text-xs">Tipo de atividade/imóvel</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPropertyType('residential')}
              className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                propertyType === 'residential'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Home className={`h-4 w-4 ${propertyType === 'residential' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${propertyType === 'residential' ? 'text-foreground' : 'text-muted-foreground'}`}>Residencial</span>
            </button>
            <button
              onClick={() => setPropertyType('commercial')}
              className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                propertyType === 'commercial'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Building className={`h-4 w-4 ${propertyType === 'commercial' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${propertyType === 'commercial' ? 'text-foreground' : 'text-muted-foreground'}`}>Comercial</span>
            </button>
          </div>
        </div>

        {/* Faturamento */}
        <div className="space-y-2">
          <Label className="text-xs">Faturamento/Renda mensal</Label>
          <Input
            placeholder="R$ 0,00"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(formatCurrencyInput(e.target.value))}
          />
        </div>

        {/* Despesas para crédito (apenas PJ) */}
        {personType === 'pj' && (
          <div className="space-y-2">
            <Label className="text-xs">Despesas com direito a crédito (opcional)</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 rounded-lg bg-muted/30">
              {EXPENSE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <Checkbox
                    id={cat.id}
                    checked={selectedExpenses[cat.id]?.checked || false}
                    onCheckedChange={(checked) => handleExpenseToggle(cat.id, !!checked)}
                  />
                  <label htmlFor={cat.id} className="text-xs flex-1 cursor-pointer">
                    {cat.label}
                  </label>
                  {selectedExpenses[cat.id]?.checked && (
                    <Input
                      placeholder="R$ 0"
                      value={selectedExpenses[cat.id]?.value || ''}
                      onChange={(e) => handleExpenseValue(cat.id, e.target.value)}
                      className="w-24 h-7 text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={calculateEconomy} 
          disabled={!monthlyRevenue || isCalculating}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
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

        <p className="text-[10px] text-muted-foreground text-center">
          ⚖️ Cálculos estimados com base na EC 132/2023
        </p>
      </CardContent>
    </Card>
  );
}