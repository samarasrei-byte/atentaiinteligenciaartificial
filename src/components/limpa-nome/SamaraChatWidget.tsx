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
    samaraText: "Oii! 😊 Eu sou a Samara, tô aqui pela AtentAI pra te ajudar a entender direitinho a sua situação. Relaxa que é tudo bem simples, tá? Posso te fazer umas perguntinhas rápidas?",
    options: ["Sim, pode perguntar!", "Tenho uma dúvida antes"],
    followUp: {
      "Tenho uma dúvida antes": "Claro! Pode mandar sua dúvida que eu respondo. Mas já adianto: aqui a gente trabalha 100% dentro da lei, usando o Código de Defesa do Consumidor pra proteger você. Nada de milagre, é direito seu mesmo! 💪 Bora continuar?",
    },
  },
  {
    samaraText: "Então me conta... seu nome tá negativado em algum lugar? Tipo Serasa, SPC, ou outro bureau de crédito?",
    options: ["Sim, tá negativado", "Não tenho certeza", "Sim, em mais de um"],
    followUp: {
      "Não tenho certeza": "Sem problema! Muita gente nem sabe que tá com o nome sujo. O Guilherme consegue verificar isso pra você rapidinho. Bora continuar pra eu entender melhor o seu caso? 😉",
    },
  },
  {
    samaraText: "Entendi! E essa negativação é no seu CPF pessoal ou de alguma empresa (CNPJ)?",
    options: ["CPF (Pessoa Física)", "CNPJ (Pessoa Jurídica)", "Os dois"],
  },
  {
    samaraText: "E você lembra mais ou menos há quanto tempo seu nome ficou negativado? Não precisa ser exato não 😄",
    options: ["Menos de 1 ano", "1 a 3 anos", "Mais de 3 anos", "Não sei ao certo"],
  },
  {
    samaraText: "Sabia que grande parte das negativações no Brasil tem alguma irregularidade? 🤔 A lei protege o consumidor e, em muitos casos, é possível limpar o nome mesmo sem pagar a dívida toda. Quer entender como funciona na prática?",
    options: ["Sim, quero entender!", "Isso é realmente legal?"],
    followUp: {
      "Isso é realmente legal?": "Total! 😊 A gente usa mecanismos do Código de Defesa do Consumidor, da Lei do Superendividamento e jurisprudências que os tribunais já consolidaram. É o seu direito, a gente só te ajuda a exercer ele! Bora ver como funciona? 💪",
    },
  },
  {
    samaraText: "Funciona assim, ó:\n\n✅ Você manda seus dados pelo WhatsApp pro Guilherme\n✅ A equipe jurídica analisa cada negativação sua\n✅ Você recebe o parecer com as possibilidades reais\n✅ A gente acompanha tudo até resolver!\n\nO investimento é de **R$ 840,00** (ou entrada de R$ 500 + 4x de R$ 85). E o melhor: se não tiver viabilidade, você fica sabendo antes de pagar qualquer coisa! 🙌",
    options: ["Quero começar agora!", "Quanto tempo leva?", "Funciona pra CNPJ?"],
    followUp: {
      "Quanto tempo leva?": "A análise inicial sai em até 48h úteis! O prazo total depende do caso, mas pode ficar tranquilo que a gente te mantém informado em cada etapa. Sem surpresas! ⏱️",
      "Funciona pra CNPJ?": "Funciona sim! 🏢 A gente atende CPF e CNPJ em todo o Brasil. Já ajudamos várias empresas a saírem do sufoco!",
    },
  },
];

const FINAL_MESSAGE = "Que massa! 🎉 Você tá tomando a melhor decisão pra regularizar sua vida financeira!\n\nAgora o próximo passo é falar diretamente com o **Guilherme Mesquita**, nosso especialista. Ele vai analisar o seu caso pessoalmente e te orientar.\n\nClica no botão aqui embaixo pra falar com ele agora no WhatsApp! 👇";



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
    const delay = 1200 + Math.random() * 1000 + text.length * 8;
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
    }, Math.min(delay, 3500));
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
