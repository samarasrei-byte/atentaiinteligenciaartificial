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
  Building2,
  Home,
  Zap,
  Bot,
  User,
  RefreshCw
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isCalculation?: boolean;
}

const CALCULATION_TYPES = [
  { 
    id: 'full_simulation', 
    label: 'Simulação Completa', 
    icon: Calculator, 
    description: 'Cálculo detalhado com comparativo',
    autoPrompt: 'Faça uma simulação completa de impostos comparando o sistema atual com a reforma tributária. Inclua PIS, COFINS, ICMS/ISS atuais e IBS + CBS futuros.'
  },
  { 
    id: 'regime_comparison', 
    label: 'Comparar Regimes', 
    icon: TrendingUp, 
    description: 'Simples vs Presumido vs Real',
    autoPrompt: 'Compare os três regimes tributários: Simples Nacional, Lucro Presumido e Lucro Real. Mostre qual tem menor carga tributária, vantagens e desvantagens de cada um.'
  },
  { 
    id: 'rental_simulation', 
    label: 'Locação de Imóveis', 
    icon: Home, 
    description: 'PF vs PJ para aluguel',
    autoPrompt: 'Simule a tributação de locação de imóveis comparando Pessoa Física vs Pessoa Jurídica. Calcule IR, IBS, CBS e qual estrutura é mais vantajosa.'
  },
  { 
    id: 'sector_impact', 
    label: 'Impacto Setorial', 
    icon: Building2, 
    description: 'Análise por segmento',
    autoPrompt: 'Analise o impacto da reforma tributária para este setor. Mostre alíquotas específicas, reduções aplicáveis, cronograma de transição e estratégias de adaptação.'
  },
];

const QUICK_PROMPTS = [
  "Calcule os impostos para um comércio com faturamento de R$ 50.000/mês em São Paulo",
  "Compare Simples Nacional vs Lucro Presumido para uma empresa de tecnologia",
  "Quanto pagarei de IBS e CBS na reforma com faturamento de R$ 100.000?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tax-calculator`;

export function PowerAICalculator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [revenue, setRevenue] = useState('');
  const [sector, setSector] = useState('');
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
        revenue: revenue ? parseFloat(revenue.replace(/\D/g, '')) / 100 : undefined,
        sector: sector || undefined,
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
    setRevenue('');
    setSector('');
    setSelectedType('');
  };

  const formatRevenue = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers || '0') / 100;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 via-transparent to-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-cyan-500 shadow-lg shadow-primary/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              AtentAI Power Calculator
            </h2>
            <p className="text-xs text-muted-foreground">IA avançada para cálculos tributários</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Zap className="h-3 w-3 mr-1" />
            Turbo
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
            {CALCULATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedType === type.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${selectedType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
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
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Faturamento Mensal</label>
                  <Input
                    value={revenue}
                    onChange={(e) => setRevenue(formatRevenue(e.target.value))}
                    placeholder="R$ 0,00"
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Setor</label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comercio">Comércio</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="industria">Indústria</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="construcao">Construção</SelectItem>
                      <SelectItem value="transporte">Transporte</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Start Calculation Button */}
              <Button
                onClick={() => {
                  const selectedCalc = CALCULATION_TYPES.find(t => t.id === selectedType);
                  if (selectedCalc) {
                    const revenueValue = revenue ? parseFloat(revenue.replace(/\D/g, '')) / 100 : 0;
                    const sectorLabel = sector || 'não especificado';
                    let prompt = selectedCalc.autoPrompt;
                    if (revenueValue > 0) {
                      prompt += ` Considere faturamento mensal de R$ ${revenueValue.toLocaleString('pt-BR')}.`;
                    }
                    if (sector) {
                      prompt += ` Setor: ${sectorLabel}.`;
                    }
                    sendMessage(prompt);
                  }
                }}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Iniciar {CALCULATION_TYPES.find(t => t.id === selectedType)?.label}
                  </>
                )}
              </Button>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Perguntas rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border"
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
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 w-fit mx-auto mb-4">
                <Brain className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Calculadora IA Tributária</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Faça cálculos complexos de impostos, compare regimes tributários e simule o impacto da Reforma Tributária 2026 na sua empresa.
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
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                    : 'bg-gradient-to-br from-primary to-cyan-500'
                }`}>
                  {message.isCalculation ? <Calculator className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.isCalculation
                      ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20'
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
            placeholder={selectedType ? "Descreva os detalhes do cálculo..." : "Digite sua pergunta ou solicite um cálculo..."}
            className="flex-1 bg-background"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
