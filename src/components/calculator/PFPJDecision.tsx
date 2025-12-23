import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  HelpCircle,
  ChevronDown,
  BookOpen,
  Receipt,
  Landmark,
  Percent,
  CircleDollarSign,
  Building,
  ShoppingBag,
  Briefcase,
  Cpu,
  Wrench,
  Stethoscope,
  GraduationCap,
  Utensils,
  Car,
  Home,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

// Tipos de atividade mais abrangentes
const ACTIVITY_TYPES = [
  { value: 'servicos', label: 'Prestação de Serviços', icon: Briefcase },
  { value: 'comercio', label: 'Comércio (Compra e Venda)', icon: ShoppingBag },
  { value: 'tecnologia', label: 'Tecnologia / Software', icon: Cpu },
  { value: 'consultoria', label: 'Consultoria / Assessoria', icon: BookOpen },
  { value: 'saude', label: 'Saúde / Clínicas', icon: Stethoscope },
  { value: 'educacao', label: 'Educação / Treinamentos', icon: GraduationCap },
  { value: 'alimentacao', label: 'Alimentação / Restaurantes', icon: Utensils },
  { value: 'construcao', label: 'Construção / Obras', icon: Building },
  { value: 'transporte', label: 'Transporte / Logística', icon: Car },
  { value: 'locacao_residencial', label: 'Locação Residencial', icon: Home },
  { value: 'locacao_comercial', label: 'Locação Comercial', icon: Building2 },
  { value: 'manutencao', label: 'Manutenção / Reparos', icon: Wrench },
];

// Glossário de impostos com explicações intuitivas
const TAX_GLOSSARY = [
  {
    abbr: 'IBS',
    name: 'Imposto sobre Bens e Serviços',
    rate: '17,7%',
    icon: Landmark,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Imposto estadual/municipal unificado. Substitui ICMS e ISS. Você paga para o estado e cidade onde opera.',
    example: 'Vendeu R$ 1.000? Paga ~R$ 177 de IBS.',
  },
  {
    abbr: 'CBS',
    name: 'Contribuição sobre Bens e Serviços',
    rate: '8,8%',
    icon: Receipt,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Contribuição federal que substitui PIS e COFINS. Vai para a União e financia seguridade social.',
    example: 'Vendeu R$ 1.000? Paga ~R$ 88 de CBS.',
  },
  {
    abbr: 'IRPJ',
    name: 'Imposto de Renda Pessoa Jurídica',
    rate: '15%',
    icon: Building2,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    description: 'Imposto sobre o lucro da empresa. No Lucro Presumido, incide sobre uma base "presumida" (32% para serviços).',
    example: 'Lucro de R$ 10.000? Paga ~R$ 1.500 de IRPJ.',
  },
  {
    abbr: 'CSLL',
    name: 'Contribuição Social sobre Lucro Líquido',
    rate: '9%',
    icon: CircleDollarSign,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Contribuição federal sobre o lucro. Financia a seguridade social (saúde, previdência, assistência).',
    example: 'Lucro de R$ 10.000? Paga ~R$ 900 de CSLL.',
  },
  {
    abbr: 'IVA',
    name: 'Imposto sobre Valor Agregado',
    rate: '26,5%',
    icon: Percent,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    description: 'Soma do IBS + CBS. É a alíquota total do novo sistema tributário brasileiro. Incide sobre consumo.',
    example: 'É o "combo" de impostos que você paga em cada venda.',
  },
];

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
      const activityLabel = ACTIVITY_TYPES.find(a => a.value === result.activityType)?.label || result.activityType;
      doc.text(`• Tipo de Atividade: ${activityLabel}`, 25, 133);
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
                    <SelectValue placeholder="Selecione sua atividade" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {ACTIVITY_TYPES.map((activity) => {
                      const IconComponent = activity.icon;
                      return (
                        <SelectItem key={activity.value} value={activity.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <span>{activity.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
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
            {/* RESULTADO DECISIVO */}
            <div className="space-y-5">
              {/* Hero Result Card */}
              <div className={`p-6 rounded-2xl border-2 ${
                result.bestOption === 'PF' 
                  ? 'bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border-blue-500/40' 
                  : 'bg-gradient-to-br from-emerald-500/15 to-green-500/10 border-emerald-500/40'
              }`}>
                {/* Header with checkmark */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-600 mb-4">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Estrutura ideal para você</span>
                  </div>
                </div>

                {/* Main Result - Big and Clear */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center p-4 rounded-full mb-4 ${
                    result.bestOption === 'PF' ? 'bg-blue-500/20' : 'bg-emerald-500/20'
                  }`}>
                    {result.bestOption === 'PF' ? (
                      <User className="h-10 w-10 text-blue-500" />
                    ) : (
                      <Building2 className="h-10 w-10 text-emerald-500" />
                    )}
                  </div>
                  <h2 className={`text-3xl font-bold ${
                    result.bestOption === 'PF' ? 'text-blue-600' : 'text-emerald-600'
                  }`}>
                    {result.bestOption === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </h2>
                </div>

                {/* Savings - Super Highlight */}
                <div className="bg-background/80 rounded-xl p-5 border border-emerald-500/30 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs font-medium">Economia mensal</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(result.monthlySavings)}
                      </p>
                    </div>
                    <div className="border-l border-border pl-4">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-medium">Economia anual</span>
                      </div>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(result.annualSavings)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparison Text - Trust Builder */}
                <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Comparado PF × PJ</span>, esta estrutura apresenta a <span className="font-semibold text-emerald-600">menor carga tributária estimada</span>.
                  </p>
                </div>
              </div>

              {/* Quick Tax Reference (collapsed/minimal) */}
              <div className="flex gap-2 text-xs text-muted-foreground justify-center">
                <span className={`px-3 py-1 rounded-full ${result.bestOption === 'PF' ? 'bg-blue-500/10 text-blue-600 font-medium' : 'bg-muted'}`}>
                  PF: {formatCurrency(result.taxPF)}/mês
                </span>
                <span className="text-muted-foreground">vs</span>
                <span className={`px-3 py-1 rounded-full ${result.bestOption === 'PJ' ? 'bg-emerald-500/10 text-emerald-600 font-medium' : 'bg-muted'}`}>
                  PJ: {formatCurrency(result.taxPJ)}/mês
                </span>
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

        {/* Glossário de Impostos - Painel Master */}
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-500/5 to-slate-500/10 border border-border hover:border-primary/30 transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Entenda os Impostos</h3>
                  <p className="text-xs text-muted-foreground">Glossário completo da Reforma Tributária</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  5 impostos
                </Badge>
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-3 animate-in slide-in-from-top-2">
            {TAX_GLOSSARY.map((tax) => {
              const IconComponent = tax.icon;
              return (
                <div 
                  key={tax.abbr}
                  className={`p-4 rounded-xl border border-border ${tax.bgColor} hover:shadow-md transition-all`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl bg-background/80 shadow-sm`}>
                      <IconComponent className={`h-6 w-6 ${tax.color}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      {/* Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${tax.bgColor} ${tax.color} border-0 font-bold text-sm px-3`}>
                            {tax.abbr}
                          </Badge>
                          <span className="font-medium text-foreground text-sm">
                            {tax.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs font-bold border-2">
                          {tax.rate}
                        </Badge>
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tax.description}
                      </p>
                      
                      {/* Example */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50">
                        <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <p className="text-xs text-foreground font-medium">
                          {tax.example}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Summary Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-violet-500/10 border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <Percent className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Resumo da Reforma</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-background/70">
                  <p className="text-2xl font-bold text-primary">26,5%</p>
                  <p className="text-xs text-muted-foreground">Alíquota Padrão (IBS+CBS)</p>
                </div>
                <div className="p-3 rounded-lg bg-background/70">
                  <p className="text-2xl font-bold text-emerald-600">2033</p>
                  <p className="text-xs text-muted-foreground">Transição completa</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                O novo sistema unifica PIS, COFINS, ICMS e ISS em dois tributos: IBS e CBS.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
