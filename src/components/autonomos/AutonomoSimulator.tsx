import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bot,
  Calculator,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Sparkles,
  Crown,
  Users,
  Building2,
  User,
  ChevronLeft,
  Download,
  Save,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  PROFESSIONAL_CATEGORIES,
  compareRegimes,
  formatCurrency,
  generateAIPrompt,
  AutonomoInput,
  ComparisonResult,
} from '@/lib/autonomosData';
import { brazilianStates } from '@/lib/taxData';
import { LEGAL_DISCLAIMER } from '@/lib/taxConstants';
import { exportAutonomoAnalysisPdf } from '@/lib/exportAutonomoPdf';

// Estados para o fluxo do wizard
type WizardStep = 'category' | 'profession' | 'revenue' | 'result';

export const AutonomoSimulator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Wizard state
  const [step, setStep] = useState<WizardStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProfession, setSelectedProfession] = useState<string>('');
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>('');
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('');
  const [state, setState] = useState<string>('SP');
  
  // Results state
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  
  const formatCurrencyInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const cents = parseInt(numbers || '0', 10);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const parseCurrencyInput = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
    return parseInt(numbers || '0', 10) / 100;
  };
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedProfession('');
    setStep('profession');
  };
  
  const handleProfessionSelect = (profession: string) => {
    setSelectedProfession(profession);
    setStep('revenue');
  };
  
  const handleCalculate = async () => {
    const revenue = parseCurrencyInput(monthlyRevenue);
    const expenses = parseCurrencyInput(monthlyExpenses);
    
    if (revenue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Informe o faturamento',
        description: 'Digite seu faturamento mensal para calcular',
      });
      return;
    }
    
    setIsCalculating(true);
    
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const input: AutonomoInput = {
      monthlyRevenue: revenue,
      monthlyExpenses: expenses,
      profession: selectedProfession,
      category: selectedCategory,
      state,
    };
    
    const comparison = compareRegimes(input);
    setResult(comparison);
    setStep('result');
    setIsCalculating(false);
    
    // Busca análise da IA
    fetchAIAnalysis(input, comparison);
  };
  
  const fetchAIAnalysis = async (input: AutonomoInput, comparison: ComparisonResult) => {
    setIsLoadingAI(true);
    setAiAnalysis('');
    
    try {
      const prompt = generateAIPrompt(input, comparison);
      
      const response = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: prompt,
          type: 'autonomo_analysis'
        }
      });
      
      if (response.error) throw response.error;
      
      setAiAnalysis(response.data?.response || comparison.recommendation);
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback para recomendação básica
      setAiAnalysis(comparison.recommendation);
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  const handleReset = () => {
    setStep('category');
    setSelectedCategory('');
    setSelectedProfession('');
    setMonthlyRevenue('');
    setMonthlyExpenses('');
    setResult(null);
    setAiAnalysis('');
    setHasSaved(false);
  };

  const handleSaveSimulation = async () => {
    if (!user || !result) return;

    setIsSaving(true);
    try {
      const revenue = parseCurrencyInput(monthlyRevenue);
      const expenses = parseCurrencyInput(monthlyExpenses);
      const category = getCategoryByID(selectedCategory);

      const { error } = await supabase.from('autonomos_simulations').insert({
        user_id: user.id,
        profession: selectedProfession,
        profession_category: category?.name || selectedCategory,
        monthly_revenue_cents: Math.round(revenue * 100),
        monthly_expenses_cents: Math.round(expenses * 100),
        state,
        recommendation: result.recommendation,
        pf_tax_cents: Math.round(result.pf.monthlyTax * 100),
        mei_tax_cents: result.mei.isEligible ? Math.round(result.mei.monthlyTax * 100) : null,
        me_simples_tax_cents: result.meSimples.isEligible ? Math.round(result.meSimples.monthlyTax * 100) : null,
        lucro_presumido_tax_cents: result.mePresumido.isEligible ? Math.round(result.mePresumido.monthlyTax * 100) : null,
        annual_savings_cents: Math.round(result.annualSavings * 100),
        notes: aiAnalysis || null,
      });

      if (error) throw error;

      setHasSaved(true);
      queryClient.invalidateQueries({ queryKey: ['autonomos-simulations'] });
      toast({ title: 'Simulação salva com sucesso!' });
    } catch (error) {
      console.error('Error saving simulation:', error);
      toast({ variant: 'destructive', title: 'Erro ao salvar simulação' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = () => {
    if (!result) return;

    const category = getCategoryByID(selectedCategory);
    
    exportAutonomoAnalysisPdf({
      profession: selectedProfession,
      category: category?.name || selectedCategory,
      monthlyRevenue: parseCurrencyInput(monthlyRevenue),
      monthlyExpenses: parseCurrencyInput(monthlyExpenses),
      state,
      pfTax: result.pf.monthlyTax,
      meiTax: result.mei.isEligible ? result.mei.monthlyTax : null,
      meSimplesTax: result.meSimples.isEligible ? result.meSimples.monthlyTax : null,
      lucroPresumidoTax: result.mePresumido.isEligible ? result.mePresumido.monthlyTax : null,
      annualSavings: result.annualSavings,
      recommendation: result.recommendation,
      aiAnalysis: aiAnalysis || undefined,
    });

    toast({ title: 'PDF gerado com sucesso!' });
  };
  
  const getCategoryByID = (id: string) => {
    return PROFESSIONAL_CATEGORIES.find(c => c.id === id);
  };
  
  const getProgress = () => {
    switch (step) {
      case 'category': return 25;
      case 'profession': return 50;
      case 'revenue': return 75;
      case 'result': return 100;
      default: return 0;
    }
  };
  
  // Render step: Category selection
  const renderCategoryStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Qual é sua área?</h2>
        <p className="text-muted-foreground mt-1">Selecione a categoria que melhor descreve seu trabalho</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {PROFESSIONAL_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="group p-4 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all text-center"
          >
            <span className="text-3xl mb-2 block">{category.icon}</span>
            <span className="text-sm font-medium text-foreground group-hover:text-primary">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
  
  // Render step: Profession selection
  const renderProfessionStep = () => {
    const category = getCategoryByID(selectedCategory);
    if (!category) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setStep('category')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span>{category.icon}</span> {category.name}
            </h2>
            <p className="text-muted-foreground">Selecione sua profissão</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {category.professions.map((profession) => (
            <button
              key={profession}
              onClick={() => handleProfessionSelect(profession)}
              className="p-4 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all text-left"
            >
              <span className="font-medium text-foreground">{profession}</span>
            </button>
          ))}
          <button
            onClick={() => handleProfessionSelect('Outro')}
            className="p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 transition-all text-left"
          >
            <span className="font-medium text-muted-foreground">Outra profissão...</span>
          </button>
        </div>
      </div>
    );
  };
  
  // Render step: Revenue input
  const renderRevenueStep = () => (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setStep('profession')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quanto você fatura?</h2>
          <p className="text-muted-foreground">
            Profissão: <span className="font-medium text-foreground">{selectedProfession}</span>
          </p>
        </div>
      </div>
      
      <Card className="bg-card border-border shadow-soft">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-medium">Faturamento mensal médio</Label>
            <Input
              placeholder="R$ 0,00"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(formatCurrencyInput(e.target.value))}
              className="text-xl h-14 text-center font-semibold"
            />
            <p className="text-xs text-muted-foreground">
              Quanto você recebe por mês, em média
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-medium">Despesas mensais (opcional)</Label>
            <Input
              placeholder="R$ 0,00"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(formatCurrencyInput(e.target.value))}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Aluguel, materiais, transporte, etc.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-medium">Estado</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {brazilianStates.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleCalculate}
            disabled={isCalculating || !monthlyRevenue}
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isCalculating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Calculando...
              </>
            ) : (
              <>
                <Bot className="h-5 w-5 mr-2" />
                IA, me diz o melhor caminho!
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
  
  // Render step: Results
  const renderResultStep = () => {
    if (!result) return null;
    
    const regimes = [result.pf, result.mei, result.meSimples, result.mePresumido]
      .filter(r => r.isEligible)
      .sort((a, b) => a.annualTax - b.annualTax);
    
    const getRegimeIcon = (regime: string) => {
      switch (regime) {
        case 'PF': return <User className="h-5 w-5" />;
        case 'MEI': return <Crown className="h-5 w-5" />;
        case 'ME_SIMPLES': return <Building2 className="h-5 w-5" />;
        case 'ME_PRESUMIDO': return <Building2 className="h-5 w-5" />;
        default: return <User className="h-5 w-5" />;
      }
    };
    
    const getRegimeColor = (regime: string, isBest: boolean) => {
      if (isBest) return 'border-emerald-500 bg-emerald-500/10';
      switch (regime) {
        case 'PF': return 'border-border bg-muted/30';
        case 'MEI': return 'border-primary/30 bg-primary/5';
        case 'ME_SIMPLES': return 'border-info/30 bg-info/5';
        case 'ME_PRESUMIDO': return 'border-amber-500/30 bg-amber-500/5';
        default: return 'border-border bg-muted/30';
      }
    };
    
    return (
      <div className="space-y-6">
        {/* Header com economia */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Análise Completa</span>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {selectedProfession}
            </h2>
            <p className="text-muted-foreground">
              Faturamento: {formatCurrency(parseCurrencyInput(monthlyRevenue))}/mês
            </p>
          </div>
          
          {result.annualSavings > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30">
              <p className="text-sm text-muted-foreground mb-1">Economia anual com a melhor opção</p>
              <p className="text-4xl font-bold text-emerald-600">
                {formatCurrency(result.annualSavings)}
              </p>
              <p className="text-sm text-emerald-600/80 mt-1">
                comparado a continuar como PF
              </p>
            </div>
          )}
        </div>
        
        {/* Comparação de regimes */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Comparação de Regimes
          </h3>
          
          <div className="grid gap-3">
            {regimes.map((regime, index) => {
              const isBest = regime.regime === result.bestOption.regime;
              
              return (
                <div
                  key={regime.regime}
                  className={`p-4 rounded-xl border-2 transition-all ${getRegimeColor(regime.regime, isBest)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isBest ? 'bg-emerald-500/20' : 'bg-muted'}`}>
                        {getRegimeIcon(regime.regime)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{regime.label}</p>
                          {isBest && (
                            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Melhor opção
                            </Badge>
                          )}
                          {index === 0 && !isBest && (
                            <Badge variant="outline" className="text-muted-foreground">
                              #{index + 1}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Alíquota efetiva: {regime.effectiveRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground">
                        {formatCurrency(regime.monthlyTax)}<span className="text-sm font-normal text-muted-foreground">/mês</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Líquido: {formatCurrency(regime.netMonthly)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Regimes não elegíveis */}
            {!result.mei.isEligible && (
              <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 opacity-60">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-foreground">MEI - Não elegível</p>
                    <p className="text-sm text-muted-foreground">{result.mei.ineligibilityReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Alertas */}
        {result.alerts.length > 0 && (
          <div className="space-y-2">
            {result.alerts.map((alert, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-700 dark:text-amber-400"
              >
                {alert}
              </div>
            ))}
          </div>
        )}
        
        {/* Análise da IA */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              Orientação da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAI ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analisando sua situação...</span>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-line">{aiAnalysis || result.recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Nova simulação
          </Button>
          {user && !hasSaved && (
            <Button
              onClick={handleSaveSimulation}
              variant="outline"
              className="flex-1"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar simulação
            </Button>
          )}
          {hasSaved && (
            <Button variant="outline" className="flex-1" disabled>
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              Salvo!
            </Button>
          )}
          <Button
            onClick={handleExportPdf}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button
            onClick={() => window.location.href = '/contadores'}
            className="flex-1 bg-primary"
          >
            <Users className="h-4 w-4 mr-2" />
            Falar com contador
          </Button>
        </div>
        
        {/* Disclaimer */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              {LEGAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progresso</span>
          <span>{getProgress()}%</span>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>
      
      {/* Current step content */}
      {step === 'category' && renderCategoryStep()}
      {step === 'profession' && renderProfessionStep()}
      {step === 'revenue' && renderRevenueStep()}
      {step === 'result' && renderResultStep()}
    </div>
  );
};
