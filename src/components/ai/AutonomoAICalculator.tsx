import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Send, 
  Loader2,
  Sparkles,
  Calculator,
  TrendingUp,
  User as UserIcon,
  Briefcase,
  Wallet,
  Building2,
  Zap,
  Bot,
  User,
  RefreshCw
} from 'lucide-react';
import { PROFESSIONAL_CATEGORIES } from '@/lib/autonomosData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isCalculation?: boolean;
}

const AUTONOMO_CALCULATION_TYPES = [
  { 
    id: 'pf_vs_mei_vs_me', 
    label: 'PF vs MEI vs ME', 
    icon: TrendingUp, 
    description: 'Compare os três regimes',
    autoPrompt: 'Compare detalhadamente a tributação para um profissional autônomo entre: Pessoa Física (Carnê-Leão), MEI e Microempresa (Simples Nacional). Mostre INSS, IR, ISS e o custo total de cada opção.'
  },
  { 
    id: 'inss_calculation', 
    label: 'Cálculo INSS', 
    icon: Wallet, 
    description: 'Contribuinte individual',
    autoPrompt: 'Calcule detalhadamente a contribuição ao INSS como contribuinte individual. Mostre as opções: 20% sobre remuneração, 11% sobre salário mínimo (plano simplificado), e 5% para MEI. Compare benefícios de aposentadoria de cada opção.'
  },
  { 
    id: 'mei_eligibility', 
    label: 'Posso ser MEI?', 
    icon: Briefcase, 
    description: 'Verifique requisitos',
    autoPrompt: 'Verifique se posso ser MEI. Explique todos os requisitos: limite de faturamento (R$ 81.000/ano), atividades permitidas, número de funcionários, e restrições. Informe as consequências de ultrapassar o limite.'
  },
  { 
    id: 'transition_regime', 
    label: 'Migrar de Regime', 
    icon: Building2, 
    description: 'MEI → ME ou ME → LP',
    autoPrompt: 'Explique como funciona a migração de regime tributário para autônomos. Detalhe: quando migrar de MEI para ME, de ME para Lucro Presumido, custos envolvidos, prazos legais e procedimentos.'
  },
];

const AUTONOMO_QUICK_PROMPTS = [
  "Quanto de INSS devo pagar como autônomo com renda de R$ 8.000/mês?",
  "Vale a pena abrir MEI para prestação de serviços?",
  "Qual a alíquota de IR no Carnê-Leão?",
  "Como funciona o DAS do MEI?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tax-calculator`;

export function AutonomoAICalculator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [profession, setProfession] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText || isLoading) return;

    setInput('');
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = '';

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const calculationData = {
        revenue: monthlyRevenue ? parseFloat(monthlyRevenue.replace(/\D/g, '')) / 100 : undefined,
        profession: profession || undefined,
        type: 'autonomo',
      };

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          calculation_type: selectedType || undefined,
          data: calculationData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar');
      }

      if (!response.body) throw new Error('Resposta vazia');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '', isCalculation: !!selectedType }]);

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
                updated[updated.length - 1] = { 
                  role: 'assistant', 
                  content: assistantContent,
                  isCalculation: !!selectedType
                };
                return updated;
              });
            }
          } catch {
            // continue
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao processar cálculo',
      });
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
      setSelectedType('');
    }
  };

  const clearChat = () => {
    setMessages([]);
    setMonthlyRevenue('');
    setProfession('');
    setSelectedType('');
  };

  const formatRevenue = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers || '0') / 100;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-emerald-500/5 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-emerald-500/10 via-transparent to-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-primary shadow-lg shadow-emerald-500/25">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-emerald-500 to-primary bg-clip-text text-transparent">
              Calculadora Autônomo
            </h2>
            <p className="text-xs text-muted-foreground">IA especializada para profissionais autônomos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <Zap className="h-3 w-3 mr-1" />
            Autônomo
          </Badge>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 space-y-4 border-b border-border bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AUTONOMO_CALCULATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedType === type.id
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'border-border bg-card hover:border-emerald-500/50 hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${selectedType === type.id ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </button>
              );
            })}
          </div>

          {selectedType && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-card rounded-lg border">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Renda Mensal</label>
                  <Input
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(formatRevenue(e.target.value))}
                    placeholder="R$ 0,00"
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Profissão</label>
                  <Select value={profession} onValueChange={setProfession}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONAL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  const selectedCalc = AUTONOMO_CALCULATION_TYPES.find(t => t.id === selectedType);
                  if (selectedCalc) {
                    const revenueValue = monthlyRevenue ? parseFloat(monthlyRevenue.replace(/\D/g, '')) / 100 : 0;
                    let prompt = selectedCalc.autoPrompt;
                    if (revenueValue > 0) {
                      prompt += ` Considere renda mensal de R$ ${revenueValue.toLocaleString('pt-BR')}.`;
                    }
                    if (profession) {
                      const profCategory = PROFESSIONAL_CATEGORIES.find(c => c.id === profession);
                      prompt += ` Profissão: ${profCategory?.name || profession}.`;
                    }
                    sendMessage(prompt);
                  }
                }}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-primary hover:from-emerald-500/90 hover:to-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular {AUTONOMO_CALCULATION_TYPES.find(t => t.id === selectedType)?.label}
                  </>
                )}
              </Button>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Perguntas rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {AUTONOMO_QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors border border-border"
                >
                  {prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !selectedType && (
            <div className="text-center py-12">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary/20 w-fit mx-auto mb-4">
                <Brain className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Calculadora IA para Autônomos</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Compare PF vs MEI vs ME, calcule INSS como contribuinte individual, 
                verifique elegibilidade ao MEI e muito mais.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isCalculation 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-primary'
                }`}>
                  {message.isCalculation ? <Calculator className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.isCalculation
                      ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20'
                      : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Calculando...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/30">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta sobre tributação para autônomos..."
            className="flex-1 bg-background"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-emerald-500 to-primary hover:from-emerald-500/90 hover:to-primary/90"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
