import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MaskedInput } from "@/components/ui/masked-input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Upload, Building2, FileText, Loader2, 
  CheckCircle2, ArrowRight, ArrowLeft, Lock,
  User, Mail, Phone, FileCheck, Calendar, 
  Sparkles, Zap, BadgeCheck, Star
} from "lucide-react";

const fiscalFormSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ inválido").max(18),
  companyName: z.string().min(2, "Nome da empresa é obrigatório").max(200),
  taxRegime: z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]),
  cnaeCode: z.string().optional(),
  annualRevenue: z.string().optional(),
  guideType: z.enum(["das", "darf", "gps", "outros"]).optional(),
  guideValue: z.string().optional(),
  analysisPeriodStart: z.string().optional(),
  analysisPeriodEnd: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type FiscalFormData = z.infer<typeof fiscalFormSchema>;

interface FiscalAnalysisFormModernProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const steps = [
  { id: 1, title: "Responsável", icon: User },
  { id: 2, title: "Empresa", icon: Building2 },
  { id: 3, title: "Análise", icon: FileCheck },
];

const trustBadges = [
  { icon: Lock, text: "SSL 256-bit" },
  { icon: Shield, text: "100% Seguro" },
  { icon: BadgeCheck, text: "LGPD" },
];

export function FiscalAnalysisFormModern({ onSuccess, onBack }: FiscalAnalysisFormModernProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guideFile, setGuideFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FiscalFormData>({
    resolver: zodResolver(fiscalFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      cpf: "",
      cnpj: "",
      companyName: "",
      taxRegime: "simples_nacional",
      cnaeCode: "",
      annualRevenue: "",
      guideType: undefined,
      guideValue: "",
      analysisPeriodStart: "",
      analysisPeriodEnd: "",
      notes: "",
    },
  });

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
    return Math.round(parseFloat(cleaned) * 100) || 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB.");
        return;
      }
      setGuideFile(file);
      toast.success("Arquivo carregado com sucesso!");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof FiscalFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["fullName", "email"];
        break;
      case 2:
        fieldsToValidate = ["companyName", "cnpj", "taxRegime"];
        break;
      case 3:
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FiscalFormData) => {
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || null;

      const { data: partner } = await supabase
        .from("credit_repair_partners")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .single();

      let guideDocumentUrl = null;

      if (guideFile) {
        const fileExt = guideFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${userId || 'guest'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("fiscal-documents")
          .upload(filePath, guideFile);

        if (!uploadError) {
          guideDocumentUrl = filePath;
        }
      }

      const { error } = await supabase
        .from("fiscal_analysis_requests")
        .insert({
          user_id: userId,
          partner_id: partner?.id || null,
          full_name: data.fullName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.replace(/\D/g, "") || null,
          cpf: data.cpf?.replace(/\D/g, "") || null,
          cnpj: data.cnpj.replace(/\D/g, ""),
          company_name: data.companyName.trim(),
          tax_regime: data.taxRegime,
          cnae_code: data.cnaeCode || null,
          annual_revenue_cents: parseCurrency(data.annualRevenue || "0"),
          guide_type: data.guideType || null,
          guide_value_cents: parseCurrency(data.guideValue || "0"),
          guide_document_url: guideDocumentUrl,
          analysis_period_start: data.analysisPeriodStart || null,
          analysis_period_end: data.analysisPeriodEnd || null,
          notes: data.notes?.trim() || null,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Solicitação enviada com sucesso! Entraremos em contato em breve.");
      form.reset();
      setGuideFile(null);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header with trust badges */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Análise 100% gratuita • Pague apenas no êxito</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Solicitar Análise Fiscal
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Descubra quanto sua empresa pode economizar com nossa análise técnica especializada.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: currentStep >= step.id ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    scale: currentStep === step.id ? 1.1 : 1,
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${currentStep >= step.id ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  )}
                </motion.div>
                <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-muted relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                    className="absolute inset-0 bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-2 border-border/50 shadow-2xl overflow-hidden bg-gradient-to-b from-card to-card/80">
        <CardContent className="p-6 md:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait" custom={currentStep}>
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Dados do Responsável</h3>
                        <p className="text-sm text-muted-foreground">Informações de contato</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              Nome Completo *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Seu nome completo" 
                                className="h-12 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              Email *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="seu@email.com" 
                                className="h-12 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              Telefone
                            </FormLabel>
                            <FormControl>
                              <MaskedInput 
                                mask="phone" 
                                placeholder="(11) 99999-9999" 
                                className="h-12 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <MaskedInput 
                                mask="cpf" 
                                placeholder="000.000.000-00" 
                                className="h-12 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Company Info */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    custom={2}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Dados da Empresa</h3>
                        <p className="text-sm text-muted-foreground">Informações fiscais</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razão Social *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nome da empresa" 
                                className="h-12 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNPJ *</FormLabel>
                            <FormControl>
                              <MaskedInput 
                                mask="cnpj" 
                                placeholder="00.000.000/0000-00" 
                                className="h-12 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxRegime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regime Tributário *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Selecione o regime" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="simples_nacional">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Popular</Badge>
                                    Simples Nacional
                                  </div>
                                </SelectItem>
                                <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                                <SelectItem value="lucro_real">Lucro Real</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cnaeCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNAE Principal</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="0000-0/00" 
                                className="h-12 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="annualRevenue"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Faturamento Anual Estimado</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="R$ 0,00" 
                                className="h-12 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Analysis Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    custom={3}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <FileCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Detalhes da Análise</h3>
                        <p className="text-sm text-muted-foreground">Informações adicionais</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="guideType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Guia</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="das">DAS (Simples Nacional)</SelectItem>
                                <SelectItem value="darf">DARF</SelectItem>
                                <SelectItem value="gps">GPS</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guideValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor da Guia</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="R$ 0,00" 
                                className="h-12 text-base"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="analysisPeriodStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              Período Inicial
                            </FormLabel>
                            <FormControl>
                              <Input type="date" className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="analysisPeriodEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              Período Final
                            </FormLabel>
                            <FormControl>
                              <Input type="date" className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* File Upload - Enhanced */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        Anexar Guia (PDF, até 10MB)
                      </Label>
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                          transition-all duration-300 group
                          ${isDragging 
                            ? 'border-primary bg-primary/5 scale-[1.02]' 
                            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
                          }
                          ${guideFile ? 'border-success bg-success/5' : ''}
                        `}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        {guideFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <CheckCircle2 className="h-8 w-8 text-success" />
                            <div className="text-left">
                              <p className="font-medium text-success">{guideFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(guideFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="font-medium text-foreground mb-1">
                              Arraste e solte ou clique para enviar
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PDF, JPG ou PNG até 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações Adicionais</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Informações adicionais relevantes para a análise..."
                              rows={4}
                              className="resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={currentStep === 1 ? onBack : prevStep}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {currentStep === 1 ? "Voltar" : "Anterior"}
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="gap-2 px-8"
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting}
                      className="gap-2 px-8 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/25"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" />
                          Solicitar Análise Gratuita
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-6 mt-8"
      >
        {trustBadges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
            <badge.icon className="h-4 w-4" />
            <span>{badge.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-10 p-6 rounded-2xl bg-muted/30 border border-border/50"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {["CM", "AR", "RS", "JP"].map((initials, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 border-2 border-background flex items-center justify-center text-xs font-bold text-primary-foreground"
                >
                  {initials}
                </div>
              ))}
            </div>
            <div>
              <p className="font-medium text-foreground">+2.847 empresas</p>
              <p className="text-sm text-muted-foreground">já economizaram conosco</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 font-medium text-foreground">4.9/5</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
