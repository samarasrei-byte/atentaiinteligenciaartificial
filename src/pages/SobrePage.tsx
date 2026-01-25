import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Shield, Zap, Award, TrendingUp, Building2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function SobrePage() {
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-6">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Sobre a AtentAI</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            Simplificando a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Reforma Tributária
            </span>
            {' '}para todos
          </h1>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Nascemos com a missão de democratizar o acesso à informação tributária, 
            usando tecnologia de ponta para ajudar empresas e profissionais a navegar 
            as mudanças da Lei Complementar 214/2025.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Nossa Missão</h2>
            <p className="text-white/70 leading-relaxed">
              Tornar a complexidade tributária acessível a todos, oferecendo ferramentas 
              inteligentes, simuladores precisos e atendimento humanizado para que cada 
              brasileiro possa tomar decisões fiscais informadas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Nossa Visão</h2>
            <p className="text-white/70 leading-relaxed">
              Ser a plataforma líder em soluções tributárias no Brasil, reconhecida pela 
              inovação, confiabilidade e pelo impacto positivo na vida financeira de 
              milhões de brasileiros e empresas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Nossos Valores</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Shield, title: 'Confiança', desc: 'Segurança e transparência em cada interação' },
            { icon: Zap, title: 'Inovação', desc: 'Tecnologia de ponta para soluções inteligentes' },
            { icon: Users, title: 'Humanização', desc: 'Especialistas reais para casos complexos' },
            { icon: Heart, title: 'Compromisso', desc: 'Dedicação total ao sucesso do cliente' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-white/60">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { value: '10.000+', label: 'Simulações realizadas' },
            { value: '2.500+', label: 'Empresas atendidas' },
            { value: 'R$ 15M+', label: 'Economia gerada' },
            { value: '4.9/5', label: 'Avaliação média' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                {stat.value}
              </div>
              <p className="text-sm text-white/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-white/10">
          <Award className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-white/70 mb-8">
            Junte-se a milhares de brasileiros que já estão se preparando para a Reforma Tributária.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link to="/auth">Criar conta grátis</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/servicos">Ver serviços</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Link */}
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-sm text-white/50">
          Dúvidas? Entre em contato:{' '}
          <a href="mailto:contato@atentai.com.br" className="text-emerald-400 hover:underline">
            contato@atentai.com.br
          </a>
        </p>
      </div>
    </div>
  );
}
