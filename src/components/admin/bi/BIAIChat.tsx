import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  needsApproval?: boolean;
  approved?: boolean;
}

const quickQuestions = [
  { icon: TrendingUp, label: 'Como está o crescimento?', query: 'Qual foi o crescimento de receita no último mês?' },
  { icon: DollarSign, label: 'Receita do mês', query: 'Quanto faturamos este mês?' },
  { icon: Users, label: 'Novos clientes', query: 'Quantos novos clientes entraram esta semana?' },
  { icon: BarChart3, label: 'Serviços mais vendidos', query: 'Quais são os serviços mais vendidos?' },
];

export const BIAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🚨 **A Reforma Tributária já começou!** Com o IBS (17,7%) e CBS (8,8%) entrando em vigor, sua empresa precisa se adaptar.\n\nSou a IA assistente do módulo de Emissão de NF. Posso ajudar você a:\n\n• Analisar o impacto da reforma no seu negócio\n• Consultar dados financeiros e tendências\n• Gerar insights para decisões estratégicas\n\nComo posso ajudar?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (query?: string) => {
    const messageText = query || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Fetch real data to provide context
      const [payments, subscriptions, creditRepair] = await Promise.all([
        supabase.from('payments').select('amount_cents, created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(100),
        supabase.from('subscriptions').select('*').eq('status', 'active'),
        supabase.from('credit_repair_requests').select('id', { count: 'exact', head: true }),
      ]);

      const totalRevenue = payments.data?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;
      const activeSubscriptions = subscriptions.data?.length || 0;
      
      // Generate AI response (mock for now, can be replaced with real AI call)
      let response = '';
      
      if (messageText.toLowerCase().includes('crescimento') || messageText.toLowerCase().includes('receita')) {
        response = `📊 **Análise de Receita**\n\nBaseado nos dados atuais:\n\n• Receita total acumulada: **${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue / 100)}**\n• Assinaturas ativas: **${activeSubscriptions}**\n• Tendência: **↑ Crescimento positivo**\n\n⚠️ *Esta é uma análise automatizada. Recomendo validar com os relatórios detalhados antes de qualquer decisão.*`;
      } else if (messageText.toLowerCase().includes('cliente')) {
        response = `👥 **Análise de Clientes**\n\nDados atualizados:\n\n• Assinaturas ativas: **${activeSubscriptions}**\n• Solicitações Limpa Nome: **${creditRepair.count || 0}**\n\n💡 *Sugestão: Para uma análise mais profunda, considere verificar a aba "Cohort" no painel Analytics.*`;
      } else if (messageText.toLowerCase().includes('serviço') || messageText.toLowerCase().includes('vendido')) {
        response = `🏆 **Serviços Mais Populares**\n\n1. **Limpa Nome** - Alta demanda\n2. **Análise Fiscal** - Crescendo\n3. **Declaração IR** - Sazonal\n\n📈 *O serviço Limpa Nome tem mostrado crescimento consistente. Considere alocar mais recursos para atendimento.*`;
      } else {
        response = `Entendi sua pergunta! Aqui está o que encontrei:\n\n📊 **Dados Gerais:**\n• Receita total: **${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue / 100)}**\n• Assinaturas ativas: **${activeSubscriptions}**\n\n💡 Posso ajudar com análises mais específicas. Tente perguntar sobre:\n- Crescimento de receita\n- Novos clientes\n- Serviços mais vendidos\n- Anomalias ou alertas\n\n*Lembre-se: sou uma assistente IA. Todas as decisões devem ser validadas por você!*`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        needsApproval: true,
        approved: false,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, approved: true } : m
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-600" />
            Chat IA - Consulta de Dados
          </h2>
          <p className="text-sm text-slate-500">Pergunte sobre métricas, tendências e análises em linguagem natural</p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          IA Assistiva - Validação Humana Obrigatória
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <Card className="lg:col-span-3 bg-white border-slate-200 overflow-hidden">
          <CardContent className="p-0 flex flex-col h-[600px] md:h-[600px] max-h-[calc(100vh-220px)]">
            {/* Messages - área de scroll fixa */}
            <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-900 rounded-tl-none'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content.split('**').map((part, i) => 
                            i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                          )}
                        </div>
                      </div>
                      
                      {/* Approval section for AI messages */}
                      {message.role === 'assistant' && message.needsApproval && (
                        <div className="mt-2 flex items-center gap-2">
                          {message.approved ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Validado por César
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-7 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleApprove(message.id)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Validar Análise
                            </Button>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-slate-400 mt-1">
                        {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input - área fixa que não expande */}
            <div className="shrink-0 p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <Input
                  placeholder="Pergunte sobre seus dados financeiros..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 bg-slate-50 border-slate-200"
                />
                <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Questions */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Perguntas Rápidas</CardTitle>
            <CardDescription>Clique para consultar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickQuestions.map((q, index) => {
              const Icon = q.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-3 text-left"
                  onClick={() => handleSend(q.query)}
                  disabled={isLoading}
                >
                  <Icon className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span className="text-sm">{q.label}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
