import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  ArrowRight, 
  CheckCircle, 
  CreditCard, 
  Landmark, 
  ShoppingCart,
  HelpCircle,
  Phone,
  User,
  Shield,
  Handshake,
  Sparkles,
  Heart,
  X
} from "lucide-react";
import { MaskedInput } from "@/components/ui/masked-input";
import { cn } from "@/lib/utils";

interface PartnerConnectionOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: 'pf' | 'pj';
}

const debtTypes = [
  { id: 'bank', label: 'Dívida bancária', icon: Landmark, description: 'Cheque especial, conta corrente' },
  { id: 'credit_card', label: 'Cartão de crédito', icon: CreditCard, description: 'Fatura em atraso' },
  { id: 'loan', label: 'Empréstimo', icon: ShoppingCart, description: 'Pessoal ou consignado' },
  { id: 'other', label: 'Outras pendências', icon: HelpCircle, description: 'Lojas, serviços, etc.' },
];

const steps = [
  { id: 1, title: 'Início' },
  { id: 2, title: 'Dados' },
  { id: 3, title: 'Situação' },
  { id: 4, title: 'Confirmação' },
];

export function PartnerConnectionOnboarding({ isOpen, onClose, selectedPlan }: PartnerConnectionOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    whatsapp: '',
    debtTypes: [] as string[],
  });

  const progress = (currentStep / steps.length) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDebtType = (debtId: string) => {
    setFormData(prev => ({
      ...prev,
      debtTypes: prev.debtTypes.includes(debtId)
        ? prev.debtTypes.filter(d => d !== debtId)
        : [...prev.debtTypes, debtId]
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    console.log('Partner connection data:', formData);
    onClose();
    window.location.href = '/limpa-nome';
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto"
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md my-auto relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Main card with glassmorphism */}
        <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          
          {/* Progress bar - minimal */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Step indicators - futuristic dots */}
          <div className="flex justify-center gap-3 pt-8 pb-4">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  step.id < currentStep 
                    ? "bg-emerald-400 w-8" 
                    : step.id === currentStep 
                      ? "bg-white w-8"
                      : "bg-slate-700"
                )}
                layout
              />
            ))}
          </div>

          <div className="px-6 pb-8">
            <AnimatePresence mode="wait">
              {/* Step 1 - Introduction */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Handshake className="h-10 w-10 text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                      Vamos conectar você ao parceiro certo
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Para garantir a melhor solução, um{' '}
                      <span className="text-white font-medium">parceiro especializado</span> irá 
                      analisar seu caso <span className="text-white font-medium">pessoalmente</span>.
                    </p>
                  </div>

                  {/* Feature cards - minimal */}
                  <div className="space-y-3">
                    <FeatureCard
                      icon={Users}
                      title="Análise feita por pessoas reais"
                      subtitle="Nenhuma decisão automática"
                      variant="default"
                    />
                    <FeatureCard
                      icon={Shield}
                      title="Conexão com parceiro especializado"
                      subtitle="Profissionais verificados"
                      variant="success"
                    />
                    
                    {/* Highlighted human guarantee card */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="relative p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border-2 border-rose-500/40">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-rose-500/20">
                            <Heart className="h-6 w-6 text-rose-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-bold text-white tracking-wide">
                              ATENDIMENTO HUMANO GARANTIDO
                            </p>
                            <p className="text-rose-200 text-sm font-medium">
                              Nada é automático – parceiros reais
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={nextStep}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base border-0 shadow-lg shadow-emerald-500/25"
                  >
                    Iniciar conexão
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2 - Basic Data */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white">
                      Seus dados básicos
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Usamos apenas para conectar você ao parceiro
                    </p>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300 text-sm font-medium">
                        Nome completo
                      </Label>
                      <Input
                        id="name"
                        placeholder="Digite seu nome"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-slate-300 text-sm font-medium">
                        {selectedPlan === 'pj' ? 'CNPJ' : 'CPF'}
                      </Label>
                      <MaskedInput
                        id="cpf"
                        mask={selectedPlan === 'pj' ? 'cnpj' : 'cpf'}
                        value={formData.cpf}
                        onChange={(value) => handleInputChange('cpf', value)}
                        className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                        showValidation={false}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-slate-300 text-sm font-medium">
                        WhatsApp
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 z-10" />
                        <MaskedInput
                          id="whatsapp"
                          mask="phone"
                          value={formData.whatsapp}
                          onChange={(value) => handleInputChange('whatsapp', value)}
                          className="h-12 pl-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                          showValidation={false}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Seus dados estão protegidos</span>
                  </div>

                  <Button 
                    onClick={nextStep}
                    disabled={!formData.name || !formData.cpf || !formData.whatsapp}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base border-0 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 3 - Debt Situation */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-amber-400" />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-white">
                      Situação do nome
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Selecione os tipos de pendência
                    </p>
                  </div>

                  {/* Options grid */}
                  <div className="grid gap-3">
                    {debtTypes.map((debt) => {
                      const Icon = debt.icon;
                      const isSelected = formData.debtTypes.includes(debt.id);
                      return (
                        <motion.button
                          key={debt.id}
                          onClick={() => toggleDebtType(debt.id)}
                          className={cn(
                            "w-full p-4 rounded-2xl border-2 text-left transition-all duration-200",
                            isSelected 
                              ? "border-amber-500/50 bg-amber-500/10" 
                              : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                          )}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-2.5 rounded-xl transition-colors",
                              isSelected ? "bg-amber-500/20" : "bg-slate-700/50"
                            )}>
                              <Icon className={cn(
                                "h-5 w-5",
                                isSelected ? "text-amber-400" : "text-slate-400"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-medium text-sm",
                                isSelected ? "text-white" : "text-slate-300"
                              )}>
                                {debt.label}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {debt.description}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-amber-400 shrink-0" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <Button 
                    onClick={nextStep}
                    disabled={formData.debtTypes.length === 0}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-base border-0 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 4 - Confirmation */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Success animation */}
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">
                      Conexão iniciada!
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                      Um parceiro humano entrará em contato
                    </p>
                  </div>

                  {/* Confirmation items */}
                  <div className="space-y-3">
                    <ConfirmationItem
                      icon={CheckCircle}
                      text="Dados recebidos com sucesso"
                      color="emerald"
                    />
                    <ConfirmationItem
                      icon={Users}
                      text="Parceiro humano irá analisar seu caso"
                      color="blue"
                    />
                    <ConfirmationItem
                      icon={Phone}
                      text="Contato via WhatsApp em breve"
                      color="teal"
                    />
                  </div>

                  {/* Human guarantee badge */}
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-slate-300">
                      Atendimento humano garantido
                    </span>
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </div>

                  <Button 
                    onClick={handleFinish}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base border-0 shadow-lg shadow-emerald-500/25"
                  >
                    Finalizar
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Feature card component
function FeatureCard({ 
  icon: Icon, 
  title, 
  subtitle, 
  variant = 'default' 
}: { 
  icon: React.ElementType; 
  title: string; 
  subtitle: string;
  variant?: 'default' | 'success';
}) {
  const iconColorClass = variant === 'success' ? 'text-emerald-400' : 'text-blue-400';
  const bgColorClass = variant === 'success' ? 'bg-emerald-500/10' : 'bg-blue-500/10';
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
      <div className={cn("p-2.5 rounded-xl", bgColorClass)}>
        <Icon className={cn("h-5 w-5", iconColorClass)} />
      </div>
      <div>
        <p className="text-white font-medium text-sm">{title}</p>
        <p className="text-slate-500 text-xs">{subtitle}</p>
      </div>
    </div>
  );
}

// Confirmation item component
function ConfirmationItem({ 
  icon: Icon, 
  text, 
  color 
}: { 
  icon: React.ElementType; 
  text: string;
  color: 'emerald' | 'blue' | 'teal';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    teal: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border",
        colorClasses[color].split(' ').slice(0, 2).join(' ')
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", colorClasses[color].split(' ')[2])} />
      <span className="text-sm text-slate-300">{text}</span>
    </motion.div>
  );
}
