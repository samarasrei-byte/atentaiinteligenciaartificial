import { Calculator, MessageCircle, Users, Mail, MapPin, ArrowUp, DollarSign, ArrowRight, TrendingUp, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onNavigate: (section: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigation = [
    { label: "Simulador", icon: Calculator, section: "simulator" },
    { label: "Consultar IA", icon: MessageCircle, section: "ai" },
    { label: "Planos", icon: Users, section: "pricing" },
  ];

  const resources = [
    { label: "Timeline da Reforma", to: "/timeline-reforma" },
    { label: "Transição 2026-2033", to: "/transicao-tributaria" },
    { label: "Ferramentas LC 214", to: "/ferramentas-lc214" },
    { label: "Glossário Tributário", href: "#" },
  ];

  const legal = [
    { label: "Termos de Uso", to: "/termos" },
    { label: "Privacidade", to: "/privacidade" },
  ];

  return (
    <>
      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group md:bottom-8"
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="bg-secondary text-secondary-foreground">
        {/* Affiliate CTA Banner - ULTRA PREMIUM */}
        <div className="relative overflow-hidden">
          {/* Multi-layer gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20" />
          
          {/* Animated glow effects */}
          <motion.div
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-yellow-400/30 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [1.1, 1, 1.1]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-20 top-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-300/20 rounded-full blur-[100px]"
          />
          
          <div className="container mx-auto px-4 py-10 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left content */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Icon with glow */}
                <motion.div 
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(255,255,255,0.2)",
                      "0 0 40px rgba(255,255,255,0.4)",
                      "0 0 20px rgba(255,255,255,0.2)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
                >
                  <DollarSign className="w-8 h-8 text-white" />
                </motion.div>
                
                <div className="text-center sm:text-left">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40">
                    <TrendingUp className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                      Programa de Afiliados • 20% Comissão
                    </span>
                  </div>
                  
                  {/* Headline */}
                  <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-tight">
                    Ganhe de{' '}
                    <span className="text-yellow-300">R$ 500</span>
                    {' '}a{' '}
                    <span className="text-emerald-300">R$ 13.000</span>
                    {' '}por venda!
                  </h3>
                  
                  <p className="text-sm sm:text-base text-white/80 mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-2">
                    <span>💰 Comissão de 20% garantida</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Alta taxa de conversão</span>
                  </p>
                </div>
              </div>
              
              {/* Right content - CTA */}
              <div className="flex flex-col items-center gap-3">
                {/* Stars rating */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-white/90 font-semibold">4.9/5</span>
                </div>
                
                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    className="bg-white text-emerald-700 hover:bg-white/95 font-bold text-base px-8 py-6 shadow-xl shadow-black/20 hover:shadow-2xl transition-all duration-300 group rounded-xl"
                    asChild
                  >
                    <Link to="/afiliado/cadastro">
                      Quero ser Afiliado
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
                
                {/* Urgency text */}
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                  </span>
                  +127 afiliados cadastrados hoje
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo-atentai.png" 
                  alt="AtentAI" 
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-secondary-foreground text-sm mb-6 leading-relaxed opacity-90">
                Simplificamos a Reforma Tributária de 2026 
                para cidadãos, empresas e profissionais.
              </p>
              <div className="flex gap-4">
                {/* Instagram */}
                <a 
                  href="https://instagram.com/atentai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a 
                  href="https://facebook.com/atentai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-bold mb-4 text-secondary-foreground">Navegação</h4>
              <ul className="space-y-3">
                {navigation.map((item) => (
                  <li key={item.section}>
                    <button 
                      onClick={() => onNavigate(item.section)}
                      className="flex items-center gap-2 text-secondary-foreground opacity-90 hover:text-primary hover:opacity-100 transition-colors text-sm"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold mb-4 text-secondary-foreground">Recursos</h4>
              <ul className="space-y-3">
                {resources.map((item) => (
                  <li key={item.label}>
                    {'to' in item ? (
                      <Link 
                        to={item.to}
                        className="text-secondary-foreground opacity-90 hover:text-primary hover:opacity-100 transition-colors text-sm"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a 
                        href={item.href}
                        className="text-secondary-foreground opacity-90 hover:text-primary hover:opacity-100 transition-colors text-sm"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-secondary-foreground">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-secondary-foreground opacity-90">
                  <Mail className="w-4 h-4" />
                  contato@atentai.com.br
                </li>
                <li className="flex items-start gap-3 text-sm text-secondary-foreground opacity-90">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  São Paulo, Vila Lobos
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-secondary-foreground opacity-80">
                © {currentYear} AtentAI. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-6 text-sm text-secondary-foreground opacity-80">
                {legal.map((item) => (
                  <Link 
                    key={item.to} 
                    to={item.to} 
                    className="hover:text-primary hover:opacity-100 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
