import { 
  Calculator, MessageCircle, Users, Mail, MapPin, ArrowUp, DollarSign, 
  ArrowRight, TrendingUp, Star, Building2, FileText, Shield, HelpCircle,
  CreditCard, Briefcase, UserPlus
} from "lucide-react";
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

  // Platform Navigation
  const platformLinks = [
    { label: "AtentAI", to: "/", icon: Calculator },
    { label: "Simulador", to: "/simulador", icon: Calculator },
    { label: "Marketplace", to: "/servicos", icon: Briefcase },
    { label: "Limpa Nome PF", to: "/limpa-nome", icon: CreditCard },
    { label: "Limpa Nome CNPJ", to: "/limpa-nome", icon: Building2 },
    { label: "Módulo Fiscal", to: "/modulo-fiscal", icon: FileText },
  ];

  // Resources
  const resourceLinks = [
    { label: "Timeline da Reforma", to: "/timeline-reforma" },
    { label: "Transição 2026-2033", to: "/transicao-tributaria" },
    { label: "Ferramentas LC 214", to: "/ferramentas-lc214" },
    { label: "FAQ", to: "/faq" },
    { label: "Planos e Preços", to: "/pricing" },
  ];

  // Partner & Affiliate
  const partnerLinks = [
    { label: "Contadores", to: "/contadores-publico", highlight: false },
    { label: "Seja Afiliado", to: "/afiliado/cadastro", highlight: true },
    { label: "Login Afiliado", to: "/auth", highlight: false },
  ];

  // Legal & Support
  const legalLinks = [
    { label: "Sobre a AtentAI", to: "/sobre" },
    { label: "Termos de Uso", to: "/termos" },
    { label: "Política de Privacidade", to: "/privacidade" },
    { label: "Suporte", to: "/suporte" },
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

      <footer className="bg-slate-900 text-white">
        {/* Affiliate CTA Banner - ULTRA PREMIUM */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20" />
          
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-yellow-400/30 rounded-full blur-[80px]"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-20 top-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-300/20 rounded-full blur-[100px]"
          />
          
          <div className="container mx-auto px-4 py-10 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <motion.div 
                  animate={{ boxShadow: ["0 0 20px rgba(255,255,255,0.2)", "0 0 40px rgba(255,255,255,0.4)", "0 0 20px rgba(255,255,255,0.2)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
                >
                  <DollarSign className="w-8 h-8 text-white" />
                </motion.div>
                
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40">
                    <TrendingUp className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                      Programa de Afiliados • 20% Comissão
                    </span>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-tight">
                    Ganhe de{' '}<span className="text-yellow-300">R$ 500</span>{' '}a{' '}
                    <span className="text-emerald-300">R$ 13.000</span>{' '}por venda!
                  </h3>
                  
                  <p className="text-sm sm:text-base text-white/80 mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-2">
                    <span>💰 Comissão de 20% garantida</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Alta taxa de conversão</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-white/90 font-semibold">4.9/5</span>
                </div>
                
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
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

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo-atentai.png" 
                  alt="AtentAI" 
                  className="h-14 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Simplificamos a Reforma Tributária de 2026 
                para cidadãos, empresas e profissionais.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                <a 
                  href="https://instagram.com/atentai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-600 hover:scale-110 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://facebook.com/atentai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/company/atentai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="font-bold mb-4 text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Plataforma
              </h4>
              <ul className="space-y-3">
                {platformLinks.map((item) => (
                  <li key={item.to + item.label}>
                    <Link 
                      to={item.to}
                      className="flex items-center gap-2 text-white/70 hover:text-emerald-400 transition-colors text-sm"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold mb-4 text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Recursos
              </h4>
              <ul className="space-y-3">
                {resourceLinks.map((item) => (
                  <li key={item.to}>
                    <Link 
                      to={item.to}
                      className="text-white/70 hover:text-cyan-400 transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partner & Affiliate */}
            <div>
              <h4 className="font-bold mb-4 text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-yellow-400" />
                Parceiros
              </h4>
              <ul className="space-y-3">
                {partnerLinks.map((item) => (
                  <li key={item.to}>
                    <Link 
                      to={item.to}
                      className={`text-sm transition-colors ${
                        item.highlight 
                          ? 'text-yellow-400 hover:text-yellow-300 font-semibold' 
                          : 'text-white/70 hover:text-yellow-400'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h4 className="font-bold mb-4 text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Institucional
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((item) => (
                  <li key={item.to}>
                    <Link 
                      to={item.to}
                      className="text-white/70 hover:text-blue-400 transition-colors text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Contact */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <h5 className="font-semibold text-sm mb-3 text-white">Contato</h5>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    contato@atentai.com.br
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    São Paulo, SP
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/60">
                © {currentYear} AtentAI. Todos os direitos reservados.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 sm:gap-6 text-sm text-white/60">
                <Link to="/termos" className="hover:text-white transition-colors">
                  Termos
                </Link>
                <Link to="/privacidade" className="hover:text-white transition-colors">
                  Privacidade
                </Link>
                <Link to="/auth" className="hover:text-white transition-colors flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
