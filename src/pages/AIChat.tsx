import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDailyQuestionLimit } from '@/hooks/useDailyQuestionLimit';
import { DAILY_QUESTION_LIMIT } from '@/lib/stripe';
import { 
  Brain, 
  Send, 
  ArrowLeft, 
  Loader2,
  User,
  Bot,
  Lock,
  Crown,
  AlertCircle
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const AIChat = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, subscription } = useAuth();
  const { toast } = useToast();
  const { questionsUsed, questionsRemaining, canAsk, isPremium, loading: limitLoading, incrementUsage, refreshUsage } = useDailyQuestionLimit();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    const { data } = await supabase
      .from('ai_chat_messages')
      .select('role, content')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (data) {
      setMessages(data as Message[]);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    await supabase.from('ai_chat_messages').insert({
      user_id: user!.id,
      role,
      content,
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check daily limit for non-premium users
    if (!isPremium && !canAsk) {
      toast({
        variant: 'destructive',
        title: 'Limite diário atingido',
        description: `Você usou todas as ${DAILY_QUESTION_LIMIT} perguntas de hoje. Assine o Premium para perguntas ilimitadas.`,
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    await saveMessage('user', userMessage);

    // Increment usage for non-premium users
    if (!isPremium) {
      await incrementUsage();
    }
    
    setIsLoading(true);
    let assistantContent = '';

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Erro ao processar mensagem');
      }

      if (!response.body) {
        throw new Error('Resposta vazia');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }

      if (assistantContent) {
        await saveMessage('assistant', assistantContent);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao enviar mensagem',
      });
      // Remove the last assistant message if there was an error
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/plano/atento-ai');
  };

  if (authLoading || limitLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-teal-400" />
              <span className="text-xl font-bold text-white">Atento AI</span>
            </div>
          </div>

          {/* Usage Badge */}
          <div className="flex items-center gap-3">
            {isPremium ? (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-slate-300 border-slate-600 ${questionsRemaining === 0 ? 'border-red-500 text-red-400' : ''}`}>
                  {questionsRemaining}/{DAILY_QUESTION_LIMIT} perguntas restantes
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUpgrade}
                  className="text-teal-400 hover:text-teal-300"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Limit Warning */}
      {!isPremium && questionsRemaining <= 2 && questionsRemaining > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Você tem apenas {questionsRemaining} pergunta{questionsRemaining !== 1 ? 's' : ''} restante{questionsRemaining !== 1 ? 's' : ''} hoje</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpgrade}
              className="text-amber-400 hover:text-amber-300"
            >
              Fazer Upgrade
            </Button>
          </div>
        </div>
      )}

      {/* Limit Reached Warning */}
      {!isPremium && questionsRemaining === 0 && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Limite diário atingido. Assine o Premium para continuar.</span>
            </div>
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-teal-500 to-cyan-500"
            >
              Desbloquear Perguntas Ilimitadas
            </Button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-4xl">
        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-teal-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Olá! Sou o Atento AI
                </h3>
                <p className="text-slate-400 max-w-lg mx-auto mb-6">
                  Sou especialista em legislação tributária brasileira. Posso ajudar com a Reforma Tributária 2026,
                  regimes tributários, planejamento fiscal, obrigações acessórias e muito mais!
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {[
                    "Qual a diferença entre IBS e CBS na reforma tributária?",
                    "Como funciona o Simples Nacional para prestadores de serviço?",
                    "Quando começa a transição para o novo sistema tributário?",
                    "Minha empresa de tecnologia vai pagar mais ou menos impostos?",
                    "O que é o Imposto Seletivo e quais produtos são afetados?",
                    "Como calcular o impacto da reforma para o comércio?"
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(suggestion); }}
                      disabled={!canAsk && !isPremium}
                      className="text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-teal-500/50 transition-all text-sm text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-slate-700 rounded-2xl px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-700 pt-4">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={canAsk || isPremium ? "Digite sua pergunta sobre a Reforma Tributária..." : "Limite diário atingido. Faça upgrade para continuar."}
              className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              disabled={isLoading || (!canAsk && !isPremium)}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || (!canAsk && !isPremium)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
