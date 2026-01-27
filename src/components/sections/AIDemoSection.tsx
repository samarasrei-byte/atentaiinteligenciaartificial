import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Crown,
  ArrowRight,
  MessageCircle,
  Zap,
  ShieldCheck,
  Calculator,
  CheckCheck,
  Clock,
  Gift,
  TrendingUp,
  Percent,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DEMO_RESPONSES: Record<string, string> = {
  'ibs': `O **IBS** é o novo imposto que substitui ICMS e ISS! 🎯

**Alíquota**: 17,7%
**Vantagem**: Crédito integral de insumos
**Destino**: Onde o consumo acontece

A transição vai de 2026 a 2033. Quer saber o impacto no seu negócio? 💼`,

  'cbs': `A **CBS** substitui PIS e COFINS! 📊

**Alíquota**: 8,8%
**Total com IBS**: 26,5%
**Gestão**: Receita Federal

É não-cumulativo, ou seja, você pode creditar insumos! Quer simular sua economia? 💰`,

  'mei': `Ótima pergunta sobre **MEI e Simples**! 🚀

✅ MEI mantém regime simplificado
✅ Limite: R$ 81.000/ano
✅ Pode optar por crédito IBS/CBS

**Novidade**: Empresas podem escolher regime híbrido para vender B2B!`,

  'cashback': `O **Cashback Tributário** devolve imposto! 💸

**Quem recebe**: Famílias no CadÚnico
**Quanto**: 100% CBS + 20% IBS
**Início**: 2027

Itens: energia, gás, água e telecom. Vai reduzir a desigualdade! 🎯`,

  'cronograma': `**Cronograma da Transição** 📅

2026-2027: CBS 0,9% + IBS 0,1% (teste)
2029: CBS 100% + IBS 10%
2033: Sistema novo completo!

ICMS e ISS serão extintos gradualmente. Quer ver ano a ano? 📊`,

  'cesta': `**Cesta Básica com ZERO imposto!** 🛒

✅ Arroz, feijão, carnes
✅ Leite, ovos, frutas
✅ Pão francês, café

São 22 itens essenciais isentos! Quer a lista completa?`,

  'economia': `Quer **calcular sua economia**? 💰

Com a reforma você pode:
📉 Reduzir carga tributária
📊 Aproveitar créditos de insumos
🎯 Otimizar seu regime

Use nosso simulador Premium para análise completa!`,

  'default': `Posso te ajudar com a **Reforma Tributária**! 🎯

Escolha um tema:
• IBS e CBS (novos impostos)
• MEI e Simples Nacional
• Cashback tributário
• Cronograma 2026-2033

Toque em um botão abaixo! 👇`
};

const QUICK_QUESTIONS = [
  { label: 'O que é IBS?', keyword: 'ibs', icon: Calculator },
  { label: 'Como funciona CBS?', keyword: 'cbs', icon: ShieldCheck },
  { label: 'Impacto no MEI', keyword: 'mei', icon: Zap },
  { label: 'Cashback tributário', keyword: 'cashback', icon: Gift },
  { label: 'Cronograma', keyword: 'cronograma', icon: Clock },
  { label: 'Cesta Básica', keyword: 'cesta', icon: Sparkles },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export function AIDemoSection() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Olá! 👋 Sou o **AtentAI**, seu assistente tributário!

Estou aqui para tirar suas dúvidas sobre a **Reforma Tributária de 2026**.

Toque em um dos botões abaixo ou digite sua pergunta! 💬`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim().toLowerCase();
    const newUserMsg: Message = { 
      role: 'user', 
      content: input, 
      timestamp: new Date(),
      status: 'read'
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay (WhatsApp-like)
    setTimeout(() => {
      let response = DEMO_RESPONSES['default'];
      
      // Match keywords
      if (userMessage.includes('ibs')) response = DEMO_RESPONSES['ibs'];
      else if (userMessage.includes('cbs')) response = DEMO_RESPONSES['cbs'];
      else if (userMessage.includes('mei') || userMessage.includes('simples')) response = DEMO_RESPONSES['mei'];
      else if (userMessage.includes('cashback') || userMessage.includes('devolução')) response = DEMO_RESPONSES['cashback'];
      else if (userMessage.includes('cronograma') || userMessage.includes('transição') || userMessage.includes('2026')) response = DEMO_RESPONSES['cronograma'];
      else if (userMessage.includes('cesta') || userMessage.includes('alimento') || userMessage.includes('isento')) response = DEMO_RESPONSES['cesta'];
      else if (userMessage.includes('economia') || userMessage.includes('calcular') || userMessage.includes('simular')) response = DEMO_RESPONSES['economia'];

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleQuickQuestion = (keyword: string, label: string) => {
    const newUserMsg: Message = { 
      role: 'user', 
      content: label, 
      timestamp: new Date(),
      status: 'read'
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: DEMO_RESPONSES[keyword],
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 500 + Math.random() * 300);
  };

  const renderMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• (.*?)(<br\/>|$)/g, '<span class="flex items-start gap-1"><span class="text-primary">•</span><span>$1</span></span>')
      .replace(/✅/g, '<span class="text-emerald-500">✅</span>')
      .replace(/📅|📊|💰|🎯|🚀|💸|🛒|💼|👋|💬|👇/g, '<span class="inline-block">$&</span>');
  };

  return (
    <section className="py-16 relative overflow-hidden bg-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.08)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 text-sm px-4 py-1">
            <Bot className="w-4 h-4 mr-2" />
            Experimente Grátis • Sem Cadastro
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Converse com a IA Tributária
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Tire dúvidas sobre a Reforma em segundos. Toque nos botões para respostas rápidas!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Chat Demo - WhatsApp Style */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Card className="bg-[#0b141a] border-0 shadow-2xl overflow-hidden rounded-2xl">
              {/* Chat Header - WhatsApp Style */}
              <div className="bg-[#202c33] p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-500 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#202c33]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      AtentAI
                      <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0">
                        Demo
                      </Badge>
                    </h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      online agora
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages - WhatsApp Style */}
              <CardContent 
                className="p-3 min-h-[200px] max-h-[320px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
                style={{ 
                  backgroundColor: '#0b141a'
                }}
              >
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex",
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm relative",
                      msg.role === 'user' 
                        ? 'bg-[#005c4b] text-white rounded-tr-none' 
                        : 'bg-[#202c33] text-white rounded-tl-none'
                    )}>
                      <div 
                        className="[&_strong]:text-emerald-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                      />
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}>
                        <span className="text-[10px] text-slate-400">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.role === 'user' && (
                          <CheckCheck className="h-3 w-3 text-sky-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#202c33] rounded-lg rounded-tl-none px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Quick Questions - Chips Style */}
              <div className="px-3 py-2 bg-[#202c33]/50 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <Button 
                      key={q.keyword}
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickQuestion(q.keyword, q.label)}
                      className="text-xs gap-1.5 whitespace-nowrap bg-[#202c33] border-white/10 text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all rounded-full px-3"
                    >
                      <q.icon className="w-3 h-3" />
                      {q.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input - WhatsApp Style */}
              <div className="p-2 bg-[#202c33] flex gap-2 items-center">
                <Input 
                  placeholder="Digite sua pergunta..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-[#2a3942] border-0 text-white placeholder:text-slate-400 rounded-full px-4 focus-visible:ring-1 focus-visible:ring-emerald-500"
                />
                <Button 
                  onClick={handleSend} 
                  size="icon" 
                  className="bg-emerald-600 hover:bg-emerald-500 rounded-full h-10 w-10"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Premium CTA - More Attractive */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-slate-800 via-slate-900 to-black border-accent/20 h-full flex flex-col relative overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              
              <CardContent className="p-6 flex flex-col h-full relative z-10">
                {/* Badge de Destaque */}
                <div className="absolute -top-1 -right-1">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    MAIS POPULAR
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-accent to-orange-500 rounded-xl">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg">AtentAI Premium</h3>
                </div>

                <p className="text-slate-300 text-sm mb-4">
                  Desbloqueie análises personalizadas e simule o impacto real no seu negócio.
                </p>

                {/* Benefits with better visual */}
                <ul className="space-y-2.5 mb-5 flex-1">
                  {[
                    { text: 'Perguntas ilimitadas', icon: MessageCircle },
                    { text: 'IA com dados atualizados', icon: Zap },
                    { text: 'Simulações personalizadas', icon: Calculator },
                    { text: 'Análise do seu negócio', icon: TrendingUp },
                    { text: 'Relatórios em PDF', icon: ShieldCheck },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm">
                      <div className="p-1 bg-accent/20 rounded-md">
                        <item.icon className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <span className="text-white">{item.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Price Section - More Attractive */}
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Percent className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 text-xs font-medium line-through">R$ 79/mês</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      R$ 39<span className="text-base font-normal text-slate-400">/mês</span>
                    </p>
                    <p className="text-emerald-400 text-xs font-medium mt-1">
                      Economize 50% - Oferta Limitada!
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-accent via-orange-500 to-accent hover:from-accent/90 hover:via-orange-400 hover:to-accent/90 text-white font-semibold h-12 text-base group shadow-lg shadow-accent/25"
                    onClick={() => navigate('/pricing')}
                  >
                    <Gift className="h-5 w-5 mr-2" />
                    Começar Agora
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      7 dias de garantia
                    </span>
                    <span>•</span>
                    <span>Cancele quando quiser</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
