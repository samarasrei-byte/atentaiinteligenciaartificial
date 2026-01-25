import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, Loader2, Lock, Sparkles, CheckCircle, Shield, Zap, Brain, Target } from "lucide-react";
import { motion } from "framer-motion";
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
  "ibs": `O IBS (Imposto sobre Bens e Serviços) é um tributo que unificará o ICMS (estadual) e o ISS (municipal).

Características principais (LC 214/2025):
- Alíquota de referência: 17,7%
- Cobrança no destino (onde o consumo ocorre)
- Não-cumulatividade plena (crédito amplo)
- Gestão pelo Comitê Gestor do IBS

Transição: Será implementado gradualmente de 2026 a 2033.
- 2026: 0,1% (fase de teste)
- 2027-2028: Aumento gradual
- 2029-2032: Redução progressiva do ICMS/ISS
- 2033: Extinção completa dos tributos antigos`,

  "cbs": `A CBS (Contribuição sobre Bens e Serviços) substituirá o PIS e a COFINS.

Características principais (LC 214/2025):
- Alíquota de referência: 8,8%
- Tributo federal
- Não-cumulatividade plena
- Base de cálculo ampla

Início: A CBS terá alíquota de 0,9% em 2026 (fase de teste).
A partir de 2027, será implementada gradualmente até atingir a alíquota plena.`,

  "is": `O IS (Imposto Seletivo) é conhecido como "imposto do pecado".

Incidirá sobre (LC 214/2025):
- Cigarros e produtos de tabaco: até 32%
- Bebidas alcoólicas: até 25%
- Bebidas açucaradas
- Veículos poluentes: até 18%
- Extração de recursos naturais (petróleo, gás, minérios)

Objetivo: Desestimular consumo de produtos nocivos à saúde e ao meio ambiente.
Início: 2027`,

  "cashback": `O Cashback Tributário é um mecanismo de devolução de impostos para famílias de baixa renda.

Como funciona (LC 214/2025):
- Devolução automática de parte do IBS e CBS pagos
- Público-alvo: famílias inscritas no CadÚnico
- Produtos essenciais: devolução de 100% do CBS e 20% do IBS
- Demais bens e serviços: devolução de 20% do CBS
- Crédito direto em conta ou via PIX

Estima-se que beneficiará cerca de 70 milhões de brasileiros.`,

  "transicao": `A transição da Reforma Tributária (LC 214/2025) ocorrerá entre 2026 e 2033.

Cronograma oficial:
- 2026: CBS (0,9%) + IBS (0,1%) - fase de teste
- 2027: Início do Imposto Seletivo, CBS e IBS aumentam
- 2028: Alíquotas continuam subindo
- 2029-2032: Redução progressiva de ICMS, ISS, PIS e COFINS
- 2033: Extinção completa dos tributos antigos

Alíquota plena combinada: Entre 26,5% e 28% (IBS + CBS)

Durante a transição, empresas operarão com os dois sistemas simultaneamente.`,

  "simples": `O Simples Nacional será mantido após a reforma!

O que muda (LC 214/2025):
- Opção de recolher IBS e CBS por fora do Simples
- Possibilidade de transferir créditos para compradores
- Vantagem para quem vende para outras empresas (PJ)

MEI: Mantém tratamento diferenciado e favorecido.

Dica: Analise qual regime é mais vantajoso para seu perfil de clientes.`,

  "cesta_basica": `A Cesta Básica Nacional terá tratamento especial (LC 214/2025).

Isenção total (alíquota 0%):
- Arroz, feijão, leite
- Carnes, ovos, peixes
- Frutas, verduras, legumes
- Pão, farinha de trigo, café
- Óleo de cozinha, manteiga
- Açúcar, sal

Alíquota reduzida (60% de desconto):
- Outros alimentos não essenciais

Esta é uma das maiores conquistas sociais da reforma!`,

  "profissionais_liberais": `Profissionais liberais terão regime especial (LC 214/2025).

Categorias beneficiadas:
- Advogados, médicos, contadores
- Engenheiros, arquitetos, psicólogos
- Dentistas, veterinários, fisioterapeutas

Benefícios:
- Alíquota reduzida de 30% sobre a alíquota padrão
- Regime simplificado de apuração
- Possibilidade de creditar insumos

Atenção: A redução se aplica a serviços prestados a pessoas físicas.`,

  "default": `Olá! Sou o assistente AtentAI, especializado na Reforma Tributária de 2026.

Posso te ajudar com informações sobre:
- IBS e CBS - Os novos tributos
- Imposto Seletivo (IS) - O "imposto do pecado"
- Cashback Tributário - Devolução para baixa renda
- Cronograma de Transição - De 2026 a 2033
- Simples Nacional - Impactos para MEI e PMEs
- Cesta Básica - Alimentos isentos
- Profissionais Liberais - Regime especial

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

1. Unificação de tributos: ICMS + ISS → IBS | PIS + COFINS → CBS
2. Alíquota padrão: Aproximadamente 26,5% (IBS 17,7% + CBS 8,8%)
3. Não-cumulatividade: Crédito amplo em toda a cadeia

Para uma análise específica do seu caso, recomendo:
- Use nosso Simulador para ver o impacto nos seus impostos
- Consulte um Contador Especializado para planejamento tributário

Posso ajudar com mais alguma dúvida específica?`;
};

const howItWorks = [
  {
    icon: Brain,
    step: "1",
    title: "IA Treinada",
    description: "Nossa IA foi treinada com toda a legislação da Reforma Tributária 2026 (LC 214/2025)"
  },
  {
    icon: Target,
    step: "2",
    title: "Contexto Personalizado",
    description: "Após login, a IA entende seu perfil (autônomo, empresa ou contador) e adapta as respostas"
  },
  {
    icon: Zap,
    step: "3",
    title: "Respostas Instantâneas",
    description: "Tire dúvidas sobre IBS, CBS, IS, Simples Nacional, transição e muito mais em segundos"
  },
  {
    icon: Shield,
    step: "4",
    title: "Dados Seguros",
    description: "Seus dados e conversas são protegidos. A IA não armazena informações sensíveis"
  }
];

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
    <section id="ai" className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-violet-950 via-slate-950 to-fuchsia-950">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Neural network pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_60%)]" />
        
        {/* Animated particles */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-violet-400 rounded-full"
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-fuchsia-400 rounded-full"
          animate={{ 
            y: [0, 40, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full"
          animate={{ 
            x: [0, 20, 0],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        />
        
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-12">
            <motion.div 
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-semibold mb-6 backdrop-blur-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              animate={{ 
                boxShadow: ['0 0 20px rgba(168,85,247,0.2)', '0 0 40px rgba(168,85,247,0.4)', '0 0 20px rgba(168,85,247,0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-5 h-5" />
              <span>INTELIGÊNCIA ARTIFICIAL</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-6 tracking-tight px-2">
              <span className="text-white">Seu Assistente Tributário</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Disponível 24h
              </span>
            </h2>
            <p className="text-base md:text-lg text-white/70 max-w-3xl mx-auto px-4 leading-relaxed">
              O <span className="text-violet-400 font-semibold">AtentAI</span> foi treinado com toda a legislação da Reforma Tributária 2026.
              <br className="hidden md:block" />
              Pergunte sobre IBS, CBS, IS e receba <span className="text-fuchsia-400 font-semibold">respostas instantâneas</span>.
            </p>
          </div>

          {/* How It Works - Futuristic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl h-full">
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-xl" />
                  <div className="absolute inset-[1px] rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950/90" />
                  
                  <CardContent className="relative pt-6 pb-4 px-4">
                    <div className="flex items-start gap-3 mb-3">
                      <motion.div 
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <item.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Important Alert - Futuristic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="mb-12 md:mb-16 border-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-transparent to-orange-500/20 opacity-50" />
              <div className="absolute inset-[1px] rounded-lg bg-slate-950/80" />
              
              <CardContent className="relative py-8 px-4 md:px-8">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <motion.div 
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-amber-500/30"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <span className="text-4xl">⚠️</span>
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="text-xl md:text-2xl font-black mb-3 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      O regime tributário errado pode tirar até 27% do seu lucro!
                    </h4>
                    <p className="text-base text-white/70 leading-relaxed">
                      Muitas empresas estão no Simples Nacional sem saber que o Lucro Presumido seria mais vantajoso — ou o contrário. 
                      A <span className="text-amber-400 font-semibold">AtentAI</span> analisa seu enquadramento e mostra qual regime é mais lucrativo.
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    className="whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-amber-500/30 border-0"
                    onClick={() => navigate('/pricing')}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Faça sua Análise
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Chat Interface - White Background */}
            <Card className="lg:col-span-2 flex flex-col h-[450px] md:h-[550px] lg:h-[600px] border-0 bg-white backdrop-blur-xl overflow-hidden relative rounded-3xl shadow-2xl">
              {/* Glowing border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20 blur-sm -z-10" />
              
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-violet-500/10 via-transparent to-fuchsia-500/10 py-4">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/40"
                    animate={{ 
                      boxShadow: ['0 10px 30px rgba(168,85,247,0.4)', '0 10px 50px rgba(236,72,153,0.5)', '0 10px 30px rgba(168,85,247,0.4)']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-slate-900 font-bold">AtentAI</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Demonstração • <span className="text-violet-600 font-medium">Assine para IA completa</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-slate-50">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 md:gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === "user" ? "bg-violet-500" : "bg-slate-200"
                      }`}>
                        {msg.role === "user" ? (
                          <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-600" />
                        )}
                      </div>
                      <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                        msg.role === "user" 
                          ? "bg-violet-500 text-white rounded-tr-sm" 
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                      }`}>
                        <div className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-2 md:gap-3">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-600" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 md:px-4 md:py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 md:p-4 border-t border-slate-200 bg-white">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Digite sua pergunta..."
                      className="flex-1 h-10 md:h-12 text-sm md:text-base bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500"
                      disabled={isTyping}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                      disabled={!input.trim() || isTyping}
                    >
                      {isTyping ? (
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-white" />
                      ) : (
                        <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      )}
                    </Button>
                  </form>
                  <p className="text-[10px] md:text-xs text-slate-500 text-center mt-2">
                    Demonstração com respostas pré-definidas. <button onClick={() => navigate('/pricing')} className="text-violet-600 underline hover:no-underline">Assine para IA completa</button>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Premium Card */}
            <Card variant="premium" className="h-fit bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-violet-500/30">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg md:text-xl text-white">AtentAI Premium</CardTitle>
                <CardDescription className="text-white/80">
                  Desbloqueie todo o potencial do AtentAI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="space-y-2 md:space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-800/50 rounded-lg text-xs md:text-sm text-white/80">
                  <p>Premium: <strong className="text-white">Perguntas ilimitadas</strong></p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl md:text-4xl font-bold text-white">{formatPrice(plan.price)}</span>
                    <span className="text-white/80 text-sm">/mês</span>
                  </div>
                  
                  {isPremium ? (
                    <Button variant="success" className="w-full" disabled>
                      <CheckCircle className="w-4 h-4" />
                      Acesso Ativo
                    </Button>
                  ) : (
                    <Button 
                      variant="accent" 
                      className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
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

                <p className="text-[10px] md:text-xs text-white/80 text-center">
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
