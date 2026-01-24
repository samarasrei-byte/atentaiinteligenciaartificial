import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  ArrowLeft,
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
  Building2
} from "lucide-react";
import { MaskedInput } from "@/components/ui/masked-input";

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

export default function LimpaNomeOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');
  const selectedPlan = (planParam === 'pj' ? 'pj' : 'pf') as 'pf' | 'pj';
  
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

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    // Save to localStorage for the next page
    localStorage.setItem('limpa_nome_lead', JSON.stringify({
      ...formData,
      plan: selectedPlan,
      createdAt: new Date().toISOString()
    }));
    
    // Navigate to payment page
    navigate(`/limpa-nome?plan=${selectedPlan}&prefilled=true`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8" />
            <Badge variant="outline" className="text-xs">
              Limpa Nome
            </Badge>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Users className="h-3 w-3 mr-1" />
            Conexão com Parceiro
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          {/* Transition Message */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <p className="text-muted-foreground">
                Estamos te conectando a um parceiro especializado
              </p>
              <p className="text-sm text-muted-foreground">
                Isso leva menos de 2 minutos.
              </p>
            </motion.div>
          )}

          {/* Progress Card */}
          <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
            {/* Progress Header */}
            <div className="bg-gradient-to-r from-primary/10 to-rose-500/10 p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {selectedPlan === 'pj' ? (
                    <Building2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <User className="h-5 w-5 text-blue-500" />
                  )}
                  <span className="font-medium text-foreground">
                    {selectedPlan === 'pj' ? 'Empresa (CNPJ)' : 'Pessoa Física'}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Passo {currentStep} de {steps.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Step Indicators */}
              <div className="flex justify-between mt-6">
                {steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`flex flex-col items-center ${
                      step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step.id < currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : step.id === currentStep 
                          ? 'bg-primary/20 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.id < currentStep ? <CheckCircle className="h-5 w-5" /> : step.id}
                    </div>
                    <span className="text-xs mt-2 font-medium">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1 - Introduction */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-rose-500/20 flex items-center justify-center">
                        <Handshake className="h-12 w-12 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                        Vamos conectar você ao parceiro certo
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        Para garantir a melhor solução, um <strong className="text-foreground">parceiro especializado</strong> irá 
                        analisar seu caso <strong className="text-foreground">pessoalmente</strong>.
                      </p>
                    </div>

                    <div className="grid gap-4 max-w-md mx-auto">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="p-3 rounded-full bg-primary/20">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Análise feita por pessoas reais</p>
                          <p className="text-sm text-muted-foreground">Nenhuma decisão automática</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="p-3 rounded-full bg-green-500/20">
                          <Shield className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Conexão com parceiro especializado</p>
                          <p className="text-sm text-muted-foreground">Profissionais verificados</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="p-3 rounded-full bg-rose-500/20">
                          <Heart className="h-6 w-6 text-rose-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Atendimento humano garantido</p>
                          <p className="text-sm text-muted-foreground">Nada é automático</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      <Button 
                        onClick={nextStep}
                        size="lg"
                        className="h-14 px-12 text-lg bg-gradient-to-r from-primary to-rose-500 hover:from-primary/90 hover:to-rose-500/90"
                      >
                        Iniciar conexão
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 - Basic Data */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <User className="h-10 w-10 text-blue-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Seus dados básicos
                      </h2>
                      <p className="text-muted-foreground">
                        Precisamos de algumas informações para conectar você ao parceiro certo.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cpf">{selectedPlan === 'pj' ? 'CNPJ' : 'CPF'}</Label>
                        <MaskedInput
                          id="cpf"
                          mask={selectedPlan === 'pj' ? 'cnpj' : 'cpf'}
                          value={formData.cpf}
                          onChange={(value) => handleInputChange('cpf', value)}
                          className="h-12"
                          showValidation={true}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                          <MaskedInput
                            id="whatsapp"
                            mask="phone"
                            value={formData.whatsapp}
                            onChange={(value) => handleInputChange('whatsapp', value)}
                            className="h-12 pl-12"
                            showValidation={true}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-center text-muted-foreground pt-2">
                        🔒 Usamos esses dados apenas para conectar você ao parceiro certo.
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                      <Button 
                        onClick={prevStep}
                        variant="outline"
                        size="lg"
                        className="h-12 px-6"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button 
                        onClick={nextStep}
                        disabled={!formData.name || !formData.cpf || !formData.whatsapp}
                        size="lg"
                        className="h-12 px-8 bg-gradient-to-r from-primary to-rose-500 hover:from-primary/90 hover:to-rose-500/90"
                      >
                        Continuar
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 - Debt Situation */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <CreditCard className="h-10 w-10 text-amber-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Situação do nome
                      </h2>
                      <p className="text-muted-foreground">
                        Cada situação exige uma análise diferente. Selecione todas que se aplicam.
                      </p>
                    </div>

                    <div className="grid gap-4 max-w-lg mx-auto">
                      {debtTypes.map((debt) => {
                        const Icon = debt.icon;
                        const isSelected = formData.debtTypes.includes(debt.id);
                        return (
                          <button
                            key={debt.id}
                            onClick={() => toggleDebtType(debt.id)}
                            className={`
                              w-full p-5 rounded-xl border-2 text-left transition-all
                              ${isSelected 
                                ? 'border-primary bg-primary/10 shadow-lg' 
                                : 'border-border hover:border-primary/50 bg-card hover:shadow-md'
                              }
                            `}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                                <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-foreground">{debt.label}</p>
                                <p className="text-sm text-muted-foreground">{debt.description}</p>
                              </div>
                              {isSelected && (
                                <CheckCircle className="h-6 w-6 text-primary" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                      <Button 
                        onClick={prevStep}
                        variant="outline"
                        size="lg"
                        className="h-12 px-6"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button 
                        onClick={nextStep}
                        disabled={formData.debtTypes.length === 0}
                        size="lg"
                        className="h-12 px-8 bg-gradient-to-r from-primary to-rose-500 hover:from-primary/90 hover:to-rose-500/90"
                      >
                        Continuar
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 - Confirmation */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center"
                      >
                        <CheckCircle className="h-12 w-12 text-green-500" />
                      </motion.div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                        Conexão iniciada com sucesso!
                      </h2>
                      <p className="text-muted-foreground">
                        Você está a um passo de limpar seu nome.
                      </p>
                    </div>

                    <div className="grid gap-4 max-w-md mx-auto">
                      <div className="flex items-center gap-4 p-5 rounded-xl bg-green-500/10 border border-green-500/20">
                        <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Conexão iniciada com sucesso</p>
                          <p className="text-sm text-muted-foreground">Seus dados foram recebidos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <Users className="h-6 w-6 text-blue-500 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Um parceiro humano irá analisar seu caso</p>
                          <p className="text-sm text-muted-foreground">Análise personalizada garantida</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-5 rounded-xl bg-primary/10 border border-primary/20">
                        <Handshake className="h-6 w-6 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Parceria séria e responsável</p>
                          <p className="text-sm text-muted-foreground">Profissionais verificados</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center space-y-3">
                      <p className="text-muted-foreground">
                        O parceiro entrará em contato com você pelo WhatsApp para dar continuidade à análise.
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <span className="font-medium text-muted-foreground">Atendimento humano garantido</span>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                      <Button 
                        onClick={prevStep}
                        variant="outline"
                        size="lg"
                        className="h-12 px-6"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button 
                        onClick={handleFinish}
                        size="lg"
                        className="h-14 px-12 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        Finalizar
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Back to Home Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar para a página inicial
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
