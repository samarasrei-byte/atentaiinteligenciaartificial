import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, Loader2, Lock, Sparkles, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PLANS, formatPrice, DAILY_QUESTION_LIMIT } from "@/lib/stripe";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Base de conhecimento sobre a Reforma Tributária (LC 214/2025)
const knowledgeBase: Record<string, string> = {
  "ibs": `O **IBS (Imposto sobre Bens e Serviços)** é um tributo que unificará o ICMS (estadual) e o ISS (municipal).

**Características principais (LC 214/2025):**
• Alíquota de referência: **17,7%**
• Cobrança no destino (onde o consumo ocorre)
• Não-cumulatividade plena (crédito amplo)
• Gestão pelo Comitê Gestor do IBS

**Transição:** Será implementado gradualmente de 2026 a 2033.
• 2026: 0,1% (fase de teste)
• 2027-2028: Aumento gradual
• 2029-2032: Redução progressiva do ICMS/ISS
• 2033: Extinção completa dos tributos antigos`,

  "cbs": `A **CBS (Contribuição sobre Bens e Serviços)** substituirá o PIS e a COFINS.

**Características principais (LC 214/2025):**
• Alíquota de referência: **8,8%**
• Tributo federal
• Não-cumulatividade plena
• Base de cálculo ampla

**Início:** A CBS terá alíquota de 0,9% em 2026 (fase de teste).
A partir de 2027, será implementada gradualmente até atingir a alíquota plena.`,

  "is": `O **IS (Imposto Seletivo)** é conhecido como "imposto do pecado".

**Incidirá sobre (LC 214/2025):**
• Cigarros e produtos de tabaco: até **32%**
• Bebidas alcoólicas: até **25%**
• Bebidas açucaradas
• Veículos poluentes: até **18%**
• Extração de recursos naturais (petróleo, gás, minérios)

**Objetivo:** Desestimular consumo de produtos nocivos à saúde e ao meio ambiente.
**Início:** 2027`,

  "cashback": `O **Cashback Tributário** é um mecanismo de devolução de impostos para famílias de baixa renda.

**Como funciona (LC 214/2025):**
• Devolução automática de parte do IBS e CBS pagos
• Público-alvo: famílias inscritas no CadÚnico
• Produtos essenciais: devolução de **100%** do CBS e **20%** do IBS
• Demais bens e serviços: devolução de **20%** do CBS
• Crédito direto em conta ou via PIX

Estima-se que beneficiará cerca de **70 milhões de brasileiros**.`,

  "transicao": `A **transição** da Reforma Tributária (LC 214/2025) ocorrerá entre 2026 e 2033.

**Cronograma oficial:**
• **2026:** CBS (0,9%) + IBS (0,1%) - fase de teste
• **2027:** Início do Imposto Seletivo, CBS e IBS aumentam
• **2028:** Alíquotas continuam subindo
• **2029-2032:** Redução progressiva de ICMS, ISS, PIS e COFINS
• **2033:** Extinção completa dos tributos antigos

**Alíquota plena combinada:** Entre **26,5% e 28%** (IBS + CBS)

Durante a transição, empresas operarão com os dois sistemas simultaneamente.`,

  "simples": `O **Simples Nacional** será mantido após a reforma!

**O que muda (LC 214/2025):**
• Opção de recolher IBS e CBS por fora do Simples
• Possibilidade de transferir créditos para compradores
• Vantagem para quem vende para outras empresas (PJ)

**MEI:** Mantém tratamento diferenciado e favorecido.

**Dica:** Analise qual regime é mais vantajoso para seu perfil de clientes.`,

  "cesta_basica": `A **Cesta Básica Nacional** terá tratamento especial (LC 214/2025).

**Isenção total (alíquota 0%):**
• Arroz, feijão, leite
• Carnes, ovos, peixes
• Frutas, verduras, legumes
• Pão, farinha de trigo, café
• Óleo de cozinha, manteiga
• Açúcar, sal

**Alíquota reduzida (60% de desconto):**
• Outros alimentos não essenciais

Esta é uma das maiores conquistas sociais da reforma!`,

  "profissionais_liberais": `**Profissionais liberais** terão regime especial (LC 214/2025).

**Categorias beneficiadas:**
• Advogados, médicos, contadores
• Engenheiros, arquitetos, psicólogos
• Dentistas, veterinários, fisioterapeutas

**Benefícios:**
• Alíquota reduzida de **30%** sobre a alíquota padrão
• Regime simplificado de apuração
• Possibilidade de creditar insumos

**Atenção:** A redução se aplica a serviços prestados a pessoas físicas.`,

  "default": `Olá! Sou o assistente **AtentAI**, especializado na Reforma Tributária de 2026. 🇧🇷

Posso te ajudar com informações sobre:
• **IBS e CBS** - Os novos tributos
• **Imposto Seletivo (IS)** - O "imposto do pecado"
• **Cashback Tributário** - Devolução para baixa renda
• **Cronograma de Transição** - De 2026 a 2033
• **Simples Nacional** - Impactos para MEI e PMEs
• **Cesta Básica** - Alimentos isentos
• **Profissionais Liberais** - Regime especial

Digite sua pergunta para começar!`
};

const findAnswer = (question: string): string => {
  const q = question.toLowerCase();
  
  if (q.includes("ibs") || q.includes("icms") || q.includes("iss")) {
    return knowledgeBase["ibs"];
  }
  if (q.includes("cbs") || q.includes("pis") || q.includes("cofins")) {
    return knowledgeBase["cbs"];
  }
  if (q.includes("seletivo") || q.includes("pecado") || q.includes("cigarro") || q.includes("bebida")) {
    return knowledgeBase["is"];
  }
  if (q.includes("cashback") || q.includes("devolução") || q.includes("baixa renda")) {
    return knowledgeBase["cashback"];
  }
  if (q.includes("transição") || q.includes("cronograma") || q.includes("quando") || q.includes("2026") || q.includes("2033")) {
    return knowledgeBase["transicao"];
  }
  if (q.includes("simples") || q.includes("mei") || q.includes("pequena empresa")) {
    return knowledgeBase["simples"];
  }
  if (q.includes("cesta") || q.includes("alimento") || q.includes("comida") || q.includes("isento")) {
    return knowledgeBase["cesta_basica"];
  }
  if (q.includes("profissional") || q.includes("advogado") || q.includes("médico") || q.includes("contador") || q.includes("liberal")) {
    return knowledgeBase["profissionais_liberais"];
  }
  if (q.includes("olá") || q.includes("oi") || q.includes("ajuda") || q.includes("ola") || q.includes("começar")) {
    return knowledgeBase["default"];
  }
  
  return `Entendi sua pergunta sobre "${question}".

Com base na Reforma Tributária de 2026, posso informar que os principais pontos são:

1. **Unificação de tributos:** ICMS + ISS → IBS | PIS + COFINS → CBS
2. **Alíquota padrão:** Aproximadamente 26,5% (IBS 17,7% + CBS 8,8%)
3. **Não-cumulatividade:** Crédito amplo em toda a cadeia

Para uma análise específica do seu caso, recomendo:
• Use nosso **Simulador** para ver o impacto nos seus impostos
• Consulte um **Contador Especializado** para planejamento tributário

Posso ajudar com mais alguma dúvida específica?`;
};

export function AISection() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: knowledgeBase["default"] }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPremium = subscription.subscribed && subscription.plan === 'premium';
  const plan = STRIPE_PLANS.premium;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simula tempo de resposta
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const answer = findAnswer(input);
    const assistantMessage: Message = { role: "assistant", content: answer };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Faça login primeiro",
        description: "Você precisa estar logado para assinar o plano premium",
      });
      navigate('/auth');
      return;
    }

    setIsCheckingOut(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao iniciar checkout',
        description: error.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const features = [
    "Perguntas ilimitadas",
    "Respostas detalhadas",
    "Base atualizada 2024",
    "Suporte prioritário",
  ];

  return (
    <section id="ai" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <MessageCircle className="w-4 h-4" />
              Consulta com IA
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
              Tire Suas Dúvidas
              <span className="gradient-text"> Instantaneamente</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              O AtentAI foi treinado com toda a legislação da Reforma Tributária. 
              Pergunte qualquer coisa sobre IBS, CBS, IS, transição e muito mais.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <Card variant="elevated" className="lg:col-span-2 flex flex-col h-[600px]">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AtentAI</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Online • Pronta para ajudar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === "user" ? "bg-primary" : "bg-muted"
                      }`}>
                        {msg.role === "user" ? (
                          <User className="w-4 h-4 text-primary-foreground" />
                        ) : (
                          <Bot className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-muted rounded-tl-sm"
                      }`}>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                              return <strong key={i}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-card">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Digite sua pergunta sobre a reforma..."
                      className="flex-1 h-12"
                      disabled={isTyping}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="h-12 w-12"
                      disabled={!input.trim() || isTyping}
                    >
                      {isTyping ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Premium Card */}
            <Card variant="premium" className="h-fit">
              <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-4 shadow-gold">
                  <Sparkles className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>AtentAI Premium</CardTitle>
                <CardDescription>
                  Desbloqueie todo o potencial do AtentAI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <p>Usuários gratuitos: <strong>{DAILY_QUESTION_LIMIT} perguntas/dia</strong></p>
                  <p>Premium: <strong>Perguntas ilimitadas</strong></p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  
                  {isPremium ? (
                    <Button variant="success" className="w-full" disabled>
                      <CheckCircle className="w-4 h-4" />
                      Acesso Ativo
                    </Button>
                  ) : (
                    <Button 
                      variant="accent" 
                      className="w-full"
                      onClick={handlePurchase}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      {isCheckingOut ? 'Processando...' : 'Desbloquear Agora'}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Cancele a qualquer momento. Sem compromisso.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
