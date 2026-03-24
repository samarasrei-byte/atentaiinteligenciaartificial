import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap, FileText, CreditCard, ArrowRight, CheckCircle2,
  QrCode, TrendingUp, Clock, Shield, Users,
  ChevronRight, Sparkles, DollarSign, BarChart3,
  AlertTriangle, XCircle, Timer, Brain, Briefcase,
  UserCheck, Building2, Lock, Star, Rocket
} from 'lucide-react';

const fade = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const EmissaoNFLanding = () => {
  const navigate = useNavigate();

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#07070b] text-white overflow-x-hidden">
      <Helmet>
        <title>AtentAI - Emissão de NF Automática | Receba e emita notas</title>
        <meta name="description" content="Emita notas fiscais automaticamente após cada pagamento. NF-e, NFS-e e NFC-e integradas. A partir de R$97/mês." />
      </Helmet>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <button onClick={() => scrollTo('problema')} className="hover:text-gray-800 transition-colors">O problema</button>
            <button onClick={() => scrollTo('como-funciona')} className="hover:text-gray-800 transition-colors">Como funciona</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-gray-800 transition-colors">Preço</button>
          </nav>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 h-9 text-sm font-medium"
          >
            Começar agora
          </Button>
        </div>
      </header>

      {/* ━━━ HERO ━━━ */}
      <section className="pt-32 pb-24 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fade} custom={0}>
              <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Automação fiscal inteligente
              </Badge>
            </motion.div>

            <motion.h1
              variants={fade}
              custom={1}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] mb-6 tracking-tight"
            >
              Receba no Pix e tenha a{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                nota emitida automaticamente
              </span>
            </motion.h1>

            <motion.p variants={fade} custom={2} className="text-lg md:text-xl text-white/50 mb-4 max-w-xl mx-auto leading-relaxed">
              Pare de perder horas cobrando clientes e emitindo nota manualmente.
            </motion.p>
            <motion.p variants={fade} custom={3} className="text-base md:text-lg text-white/40 mb-10 max-w-lg mx-auto">
              Automatize tudo: cobrança, pagamento e nota fiscal — sem esforço.
            </motion.p>

            <motion.div variants={fade} custom={4} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-full px-10 h-14 text-lg font-bold shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] transition-all w-full sm:w-auto"
              >
                Começar agora <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => scrollTo('como-funciona')}
                className="text-white/50 hover:text-white hover:bg-white/5 rounded-full px-8 h-14 text-lg w-full sm:w-auto"
              >
                Ver como funciona <ChevronRight className="ml-1 w-5 h-5" />
              </Button>
            </motion.div>

            <motion.p variants={fade} custom={5} className="text-emerald-400/80 font-semibold text-sm mb-10">
              👉 Você cobra. A gente faz o resto.
            </motion.p>

            {/* Social proof */}
            <motion.div variants={fade} custom={6} className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-2 text-sm text-white/40">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span>Mais de <strong className="text-white/70">1.200</strong> negócios automatizando</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-white/70">R$ 500 mil+</strong> processados com segurança</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ O PROBLEMA ━━━ */}
      <section id="problema" className="py-24 bg-[#0b0b12]">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-red-500/10 text-red-400 border-red-500/20">😩 O problema</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Se você presta serviço, <span className="text-red-400">já passou por isso</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                { icon: AlertTriangle, text: 'Esquece de cobrar o cliente' },
                { icon: FileText, text: 'Precisa emitir nota manualmente toda vez' },
                { icon: Timer, text: 'Perde tempo conferindo pagamento' },
                { icon: XCircle, text: 'Mistura financeiro com planilha bagunçada' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 bg-red-500/5 border border-red-500/10 rounded-xl p-5"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-white/70 text-sm font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/15 rounded-2xl p-6 text-center"
            >
              <p className="text-lg font-semibold text-red-400">
                👉 No fim, você perde tempo e dinheiro.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ A SOLUÇÃO ━━━ */}
      <section className="py-24 bg-[#07070b]">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">⚡ A solução</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Automatize tudo em <span className="text-emerald-400">minutos</span>
            </h2>
            <p className="text-white/40 mb-12">Sem retrabalho. Sem erro. Sem estresse.</p>

            <div className="grid sm:grid-cols-3 gap-5 mb-10">
              {[
                { icon: Zap, text: 'Envie cobranças com 1 clique', color: 'from-emerald-500 to-emerald-600' },
                { icon: QrCode, text: 'Receba via Pix, boleto ou cartão', color: 'from-blue-500 to-blue-600' },
                { icon: FileText, text: 'Nota emitida automaticamente', color: 'from-violet-500 to-violet-600' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/20 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white/70 text-sm font-medium">{item.text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6"
            >
              <p className="text-lg font-semibold text-emerald-400">
                ✅ Pagou → Nota emitida → Tudo registrado
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ COMO FUNCIONA ━━━ */}
      <section id="como-funciona" className="py-24 bg-[#0b0b12]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">🚀 Como funciona</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              3 passos. <span className="text-emerald-400">Zero complicação.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Crie a cobrança',
                desc: 'Defina valor, cliente e método de pagamento em segundos.',
                icon: CreditCard,
                color: 'from-emerald-500 to-emerald-600',
              },
              {
                step: '02',
                title: 'Seu cliente paga',
                desc: 'Pix, boleto ou cartão. Tudo integrado e automático.',
                icon: QrCode,
                color: 'from-blue-500 to-blue-600',
              },
              {
                step: '03',
                title: 'Nota emitida',
                desc: 'A nota fiscal é gerada automaticamente após o pagamento.',
                icon: FileText,
                color: 'from-violet-500 to-violet-600',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl h-full hover:border-emerald-500/20 transition-all p-8 text-center group">
                  {/* Step number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#0b0b12] border border-white/10 text-white/30 text-xs font-mono px-3 py-1 rounded-full">
                      Passo {item.step}
                    </span>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mt-2 mb-3 text-white">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Connector line */}
          <div className="hidden md:flex justify-center mt-8">
            <div className="flex items-center gap-2 text-emerald-500/40">
              <div className="w-16 h-px bg-emerald-500/20" />
              <ArrowRight className="w-4 h-4" />
              <div className="w-16 h-px bg-emerald-500/20" />
              <ArrowRight className="w-4 h-4" />
              <div className="w-16 h-px bg-emerald-500/20" />
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ POR QUE USAR ━━━ */}
      <section className="py-24 bg-[#07070b]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/20">💡 Por que usar</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Tudo automático. Tudo simples.</h2>
            <p className="text-white/40 text-lg">Escale seu faturamento sem esforço</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Clock, title: 'Economize horas', desc: 'Pare de emitir nota manualmente toda semana.', accent: 'emerald' },
              { icon: DollarSign, title: 'Nunca esqueça de cobrar', desc: 'Envio automático de cobrança para o cliente.', accent: 'blue' },
              { icon: BarChart3, title: 'Controle total', desc: 'Dashboard com tudo em tempo real.', accent: 'violet' },
              { icon: Zap, title: 'Cresça sem trabalho', desc: 'Escale seu faturamento sem aumentar esforço.', accent: 'amber' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:border-emerald-500/20 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-${item.accent}-500/10 flex items-center justify-center mb-4 group-hover:bg-${item.accent}-500/20 transition-colors`}>
                  <item.icon className={`w-6 h-6 text-${item.accent}-400`} />
                </div>
                <h3 className="font-bold mb-2 text-white text-lg">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ DASHBOARD PREVIEW ━━━ */}
      <section className="py-24 bg-[#0b0b12]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">📊 Seu painel</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Seu financeiro em um só lugar</h2>
            <p className="text-white/40">Tudo atualizado automaticamente</p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-white/40">Saldo disponível</p>
                <p className="text-3xl font-bold text-emerald-400">R$ 12.450,00</p>
              </div>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full">
                + Nova cobrança
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Faturamento', value: 'R$ 47.800', icon: '💰' },
                { label: 'Notas emitidas', value: '234', icon: '📄' },
                { label: 'Via Pix', value: '189', icon: '⚡' },
                { label: 'Via Cartão', value: '45', icon: '💳' },
                { label: 'Receita líquida', value: 'R$ 44.100', icon: '📈' },
              ].map((m, i) => (
                <div key={i} className="bg-white/[0.05] rounded-xl p-4 text-center">
                  <span className="text-lg">{m.icon}</span>
                  <p className="text-xs text-white/40 mt-1">{m.label}</p>
                  <p className="text-sm font-semibold mt-0.5 text-white">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Últimos pagamentos',
                  items: [
                    { name: 'Maria Silva', amount: 'R$ 1.200,00', status: 'Pago', statusColor: 'text-emerald-400' },
                    { name: 'João Santos', amount: 'R$ 850,00', status: 'Pendente', statusColor: 'text-amber-400' },
                    { name: 'Ana Costa', amount: 'R$ 3.500,00', status: 'Pago', statusColor: 'text-emerald-400' },
                  ],
                },
                {
                  title: 'Notas recentes',
                  items: [
                    { name: 'NF-e #1247', amount: 'R$ 1.200,00', status: 'Emitida ✅', statusColor: 'text-emerald-400' },
                    { name: 'NF-e #1246', amount: 'R$ 3.500,00', status: 'Emitida ✅', statusColor: 'text-emerald-400' },
                    { name: 'NF-e #1245', amount: 'R$ 2.100,00', status: 'Emitida ✅', statusColor: 'text-emerald-400' },
                  ],
                },
              ].map((section, si) => (
                <div key={si} className="bg-white/[0.04] rounded-xl p-4">
                  <p className="text-sm font-medium text-white/60 mb-3">{section.title}</p>
                  <div className="space-y-3">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-white/50">{item.amount}</span>
                          <span className={`text-xs ${item.statusColor}`}>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ PRICING ━━━ */}
      <section id="pricing" className="py-24 bg-[#07070b]">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-lg mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">💰 Preço</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Simples e justo</h2>
            <p className="text-white/40 mb-10">Você só paga quando ganha dinheiro</p>

            <div className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] border-2 border-emerald-500/30 rounded-3xl overflow-hidden p-8 md:p-10">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1)_0%,transparent_60%)]" />

              <div className="relative z-10">
                <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Plano único</Badge>
                <div className="mb-2">
                  <span className="text-5xl md:text-6xl font-extrabold text-white">R$ 97</span>
                  <span className="text-white/40 text-lg">/mês</span>
                </div>
                <p className="text-emerald-400 text-sm font-medium mb-8">+ R$ 2,90 por nota emitida</p>

                <div className="space-y-3 text-left mb-8">
                  {[
                    'Cobranças ilimitadas (Pix, boleto, cartão)',
                    'Nota fiscal automática',
                    'Dashboard completo',
                    'Gestão de clientes',
                    'Relatórios em tempo real',
                    'Suporte com especialista',
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-white/70">{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-full h-14 text-lg font-bold shadow-[0_0_40px_rgba(16,185,129,0.25)]"
                >
                  Ativar agora <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━ SEGURANÇA ━━━ */}
      <section className="py-16 bg-[#0b0b12]">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">🔒 Seguro e confiável</h2>
            <p className="text-white/40 text-lg">
              Seus dados e transações protegidos com padrão bancário.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ━━━ PARA QUEM É ━━━ */}
      <section className="py-24 bg-[#07070b]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">❓ Para quem é?</h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {[
              { icon: UserCheck, label: 'Freelancers' },
              { icon: Brain, label: 'Consultores' },
              { icon: Building2, label: 'Agências' },
              { icon: Briefcase, label: 'Prestadores de serviço' },
              { icon: Users, label: 'MEIs e pequenas empresas' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-full px-6 py-3 hover:border-emerald-500/20 transition-all"
              >
                <item.icon className="w-5 h-5 text-emerald-400" />
                <span className="text-white/70 font-medium text-sm">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA FINAL ━━━ */}
      <section className="py-24 bg-[#0b0b12] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Rocket className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-white">
              Comece agora
            </h2>
            <p className="text-white/50 text-lg mb-2">
              Leva menos de 2 minutos para começar.
            </p>
            <p className="text-emerald-400 font-semibold text-lg mb-10">
              Automatize seu financeiro hoje.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-full px-12 h-14 text-lg font-bold shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] transition-all"
            >
              Criar minha conta <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-[#07070b]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-white/30">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-6 w-auto" />
          </a>
          <p className="mt-2 md:mt-0">Parte do ecossistema AtentAI</p>
        </div>
      </footer>
    </div>
  );
};

export default EmissaoNFLanding;
