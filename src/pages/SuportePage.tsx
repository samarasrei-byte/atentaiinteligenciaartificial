import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle, Clock, HelpCircle, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function SuportePage() {
  const faqItems = [
    {
      question: 'Como funciona a Reforma Tributária de 2026?',
      answer: 'A LC 214/2025 unifica tributos como ICMS, ISS, PIS e COFINS em dois novos impostos: IBS e CBS. A transição será gradual de 2026 a 2033.',
    },
    {
      question: 'Os simuladores são confiáveis?',
      answer: 'Sim! Nossos simuladores são baseados na legislação oficial e atualizados constantemente. Para decisões importantes, recomendamos consultar um contador.',
    },
    {
      question: 'Posso cancelar minha assinatura?',
      answer: 'Sim, você pode cancelar a qualquer momento pelo portal do cliente. Não cobramos multas ou taxas de cancelamento.',
    },
    {
      question: 'O que é o Limpa Nome?',
      answer: 'É um serviço de regularização de dívidas usando ações coletivas legais. Removemos restrições do SPC, Serasa e outros órgãos de proteção ao crédito.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Central de Ajuda</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Como podemos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              ajudar?
            </span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Estamos aqui para tirar suas dúvidas e garantir a melhor experiência.
          </p>
        </motion.div>
      </section>

      {/* Contact Options */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 text-white h-full">
              <CardHeader className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-blue-400" />
                </div>
                <CardTitle>E-mail</CardTitle>
                <CardDescription className="text-white/60">Resposta em até 24h</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a 
                  href="mailto:contato@atentai.com.br" 
                  className="text-blue-400 hover:underline font-medium"
                >
                  contato@atentai.com.br
                </a>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10 text-white h-full">
              <CardHeader className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 text-green-400" />
                </div>
                <CardTitle>WhatsApp</CardTitle>
                <CardDescription className="text-white/60">Atendimento rápido</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:underline font-medium"
                >
                  (11) 99999-9999
                </a>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10 text-white h-full">
              <CardHeader className="text-center">
                <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-purple-400" />
                </div>
                <CardTitle>Horário</CardTitle>
                <CardDescription className="text-white/60">Atendimento humano</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-white/80">
                Seg a Sex: 9h às 18h
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                {item.question}
              </h3>
              <p className="text-white/70 ml-7">{item.answer}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
            <Link to="/faq">
              Ver todas as perguntas
            </Link>
          </Button>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Links Úteis</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { icon: FileText, label: 'Termos de Uso', to: '/termos' },
            { icon: FileText, label: 'Privacidade', to: '/privacidade' },
            { icon: Users, label: 'Seja Afiliado', to: '/afiliado/cadastro' },
            { icon: HelpCircle, label: 'FAQ Completo', to: '/faq' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <item.icon className="w-5 h-5 text-blue-400" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center p-10 rounded-3xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-white/10">
          <h2 className="text-2xl font-bold mb-4">Não encontrou o que procura?</h2>
          <p className="text-white/70 mb-6">
            Nossa equipe está pronta para ajudar com qualquer dúvida.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <a href="mailto:contato@atentai.com.br">
              Enviar mensagem
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
