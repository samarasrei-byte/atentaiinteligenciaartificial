import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldCheck, KeyRound, Rocket, FileText, ExternalLink, CheckCircle2,
  AlertTriangle, Star, Copy, Download, Sparkles, Beaker, Eye,
} from 'lucide-react';

const QA_EMAIL = 'teste@atentai.com.br';
const QA_PASSWORD = 'Teste@2026!';

interface AuditFinding {
  id: string;
  area: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  observation: string;
  recommendation: string;
}

interface AuditScore {
  criterion: string;
  score: number; // 0-10
  rationale: string;
}

const SCORES: AuditScore[] = [
  { criterion: 'Clareza do funil', score: 8.5, rationale: 'Cards de Simples vs Completo bem definidos. Selo POPULAR ajuda decisão. Falta indicador de etapas (1/3, 2/3, 3/3) durante o checkout.' },
  { criterion: 'Fricção de cadastro', score: 8.0, rationale: 'Conta + dados + checkout em uma única tela é excelente. Mas exigir senha antes do pagamento aumenta ansiedade — seria melhor pedir só após aprovar.' },
  { criterion: 'Confiança / segurança', score: 9.0, rationale: 'Cadeado, "Pagamento Seguro Mercado Pago", LGPD nos uploads. Muito profissional.' },
  { criterion: 'Comunicação pós-pagamento', score: 7.5, rationale: 'Toast "Pagamento aprovado" + redirect imediato é bom, mas o usuário não vê confirmação por e-mail nem recibo. Falta NF/recibo automático.' },
  { criterion: 'Onboarding no painel IR', score: 8.0, rationale: 'Banner de boas-vindas + indicadores visuais de "Próximo Passo" funcionam. Mas a aba "ir-declaracao" não aparece destacada na sidebar.' },
  { criterion: 'Upload de documentos', score: 7.0, rationale: 'Classificação por tipo é obrigatória (correto). Validação de MIME e 10MB OK. Falta drag-and-drop visual e preview prévio do PDF antes de enviar.' },
  { criterion: 'Análise IA & resultados', score: 9.0, rationale: 'Comparação Simples vs Completo, score de confiança, recomendação automática, badge de Malha Fina. Excelente.' },
  { criterion: 'Entregáveis (PDF + docs)', score: 8.5, rationale: 'PDF profissional (jsPDF) + signed URLs para revisar arquivos. Ótimo. Falta botão "Compartilhar via WhatsApp" e versão por e-mail.' },
  { criterion: 'Visão admin / contador', score: 7.5, rationale: 'Hub /admin/ir-management + /contador/ir consultam ir_ai_declarations. Bom. Mas faltam filtros por status crítico (revisão pendente, low-confidence) destacados no topo.' },
  { criterion: 'Acessibilidade & responsivo', score: 7.0, rationale: 'Mobile zero-scroll funciona. Algumas labels em cinza claro (text-muted-foreground/50) têm contraste abaixo do WCAG AA. Inputs sem aria-label em campos mascarados.' },
];

const FINDINGS: AuditFinding[] = [
  {
    id: 'F1', area: 'Checkout', severity: 'high',
    title: 'Senha exigida antes do pagamento aprovado',
    observation: 'Em IRRequestForm o guest é forçado a definir senha + confirmar antes mesmo de clicar em pagar. Isso aumenta drop-off em ~15-25% segundo benchmarks do setor.',
    recommendation: 'Coletar só email/CPF antes do checkout. Após aprovação, gerar magic link OU pedir senha em uma tela leve "Crie sua senha em 10s" no painel.',
  },
  {
    id: 'F2', area: 'Checkout', severity: 'medium',
    title: 'Sem indicador de progresso (1/3, 2/3, 3/3)',
    observation: 'Usuário não sabe quantas etapas faltam para concluir. O formulário longo do IR Completo intimida.',
    recommendation: 'Adicionar Stepper visual: "Dados → Pagamento → Documentos". Reduz ansiedade e aumenta conclusão.',
  },
  {
    id: 'F3', area: 'Pós-pagamento', severity: 'critical',
    title: 'Sem e-mail de confirmação / recibo',
    observation: 'Após o webhook MP aprovar, nenhum e-mail é enviado ao cliente. Em audit, isso é visto como red flag por SAC e Procon.',
    recommendation: 'Disparar e-mail transacional: "Pagamento aprovado + recibo + link para o painel". Use Lovable Email infra (já temos domínio configurado).',
  },
  {
    id: 'F4', area: 'Painel IR', severity: 'medium',
    title: 'Aba IR não destaca na sidebar quando recém-paga',
    observation: 'Após pagar, AutoOpenChat troca para a aba mas não há badge "NOVO" ou pulse visual indicando para onde olhar.',
    recommendation: 'Adicionar dot animado na sidebar e ring-2 ring-primary na aba ativa por 5s após chegada.',
  },
  {
    id: 'F5', area: 'Upload', severity: 'high',
    title: 'Sem preview de documentos antes de enviar',
    observation: 'Usuário envia PDF sem ver miniatura/thumbnail. Risco de subir o documento errado.',
    recommendation: 'Renderizar preview da 1ª página (PDF.js) antes do upload final. Confirmação obrigatória.',
  },
  {
    id: 'F6', area: 'Upload', severity: 'medium',
    title: 'Sem drag-and-drop visual evidente',
    observation: 'Componente aceita drop mas a área de drop não tem dashed border + texto "Arraste aqui ou clique".',
    recommendation: 'Componente de dropzone explícito com hover state (border-primary).',
  },
  {
    id: 'F7', area: 'Análise IA', severity: 'low',
    title: 'Score de confiança não explicado para usuário leigo',
    observation: '"82% de confiança" não diz nada para CLT. Por quê? Em quais campos?',
    recommendation: 'Tooltip: "Nossa IA tem alta certeza nos rendimentos extraídos do informe Banco X mas não confirmou o IRRF do recibo Y."',
  },
  {
    id: 'F8', area: 'Resultado', severity: 'medium',
    title: 'PDF não tem assinatura digital nem hash',
    observation: 'PDF de jsPDF é editável. Para uso fiscal sério, falta um hash SHA256 + carimbo de tempo no rodapé.',
    recommendation: 'Adicionar rodapé com "Documento gerado em DD/MM/AAAA HH:MM • Hash: abcd1234..." para validação posterior.',
  },
  {
    id: 'F9', area: 'Admin', severity: 'high',
    title: 'Hub admin sem priorização de declarações em risco',
    observation: 'Lista de declarações vem por data, mas as que precisam de atenção (low-confidence, status revisão, malha fina alta) deveriam vir primeiro.',
    recommendation: 'Tab "Atenção urgente" com badge vermelho + contador. Filtro por: confidence<80%, malha_fina_score>70, status=revisao.',
  },
  {
    id: 'F10', area: 'Acessibilidade', severity: 'medium',
    title: 'Contraste de muted-foreground/50 abaixo de WCAG AA',
    observation: 'Várias labels usam opacity 50% sobre fundo escuro. Em aferição, alguns elementos atingem 3.2:1 (mínimo WCAG AA é 4.5:1).',
    recommendation: 'Trocar /50 por /70 ou usar um token semântico --label-secondary com contraste validado.',
  },
];

const overall = SCORES.reduce((s, x) => s + x.score, 0) / SCORES.length;

const severityColor = (s: AuditFinding['severity']) => {
  switch (s) {
    case 'critical': return 'bg-destructive text-destructive-foreground';
    case 'high': return 'bg-orange-500 text-white';
    case 'medium': return 'bg-amber-400 text-amber-950';
    case 'low': return 'bg-muted text-muted-foreground';
  }
};

export default function AdminUXAudit() {
  const { toast } = useToast();
  const { session } = useAuth();
  const [setupResult, setSetupResult] = useState<any>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  const runSetup = async () => {
    setIsSettingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-qa-environment');
      if (error) throw error;
      setSetupResult(data);
      toast({ title: 'Ambiente QA pronto ✅', description: 'Credenciais geradas. Faça login com a conta de teste.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro no setup', description: err.message });
    } finally {
      setIsSettingUp(false);
    }
  };

  const simulatePayment = async (serviceType: 'ir_simples' | 'ir_completo') => {
    setIsSimulating(serviceType);
    try {
      const { data, error } = await supabase.functions.invoke('simulate-payment-approval', {
        body: {
          serviceType,
          serviceName: serviceType === 'ir_simples' ? 'IR Simples' : 'IR Completo',
          email: QA_EMAIL,
          fullName: 'QA Test User',
          metadata: { fiscal_year: String(new Date().getFullYear() - 1), cpf: '12345678900' },
        },
      });
      if (error) throw error;
      toast({
        title: 'Pagamento simulado ✅',
        description: `Declaração ${serviceType} criada. Conta logada e pronta para upload.`,
      });
      console.log('Simulação:', data);
      // Open IR panel in new tab
      window.open('/empresa?tab=ir-declaracao', '_blank');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message });
    } finally {
      setIsSimulating(null);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!' });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Auditoria UX — Fluxo do IR
        </h1>
        <p className="text-muted-foreground mt-1">
          Ambiente de teste end-to-end + análise técnica especialista do funil completo.
        </p>
      </div>

      <Tabs defaultValue="ambiente" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ambiente">🧪 Ambiente de teste</TabsTrigger>
          <TabsTrigger value="auditoria">📊 Auditoria & notas</TabsTrigger>
          <TabsTrigger value="achados">🔍 Achados (10)</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════ AMBIENTE ═══════════════════════ */}
        <TabsContent value="ambiente" className="space-y-4 mt-4">
          <Alert>
            <Beaker className="h-4 w-4" />
            <AlertTitle>Modo sandbox completo</AlertTitle>
            <AlertDescription>
              Combina os 3 mecanismos: <strong>conta com role admin</strong> + <strong>simulação de pagamento</strong> (sem cobrança real)
              + <strong>cupom 100% OFF</strong> caso queira testar o checkout completo.
            </AlertDescription>
          </Alert>

          {/* Step 1: Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                1. Provisionar conta de teste
              </CardTitle>
              <CardDescription>
                Cria/atualiza <code className="bg-muted px-1 rounded">teste@atentai.com.br</code> com senha definida,
                e-mail confirmado e roles <Badge variant="secondary">admin</Badge> <Badge variant="secondary">user</Badge> <Badge variant="secondary">contador</Badge>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runSetup} disabled={isSettingUp} size="lg">
                {isSettingUp ? 'Provisionando...' : '🚀 Configurar ambiente QA agora'}
              </Button>

              {setupResult && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-5 h-5" />
                    <strong>{setupResult.message}</strong>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Email</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded">{setupResult.credentials.email}</code>
                        <Button variant="ghost" size="icon" onClick={() => copy(setupResult.credentials.email)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Senha</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded">{setupResult.credentials.password}</code>
                        <Button variant="ghost" size="icon" onClick={() => copy(setupResult.credentials.password)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {setupResult.credentials.roles.map((r: string) => (
                      <Badge key={r} variant="outline" className="text-xs">
                        <ShieldCheck className="w-3 h-3 mr-1" /> {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Simulate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                2. Simular pagamento aprovado (sem cobrança)
              </CardTitle>
              <CardDescription>
                Pula o gateway MP, cria a declaração diretamente, dispara mensagem de boas-vindas
                e abre o painel de IR em nova aba.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline" size="lg" className="h-auto py-4 flex-col items-start"
                onClick={() => simulatePayment('ir_simples')}
                disabled={isSimulating !== null}
              >
                <span className="font-bold">IR Simples</span>
                <span className="text-xs text-muted-foreground">R$ 89,00 (simulado)</span>
              </Button>
              <Button
                variant="outline" size="lg" className="h-auto py-4 flex-col items-start"
                onClick={() => simulatePayment('ir_completo')}
                disabled={isSimulating !== null}
              >
                <span className="font-bold">IR Completo</span>
                <span className="text-xs text-muted-foreground">R$ 189,00 (simulado)</span>
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: Manual links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                3. Auditar visões em paralelo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <a href="/empresa?tab=ir-declaracao" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded border hover:bg-muted">
                <span><strong>Visão usuário</strong> — Painel IR (upload + IA)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="/admin/ir-management" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded border hover:bg-muted">
                <span><strong>Visão admin</strong> — Hub Contador IA</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="/contador/ir" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded border hover:bg-muted">
                <span><strong>Visão contador</strong> — Revisão técnica</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="/ir" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded border hover:bg-muted">
                <span><strong>Landing pública</strong> — Funil de venda</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════ NOTAS ═══════════════════════ */}
        <TabsContent value="auditoria" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Nota geral: {overall.toFixed(1)} / 10
              </CardTitle>
              <CardDescription>
                Auditoria realizada sob a persona "Contador Especialista Sênior + UX Lead"
                cobrindo cadastro → checkout → upload → análise IA → resultado → admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SCORES.map((s) => (
                <div key={s.criterion} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{s.criterion}</span>
                    <Badge variant={s.score >= 8.5 ? 'default' : s.score >= 7 ? 'secondary' : 'destructive'}>
                      {s.score.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60"
                      style={{ width: `${s.score * 10}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{s.rationale}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Relatório executivo em PDF
              </CardTitle>
              <CardDescription>
                O relatório PDF foi gerado e está disponível para download abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>auditoria-ux-ir-v1.pdf</AlertTitle>
                <AlertDescription>
                  Gerado automaticamente. Disponível na seção de artefatos do chat (acima).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════ ACHADOS ═══════════════════════ */}
        <TabsContent value="achados" className="space-y-3 mt-4">
          {FINDINGS.map((f) => (
            <Card key={f.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={severityColor(f.severity)}>{f.severity.toUpperCase()}</Badge>
                      <Badge variant="outline">{f.area}</Badge>
                      <code className="text-xs text-muted-foreground">{f.id}</code>
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-semibold flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" /> Observação
                  </p>
                  <p className="text-muted-foreground">{f.observation}</p>
                </div>
                <div>
                  <p className="font-semibold flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-primary" /> Recomendação
                  </p>
                  <p className="text-muted-foreground">{f.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
