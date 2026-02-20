import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  User, 
  Building2, 
  FileText, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Shield,
  Clock,
  Zap,
  Star,
  Loader2,
  FileCheck,
  AlertCircle,
  X,
  Check,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
  Calculator,
  BarChart3,
  Target,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  Heart,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Types
interface OnboardingData {
  // Personal/Company Info
  fullName: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  password: string; // SaaS: Account creation
  
  // Business Info
  businessType: 'pf' | 'pj' | '';
  companyName: string;
  taxRegime: string;
  sector: string;
  monthlyRevenue: number;
  employeeCount: number;
  
  // Location
  state: string;
  city: string;
  
  // Service Details
  mainConcern: string;
  currentAccountant: string;
  urgency: 'low' | 'medium' | 'high' | '';
  additionalInfo: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  category: string;
}

// Constants
const DOCUMENT_CATEGORIES = [
  { value: 'contrato_social', label: 'Contrato Social', description: 'Documento constitutivo da empresa', icon: FileText, required: true },
  { value: 'balanco', label: 'Balanço Patrimonial', description: 'Último balanço disponível', icon: BarChart3, required: false },
  { value: 'dre', label: 'DRE', description: 'Demonstração do Resultado', icon: Calculator, required: false },
  { value: 'guias_impostos', label: 'Guias de Impostos', description: 'DARFs, GPS, DCTF', icon: DollarSign, required: false },
  { value: 'notas_fiscais', label: 'Notas Fiscais', description: 'NF-e entrada/saída', icon: FileCheck, required: false },
  { value: 'extratos', label: 'Extratos Bancários', description: 'Últimos 3 meses', icon: Briefcase, required: false },
  { value: 'outros', label: 'Outros Documentos', description: 'Documentos adicionais', icon: FileText, required: false },
];

const TAX_REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional', description: 'Regime simplificado' },
  { value: 'lucro_presumido', label: 'Lucro Presumido', description: 'Base de cálculo presumida' },
  { value: 'lucro_real', label: 'Lucro Real', description: 'Tributos sobre lucro efetivo' },
  { value: 'mei', label: 'MEI', description: 'Microempreendedor Individual' },
  { value: 'autonomo', label: 'Autônomo PF', description: 'Pessoa Física' },
];

const SECTORS = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'construcao', label: 'Construção' },
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'outro', label: 'Outro' },
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Baixa', description: 'Próximos 30 dias', color: 'text-emerald-500' },
  { value: 'medium', label: 'Média', description: '1-2 semanas', color: 'text-amber-500' },
  { value: 'high', label: 'Alta', description: 'Urgente', color: 'text-red-500' },
];

const STEPS = [
  { id: 1, title: 'Identificação', icon: User, description: 'Seus dados' },
  { id: 2, title: 'Empresa', icon: Building2, description: 'Dados do negócio' },
  { id: 3, title: 'Documentos', icon: FileText, description: 'Envie arquivos' },
  { id: 4, title: 'Detalhes', icon: Target, description: 'Necessidades' },
  { id: 5, title: 'Criar Conta', icon: Lock, description: 'Acesso ao painel' },
  { id: 6, title: 'Confirmação', icon: CheckCircle2, description: 'Tudo pronto!' },
];

const BIContabilidadeOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedDocCategory, setSelectedDocCategory] = useState('');
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    cpfCnpj: '',
    password: '',
    businessType: '',
    companyName: '',
    taxRegime: '',
    sector: '',
    monthlyRevenue: 0,
    employeeCount: 0,
    state: '',
    city: '',
    mainConcern: '',
    currentAccountant: '',
    urgency: '',
    additionalInfo: '',
  });

  const updateFormData = (field: keyof OnboardingData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPFCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocCategory) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido.');
      return;
    }

    const newDoc: UploadedDocument = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file,
      category: selectedDocCategory,
    };

    setDocuments(prev => [...prev, newDoc]);
    setSelectedDocCategory('');
    toast.success('Documento adicionado!');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.fullName && formData.email && formData.phone && formData.businessType);
      case 2:
        return formData.businessType === 'pf' 
          ? Boolean(formData.sector && formData.monthlyRevenue > 0)
          : Boolean(formData.companyName && formData.taxRegime && formData.sector);
      case 3:
        return true; // Documents are optional but encouraged
      case 4:
        return Boolean(formData.mainConcern && formData.urgency);
      case 5:
        return Boolean(formData.email && formData.password && formData.password.length >= 6);
      case 6:
        return true;
      default:
        return true;
    }
  };

  // Step 4 → 5: Create service request FIRST (before account)
  const handleCreateRequest = async () => {
    setIsSubmitting(true);

    try {
      // Create fiscal analysis request with null user_id (will be linked after account creation)
      const { data: request, error: requestError } = await supabase
        .from('fiscal_analysis_requests')
        .insert({
          user_id: user?.id || null, // Will be updated after account creation
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpfCnpj,
          company_name: formData.companyName || formData.fullName,
          cnpj: formData.businessType === 'pj' ? formData.cpfCnpj : '',
          tax_regime: formData.taxRegime || 'autonomo',
          annual_revenue_cents: formData.monthlyRevenue * 12 * 100,
          status: 'pending',
          notes: JSON.stringify({
            businessType: formData.businessType,
            sector: formData.sector,
            employeeCount: formData.employeeCount,
            state: formData.state,
            city: formData.city,
            mainConcern: formData.mainConcern,
            currentAccountant: formData.currentAccountant,
            urgency: formData.urgency,
            additionalInfo: formData.additionalInfo,
            documentsCount: documents.length,
            source: 'bi-contabilidade-onboarding',
          }),
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Upload documents if any
      if (documents.length > 0 && request) {
        for (const doc of documents) {
          const fileExt = doc.name.split('.').pop();
          const fileName = `bi-requests/${request.id}/${doc.category}_${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('fiscal-documents')
            .upload(fileName, doc.file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
          }
        }
      }

      setRequestId(request.id);
      toast.success('Solicitação criada! Agora crie sua conta.');
      setStep(5); // Go to account creation step
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5 → 6: Create account and link request
  const handleCreateAccount = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Preencha email e senha');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message?.includes('already registered')) {
          // Try to login instead
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          
          if (loginError) throw loginError;
          
          if (loginData.user && requestId) {
            await supabase
              .from('fiscal_analysis_requests')
              .update({ user_id: loginData.user.id })
              .eq('id', requestId);
              
            // Create notification
            await supabase.from('service_notifications').insert({
              user_id: loginData.user.id,
              title: '🎉 Solicitação BI+ Contabilidade Enviada!',
              message: 'Sua solicitação foi recebida. César, nosso especialista em BI, entrará em contato em breve.',
              notification_type: 'service_created',
              service_type: 'bi-contabilidade',
              metadata: { requestId },
            });
          }
        } else {
          throw signUpError;
        }
      } else if (authData.user && requestId) {
        // Link request to new user
        await supabase
          .from('fiscal_analysis_requests')
          .update({ user_id: authData.user.id })
          .eq('id', requestId);
          
        // Create notification
        await supabase.from('service_notifications').insert({
          user_id: authData.user.id,
          title: '🎉 Solicitação BI+ Contabilidade Enviada!',
          message: 'Sua solicitação foi recebida. César, nosso especialista em BI, entrará em contato em breve.',
          notification_type: 'service_created',
          service_type: 'bi-contabilidade',
          metadata: { requestId },
        });
      }

      toast.success('Conta criada! Redirecionando para seu painel...');
      setStep(6); // Go to confirmation step
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final step: Redirect to chat
  const handleFinish = () => {
    // REGRA DE NEGÓCIO: Todo serviço finaliza em CHAT com César
    navigate(`/chat/cesar?servico=bi-contabilidade&request=${requestId}`);
  };

  const nextStep = () => {
    if (step === 4) {
      // Step 4 → Create request, then go to Step 5
      handleCreateRequest();
    } else if (step === 5) {
      // Step 5 → Create account, then go to Step 6
      handleCreateAccount();
    } else if (step < 6) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Animated background particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/10"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-border bg-white/95 backdrop-blur-lg sticky top-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8" />
            <div>
              <span className="font-bold text-lg text-foreground">BI+ Contabilidade</span>
              <span className="text-[10px] text-primary block -mt-1">by AtentAI™</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 hidden sm:flex">
              <Shield className="h-3 w-3 mr-1" />
              Dados Seguros
            </Badge>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 hidden sm:flex">
              <Clock className="h-3 w-3 mr-1" />
              Resposta em 4h
            </Badge>
          </div>
        </div>
      </header>

      {/* Back Link */}
      <div className="relative z-10 container mx-auto px-4 py-4">
        <Link 
          to="/bi-contabilidade" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30"
              animate={{
                y: [0, -8, 0],
                rotateY: [0, 10, 0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Brain className="h-10 w-10 text-white" />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Análise Financeira Completa
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              IA acelera. Humano decide. Preencha os dados para uma análise personalizada.
            </p>
          </motion.div>

          {/* Progress Steps - Mobile Optimized */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 md:gap-4 mb-8 px-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {STEPS.map((s, index) => {
              const StepIcon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              
              return (
                <React.Fragment key={s.id}>
                  <motion.div
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 sm:gap-1",
                      isActive && "scale-105 sm:scale-110"
                    )}
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                  >
                    <motion.div
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300",
                        isCompleted && "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30",
                        isActive && "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 ring-2 sm:ring-4 ring-indigo-500/20",
                        !isActive && !isCompleted && "bg-slate-800/50 border border-slate-700"
                      )}
                      whileHover={{ scale: 1.05 }}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      ) : (
                        <StepIcon className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
                          isActive ? "text-white" : "text-slate-500"
                        )} />
                      )}
                    </motion.div>
                    <span className={cn(
                      "text-[9px] sm:text-[10px] md:text-xs font-medium text-center max-w-[50px] sm:max-w-none truncate",
                      isActive ? "text-indigo-400" : isCompleted ? "text-emerald-400" : "text-slate-500",
                      "hidden xs:block sm:block"
                    )}>
                      {s.title}
                    </span>
                  </motion.div>
                  
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "w-4 sm:w-8 md:w-16 h-0.5 sm:h-1 rounded-full transition-colors duration-300 flex-shrink-0",
                      step > s.id ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-slate-800"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Card glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              <CardContent className="p-6 md:p-8 relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-indigo-500/20">
                            <User className="h-5 w-5 text-indigo-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">Seus Dados</h2>
                            <p className="text-sm text-slate-400">Informações de contato</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Nome Completo *</Label>
                            <Input
                              value={formData.fullName}
                              onChange={(e) => updateFormData('fullName', e.target.value)}
                              placeholder="Seu nome completo"
                              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-300">E-mail *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                              <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateFormData('email', e.target.value)}
                                placeholder="seu@email.com"
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11 pl-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-300">Telefone/WhatsApp *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                              <Input
                                value={formData.phone}
                                onChange={(e) => updateFormData('phone', formatPhone(e.target.value))}
                                placeholder="(11) 99999-9999"
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11 pl-10"
                                maxLength={15}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-300">CPF/CNPJ</Label>
                            <Input
                              value={formData.cpfCnpj}
                              onChange={(e) => updateFormData('cpfCnpj', formatCPFCNPJ(e.target.value))}
                              placeholder="000.000.000-00"
                              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                              maxLength={18}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-slate-300">Você é... *</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <motion.button
                              type="button"
                              onClick={() => updateFormData('businessType', 'pf')}
                              className={cn(
                                "p-4 rounded-xl border text-left transition-all",
                                formData.businessType === 'pf'
                                  ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  formData.businessType === 'pf' ? "bg-indigo-500/20" : "bg-slate-700/50"
                                )}>
                                  <User className={cn(
                                    "h-5 w-5",
                                    formData.businessType === 'pf' ? "text-indigo-400" : "text-slate-400"
                                  )} />
                                </div>
                                <div>
                                  <p className="font-semibold text-white">Pessoa Física</p>
                                  <p className="text-xs text-slate-400">Autônomo, Profissional Liberal</p>
                                </div>
                              </div>
                            </motion.button>

                            <motion.button
                              type="button"
                              onClick={() => updateFormData('businessType', 'pj')}
                              className={cn(
                                "p-4 rounded-xl border text-left transition-all",
                                formData.businessType === 'pj'
                                  ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  formData.businessType === 'pj' ? "bg-indigo-500/20" : "bg-slate-700/50"
                                )}>
                                  <Building2 className={cn(
                                    "h-5 w-5",
                                    formData.businessType === 'pj' ? "text-indigo-400" : "text-slate-400"
                                  )} />
                                </div>
                                <div>
                                  <p className="font-semibold text-white">Pessoa Jurídica</p>
                                  <p className="text-xs text-slate-400">MEI, ME, EPP, LTDA, etc.</p>
                                </div>
                              </div>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Business Info */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-purple-500/20">
                            <Building2 className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              {formData.businessType === 'pj' ? 'Dados da Empresa' : 'Atividade Profissional'}
                            </h2>
                            <p className="text-sm text-slate-400">Informações do negócio</p>
                          </div>
                        </div>

                        {formData.businessType === 'pj' && (
                          <div className="space-y-2">
                            <Label className="text-slate-300">Razão Social / Nome Fantasia *</Label>
                            <Input
                              value={formData.companyName}
                              onChange={(e) => updateFormData('companyName', e.target.value)}
                              placeholder="Nome da empresa"
                              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {formData.businessType === 'pj' && (
                            <div className="space-y-2">
                              <Label className="text-slate-300">Regime Tributário *</Label>
                              <Select
                                value={formData.taxRegime}
                                onValueChange={(value) => updateFormData('taxRegime', value)}
                              >
                                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-11">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TAX_REGIMES.map((regime) => (
                                    <SelectItem key={regime.value} value={regime.value}>
                                      {regime.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label className="text-slate-300">Setor de Atuação *</Label>
                            <Select
                              value={formData.sector}
                              onValueChange={(value) => updateFormData('sector', value)}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-11">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {SECTORS.map((sector) => (
                                  <SelectItem key={sector.value} value={sector.value}>
                                    {sector.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-300">Faturamento Mensal Médio *</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={formData.monthlyRevenue > 0 ? new Intl.NumberFormat('pt-BR').format(formData.monthlyRevenue) : ''}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  updateFormData('monthlyRevenue', parseInt(value) || 0);
                                }}
                                placeholder="0"
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11 pl-10"
                              />
                            </div>
                            {formData.monthlyRevenue > 0 && (
                              <p className="text-xs text-slate-500">
                                Anual estimado: {formatCurrency(formData.monthlyRevenue * 12)}
                              </p>
                            )}
                          </div>

                          {formData.businessType === 'pj' && (
                            <div className="space-y-2">
                              <Label className="text-slate-300">Número de Funcionários</Label>
                              <Input
                                type="number"
                                min="0"
                                value={formData.employeeCount || ''}
                                onChange={(e) => updateFormData('employeeCount', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Estado</Label>
                            <Select
                              value={formData.state}
                              onValueChange={(value) => updateFormData('state', value)}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-11">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[200px]">
                                {STATES.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-300">Cidade</Label>
                            <Input
                              value={formData.city}
                              onChange={(e) => updateFormData('city', e.target.value)}
                              placeholder="Sua cidade"
                              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Documents */}
                    {step === 3 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-emerald-500/20">
                            <FileText className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">Documentos</h2>
                            <p className="text-sm text-slate-400">Envie os arquivos para análise (opcional)</p>
                          </div>
                        </div>

                        {/* Info card */}
                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                          <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-indigo-300 font-medium">Quanto mais documentos, melhor a análise</p>
                              <p className="text-xs text-indigo-400/70 mt-1">
                                Você pode enviar documentos agora ou depois, diretamente pelo chat com nosso especialista.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Document categories */}
                        <div className="space-y-3">
                          <Label className="text-slate-300">Selecione o tipo de documento:</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {DOCUMENT_CATEGORIES.map((cat) => {
                              const Icon = cat.icon;
                              const hasUploaded = documents.some(d => d.category === cat.value);
                              return (
                                <motion.button
                                  key={cat.value}
                                  type="button"
                                  onClick={() => setSelectedDocCategory(cat.value)}
                                  className={cn(
                                    "p-3 rounded-xl border text-left transition-all",
                                    selectedDocCategory === cat.value
                                      ? "border-emerald-500 bg-emerald-500/10"
                                      : hasUploaded
                                      ? "border-emerald-500/50 bg-slate-800/50"
                                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                  )}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex items-center gap-2">
                                    {hasUploaded ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                      <Icon className="h-4 w-4 text-slate-400" />
                                    )}
                                    <span className={cn(
                                      "text-sm font-medium",
                                      hasUploaded ? "text-emerald-400" : "text-white"
                                    )}>
                                      {cat.label}
                                    </span>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Upload area */}
                        {selectedDocCategory && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 border-2 border-dashed border-slate-600 rounded-xl text-center bg-slate-800/30"
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-300 font-medium mb-1">
                              {DOCUMENT_CATEGORIES.find(c => c.value === selectedDocCategory)?.description}
                            </p>
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingFile}
                              variant="outline"
                              className="mt-3 border-slate-600 hover:bg-slate-700"
                            >
                              {uploadingFile ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Selecionar Arquivo
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-slate-500 mt-2">
                              PDF, JPG, PNG ou Excel (máx. 10MB)
                            </p>
                          </motion.div>
                        )}

                        {/* Uploaded documents list */}
                        {documents.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-slate-300">Documentos adicionados:</Label>
                            {documents.map((doc) => (
                              <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                              >
                                <div className="flex items-center gap-3">
                                  <FileCheck className="h-5 w-5 text-emerald-400" />
                                  <div>
                                    <p className="text-sm font-medium text-white truncate max-w-[200px]">
                                      {doc.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => removeDocument(doc.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Details */}
                    {step === 4 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-pink-500/20">
                            <Target className="h-5 w-5 text-pink-400" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white">Suas Necessidades</h2>
                            <p className="text-sm text-slate-400">Conte-nos como podemos ajudar</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Qual sua principal preocupação? *</Label>
                          <Textarea
                            value={formData.mainConcern}
                            onChange={(e) => updateFormData('mainConcern', e.target.value)}
                            placeholder="Ex: Preciso entender se estou pagando impostos a mais, organizar minha contabilidade, resolver pendências fiscais..."
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Possui contador atualmente?</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'sim', label: 'Sim' },
                              { value: 'nao', label: 'Não' },
                              { value: 'mudando', label: 'Trocando' },
                            ].map((opt) => (
                              <motion.button
                                key={opt.value}
                                type="button"
                                onClick={() => updateFormData('currentAccountant', opt.value)}
                                className={cn(
                                  "p-3 rounded-xl border text-center transition-all",
                                  formData.currentAccountant === opt.value
                                    ? "border-indigo-500 bg-indigo-500/10"
                                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className={cn(
                                  "text-sm font-medium",
                                  formData.currentAccountant === opt.value ? "text-indigo-400" : "text-white"
                                )}>
                                  {opt.label}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Urgência *</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {URGENCY_OPTIONS.map((opt) => (
                              <motion.button
                                key={opt.value}
                                type="button"
                                onClick={() => updateFormData('urgency', opt.value as 'low' | 'medium' | 'high')}
                                className={cn(
                                  "p-3 rounded-xl border text-center transition-all",
                                  formData.urgency === opt.value
                                    ? "border-indigo-500 bg-indigo-500/10"
                                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span className={cn(
                                  "text-sm font-medium block",
                                  formData.urgency === opt.value ? opt.color : "text-white"
                                )}>
                                  {opt.label}
                                </span>
                                <span className="text-xs text-slate-500">{opt.description}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Informações adicionais</Label>
                          <Textarea
                            value={formData.additionalInfo}
                            onChange={(e) => updateFormData('additionalInfo', e.target.value)}
                            placeholder="Algo mais que gostaria de compartilhar? (opcional)"
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 5: Create Account (SaaS Pattern) */}
                    {step === 5 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center"
                          >
                            <User className="h-10 w-10 text-indigo-400" />
                          </motion.div>
                          <h2 className="text-2xl font-bold text-white mb-2">
                            Crie sua conta para acompanhar
                          </h2>
                          <p className="text-slate-400">
                            Sua solicitação já foi criada! Agora crie uma conta para acessar seu painel.
                          </p>
                        </div>

                        {/* Benefits reminder */}
                        <div className="bg-slate-800/50 rounded-xl p-4 max-w-md mx-auto space-y-2 border border-slate-700">
                          <p className="text-xs font-medium text-white flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                            Com sua conta você terá:
                          </p>
                          <ul className="space-y-1 text-xs text-slate-400">
                            <li className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-indigo-400" />
                              Chat direto com César (seu especialista BI)
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-indigo-400" />
                              Dashboard com insights em tempo real
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-indigo-400" />
                              Documentos já anexados ao seu caso
                            </li>
                          </ul>
                        </div>

                        <div className="max-w-md mx-auto space-y-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-500" />
                              Email
                            </Label>
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              value={formData.email}
                              onChange={(e) => updateFormData('email', e.target.value)}
                              className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-300 flex items-center gap-2">
                              <KeyRound className="h-4 w-4 text-slate-500" />
                              Senha
                            </Label>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 6 caracteres"
                                value={formData.password}
                                onChange={(e) => updateFormData('password', e.target.value)}
                                className="h-12 pr-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                required
                                minLength={6}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Confirmation & Redirect to Chat */}
                    {step === 6 && (
                      <div className="space-y-8 text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.6 }}
                          className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center"
                        >
                          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                        </motion.div>
                        
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Tudo pronto! 🎉
                          </h2>
                          <p className="text-slate-400">
                            Seu painel está configurado. César já foi notificado.
                          </p>
                        </div>

                        <div className="grid gap-4 max-w-md mx-auto">
                          <div className="flex items-center gap-4 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                            <div className="text-left">
                              <p className="font-medium text-white">Solicitação criada</p>
                              <p className="text-sm text-slate-400">Seus dados e documentos foram salvos</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <Brain className="h-6 w-6 text-indigo-400 shrink-0" />
                            <div className="text-left">
                              <p className="font-medium text-white">Chat com César</p>
                              <p className="text-sm text-slate-400">Seu especialista BI já está disponível</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-5 rounded-xl bg-slate-900/80 border-2 border-pink-500/40 shadow-lg shadow-pink-500/10">
                            <div className="p-2 rounded-full bg-pink-500/20 border border-pink-500/30">
                              <Heart className="h-5 w-5 text-pink-400" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-pink-400">ATENDIMENTO HUMANO GARANTIDO</p>
                              <p className="text-sm text-white/80">IA acelera. Humano decide.</p>
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={handleFinish}
                          size="lg"
                          className="h-14 px-12 text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 group"
                        >
                          Abrir meu painel e chat
                          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation - Hide on step 6 */}
                {step !== 6 && (
                  <motion.div
                    className="flex gap-4 mt-8 pt-6 border-t border-slate-700/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === 1 || step === 5 || isSubmitting}
                      className="flex-1 h-12 border-slate-600 hover:bg-slate-800 text-white"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>

                    <Button
                      onClick={nextStep}
                      disabled={!canProceed() || isSubmitting}
                      className={cn(
                        "flex-1 h-12 relative overflow-hidden",
                        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
                        canProceed() && !isSubmitting && "shadow-lg shadow-indigo-500/30"
                      )}
                    >
                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                        initial={{ x: "-100%" }}
                        animate={canProceed() ? { x: "200%" } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                      />

                      <span className="relative z-10 flex items-center justify-center">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {step === 4 ? 'Criando solicitação...' : step === 5 ? 'Criando conta...' : 'Enviando...'}
                          </>
                        ) : step === 4 ? (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Criar Solicitação
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            >
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </motion.span>
                          </>
                        ) : step === 5 ? (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            Criar Conta
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            >
                              <CheckCircle2 className="h-4 w-4 ml-2" />
                            </motion.span>
                          </>
                        ) : (
                          <>
                            Próximo
                            <motion.span
                              className="ml-2"
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </motion.span>
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                )}

                {/* Quick tip */}
                {!isSubmitting && step !== 6 && (
                  <motion.p
                    className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Lock className="h-3 w-3" />
                    Seus dados estão protegidos e não serão compartilhados
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Análise por especialista
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Resposta em até 4h
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Sem compromisso
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              100% seguro
            </span>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default BIContabilidadeOnboarding;
