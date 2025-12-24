import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bot, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  User,
  Minimize2,
  Maximize2,
  MessageCircle,
  Brain,
  TrendingUp,
  Calculator,
  Users,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FloatingAIAgentProps {
  /** Context type determines the AI's persona and suggestions */
  context: 'autonomo' | 'empresa' | 'contador' | 'admin' | 'landing';
  /** Optional custom system prompt addition */
  customContext?: string;
}

const CONTEXT_CONFIG = {
  autonomo: {
    title: 'Assistente do Autônomo',
    subtitle: 'Reforma Tributária 2026',
    icon: User,
    gradient: 'from-cyan-500 to-teal-500',
    welcomeMessage: 'Olá! Sou seu assistente especializado em tributação para autônomos. Posso te ajudar com:\n\n- Comparação MEI x ME x PF\n- Cálculo de INSS e IR\n- Reforma Tributária 2026\n- Quando formalizar?\n\nComo posso te ajudar hoje?',
    quickPrompts: [
      'Devo virar MEI?',
      'Quanto pago de INSS?',
      'O que muda em 2026?',
      'PF ou PJ, qual melhor?'
    ],
    systemPrompt: `Você é um assistente tributário especializado em AUTÔNOMOS e profissionais liberais.

FOCO:
- Comparação PF x MEI x ME para autônomos
- Cálculo simplificado de INSS e IR
- Formalização e abertura de empresa
- Impactos da Reforma Tributária 2026 para autônomos

REGRAS:
- Use linguagem MUITO simples, autônomos geralmente são leigos
- Dê exemplos práticos com valores
- Seja direto e objetivo
- Sugira quando procurar contador
- Sempre mencione valores aproximados quando possível`
  },
  empresa: {
    title: 'Assistente Empresarial',
    subtitle: 'Simulador Tributário',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-green-500',
    welcomeMessage: 'Olá! Sou seu assistente para empresas. Posso te ajudar com:\n\n- Simples Nacional x Lucro Presumido x Real\n- Impacto da Reforma Tributária\n- Cálculo de IBS, CBS e IS\n- Economia tributária\n\nQual sua dúvida?',
    quickPrompts: [
      'Simples ou Presumido?',
      'O que é IBS e CBS?',
      'Quanto vou economizar?',
      'Melhor regime para mim'
    ],
    systemPrompt: `Você é um assistente tributário especializado em EMPRESAS.

FOCO:
- Comparação Simples Nacional x Lucro Presumido x Lucro Real
- Reforma Tributária: IBS (17,7%), CBS (8,8%), IS
- Cálculo de economia entre regimes
- Transição 2026-2033

REGRAS:
- Responda com base nos dados da empresa quando disponíveis
- Cite valores e alíquotas
- Explique impactos práticos
- Recomende simulações específicas`
  },
  contador: {
    title: 'Assistente do Contador',
    subtitle: 'LC 214/2025',
    icon: Calculator,
    gradient: 'from-purple-500 to-violet-500',
    welcomeMessage: 'Olá! Sou seu assistente técnico para contadores. Posso ajudar com:\n\n- Detalhes da LC 214/2025\n- Cálculos de IBS, CBS e IS\n- Cronograma de transição\n- Split payment e não-cumulatividade\n\nQual sua dúvida técnica?',
    quickPrompts: [
      'Cronograma transição',
      'Split payment',
      'Não-cumulatividade',
      'Alíquotas por setor'
    ],
    systemPrompt: `Você é um assistente TÉCNICO para CONTADORES sobre a Reforma Tributária.

CONHECIMENTO TÉCNICO (LC 214/2025):
- IBS: 17,7% (estadual/municipal, substitui ICMS/ISS)
- CBS: 8,8% (federal, substitui PIS/COFINS)
- IS: Imposto Seletivo sobre produtos nocivos
- Transição: 2026 (teste) → 2033 (pleno)
- Split payment: recolhimento automático na NF
- Não-cumulatividade plena

REGRAS:
- Use linguagem técnica
- Cite artigos da LC quando relevante
- Seja preciso com alíquotas e prazos
- Aborde aspectos contábeis e fiscais`
  },
  admin: {
    title: 'Assistente Analytics',
    subtitle: 'Gestão da Plataforma',
    icon: BarChart3,
    gradient: 'from-orange-500 to-amber-500',
    welcomeMessage: 'Olá, Admin! Posso te ajudar a analisar:\n\n- Crescimento de usuários\n- Métricas de engajamento\n- Simulações realizadas\n- Performance da plataforma\n\nO que deseja analisar?',
    quickPrompts: [
      'Usuários ativos',
      'Taxa de conversão',
      'Simulações por dia',
      'Tendências de uso'
    ],
    systemPrompt: `Você é um assistente de ANALYTICS para administradores da plataforma AtentAI.

FOCO:
- Análise de métricas de usuários
- Indicadores de crescimento
- Sugestões de melhorias
- Insights de uso da plataforma

REGRAS:
- Foque em métricas actionable
- Sugira melhorias baseadas em dados
- Identifique oportunidades de crescimento
- Seja estratégico nas recomendações`
  },
  landing: {
    title: 'Assistente AtentAI',
    subtitle: 'Reforma Tributária 2026',
    icon: Brain,
    gradient: 'from-teal-500 to-cyan-500',
    welcomeMessage: 'Olá! Sou a IA da AtentAI, especialista na Reforma Tributária 2026.\n\n🔹 Sabia que o regime errado pode tirar até 27% do seu lucro?\n\nPosso te ajudar a entender:\n- O que muda em 2026?\n- Qual o melhor regime para você?\n- Quanto você pode economizar?\n\nPergunta o que quiser!',
    quickPrompts: [
      'O que muda em 2026?',
      'Quanto posso economizar?',
      'Sou autônomo, e agora?',
      'Comparar regimes'
    ],
    systemPrompt: `Você é o assistente de IA da AtentAI na página inicial.

OBJETIVO:
- Engajar visitantes sobre a Reforma Tributária
- Mostrar valor da plataforma
- Responder dúvidas básicas
- Incentivar cadastro/simulação

DADOS IMPORTANTES:
- Regime errado pode custar até 27% do lucro
- Reforma entra em vigor em 2026
- IBS + CBS = 26,5% (alíquota de referência)
- Transição gradual até 2033

REGRAS:
- Seja amigável e acessível
- Use linguagem simples
- Desperte interesse na plataforma
- Sugira experimentar o simulador gratuito`
  }
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`;

export const FloatingAIAgent: React.FC<FloatingAIAgentProps> = ({ 
  context, 
  customContext 
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = CONTEXT_CONFIG[context];
  const IconComponent = config.icon;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
          customContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar mensagem');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro. Tente novamente em instantes.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl",
            `bg-gradient-to-br ${config.gradient}`,
            "hover:scale-110 transition-all duration-300",
            "group relative overflow-hidden"
          )}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Bot className="h-6 w-6 text-white relative z-10" />
          
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full animate-ping bg-white/30" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-foreground text-background px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            <span>Fale com a IA</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className={cn(
        "shadow-2xl border-2 transition-all duration-300 overflow-hidden",
        isMinimized ? "w-72" : "w-96 sm:w-[420px]",
        `border-t-4 border-t-${context === 'autonomo' ? 'cyan' : context === 'empresa' ? 'emerald' : context === 'contador' ? 'purple' : context === 'admin' ? 'orange' : 'teal'}-500`
      )}>
        {/* Header */}
        <CardHeader className={cn(
          "py-3 px-4",
          `bg-gradient-to-r ${config.gradient}`
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-white">
                  {config.title}
                </CardTitle>
                <p className="text-xs text-white/80">{config.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-80 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="space-y-4">
                  {/* Welcome message */}
                  <div className="flex gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      `bg-gradient-to-br ${config.gradient}`
                    )}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-foreground whitespace-pre-line">
                        {config.welcomeMessage}
                      </p>
                    </div>
                  </div>

                  {/* Quick prompts */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {config.quickPrompts.map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleQuickPrompt(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex gap-3",
                        msg.role === 'user' && "justify-end"
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                          `bg-gradient-to-br ${config.gradient}`
                        )}>
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        "rounded-2xl px-4 py-3 max-w-[85%]",
                        msg.role === 'user' 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted text-foreground rounded-tl-none"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        `bg-gradient-to-br ${config.gradient}`
                      )}>
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-muted/30">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  className="flex-1 bg-background"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    `bg-gradient-to-r ${config.gradient}`,
                    "hover:opacity-90"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                IA especializada na Reforma Tributária LC 214/2025
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default FloatingAIAgent;
