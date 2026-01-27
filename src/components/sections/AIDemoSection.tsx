import React, { useState } from 'react';
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
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DEMO_RESPONSES: Record<string, string> = {
  'ibs': `## IBS - Imposto sobre Bens e Serviços

O **IBS** é um dos novos tributos criados pela Reforma Tributária (LC 214/2025):

- **Alíquota de referência**: 17,7%
- **Substitui**: ICMS (estadual) e ISS (municipal)
- **Não-cumulativo**: Permite crédito integral de insumos
- **Destino**: Arrecadação vai para onde o consumo ocorre

📅 **Transição**: 2026-2033 (implementação gradual)

*Para análise personalizada do impacto no seu negócio, assine o plano Premium.*`,

  'cbs': `## CBS - Contribuição sobre Bens e Serviços

A **CBS** é a contribuição federal do novo sistema tributário:

- **Alíquota de referência**: 8,8%
- **Substitui**: PIS e COFINS
- **Não-cumulativo**: Crédito amplo de insumos
- **Gestão**: Federal (Receita Federal)

📊 **Total IBS + CBS**: 26,5% (alíquota de referência)

*Quer saber quanto sua empresa vai economizar? Use nosso simulador Premium.*`,

  'mei': `## Impactos no MEI e Simples Nacional

A Reforma traz mudanças importantes para pequenos negócios:

### MEI
- Mantém regime simplificado
- Pode optar por crédito de IBS/CBS
- Limite continua R$ 81.000/ano

### Simples Nacional
- Empresas podem escolher regime híbrido
- Possibilidade de destacar IBS/CBS na nota
- Vantagem competitiva em vendas B2B

*Simule seu cenário ideal com nossa calculadora Premium.*`,

  'cashback': `## Cashback Tributário

O **Cashback** é a devolução de impostos para famílias de baixa renda:

- **Beneficiários**: Inscritos no CadÚnico
- **Devolução**: 100% CBS + 20% IBS em itens essenciais
- **Itens cobertos**: Energia, gás, água, telecomunicações
- **Início**: 2027

💰 **Objetivo**: Reduzir a regressividade do sistema tributário.

*Saiba mais sobre como isso afeta seu negócio no plano Premium.*`,

  'cronograma': `## Cronograma da Transição (2026-2033)

| Ano | IBS | CBS | ICMS/ISS |
|-----|-----|-----|----------|
| 2026 | 0,1% | 0,9% | Integral |
| 2027 | 0,1% | 0,9% | Integral |
| 2029 | 10% | 100% | 90% |
| 2030 | 20% | 100% | 80% |
| 2031 | 30% | 100% | 70% |
| 2032 | 40% | 100% | 60% |
| 2033 | 100% | 100% | Extinto |

*Use nosso simulador de transição para ver impactos ano a ano.*`,

  'cesta': `## Cesta Básica Nacional

Alimentos com **alíquota ZERO** de IBS e CBS:

✅ Arroz, feijão, carnes
✅ Leite, ovos, frutas
✅ Legumes, verduras, hortaliças
✅ Farinha de trigo e mandioca
✅ Pão francês, café

📋 **Lista completa**: 22 itens essenciais isentos

*Para análise fiscal do seu mix de produtos, use nosso módulo Premium.*`,

  'default': `## Reforma Tributária 2026

Posso te ajudar com informações sobre:

🔹 **IBS e CBS** - Os novos tributos unificados
🔹 **Cronograma** - Transição de 2026 a 2033  
🔹 **MEI/Simples** - Impactos em pequenos negócios
🔹 **Cashback** - Devolução para baixa renda
🔹 **Cesta Básica** - Alimentos isentos

Digite uma dessas palavras-chave para saber mais!

*Para análises personalizadas e simulações completas, assine o Premium.*`
};

const QUICK_QUESTIONS = [
  { label: 'IBS', keyword: 'ibs', icon: Calculator },
  { label: 'CBS', keyword: 'cbs', icon: ShieldCheck },
  { label: 'MEI', keyword: 'mei', icon: Zap },
  { label: 'Cashback', keyword: 'cashback', icon: Sparkles },
];

export function AIDemoSection() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { 
      role: 'assistant', 
      content: `## 👋 Olá! Sou o assistente AtentAI

Especializado na **Reforma Tributária de 2026** (LC 214/2025).

Experimente perguntar sobre:
- IBS e CBS - Os novos tributos
- Cronograma de transição
- Impactos no MEI e Simples
- Cashback tributário

**Esta é uma demonstração com respostas pré-definidas.**`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim().toLowerCase();
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      let response = DEMO_RESPONSES['default'];
      
      // Match keywords
      if (userMessage.includes('ibs')) response = DEMO_RESPONSES['ibs'];
      else if (userMessage.includes('cbs')) response = DEMO_RESPONSES['cbs'];
      else if (userMessage.includes('mei') || userMessage.includes('simples')) response = DEMO_RESPONSES['mei'];
      else if (userMessage.includes('cashback') || userMessage.includes('devolução')) response = DEMO_RESPONSES['cashback'];
      else if (userMessage.includes('cronograma') || userMessage.includes('transição') || userMessage.includes('2026')) response = DEMO_RESPONSES['cronograma'];
      else if (userMessage.includes('cesta') || userMessage.includes('alimento') || userMessage.includes('isento')) response = DEMO_RESPONSES['cesta'];

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickQuestion = (keyword: string) => {
    setInput(keyword.toUpperCase());
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'user', content: keyword.toUpperCase() }]);
      setIsTyping(true);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: DEMO_RESPONSES[keyword] }]);
        setIsTyping(false);
      }, 600);
    }, 100);
    setInput('');
  };

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.1)_0%,transparent_50%)]" />
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
            Demonstração Gratuita • Experimente Agora
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Agente IA Tributário
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Tire suas dúvidas sobre a Reforma Tributária. Demonstração com respostas pré-definidas.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Chat Demo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-primary to-emerald-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      AtentAI
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        Demo
                      </Badge>
                    </h3>
                    <p className="text-xs text-white/80">Especialista em LC 214/2025</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-white border-0">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Online
                </Badge>
              </div>

              {/* Messages */}
              <CardContent className="p-4 h-[320px] overflow-y-auto space-y-4 bg-slate-50">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex",
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-br-md' 
                        : 'bg-white shadow-md rounded-bl-md prose prose-sm prose-slate max-w-none'
                    )}>
                      {msg.role === 'assistant' ? (
                        <div 
                          className="[&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:ml-4 [&_table]:text-xs [&_table]:w-full [&_th]:bg-slate-100 [&_th]:p-1 [&_td]:p-1 [&_td]:border [&_th]:border"
                          dangerouslySetInnerHTML={{ 
                            __html: msg.content
                              .replace(/## (.*)/g, '<h2>$1</h2>')
                              .replace(/### (.*)/g, '<h3>$1</h3>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/\n- (.*)/g, '<li>$1</li>')
                              .replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>')
                              .replace(/🔹|✅|📅|📊|💰|📋|👋/g, '<span class="mr-1">$&</span>')
                              .replace(/\n\n/g, '<br/><br/>')
                              .replace(/\n/g, '<br/>')
                          }}
                        />
                      ) : msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-md rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Quick Questions */}
              <div className="px-4 py-2 bg-white border-t flex gap-2 flex-wrap">
                {QUICK_QUESTIONS.map((q) => (
                  <Button 
                    key={q.keyword}
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickQuestion(q.keyword)}
                    className="text-xs gap-1 hover:bg-primary hover:text-white transition-colors"
                  >
                    <q.icon className="w-3 h-3" />
                    {q.label}
                  </Button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t flex gap-2">
                <Input 
                  placeholder="Digite sua pergunta..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon" className="bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Premium CTA */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-accent/30 h-full flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Crown className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-white">AtentAI Premium</h3>
                </div>

                <p className="text-slate-300 text-sm mb-6">
                  Desbloqueie o potencial completo do agente tributário com IA avançada.
                </p>

                <ul className="space-y-3 mb-6 flex-1">
                  {[
                    'Perguntas ilimitadas',
                    'IA com base atualizada',
                    'Simulações personalizadas',
                    'Análise do seu negócio',
                    'Relatórios em PDF',
                    'Suporte prioritário'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-200">
                      <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">A partir de</p>
                    <p className="text-2xl font-bold text-white">
                      R$ 39<span className="text-sm font-normal text-slate-400">/mês</span>
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-white group"
                    onClick={() => navigate('/pricing')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ver Planos
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    7 dias de garantia • Cancele quando quiser
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-slate-400 text-sm mt-6"
        >
          💡 Esta demonstração usa respostas pré-definidas. Assine para IA completa com análises personalizadas.
        </motion.p>
      </div>
    </section>
  );
}
