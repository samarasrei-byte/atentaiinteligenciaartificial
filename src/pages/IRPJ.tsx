import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2, ArrowRight, ArrowLeft, ShieldCheck, Sparkles,
  AlertTriangle, CheckCircle2, XCircle, FileText, Lock, Loader2,
  TrendingUp, Calculator, Award
} from 'lucide-react';

type Regime = 'mei' | 'simples_nacional' | 'lucro_presumido' | 'lucro_real';
type Risk = 'baixo' | 'medio' | 'alto';

interface FormData {
  current_company_type: Regime | '';
  base_year: number;
  annual_revenue_cents: number;
  cnae_code: string;
  cnae_description: string;
  has_payroll: boolean;
  payroll_monthly_cents: number;
  estimated_bank_movement_cents: number;
  documents: { nf: boolean; extratos: boolean; das: boolean };
}

interface SimulationResult {
  id: string;
  recommended_regime: Regime;
  recommendation_reason: string;
  alternatives: { regime: Regime; reason: string }[];
  risks: string[];
  malha_fina_score: Risk;
  ai_analysis?: { qualitative?: string };
}

const STORAGE_KEY = 'ir_pj_wizard_draft';
const MEI_LIMIT = 8_100_000;
const SIMPLES_LIMIT = 480_000_000;

const REGIME_LABELS: Record<Regime, string> = {
  mei: 'MEI',
  simples_nacional: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
};

const initialData: FormData = {
  current_company_type: '',
  base_year: new Date().getFullYear() - 1,
  annual_revenue_cents: 0,
  cnae_code: '',
  cnae_description: '',
  has_payroll: false,
  payroll_monthly_cents: 0,
  estimated_bank_movement_cents: 0,
  documents: { nf: false, extratos: false, das: false },
};

const fmtBRL = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

const IRPJ: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0); // 0 = landing
  const [data, setData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Restaurar draft
  useEffect(() => {
    const draft = sessionStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setData(parsed.data || initialData);
        setStep(parsed.step || 0);
      } catch { /* ignore */ }
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (step > 0 && !result) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step }));
    }
  }, [data, step, result]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData(prev => ({ ...prev, [key]: value }));

  const exceedsMEI = data.annual_revenue_cents > MEI_LIMIT;
  const exceedsSimples = data.annual_revenue_cents > SIMPLES_LIMIT;

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!data.current_company_type && data.base_year > 2000;
      case 2: return data.annual_revenue_cents > 0 && !!data.cnae_code;
      case 3: return true;
      case 4: return true;
      default: return true;
    }
  };

  const submit = async () => {
    if (!user) {
      sessionStorage.setItem('postAuthRedirect', '/ir-pj');
      toast({ title: 'Faça login', description: 'Entre para gerar sua recomendação.' });
      navigate('/auth');
      return;
    }
    setLoading(true);
    try {
      const { data: resp, error } = await supabase.functions.invoke('ir-pj-recommend', {
        body: {
          current_company_type: data.current_company_type,
          base_year: data.base_year,
          annual_revenue_cents: data.annual_revenue_cents,
          cnae_code: data.cnae_code,
          cnae_description: data.cnae_description,
          has_payroll: data.has_payroll,
          payroll_monthly_cents: data.payroll_monthly_cents,
          estimated_bank_movement_cents: data.estimated_bank_movement_cents,
        },
      });
      if (error) throw error;
      setResult(resp.simulation);
      sessionStorage.removeItem(STORAGE_KEY);
      setStep(5);
    } catch (e: any) {
      toast({
        title: 'Erro na análise',
        description: e?.message || 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ───── Landing
  if (step === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" /> IR PJ 2025 — Beta
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Imposto de Renda PJ com<br />
              <span className="text-primary">recomendação inteligente</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubra o melhor regime tributário para sua empresa em 5 passos.
              Validação dupla: IA + Certificado Digital.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Calculator, title: 'Motor de regime', desc: 'MEI, Simples ou Lucro Presumido — recomendação baseada em regras fiscais oficiais.' },
              { icon: ShieldCheck, title: 'Validação dupla', desc: 'Análise de IA + integração com Certificado Digital (em breve).' },
              { icon: AlertTriangle, title: 'Prévia anti-malha fina', desc: 'Identifique inconsistências antes do envio oficial.' },
            ].map((f, i) => (
              <Card key={i} className="p-6">
                <f.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => setStep(1)} className="gap-2">
              Iniciar simulação gratuita <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              <Lock className="h-3 w-3 inline mr-1" /> Dados criptografados. Não cobramos pela simulação.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ───── Resultado
  if (step === 5 && result) {
    const riskColor = result.malha_fina_score === 'baixo'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30'
      : result.malha_fina_score === 'medio'
      ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30'
      : 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30';

    const RiskIcon = result.malha_fina_score === 'baixo' ? CheckCircle2
      : result.malha_fina_score === 'medio' ? AlertTriangle : XCircle;

    const blockPayment = result.malha_fina_score === 'alto';

    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Award className="h-12 w-12 text-primary mx-auto mb-3" />
            <h1 className="text-3xl font-bold mb-2">Sua recomendação está pronta</h1>
            <p className="text-muted-foreground">Análise concluída com base nos dados informados.</p>
          </div>

          <Card className="p-6 mb-4 border-primary/30 bg-primary/5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Regime recomendado</p>
                <h2 className="text-2xl font-bold mb-2">{REGIME_LABELS[result.recommended_regime]}</h2>
                <p className="text-sm">{result.recommendation_reason}</p>
              </div>
            </div>
          </Card>

          <Card className={`p-4 mb-4 border ${riskColor}`}>
            <div className="flex items-center gap-2">
              <RiskIcon className="h-5 w-5" />
              <span className="font-semibold">Risco de malha fina: {result.malha_fina_score.toUpperCase()}</span>
            </div>
          </Card>

          {result.risks.length > 0 && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Pontos de atenção
              </h3>
              <ul className="space-y-2 text-sm">
                {result.risks.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-600">•</span> {r}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {result.alternatives.length > 0 && (
            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Alternativas
              </h3>
              {result.alternatives.map((alt, i) => (
                <div key={i} className="text-sm mb-2 last:mb-0">
                  <strong>{REGIME_LABELS[alt.regime]}:</strong> {alt.reason}
                </div>
              ))}
            </Card>
          )}

          {result.ai_analysis?.qualitative && (
            <Card className="p-6 mb-4 bg-slate-950 text-slate-50 border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary/20 rounded-md">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Parecer do Auditor IA</h3>
                  <p className="text-xs text-slate-400">Análise de Dados Sênior • RFB Compliance</p>
                </div>
              </div>
              <div className="text-sm space-y-4 leading-relaxed opacity-90">
                {result.ai_analysis.qualitative.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" /> Verificado por Auditoria Nível 1
                </div>
                <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                  REF: {result.id.split('-')[0].toUpperCase()}
                </Badge>
              </div>
            </Card>
          )}

          <Alert className="mb-6">
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              <strong>Camada 2 — Certificado Digital:</strong> em breve você poderá conectar
              seu e-CNPJ para validação cruzada com dados do e-CAC.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => { setResult(null); setData(initialData); setStep(0); }}
              className="flex-1"
            >
              Nova simulação
            </Button>
            <Button
              className="flex-1"
              disabled={blockPayment}
              onClick={() => navigate('/servicos')}
            >
              {blockPayment ? 'Resolva os riscos antes de prosseguir' : 'Contratar declaração'}
            </Button>
          </div>
          {blockPayment && (
            <p className="text-xs text-red-600 text-center mt-2">
              Pagamento bloqueado: risco alto identificado. Ajuste os dados ou consulte um contador.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ───── Wizard (steps 1-4)
  const stepTitles = ['', 'Identificação', 'Faturamento e Atividade', 'Documentos', 'Validação'];
  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium">Passo {step} de 4: {stepTitles[step]}</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <Card className="p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <Building2 className="h-5 w-5" />
                <h2 className="font-semibold">Conte sobre sua empresa</h2>
              </div>

              <div className="space-y-2">
                <Label>Regime tributário atual *</Label>
                <Select
                  value={data.current_company_type}
                  onValueChange={(v) => update('current_company_type', v as Regime)}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o regime atual" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mei">MEI — Microempreendedor Individual</SelectItem>
                    <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                    <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                    <SelectItem value="lucro_real">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano-base da declaração *</Label>
                <Input
                  id="year"
                  type="number"
                  min={2020}
                  max={new Date().getFullYear()}
                  value={data.base_year}
                  onChange={(e) => update('base_year', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <Calculator className="h-5 w-5" />
                <h2 className="font-semibold">Dados financeiros</h2>
              </div>

              <div className="space-y-2">
                <Label>Faturamento anual *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    className="pl-10"
                    value={data.annual_revenue_cents > 0
                      ? new Intl.NumberFormat('pt-BR').format(data.annual_revenue_cents / 100)
                      : ''}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      update('annual_revenue_cents', (parseInt(v) || 0) * 100);
                    }}
                    placeholder="0"
                  />
                </div>
                {exceedsMEI && data.current_company_type === 'mei' && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Faturamento acima do limite MEI ({fmtBRL(MEI_LIMIT)}). Desenquadramento obrigatório.
                    </AlertDescription>
                  </Alert>
                )}
                {exceedsSimples && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Faturamento acima do limite do Simples Nacional ({fmtBRL(SIMPLES_LIMIT)}).
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cnae">CNAE *</Label>
                  <Input
                    id="cnae"
                    value={data.cnae_code}
                    onChange={(e) => update('cnae_code', e.target.value)}
                    placeholder="0000-0/00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnae_desc">Atividade</Label>
                  <Input
                    id="cnae_desc"
                    value={data.cnae_description}
                    onChange={(e) => update('cnae_description', e.target.value)}
                    placeholder="Ex: Desenvolvimento de software"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label htmlFor="payroll" className="cursor-pointer">Possui folha de pagamento?</Label>
                  <p className="text-xs text-muted-foreground">Funcionários com carteira assinada</p>
                </div>
                <Switch
                  id="payroll"
                  checked={data.has_payroll}
                  onCheckedChange={(v) => update('has_payroll', v)}
                />
              </div>

              {data.has_payroll && (
                <div className="space-y-2">
                  <Label>Folha mensal estimada</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      className="pl-10"
                      value={data.payroll_monthly_cents > 0
                        ? new Intl.NumberFormat('pt-BR').format(data.payroll_monthly_cents / 100)
                        : ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '');
                        update('payroll_monthly_cents', (parseInt(v) || 0) * 100);
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Movimentação bancária estimada (anual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    className="pl-10"
                    value={data.estimated_bank_movement_cents > 0
                      ? new Intl.NumberFormat('pt-BR').format(data.estimated_bank_movement_cents / 100)
                      : ''}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      update('estimated_bank_movement_cents', (parseInt(v) || 0) * 100);
                    }}
                    placeholder="Opcional"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usado para detectar divergências com o faturamento.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                <h2 className="font-semibold">Checklist de documentos</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Marque o que você já tem em mãos. O upload completo será solicitado após a contratação.
              </p>

              {[
                { key: 'nf', label: 'Notas fiscais emitidas no ano-base' },
                { key: 'extratos', label: 'Extratos bancários PJ' },
                { key: 'das', label: 'Comprovantes de DAS pagos (se aplicável)' },
              ].map((d) => (
                <label
                  key={d.key}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                >
                  <Switch
                    checked={data.documents[d.key as keyof typeof data.documents]}
                    onCheckedChange={(v) =>
                      update('documents', { ...data.documents, [d.key]: v })
                    }
                  />
                  <span className="text-sm flex-1">{d.label}</span>
                  {data.documents[d.key as keyof typeof data.documents]
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    : <span className="text-xs text-muted-foreground">Pendente</span>}
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="font-semibold">Validação em duas camadas</h2>
              </div>

              <Card className="p-4 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Camada 1 — Validação por IA</p>
                    <p className="text-xs text-muted-foreground">
                      Cruzamento de faturamento, CNAE e regime atual. Pronta para executar.
                    </p>
                  </div>
                  <Badge className="bg-emerald-600">Ativa</Badge>
                </div>
              </Card>

              <Card className="p-4 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Camada 2 — Certificado Digital (e-CNPJ)</p>
                    <p className="text-xs text-muted-foreground">
                      Integração com e-CAC para pré-preenchimento e cruzamento oficial.
                    </p>
                  </div>
                  <Badge variant="outline">Em breve</Badge>
                </div>
              </Card>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Validação incompleta sem Certificado Digital. Recomendação será baseada
                  apenas nos dados informados.
                </AlertDescription>
              </Alert>

              <div className="rounded-lg bg-muted/40 p-4 space-y-1 text-sm">
                <p><strong>Regime atual:</strong> {REGIME_LABELS[data.current_company_type as Regime]}</p>
                <p><strong>Ano-base:</strong> {data.base_year}</p>
                <p><strong>Faturamento:</strong> {fmtBRL(data.annual_revenue_cents)}</p>
                <p><strong>CNAE:</strong> {data.cnae_code} {data.cnae_description && `— ${data.cnae_description}`}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : setStep(0)}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>

            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Continuar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando...</>
                ) : (
                  <>Gerar recomendação <Sparkles className="h-4 w-4 ml-2" /></>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IRPJ;
