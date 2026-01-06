import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MaskedInput } from "@/components/ui/masked-input";
import { Shield, Upload, Building2, FileText, Loader2 } from "lucide-react";

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

interface FiscalAnalysisFormProps {
  onSuccess?: () => void;
}

export function FiscalAnalysisForm({ onSuccess }: FiscalAnalysisFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guideFile, setGuideFile] = useState<File | null>(null);

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
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB.");
        return;
      }
      setGuideFile(file);
    }
  };

  const onSubmit = async (data: FiscalFormData) => {
    setIsSubmitting(true);

    try {
      // Get current user if logged in
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || null;

      // Find an active partner to assign
      const { data: partner } = await supabase
        .from("credit_repair_partners")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .single();

      let guideDocumentUrl = null;

      // Upload guide document if provided
      if (guideFile) {
        const fileExt = guideFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${userId || 'guest'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("fiscal-documents")
          .upload(filePath, guideFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
        } else {
          guideDocumentUrl = filePath;
        }
      }

      // Create the fiscal analysis request
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

  return (
    <Card className="border border-border/50 shadow-lg">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto p-4 rounded-2xl bg-primary/10 w-fit mb-4">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl md:text-3xl">Solicitar Análise Fiscal</CardTitle>
        <CardDescription className="text-sm md:text-base max-w-md mx-auto">
          Preencha os dados da empresa para iniciar a análise técnica. 
          Serviço sujeito a validação prévia do enquadramento fiscal.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-base md:text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Dados do Responsável
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
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
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
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
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <MaskedInput mask="phone" placeholder="(11) 99999-9999" {...field} />
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
                        <MaskedInput mask="cpf" placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-base md:text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Dados da Empresa
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} />
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
                        <MaskedInput mask="cnpj" placeholder="00.000.000/0000-00" {...field} />
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
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o regime" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
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
                        <Input placeholder="0000-0/00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annualRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faturamento Anual Estimado</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Analysis Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-base md:text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Detalhes da Análise
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guideType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Guia</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                        <Input placeholder="R$ 0,00" {...field} />
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
                      <FormLabel>Período Inicial</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>Período Final</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Anexar Guia (PDF, até 10MB)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="guide-upload"
                  />
                  <label htmlFor="guide-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    {guideFile ? (
                      <p className="text-sm text-primary font-medium">{guideFile.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar ou arraste o arquivo
                      </p>
                    )}
                  </label>
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
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-6">
              <Button type="submit" size="lg" className="w-full h-12 md:h-14 text-base" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Solicitar Análise Fiscal
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Ao enviar, você concorda com nossa política de privacidade e termos de uso.
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
