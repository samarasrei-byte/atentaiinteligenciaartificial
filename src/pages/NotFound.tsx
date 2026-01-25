import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <img 
            src="/logo-atentai.png" 
            alt="AtentAI" 
            className="h-10 w-auto mx-auto opacity-60"
          />
        </motion.div>

        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <span className="text-8xl md:text-9xl font-bold bg-gradient-to-b from-white to-slate-600 bg-clip-text text-transparent">
            404
          </span>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 space-y-3"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            Página não encontrada
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida para outro endereço.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-teal-400 hover:from-primary/90 hover:to-teal-400/90 text-slate-900 font-semibold shadow-lg shadow-primary/25"
          >
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-6 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white"
          >
            <Link to="/auth">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Fazer Login
            </Link>
          </Button>
        </motion.div>

        {/* Help Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 pt-8 border-t border-slate-800"
        >
          <p className="text-sm text-slate-500 mb-4">Precisa de ajuda?</p>
          <div className="flex items-center justify-center gap-6">
            <Link 
              to="/faq" 
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Perguntas Frequentes
            </Link>
            <Link 
              to="/suporte" 
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
              Suporte
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
