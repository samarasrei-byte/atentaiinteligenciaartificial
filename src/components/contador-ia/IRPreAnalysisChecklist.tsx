import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users, Home, Landmark, DollarSign, Briefcase, TrendingUp,
  Bitcoin, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck,
  Plus, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ChecklistAnswers = {
  has_dependents: boolean;
  dependents_count: number;
  dependents_info: { name: string; cpf: string; relation: string }[];
  has_assets: boolean;
  assets_info: { type: string; description: string; value_cents: number }[];
  has_private_pension: boolean;
  pension_type: string;
  pension_annual_cents: number;
  has_exempt_income: boolean;
  exempt_income_types: string[];
  had_carne_leao: boolean;
  multiple_income_sources: boolean;
  sold_assets: boolean;
  has_crypto: boolean;
};

const defaultAnswers: ChecklistAnswers = {
  has_dependents: false,
  dependents_count: 0,
  dependents_info: [],
  has_assets: false,
  assets_info: [],
  has_private_pension: false,
  pension_type: '',
  pension_annual_cents: 0,
  has_exempt_income: false,
  exempt_income_types: [],
  had_carne_leao: false,
  multiple_income_sources: false,
  sold_assets: false,
  has_crypto: false,
};

const exemptIncomeOptions = [
  { id: 'fgts', label: 'FGTS' },
  { id: 'seguro_desemprego', label: 'Seguro-desemprego' },
  { id: 'poupanca', label: 'Rendimentos de poupança' },
  { id: 'lucros_dividendos', label: 'Lucros e dividendos' },
  { id: 'indenizacao', label: 'Indenização trabalhista' },
  { id: 'heranca', label: 'Herança / Doação' },
];

const assetTypes = [
  { id: 'imovel', label: 'Imóvel' },
  { id: 'veiculo', label: 'Veículo' },
  { id: 'investimento', label: 'Investimentos (ações, FIIs, renda fixa)' },
  { id: 'conta_bancaria', label: 'Conta bancária > R$ 140' },
  { id: 'participacao', label: 'Participação societária' },
  { id: 'outro', label: 'Outro bem' },
];

const relationOptions = [
  'Filho(a)', 'Cônjuge / Companheiro(a)', 'Pai / Mãe', 'Enteado(a)', 'Outro'
];

type Props = {
  onComplete: (answers: ChecklistAnswers) => void;
  onSkip: () => void;
  isLoading?: boolean;
  fiscalYear?: number;
};

type QuestionStep = {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  alertText?: string;
};

const getQuestions = (year: number): QuestionStep[] => [
  { id: 'dependents', icon: Users, title: 'Dependentes', description: 'Você tem dependentes (filhos, cônjuge, pais)?' },
  { id: 'assets', icon: Home, title: 'Bens e Direitos', description: 'Possui imóveis, veículos, investimentos ou contas bancárias > R$ 140?', alertText: 'A Receita cruza dados com cartórios, DETRAN e B3' },
  { id: 'pension', icon: Landmark, title: 'Previdência Privada', description: `Contribuiu para PGBL ou VGBL em ${year}?`, alertText: 'PGBL pode deduzir até 12% da renda tributável' },
  { id: 'exempt', icon: DollarSign, title: 'Rendimentos Isentos', description: 'Recebeu FGTS, seguro-desemprego, poupança, dividendos ou herança?' },
  { id: 'carne_leao', icon: Briefcase, title: 'Carnê-Leão', description: 'Recebeu pagamentos de pessoas físicas (aluguel, freelance, etc.)?', alertText: 'Autônomos com renda de PF precisam do carnê-leão' },
  { id: 'sold_assets', icon: TrendingUp, title: 'Venda de Bens', description: `Vendeu imóvel, veículo ou ações em ${year}?`, alertText: 'Ganho de capital pode ter imposto específico' },
  { id: 'crypto', icon: Bitcoin, title: 'Criptomoedas', description: 'Possui ou negociou criptomoedas (Bitcoin, ETH, etc.)?', alertText: 'Obrigatório declarar acima de R$ 5.000' },
  { id: 'multiple_income', icon: Briefcase, title: 'Múltiplas Fontes de Renda', description: `Teve mais de uma fonte pagadora em ${year} (CLT + freelance, dois empregos, etc.)?`, alertText: 'Múltiplas fontes podem gerar imposto complementar' },
];

// Track which questions have been answered (null = not yet answered)
type AnswerState = Record<string, boolean | null>;

const IRPreAnalysisChecklist: React.FC<Props> = ({ onComplete, onSkip, isLoading, fiscalYear }) => {
  const year = fiscalYear || new Date().getFullYear() - 1;
  const questions = getQuestions(year);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<ChecklistAnswers>(defaultAnswers);
  const [answered, setAnswered] = useState<AnswerState>(() => {
    const init: AnswerState = {};
    getQuestions(year).forEach(q => { init[q.id] = null; });
    return init;
  });

  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const getBoolField = (): keyof ChecklistAnswers => {
    const map: Record<string, keyof ChecklistAnswers> = {
      dependents: 'has_dependents',
      assets: 'has_assets',
      pension: 'has_private_pension',
      exempt: 'has_exempt_income',
      carne_leao: 'had_carne_leao',
      sold_assets: 'sold_assets',
      crypto: 'has_crypto',
      multiple_income: 'multiple_income_sources',
    };
    return map[question.id];
  };

  // Sanitize answers before submission — prevent "has_X = true" with empty data
  const sanitizeAnswers = (raw: ChecklistAnswers): ChecklistAnswers => {
    const sanitized = { ...raw };
    if (sanitized.has_dependents && sanitized.dependents_info.length === 0) {
      sanitized.has_dependents = false;
      sanitized.dependents_count = 0;
    }
    sanitized.dependents_count = sanitized.dependents_info.length;
    if (sanitized.has_assets && sanitized.assets_info.length === 0) {
      sanitized.has_assets = false;
    }
    if (sanitized.has_exempt_income && sanitized.exempt_income_types.length === 0) {
      sanitized.has_exempt_income = false;
    }
    if (sanitized.has_private_pension && !sanitized.pension_type && sanitized.pension_annual_cents === 0) {
      sanitized.has_private_pension = false;
    }
    return sanitized;
  };

  const handleYesNo = (field: keyof ChecklistAnswers, value: boolean) => {
    const updatedAnswers = { ...answers, [field]: value };
    setAnswers(updatedAnswers);
    setAnswered(prev => ({ ...prev, [question.id]: value }));
    if (!value) {
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          onComplete(sanitizeAnswers(updatedAnswers));
        }
      }, 300);
    }
  };

  const advance = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(sanitizeAnswers(answers));
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const addDependent = () => {
    setAnswers(prev => ({
      ...prev,
      dependents_count: prev.dependents_count + 1,
      dependents_info: [...prev.dependents_info, { name: '', cpf: '', relation: 'Filho(a)' }],
    }));
  };

  const removeDependent = (idx: number) => {
    setAnswers(prev => ({
      ...prev,
      dependents_count: Math.max(0, prev.dependents_count - 1),
      dependents_info: prev.dependents_info.filter((_, i) => i !== idx),
    }));
  };

  const updateDependent = (idx: number, field: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      dependents_info: prev.dependents_info.map((d, i) => i === idx ? { ...d, [field]: value } : d),
    }));
  };

  const toggleExemptIncome = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      exempt_income_types: prev.exempt_income_types.includes(id)
        ? prev.exempt_income_types.filter(t => t !== id)
        : [...prev.exempt_income_types, id],
    }));
  };

  const addAsset = (type: string) => {
    setAnswers(prev => ({
      ...prev,
      assets_info: [...prev.assets_info, { type, description: '', value_cents: 0 }],
    }));
  };

  const removeAsset = (idx: number) => {
    setAnswers(prev => ({
      ...prev,
      assets_info: prev.assets_info.filter((_, i) => i !== idx),
    }));
  };

  const updateAsset = (idx: number, field: string, value: string | number) => {
    setAnswers(prev => ({
      ...prev,
      assets_info: prev.assets_info.map((a, i) => i === idx ? { ...a, [field]: value } : a),
    }));
  };

  // Current answer for this question (null = not answered yet)
  const currentAnswered = answered[question.id];

  const renderDetails = () => {
    switch (question.id) {
      case 'dependents':
        if (!answers.has_dependents) return null;
        return (
          <div className="mt-4 space-y-3">
            {answers.dependents_info.map((dep, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Dependente {idx + 1}</span>
                  <Button size="sm" variant="ghost" onClick={() => removeDependent(idx)} className="h-6 w-6 p-0 text-red-400">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <Input placeholder="Nome completo" value={dep.name} onChange={e => updateDependent(idx, 'name', e.target.value)} className="h-8 text-sm bg-background" />
                <Input placeholder="CPF" value={dep.cpf} onChange={e => updateDependent(idx, 'cpf', e.target.value)} className="h-8 text-sm bg-background" />
                <div className="flex flex-wrap gap-1.5">
                  {relationOptions.map(rel => (
                    <Button key={rel} size="sm" variant={dep.relation === rel ? 'default' : 'outline'}
                      onClick={() => updateDependent(idx, 'relation', rel)}
                      className={`rounded-full text-xs h-7 ${dep.relation === rel ? 'bg-purple-500 hover:bg-purple-600' : 'border-border'}`}>
                      {rel}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={addDependent} className="rounded-full text-xs border-dashed">
              <Plus className="w-3 h-3 mr-1" /> Adicionar dependente
            </Button>
          </div>
        );

      case 'assets':
        if (!answers.has_assets) return null;
        return (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {assetTypes.map(at => (
                <Button key={at.id} size="sm" variant="outline"
                  onClick={() => addAsset(at.id)}
                  className="rounded-full text-xs border-border">
                  <Plus className="w-3 h-3 mr-1" /> {at.label}
                </Button>
              ))}
            </div>
            {answers.assets_info.map((asset, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {assetTypes.find(a => a.id === asset.type)?.label || asset.type}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => removeAsset(idx)} className="h-6 w-6 p-0 text-red-400">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <Input placeholder="Descrição (ex: Apartamento 2Q, Bairro X)" value={asset.description} onChange={e => updateAsset(idx, 'description', e.target.value)} className="h-8 text-sm bg-background" />
                <div>
                  <Label className="text-xs text-muted-foreground">Valor estimado (R$)</Label>
                  <Input type="number" placeholder="0,00" className="h-8 text-sm bg-background mt-1"
                    onChange={e => updateAsset(idx, 'value_cents', Math.round(parseFloat(e.target.value || '0') * 100))} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'pension':
        if (!answers.has_private_pension) return null;
        return (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              {['PGBL', 'VGBL', 'Ambos'].map(type => (
                <Button key={type} size="sm" variant={answers.pension_type === type ? 'default' : 'outline'}
                  onClick={() => setAnswers(prev => ({ ...prev, pension_type: type }))}
                  className={`rounded-full text-xs ${answers.pension_type === type ? 'bg-purple-500 hover:bg-purple-600' : 'border-border'}`}>
                  {type}
                </Button>
              ))}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Valor contribuído em 2024 (R$)</Label>
              <Input type="number" placeholder="0,00" className="h-8 text-sm bg-background mt-1"
                onChange={e => setAnswers(prev => ({ ...prev, pension_annual_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))} />
            </div>
          </div>
        );

      case 'exempt':
        if (!answers.has_exempt_income) return null;
        return (
          <div className="mt-4 flex flex-wrap gap-2">
            {exemptIncomeOptions.map(opt => (
              <Button key={opt.id} size="sm"
                variant={answers.exempt_income_types.includes(opt.id) ? 'default' : 'outline'}
                onClick={() => toggleExemptIncome(opt.id)}
                className={`rounded-full text-xs ${answers.exempt_income_types.includes(opt.id) ? 'bg-purple-500 hover:bg-purple-600' : 'border-border'}`}>
                {opt.label}
              </Button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="h-1 bg-muted">
        <motion.div className="h-full bg-purple-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Checklist fiscal — {currentStep + 1}/{questions.length}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground">
            Pular checklist
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={question.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <question.icon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-base">{question.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{question.description}</p>
              </div>
            </div>

            {question.alertText && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80">{question.alertText}</p>
              </div>
            )}

            {/* Yes / No buttons — null = not answered yet */}
            <div className="flex gap-3 mb-2">
              <Button
                onClick={() => handleYesNo(getBoolField(), true)}
                className={`flex-1 rounded-full h-10 ${currentAnswered === true ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Sim
              </Button>
              <Button
                onClick={() => handleYesNo(getBoolField(), false)}
                className={`flex-1 rounded-full h-10 ${currentAnswered === false ? 'bg-muted/80 text-foreground border border-border' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Não
              </Button>
            </div>

            {renderDetails()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={goBack} disabled={currentStep === 0} className="text-xs text-muted-foreground">
            ← Voltar
          </Button>
          <Button onClick={advance} disabled={isLoading || answered[question.id] === null}
            className="bg-purple-500 hover:bg-purple-600 rounded-full h-9 px-6 text-sm disabled:opacity-40">
            {currentStep === questions.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Concluir e analisar
              </>
            ) : (
              <>
                Próximo <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IRPreAnalysisChecklist;
