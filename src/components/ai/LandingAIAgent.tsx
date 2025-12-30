import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  User,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`;

const WELCOME_MESSAGE = `Olá! 👋 Sou o AtentAI, seu assistente especializado na Reforma Tributária 2026.

Posso te ajudar a:
• Calcular quanto você pode economizar
• Explicar o que muda com IBS e CBS
• Descobrir o melhor regime para você
• Tirar dúvidas sobre a LC 214/2025

Como posso ajudar?`;

const QUICK_PROMPTS = [
  { text: 'O que muda em 2026?', icon: TrendingUp },
  { text: 'Quanto vou economizar?', icon: Calculator },
  { text: 'MEI ou ME, qual melhor?', icon: MessageCircle },
];

export const LandingAIAgent: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-open after 8 seconds if user hasn't interacted
  useEffect(() => {
    if (hasInteracted) return;
    
    const timer = setTimeout(() => {
      if (!hasInteracted && !isOpen) {
        setIsOpen(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [hasInteracted, isOpen]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setHasInteracted(true);
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: 'landing',
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
        content: 'Desculpe, ocorreu um erro. Que tal criar uma conta grátis para continuar conversando?' 
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
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
        {/* Attention-grabbing button */}
        <div className="relative">
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full animate-ping bg-accent/40" />
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent to-primary opacity-30 blur animate-pulse" />
          
          <Button
            onClick={() => { setIsOpen(true); setHasInteracted(true); }}
            className={cn(
              "relative h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl",
              "bg-gradient-to-br from-accent via-accent to-orange-500",
              "hover:scale-110 transition-all duration-300",
              "group overflow-hidden"
            )}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-white relative z-10 animate-bounce" />
          </Button>
          
          {/* Tooltip bubble */}
          <div className="absolute bottom-full right-0 mb-3 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-card border border-border shadow-xl rounded-2xl px-4 py-3 max-w-[200px] relative">
              <div className="absolute bottom-0 right-6 w-3 h-3 bg-card border-r border-b border-border transform rotate-45 translate-y-1.5" />
              <p className="text-sm font-medium text-foreground">
                Fale com nossa IA!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tire suas dúvidas agora
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className={cn(
        "shadow-2xl border-2 transition-all duration-300 overflow-hidden",
        "w-[calc(100vw-2rem)] sm:w-96 md:w-[420px]",
        "max-w-[calc(100vw-2rem)]",
        "border-t-4 border-t-accent"
      )}>
        {/* Header */}
        <CardHeader className="py-3 px-4 bg-gradient-to-r from-accent to-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  AtentAI
                  <Sparkles className="h-4 w-4" />
                </CardTitle>
                <p className="text-xs text-white/80">Especialista em Reforma Tributária</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages */}
          <ScrollArea className="h-72 sm:h-80 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="space-y-4">
                {/* Welcome message */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-accent to-orange-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-foreground whitespace-pre-line">
                      {WELCOME_MESSAGE}
                    </p>
                  </div>
                </div>

                {/* Quick prompts */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 gap-2 hover:bg-accent hover:text-accent-foreground transition-colors border-accent/30"
                      onClick={() => handleQuickPrompt(prompt.text)}
                    >
                      <prompt.icon className="h-3.5 w-3.5" />
                      {prompt.text}
                    </Button>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Desbloqueie todo o potencial
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Crie sua conta grátis e acesse simuladores, histórico e muito mais.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-primary hover:bg-primary/90 group"
                    onClick={() => navigate('/comecar')}
                  >
                    Começar Grátis
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
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
                      <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-accent to-orange-500">
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
                    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-accent to-orange-500">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}

                {/* CTA after conversation */}
                {messages.length >= 2 && !isLoading && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-xl border border-accent/20">
                    <p className="text-xs text-foreground mb-2">
                      Gostou? Crie sua conta para continuar e acessar simuladores avançados.
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group"
                      onClick={() => navigate('/comecar')}
                    >
                      Criar Conta Grátis
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
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
                className="flex-1 bg-background text-sm h-10"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 bg-gradient-to-r from-accent to-orange-500 hover:opacity-90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              IA especializada na Reforma Tributária • LC 214/2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
