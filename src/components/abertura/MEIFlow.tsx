import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  User,
  FileText,
  Building2,
  Receipt,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MEIFlowProps {
  onBack: () => void;
}

interface MEIData {
  fullName: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  activity: string;
  city: string;
  state: string;
  cnpj: string;
  companyName: string;
}

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const ACTIVITIES = [
  { value: 'comercio', label: 'Comércio varejista' },
  { value: 'servicos', label: 'Prestação de serviços' },
  { value: 'artesanato', label: 'Artesanato' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'beleza', label: 'Beleza e estética' },
  { value: 'manutencao', label: 'Manutenção e reparos' },
  { value: 'transporte', label: 'Transporte de passageiros' },
  { value: 'tecnologia', label: 'Tecnologia e informática' },
  { value: 'educacao', label: 'Educação e treinamento' },
  { value: 'outros', label: 'Outras atividades permitidas' },
];

const MEIFlow: React.FC<MEIFlowProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meiData, setMeiData] = useState<MEIData>({
    fullName: '',
    cpf: '',
    birthDate: '',
    phone: '',
    email: user?.email || '',
    activity: '',
    city: '',
    state: '',
    cnpj: '',
    companyName: '',
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const updateData = (field: keyof MEIData, value: string) => {
    setMeiData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return meiData.fullName && meiData.cpf.length === 14 && meiData.birthDate;
      case 2:
        return meiData.phone.length >= 14 && meiData.email;
      case 3:
        return meiData.activity && meiData.city && meiData.state;
      case 4:
        return true; // Information step
      case 5:
        return meiData.cnpj && meiData.companyName;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleSubmitCadastro = async () => {
    setIsSubmitting(true);
    try {
      // Save MEI data to database
      const { error } = await supabase.from('autonomo_profiles').upsert({
        user_id: user?.id,
        cpf: meiData.cpf,
        profession: 'MEI - ' + meiData.activity,
        profession_category: meiData.activity,
        current_regime: 'mei',
        city: meiData.city,
        state: meiData.state,
        phone: meiData.phone,
      });

      if (error) throw error;

      toast.success('Cadastro MEI salvo com sucesso!');
      setStep(5);
    } catch (error) {
      console.error('Error saving MEI data:', error);
      toast.error('Erro ao salvar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    try {
      // Update with CNPJ
      const { error } = await supabase.from('autonomo_profiles').update({
        crc_number: meiData.cnpj, // Using crc_number field to store CNPJ
      }).eq('user_id', user?.id);

      if (error) throw error;

      toast.success('MEI cadastrado com sucesso! Você já pode emitir notas fiscais.');
    } catch (error) {
      console.error('Error finalizing MEI:', error);
      toast.error('Erro ao finalizar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white/60 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Abrir MEI</h1>
            <p className="text-sm text-white/60">Passo {step} de {totalSteps}</p>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            100% Digital
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-slate-800" />
          <div className="flex justify-between mt-2">
            {['Dados', 'Contato', 'Atividade', 'Orientação', 'Cadastro'].map((label, i) => (
              <span 
                key={label}
                className={`text-xs ${i + 1 <= step ? 'text-emerald-400' : 'text-white/40'}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          {step === 1 && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Dados Pessoais</CardTitle>
                <CardDescription className="text-white/60">
                  Informe seus dados básicos para iniciar o processo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/80">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={meiData.fullName}
                    onChange={(e) => updateData('fullName', e.target.value)}
                    placeholder="Seu nome completo"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-white/80">CPF</Label>
                  <Input
                    id="cpf"
                    value={meiData.cpf}
                    onChange={(e) => updateData('cpf', formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-white/80">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={meiData.birthDate}
                    onChange={(e) => updateData('birthDate', e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Contato</CardTitle>
                <CardDescription className="text-white/60">
                  Seus dados de contato para comunicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80">Telefone/WhatsApp</Label>
                  <Input
                    id="phone"
                    value={meiData.phone}
                    onChange={(e) => updateData('phone', formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={meiData.email}
                    onChange={(e) => updateData('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Atividade e Localização</CardTitle>
                <CardDescription className="text-white/60">
                  Defina sua atividade principal e onde irá atuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activity" className="text-white/80">Atividade Principal</Label>
                  <Select value={meiData.activity} onValueChange={(v) => updateData('activity', v)}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione sua atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITIES.map(act => (
                        <SelectItem key={act.value} value={act.value}>
                          {act.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white/80">Cidade</Label>
                    <Input
                      id="city"
                      value={meiData.city}
                      onChange={(e) => updateData('city', e.target.value)}
                      placeholder="Sua cidade"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-white/80">Estado</Label>
                    <Select value={meiData.state} onValueChange={(v) => updateData('state', v)}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Orientação para Abertura</CardTitle>
                <CardDescription className="text-white/60">
                  Siga estes passos para abrir seu MEI no portal oficial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-400">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Acesse o Portal do Empreendedor</p>
                      <p className="text-sm text-white/60">Use sua conta gov.br para fazer login</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-400">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Clique em "Formalize-se"</p>
                      <p className="text-sm text-white/60">Siga as instruções na tela</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-400">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Preencha os dados solicitados</p>
                      <p className="text-sm text-white/60">Use os dados que você informou aqui</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-400">4</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Conclua e anote o CNPJ</p>
                      <p className="text-sm text-white/60">Você receberá seu CNPJ imediatamente</p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Portal do Empreendedor
                </a>

                <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white/80">
                      <strong className="text-amber-400">Dica:</strong> Após concluir a abertura no gov.br, 
                      volte aqui e informe seu CNPJ para liberar a emissão de notas fiscais.
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Cadastro do MEI</CardTitle>
                <CardDescription className="text-white/60">
                  Informe os dados do seu MEI para liberar a emissão de notas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-white/80">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={meiData.cnpj}
                    onChange={(e) => updateData('cnpj', e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-white/80">Razão Social</Label>
                  <Input
                    id="companyName"
                    value={meiData.companyName}
                    onChange={(e) => updateData('companyName', e.target.value)}
                    placeholder="Nome conforme CNPJ"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Emissão de NFS-e integrada</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Histórico de notas emitidas</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Alertas de limite MEI</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Footer Actions */}
          <div className="p-6 pt-0">
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                >
                  Voltar
                </Button>
              )}
              {step < 4 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {step === 4 && (
                <Button
                  onClick={handleSubmitCadastro}
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  {isSubmitting ? 'Salvando...' : 'Já abri meu MEI'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {step === 5 && (
                <Button
                  onClick={handleFinalize}
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  {isSubmitting ? 'Finalizando...' : 'Concluir Cadastro'}
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MEIFlow;
