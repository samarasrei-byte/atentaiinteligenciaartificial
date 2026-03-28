import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ArrowRight, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_LINK = `https://wa.me/5511985214895?text=${encodeURIComponent("Vim limpar o meu nome através do AtentAI")}`;

type Message = {
  id: number;
  role: "samara" | "user" | "system";
  text: string;
  options?: string[];
  isWhatsappCTA?: boolean;
};

const FLOW: {
  samaraText: string;
  options?: string[];
  followUp?: Record<string, string>;
}[] = [
  {
    samaraText: "Oi! Eu sou a Samara, assistente virtual da AtentAI 💚 Tô aqui pra te ajudar a entender se o seu nome pode ser limpo pela lei. Posso te fazer algumas perguntas rápidas?",
    options: ["Sim, pode perguntar!", "Tenho uma dúvida antes"],
  },
  {
    samaraText: "Seu nome está negativado em algum órgão como SPC, Serasa ou outro bureau de crédito?",
    options: ["Sim, está negativado", "Não tenho certeza", "Sim, em mais de um"],
  },
  {
    samaraText: "Entendi! E essa negativação é de pessoa física (CPF) ou pessoa jurídica (CNPJ)?",
    options: ["CPF (Pessoa Física)", "CNPJ (Pessoa Jurídica)", "Os dois"],
  },
  {
    samaraText: "Você sabe há quanto tempo o seu nome está negativado?",
    options: ["Menos de 1 ano", "1 a 3 anos", "Mais de 3 anos", "Não sei ao certo"],
  },
  {
    samaraText: "Perfeito! Sabia que muitas negativações no Brasil possuem irregularidades? 🤔 A lei protege o consumidor e é possível buscar a remoção mesmo sem quitar a dívida toda. Quer saber como funciona?",
    options: ["Sim, quero saber!", "Isso é realmente legal?"],
    followUp: {
      "Isso é realmente legal?": "100% legal! Utilizamos mecanismos previstos no Código de Defesa do Consumidor (CDC), Lei do Superendividamento e jurisprudências consolidadas nos tribunais brasileiros. Nada de milagre, é direito seu! 💪",
    },
  },
  {
    samaraText: "Funciona assim:\n\n✅ **Passo 1** — Você envia seus dados básicos pelo WhatsApp\n✅ **Passo 2** — Nossa equipe jurídica analisa cada negativação\n✅ **Passo 3** — Você recebe o parecer com as possibilidades reais\n✅ **Passo 4** — Acompanhamos todo o processo até a resolução\n\nO investimento é de **R$ 840,00** (ou entrada de R$ 500 + 4x R$ 85). E se não houver viabilidade, você é informado antes de qualquer cobrança!",
    options: ["Quero começar agora!", "Quanto tempo leva?", "Funciona pra CNPJ?"],
    followUp: {
      "Quanto tempo leva?": "A análise inicial é feita em até 48h úteis. O prazo total depende da complexidade do caso, mas mantemos você informado em cada etapa! ⏱️",
      "Funciona pra CNPJ?": "Sim! Atendemos tanto CPF quanto CNPJ em todo o território nacional. Já ajudamos diversas empresas a regularizarem sua situação! 🏢",
    },
  },
];

const FINAL_MESSAGE = "Que ótimo! Você tá no caminho certo pra regularizar sua situação! 🎉\n\nAgora o próximo passo é falar diretamente com o **Guilherme Mesquita**, nosso especialista em regularização jurídica. Ele vai analisar seu caso pessoalmente.\n\nClica no botão abaixo pra falar com ele agora no WhatsApp! 👇";

export default function SamaraChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [pendingFollowUp, setPendingFollowUp] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addSamaraMessage = (text: string, options?: string[], isWhatsappCTA = false) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "samara",
          text,
          options,
          isWhatsappCTA,
        },
      ]);
    }, 800 + Math.random() * 700);
  };

  const startChat = () => {
    setStarted(true);
    const step = FLOW[0];
    addSamaraMessage(step.samaraText, step.options);
  };

  const handleOptionClick = (option: string) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: option },
    ]);

    const step = FLOW[currentStep];

    // Check if there's a follow-up for this option
    if (step.followUp && step.followUp[option]) {
      setPendingFollowUp(option);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: "samara", text: step.followUp![option] },
        ]);
        // After follow-up, show the next step or final
        setTimeout(() => {
          const nextStep = currentStep + 1;
          if (nextStep < FLOW.length) {
            setCurrentStep(nextStep);
            addSamaraMessage(FLOW[nextStep].samaraText, FLOW[nextStep].options);
          } else {
            addSamaraMessage(FINAL_MESSAGE, undefined, true);
          }
        }, 500);
      }, 1000);
      return;
    }

    // Move to next step
    const nextStep = currentStep + 1;
    if (nextStep < FLOW.length) {
      setCurrentStep(nextStep);
      addSamaraMessage(FLOW[nextStep].samaraText, FLOW[nextStep].options);
    } else {
      // Final message
      addSamaraMessage(FINAL_MESSAGE, undefined, true);
    }
  };

  const renderMessageText = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="text-white font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
      return (
        <span key={i}>
          {i > 0 && <br />}
          {parts}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        ref={containerRef}
        className="rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-sm overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.08)]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-white/[0.06] bg-emerald-500/[0.06]">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#030712]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Samara</p>
            <p className="text-emerald-400/70 text-xs">Assistente AtentAI • Online agora</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="h-[400px] sm:h-[450px] overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scrollbar-thin">
          {!started ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg mb-1">Tire suas dúvidas agora!</p>
                <p className="text-white/40 text-sm max-w-xs">
                  Converse com a Samara e descubra se seu nome pode ser regularizado
                </p>
              </div>
              <Button
                onClick={startChat}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-5 rounded-xl text-sm uppercase tracking-wider"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Iniciar conversa
              </Button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] ${msg.role === "user" ? "" : "flex gap-2.5"}`}>
                      {msg.role === "samara" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 mt-1">
                          <Sparkles className="w-4 h-4 text-black" />
                        </div>
                      )}
                      <div>
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-emerald-500 text-black font-medium rounded-br-md"
                              : "bg-white/[0.06] text-white/80 border border-white/[0.06] rounded-bl-md"
                          }`}
                        >
                          {renderMessageText(msg.text)}
                        </div>

                        {/* Options */}
                        {msg.options && msg.id === messages[messages.length - 1]?.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap gap-2 mt-3"
                          >
                            {msg.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => handleOptionClick(opt)}
                                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs sm:text-sm font-medium hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 text-left"
                              >
                                {opt}
                              </button>
                            ))}
                          </motion.div>
                        )}

                        {/* WhatsApp CTA */}
                        {msg.isWhatsappCTA && msg.id === messages[messages.length - 1]?.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4"
                          >
                            <a
                              href={WHATSAPP_LINK}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block w-full"
                            >
                              <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-xl text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Falar com Guilherme agora
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </a>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-black" />
                    </div>
                    <div className="px-5 py-3.5 rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/[0.06]">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
