import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, Building2, BadgeCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Carlos Eduardo",
    company: "Distribuidora ABC Ltda",
    sector: "Comércio",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    recovered: 127500,
    text: "Descobrimos que estávamos pagando ICMS a maior há 3 anos. A análise identificou R$ 127.500 em créditos que conseguimos recuperar. Investimento que se pagou 50x.",
    rating: 5,
  },
  {
    name: "Patrícia Mendes",
    company: "Tech Solutions ME",
    sector: "Tecnologia",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    recovered: 89000,
    text: "Como empresa de tecnologia, achávamos que estávamos no regime correto. A análise revelou que Lucro Presumido seria mais vantajoso e ainda identificou R$ 89 mil em oportunidades.",
    rating: 5,
  },
  {
    name: "Roberto Silva",
    company: "Construtora Horizonte",
    sector: "Construção Civil",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    recovered: 234000,
    text: "Em construção civil, a complexidade tributária é enorme. A análise encontrou R$ 234 mil em PIS/COFINS não aproveitados. Valor que mudou nosso fluxo de caixa.",
    rating: 5,
  },
  {
    name: "Amanda Costa",
    company: "Clínica Bem Estar",
    sector: "Saúde",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    recovered: 67800,
    text: "Clínicas pagam impostos altíssimos. A análise identificou R$ 67.800 em deduções que nosso contador anterior deixou passar. Agora pagamos 23% menos.",
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function FiscalTestimonialsSection() {
  const totalRecovered = testimonials.reduce((acc, t) => acc + t.recovered, 0);

  return (
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden">
      {/* Background - Matching the hero gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4 sm:mb-6">
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
            <span className="text-xs sm:text-sm font-medium text-emerald-400">Resultados Comprovados</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
            <span className="text-white">Empresas que </span>
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              Recuperaram Milhares
            </span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Veja histórias reais de empresas que identificaram valores perdidos através do nosso Módulo Fiscal
          </p>

          {/* Total Recovered Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30"
          >
            <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-400" />
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-emerald-300/80">Total recuperado por estes clientes</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
                R$ {(totalRecovered / 1000).toFixed(0)}mil+
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="p-5 sm:p-6 lg:p-8 bg-white/5 backdrop-blur-sm border-white/10 hover:border-emerald-500/30 transition-all duration-300 h-full group">
                {/* Quote Icon */}
                <Quote className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-500/30 mb-3 sm:mb-4 group-hover:text-emerald-500/50 transition-colors" />
                
                {/* Testimonial Text */}
                <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                  "{testimonial.text}"
                </p>

                {/* Recovered Amount */}
                <div className="flex items-center gap-3 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/70">Valor Recuperado</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                      R$ {testimonial.recovered.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-12 sm:w-14 h-12 sm:h-14 rounded-full object-cover border-2 border-emerald-500/30"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-sm sm:text-base">{testimonial.name}</h4>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                        <Building2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                        <span>{testimonial.company}</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-medium">{testimonial.sector}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-10 sm:mt-12"
        >
          <p className="text-white/70 mb-4 text-sm sm:text-base">
            Sua empresa pode ser a próxima a descobrir valores esquecidos
          </p>
          <a
            href="#fiscal"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-sm sm:text-base"
          >
            Solicitar minha análise fiscal →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
