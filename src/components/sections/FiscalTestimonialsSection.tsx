import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, Building2, BadgeCheck } from "lucide-react";
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
    <section className="py-20 sm:py-28 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <BadgeCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Resultados Comprovados</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Empresas que </span>
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Recuperaram Milhares
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Veja histórias reais de empresas que identificaram valores perdidos através do nosso Módulo Fiscal
          </p>

          {/* Total Recovered Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30"
          >
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <div className="text-left">
              <p className="text-sm text-emerald-300/80">Total recuperado por estes clientes</p>
              <p className="text-3xl font-bold text-emerald-400">
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
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="p-6 lg:p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-emerald-500/30 transition-all duration-300 h-full group">
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-emerald-500/20 mb-4 group-hover:text-emerald-500/40 transition-colors" />
                
                {/* Testimonial Text */}
                <p className="text-foreground/90 text-lg leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Recovered Amount */}
                <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Recuperado</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      R$ {testimonial.recovered.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/30"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>{testimonial.company}</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-medium">{testimonial.sector}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Sua empresa pode ser a próxima a descobrir valores esquecidos
          </p>
          <a
            href="#fiscal"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Solicitar minha análise fiscal →
          </a>
        </motion.div>
      </div>
    </section>
  );
}