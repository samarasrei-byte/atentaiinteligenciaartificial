import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap, FileText, CreditCard, ArrowRight, CheckCircle2,
  QrCode, TrendingUp, Clock, Shield, Users,
  ChevronRight, Sparkles, DollarSign, BarChart3
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const EmissaoNFLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <Helmet>
        <title>AtentAI - Emissão de NF Automática | Receba e emita notas</title>
        <meta name="description" content="Emita notas fiscais automaticamente após cada pagamento. NF-e, NFS-e e NFC-e integradas. A partir de R$97/mês." />
      </Helmet>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#como-funciona" className="hover:text-gray-800 transition-colors">Como funciona</a>
            <a href="#beneficios" className="hover:text-gray-800 transition-colors">Benefícios</a>
            <a href="#pricing" className="hover:text-gray-800 transition-colors">Preço</a>
          </div>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 h-9 text-sm font-medium"
          >
            Começar agora
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 text-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Emissão de NF automática
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-white"
            >
              Receba no Pix e a{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                nota sai sozinha
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-white/50 mb-10 max-w-xl mx-auto"
            >
              Cobre seus clientes e automatize todo seu financeiro em minutos
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-lg shadow-emerald-500/25 w-full sm:w-auto"
              >
                Começar agora <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-white/60 hover:text-white hover:bg-white/5 rounded-full px-8 h-14 text-lg w-full sm:w-auto"
              >
                Ver como funciona <ChevronRight className="ml-1 w-5 h-5" />
              </Button>
            </motion.div>

            {/* Social proof strip */}
            <motion.div variants={fadeUp} custom={4} className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Mais de <strong className="text-white/70">1.200</strong> usuários</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-white/70">R$ 500k+</strong> processados</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>100% seguro</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 bg-[#0d0d14]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">3 passos simples</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Você cobra. <span className="text-emerald-400">A gente faz o resto.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Você cria a cobrança', desc: 'Defina valor, método e cliente em segundos.', icon: CreditCard, color: 'from-emerald-500 to-emerald-600' },
              { step: '02', title: 'Seu cliente paga', desc: 'Pix, boleto ou cartão. Tudo integrado.', icon: QrCode, color: 'from-blue-500 to-blue-600' },
              { step: '03', title: 'Nota fiscal automática', desc: 'A nota é emitida sozinha. Zero trabalho manual.', icon: FileText, color: 'from-violet-500 to-violet-600' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl h-full hover:border-white/10 transition-all p-8 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-mono text-white/30 uppercase tracking-wider">Passo {item.step}</span>
                  <h3 className="text-xl font-semibold mt-2 mb-3 text-white">{item.title}</h3>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Automation callout */}
          <motion.div
            className="max-w-2xl mx-auto mt-12"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
              <p className="text-lg font-medium text-emerald-400">
                ✅ Pagamento recebido — Nota emitida automaticamente
              </p>
              <p className="text-sm text-white/40 mt-2">Tudo automático. Sem cliques extras.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-24 bg-[#0a0a0f]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Tudo automático</h2>
            <p className="text-white/40 text-lg">Escale seu faturamento sem esforço</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Clock, title: 'Pare de perder tempo', desc: 'Nota fiscal emitida sozinha após o pagamento.' },
              { icon: Zap, title: 'Nunca mais cobre manualmente', desc: 'Link de cobrança enviado com 1 clique.' },
              { icon: BarChart3, title: 'Controle total', desc: 'Dashboard com métricas em tempo real.' },
              { icon: DollarSign, title: 'Receba no Pix', desc: 'Pix, boleto e cartão. Sem complicação.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:border-emerald-500/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <item.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-sm text-white/40">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="py-24 bg-[#0d0d14]">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Seu painel financeiro completo</h2>
            <p className="text-white/40">Tudo que você precisa em um só lugar</p>
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
                { title: 'Últimos pagamentos', items: [
                  { name: 'Maria Silva', amount: 'R$ 1.200,00', status: 'Pago', statusColor: 'text-emerald-400' },
                  { name: 'João Santos', amount: 'R$ 850,00', status: 'Pendente', statusColor: 'text-amber-400' },
                  { name: 'Ana Costa', amount: 'R$ 3.500,00', status: 'Pago', statusColor: 'text-emerald-400' },
                ]},
                { title: 'Notas recentes', items: [
                  { name: 'NF-e #1247', amount: 'R$ 1.200,00', status: 'Emitida ✅', statusColor: 'text-emerald-400' },
                  { name: 'NF-e #1246', amount: 'R$ 3.500,00', status: 'Emitida ✅', statusColor: 'text-emerald-400' },
                  { name: 'NF-e #1245', amount: 'R$ 2.100,00', status: 'Emitida ✅', statusColor: 'text-emerald-400' },
                ]},
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

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#0a0a0f]">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-lg mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Simples e justo</h2>
            <p className="text-white/40 mb-10">Você só paga quando ganha dinheiro</p>

            <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-emerald-500/20 rounded-3xl overflow-hidden p-8 md:p-10">
              <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Plano único</Badge>
              <div className="mb-2">
                <span className="text-5xl md:text-6xl font-bold text-white">R$ 97</span>
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
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-14 text-lg font-semibold shadow-lg shadow-emerald-500/25"
              >
                Ativar agora <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#0d0d14]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Receba no Pix <span className="text-emerald-400">sem esforço</span>
            </h2>
            <p className="text-white/40 text-lg mb-10">
              Escale seu faturamento. Tudo automático.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-10 h-14 text-lg font-semibold shadow-lg shadow-emerald-500/25"
            >
              Ativar agora <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-[#0a0a0f]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-white/30">
          <div className="flex items-center gap-2">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-6 w-auto" />
            <span className="text-white/50 font-medium">AtentAI</span>
          </div>
          <p className="mt-2 md:mt-0">Parte do ecossistema AtentAI</p>
        </div>
      </footer>
    </div>
  );
};

export default EmissaoNFLanding;
