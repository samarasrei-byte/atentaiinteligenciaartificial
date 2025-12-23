import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  TrendingDown, 
  ArrowRight, 
  Sparkles, 
  User, 
  Building2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface DecisionResult {
  bestOption: 'PF' | 'PJ';
  taxPF: number;
  taxPJ: number;
  monthlySavings: number;
  annualSavings: number;
  revenue: number;
  expenses: number;
  activityType: string;
}

export const PFPJDecision = () => {
  const { user } = useAuth();
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [activityType, setActivityType] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<DecisionResult | null>(null);
  const { toast } = useToast();

  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(value) / 100;
    if (value) {
      setMonthlyRevenue(numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    } else {
      setMonthlyRevenue('');
    }
  };

  const handleExpensesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(value) / 100;
    if (value) {
      setMonthlyExpenses(numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    } else {
      setMonthlyExpenses('');
    }
  };

  const calculateDecision = async () => {
    const revenue = parseCurrency(monthlyRevenue);
    const expenses = parseCurrency(monthlyExpenses);

    if (revenue <= 0) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, informe o faturamento mensal.',
        variant: 'destructive',
      });
      return;
    }

    if (!activityType) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, selecione o tipo de atividade.',
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);

    // Simular delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 1200));

    // CENÁRIO PF: 26,5% sobre faturamento (sem créditos)
    const taxPF = revenue * 0.265;

    // CENÁRIO PJ: Lucro Presumido
    // Base presumida = faturamento × 32%
    const presumedBase = revenue * 0.32;
    // IRPJ + CSLL = 11,33% sobre base presumida
    const irpjCsll = presumedBase * 0.1133;
    // CBS = 12% sobre faturamento
    const cbs = revenue * 0.12;
    // Crédito CBS = 100% das despesas × 12%
    const cbsCredit = expenses * 0.12;
    // Imposto PJ = IRPJ + CSLL + CBS - créditos
    const taxPJ = Math.max(0, irpjCsll + cbs - cbsCredit);

    // Comparar e selecionar menor
    const bestOption: 'PF' | 'PJ' = taxPF <= taxPJ ? 'PF' : 'PJ';
    const monthlySavings = Math.abs(taxPF - taxPJ);
    const annualSavings = monthlySavings * 12;

    const resultData: DecisionResult = {
      bestOption,
      taxPF,
      taxPJ,
      monthlySavings,
      annualSavings,
      revenue,
      expenses,
      activityType,
    };
    
    setResult(resultData);
    
    // Save to database
    saveSimulation(resultData);

    setIsCalculating(false);

    toast({
      title: 'Análise concluída!',
      description: `A estrutura mais eficiente é ${bestOption === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}.`,
    });
  };

  // Save simulation to database
  const saveSimulation = async (data: DecisionResult) => {
    if (!user) return;
    
    try {
      const minTax = Math.min(data.taxPF, data.taxPJ);
      await supabase.from('tax_simulations').insert({
        user_id: user.id,
        revenue_cents: Math.round(data.revenue * 100),
        tax_type: 'pf_pj',
        total_tax_cents: Math.round(minTax * 100),
        cbs_cents: data.bestOption === 'PJ' ? Math.round(data.revenue * 0.12 * 100) : 0,
      });
    } catch (error) {
      console.error('Error saving simulation:', error);
    }
  };

  // Export to PDF
  const exportToPdf = async () => {
    if (!result) return;
    
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(124, 58, 237); // violet-500
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('Decisão Tributária: PF ou PJ', pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text('AtentAI - Análise Automatizada', pageWidth / 2, 30, { align: 'center' });
      
      // Date
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 50, { align: 'center' });
      
      // Result section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('Resultado da Análise', 20, 65);
      
      // Best option
      doc.setFillColor(result.bestOption === 'PF' ? 59 : 16, result.bestOption === 'PF' ? 130 : 185, result.bestOption === 'PF' ? 246 : 129);
      doc.roundedRect(20, 70, pageWidth - 40, 30, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(`Estrutura Recomendada: ${result.bestOption === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}`, pageWidth / 2, 85, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Esta é a estrutura mais eficiente com base nos seus dados.', pageWidth / 2, 93, { align: 'center' });
      
      // Data input summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text('Dados Informados:', 20, 115);
      
      doc.setFontSize(10);
      doc.text(`• Faturamento Mensal: ${formatCurrency(result.revenue)}`, 25, 125);
      doc.text(`• Tipo de Atividade: ${result.activityType === 'residencial' ? 'Locação Residencial' : 'Locação Comercial'}`, 25, 133);
      doc.text(`• Despesas Mensais: ${formatCurrency(result.expenses)}`, 25, 141);
      
      // Comparison
      doc.setFontSize(12);
      doc.text('Comparativo de Impostos:', 20, 160);
      
      // PF box
      doc.setDrawColor(59, 130, 246);
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(20, 165, (pageWidth - 50) / 2, 40, 2, 2, 'FD');
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(10);
      doc.text('Pessoa Física', 20 + (pageWidth - 50) / 4, 178, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(formatCurrency(result.taxPF) + '/mês', 20 + (pageWidth - 50) / 4, 195, { align: 'center' });
      
      // PJ box
      doc.setDrawColor(16, 185, 129);
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(30 + (pageWidth - 50) / 2, 165, (pageWidth - 50) / 2, 40, 2, 2, 'FD');
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(10);
      doc.text('Pessoa Jurídica', 30 + 3 * (pageWidth - 50) / 4, 178, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(formatCurrency(result.taxPJ) + '/mês', 30 + 3 * (pageWidth - 50) / 4, 195, { align: 'center' });
      
      // Savings
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(20, 215, pageWidth - 40, 35, 3, 3, 'F');
      doc.setTextColor(22, 163, 74);
      doc.setFontSize(12);
      doc.text('Economia Estimada', pageWidth / 2, 228, { align: 'center' });
      doc.setFontSize(16);
      doc.text(`${formatCurrency(result.monthlySavings)}/mês | ${formatCurrency(result.annualSavings)}/ano`, pageWidth / 2, 243, { align: 'center' });
      
      // Legal disclaimer
      doc.setTextColor(120, 113, 108);
      doc.setFontSize(8);
      const disclaimer = 'Simulação estimada com base na EC 132/2023 e parâmetros médios. A decisão final deve ser validada com contador. Este documento não substitui consultoria profissional.';
      const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 40);
      doc.text(splitDisclaimer, 20, 265);
      
      // Footer
      doc.setTextColor(150, 150, 150);
      doc.text('AtentAI © 2024 - www.atentai.com.br', pageWidth / 2, 285, { align: 'center' });
      
      doc.save(`decisao-pf-pj-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'PDF exportado!',
        description: 'O arquivo foi baixado com sucesso.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao exportar',
        description: 'Não foi possível gerar o PDF.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resetCalculation = () => {
    setResult(null);
    setMonthlyRevenue('');
    setMonthlyExpenses('');
    setActivityType('');
  };

  return (
    <Card className="bg-card border-border shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <Target className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Decisão Automática: PF ou PJ</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Descubra a estrutura tributária mais eficiente em 1 clique
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {!result ? (
          <>
            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="revenue" className="text-sm font-medium">
                  Faturamento Mensal
                </Label>
                <Input
                  id="revenue"
                  value={monthlyRevenue}
                  onChange={handleRevenueChange}
                  placeholder="R$ 0,00"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity" className="text-sm font-medium">
                  Tipo de Atividade
                </Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residencial">Locação Residencial</SelectItem>
                    <SelectItem value="comercial">Locação Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenses" className="text-sm font-medium">
                  Despesas Mensais Médias
                </Label>
                <Input
                  id="expenses"
                  value={monthlyExpenses}
                  onChange={handleExpensesChange}
                  placeholder="R$ 0,00"
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Inclua manutenção, condomínio, IPTU e outras despesas dedutíveis
                </p>
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={calculateDecision}
              disabled={isCalculating}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
              size="lg"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analisando cenários...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Descobrir estrutura ideal
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Result Card */}
            <div className="space-y-6">
              {/* Best Option Card */}
              <div className={`p-6 rounded-xl border-2 ${
                result.bestOption === 'PF' 
                  ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30' 
                  : 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${
                    result.bestOption === 'PF' ? 'bg-blue-500/20' : 'bg-emerald-500/20'
                  }`}>
                    {result.bestOption === 'PF' ? (
                      <User className="h-6 w-6 text-blue-500" />
                    ) : (
                      <Building2 className="h-6 w-6 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground">
                        {result.bestOption === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </h3>
                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Recomendado
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Esta é a estrutura mais eficiente com base nos seus dados.
                    </p>
                  </div>
                </div>

                {/* Savings Highlight */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-background/60 rounded-lg p-4 text-center">
                    <TrendingDown className="h-5 w-5 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Economia mensal</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(result.monthlySavings)}
                    </p>
                  </div>
                  <div className="bg-background/60 rounded-lg p-4 text-center border-2 border-green-500/30">
                    <Sparkles className="h-5 w-5 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Economia anual</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.annualSavings)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tax Comparison (simplified) */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-lg border ${
                  result.bestOption === 'PF' 
                    ? 'bg-blue-500/5 border-blue-500/20' 
                    : 'bg-muted/30 border-border'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Pessoa Física</span>
                    {result.bestOption === 'PF' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(result.taxPF)}<span className="text-xs text-muted-foreground">/mês</span>
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${
                  result.bestOption === 'PJ' 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-muted/30 border-border'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Pessoa Jurídica</span>
                    {result.bestOption === 'PJ' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(result.taxPJ)}<span className="text-xs text-muted-foreground">/mês</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={exportToPdf}
                  disabled={isExporting}
                  variant="outline"
                  className="flex-1 border-violet-500/50 text-violet-600 hover:bg-violet-500/10"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar PDF
                </Button>
                <Button
                  onClick={resetCalculation}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Nova simulação
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Legal Disclaimer */}
        <Alert className="bg-amber-500/5 border-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-700">
            Simulação estimada com base na EC 132/2023 e parâmetros médios. A decisão final deve ser validada com contador.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
