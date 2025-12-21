import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Star, Clock, CheckCircle, Shield, MessageCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Accountant {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  avatar: string;
  available: boolean;
}

const accountants: Accountant[] = [
  {
    id: "1",
    name: "Dr. Ricardo Souza",
    specialty: "Reforma Tributária & Planejamento",
    rating: 4.9,
    reviews: 234,
    experience: "15 anos",
    avatar: "RS",
    available: true,
  },
  {
    id: "2",
    name: "Dra. Marina Costa",
    specialty: "Simples Nacional & MEI",
    rating: 4.8,
    reviews: 187,
    experience: "12 anos",
    avatar: "MC",
    available: true,
  },
  {
    id: "3",
    name: "Dr. Carlos Ferreira",
    specialty: "Lucro Real & Presumido",
    rating: 4.9,
    reviews: 312,
    experience: "20 anos",
    avatar: "CF",
    available: false,
  },
];

export function AccountantSection() {
  const [selectedAccountant, setSelectedAccountant] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "form" | "success">("select");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyType: "",
    subject: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simula processamento
    toast({
      title: "Solicitação enviada! 📨",
      description: "O contador entrará em contato em até 24h úteis.",
    });
    
    setStep("success");
  };

  const platformFee = 15; // 10% de R$150
  const accountantFee = 135;
  const totalPrice = 150;

  return (
    <section id="accountant" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Contadores Especializados
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
              Consultoria com
              <span className="gradient-text"> Profissionais Experts</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conecte-se com contadores certificados e especializados na Reforma Tributária. 
              Receba orientação personalizada para o seu negócio.
            </p>
          </div>

          {step === "select" && (
            <>
              {/* Accountants Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {accountants.map((accountant) => (
                  <Card 
                    key={accountant.id}
                    variant={selectedAccountant === accountant.id ? "premium" : "elevated"}
                    className={`cursor-pointer transition-all ${
                      !accountant.available && "opacity-60"
                    } ${selectedAccountant === accountant.id && "ring-2 ring-primary"}`}
                    onClick={() => accountant.available && setSelectedAccountant(accountant.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-bold text-lg shadow-glow">
                          {accountant.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{accountant.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{accountant.specialty}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-accent text-accent" />
                              {accountant.rating}
                            </span>
                            <span className="text-muted-foreground">
                              ({accountant.reviews} avaliações)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {accountant.experience}
                        </div>
                        {accountant.available ? (
                          <span className="flex items-center gap-1 text-sm text-success">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            Disponível
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Indisponível
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pricing Card */}
              <Card variant="gradient" className="overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">Consulta Individual</h3>
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success" />
                          1 hora de consultoria
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success" />
                          Análise personalizada
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success" />
                          Relatório em PDF
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="flex items-baseline gap-2 justify-center md:justify-end">
                        <span className="text-4xl font-bold">R${totalPrice}</span>
                        <span className="text-muted-foreground">/sessão</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Inclui taxa de plataforma (R${platformFee})
                      </p>
                      <Button 
                        variant="hero" 
                        size="lg" 
                        className="mt-4"
                        disabled={!selectedAccountant}
                        onClick={() => setStep("form")}
                      >
                        {selectedAccountant ? "Agendar Consulta" : "Selecione um contador"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Pagamento Seguro
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Contadores Verificados
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-info" />
                  Suporte 24/7
                </span>
              </div>
            </>
          )}

          {step === "form" && (
            <Card variant="elevated" className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  Agendar Consulta
                </CardTitle>
                <CardDescription>
                  Preencha seus dados para agendar com{" "}
                  {accountants.find(a => a.id === selectedAccountant)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name" 
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Empresa</Label>
                      <Select 
                        value={formData.companyType} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, companyType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mei">MEI</SelectItem>
                          <SelectItem value="simples">Simples Nacional</SelectItem>
                          <SelectItem value="presumido">Lucro Presumido</SelectItem>
                          <SelectItem value="real">Lucro Real</SelectItem>
                          <SelectItem value="pf">Pessoa Física</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto Principal</Label>
                    <Input 
                      id="subject" 
                      placeholder="Ex: Impacto da reforma no meu negócio"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Detalhes da Consulta</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Descreva suas dúvidas ou o que gostaria de abordar na consulta..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-muted">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Consultoria</span>
                      <span className="font-medium">R${accountantFee}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Taxa de plataforma</span>
                      <span className="font-medium">R${platformFee}</span>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span className="text-primary">R${totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep("select")}
                    >
                      Voltar
                    </Button>
                    <Button type="submit" variant="hero" className="flex-1">
                      Confirmar e Pagar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "success" && (
            <Card variant="premium" className="max-w-lg mx-auto text-center">
              <CardContent className="p-8 md:p-12">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Consulta Agendada!</h3>
                <p className="text-muted-foreground mb-6">
                  Você receberá um e-mail com os detalhes e o link para a videochamada em até 24h úteis.
                </p>
                <Button 
                  variant="hero"
                  onClick={() => {
                    setStep("select");
                    setSelectedAccountant(null);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      companyType: "",
                      subject: "",
                      message: "",
                    });
                  }}
                >
                  Agendar Outra Consulta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
