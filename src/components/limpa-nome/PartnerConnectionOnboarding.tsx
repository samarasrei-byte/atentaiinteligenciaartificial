import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Heart
} from "lucide-react";
import { MaskedInput } from "@/components/ui/masked-input";

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
  { id: 1, title: 'Introdução' },
  { id: 2, title: 'Seus dados' },
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
    // Save to localStorage or send to backend
    console.log('Partner connection data:', formData);
    onClose();
    // Navigate to payment or next step
    window.location.href = '/limpa-nome';
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md my-auto"
      >
        <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header with Progress - Compact */}
          <div className="bg-gradient-to-r from-primary/10 to-rose-500/10 p-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                <Users className="h-3 w-3 mr-1" />
                Conexão com Parceiro
              </Badge>
              <span className="text-xs text-muted-foreground">
                Passo {currentStep} de {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
            
            {/* Step Indicators - Compact */}
            <div className="flex justify-between mt-3">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step.id < currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : step.id === currentStep 
                        ? 'bg-primary/20 text-primary border border-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.id < currentStep ? <CheckCircle className="h-3 w-3" /> : step.id}
                  </div>
                  <span className="text-[10px] mt-1 hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          <CardContent className="p-4 overflow-y-auto flex-1">
            <AnimatePresence mode="wait">
              {/* Step 1 - Introduction - Compact */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-rose-500/20 flex items-center justify-center">
                      <Handshake className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      Vamos conectar você ao parceiro certo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Um <strong className="text-foreground">parceiro especializado</strong> irá 
                      analisar seu caso <strong className="text-foreground">pessoalmente</strong>.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs text-muted-foreground">Análise feita por pessoas reais</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Shield className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-xs text-muted-foreground">Conexão com parceiro especializado</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                      <span className="text-xs text-muted-foreground">Nada é automático – atendimento humano</span>
                    </div>
                  </div>

                  <Button 
                    onClick={nextStep}
                    className="w-full h-11 bg-gradient-to-r from-primary to-rose-500 hover:from-primary/90 hover:to-rose-500/90"
                  >
                    Iniciar conexão
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2 - Basic Data - Compact */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Seus dados básicos
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-xs">Nome completo</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cpf" className="text-xs">{selectedPlan === 'pj' ? 'CNPJ' : 'CPF'}</Label>
                      <MaskedInput
                        id="cpf"
                        mask={selectedPlan === 'pj' ? 'cnpj' : 'cpf'}
                        value={formData.cpf}
                        onChange={(value) => handleInputChange('cpf', value)}
                        className="h-10"
                        showValidation={false}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="whatsapp" className="text-xs">WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <MaskedInput
                          id="whatsapp"
                          mask="phone"
                          value={formData.whatsapp}
                          onChange={(value) => handleInputChange('whatsapp', value)}
                          className="h-10 pl-10"
                          showValidation={false}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-muted-foreground">
                    🔒 Usamos esses dados apenas para conectar você ao parceiro certo.
                  </p>

                  <Button 
                    onClick={nextStep}
                    disabled={!formData.name || !formData.cpf || !formData.whatsapp}
                    className="w-full h-11 bg-gradient-to-r from-primary to-rose-500 hover:from-primary/90 hover:to-rose-500/90"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 3 - Debt Situation - Compact */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Situação do nome
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cada situação exige uma análise diferente.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    {debtTypes.map((debt) => {
                      const Icon = debt.icon;
                      const isSelected = formData.debtTypes.includes(debt.id);
                      return (
                        <button
                          key={debt.id}
                          onClick={() => toggleDebtType(debt.id)}
                          className={`
                            w-full p-3 rounded-lg border-2 text-left transition-all
                            ${isSelected 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50 bg-card'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                              <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground">{debt.label}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{debt.description}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Button 
                    onClick={nextStep}
                    disabled={formData.debtTypes.length === 0}
                    className="w-full h-11 bg-gradient-to-r from-primary to-rose-500 hover:from-primary/90 hover:to-rose-500/90"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 4 - Confirmation - Compact */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center"
                    >
                      <CheckCircle className="h-7 w-7 text-green-500" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-foreground">
                      Conexão iniciada com sucesso!
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-xs text-foreground">Conexão iniciada com sucesso</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Users className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-xs text-foreground">Um parceiro humano irá analisar seu caso</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Handshake className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs text-foreground">Parceria séria e responsável</span>
                    </div>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    O parceiro entrará em contato pelo WhatsApp.
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-medium text-muted-foreground">Atendimento humano garantido</span>
                  </div>

                  <Button 
                    onClick={handleFinish}
                    className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    Finalizar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      </motion.div>
    </motion.div>
  );
}
