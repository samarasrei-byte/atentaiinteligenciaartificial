import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Calculator, Briefcase, ArrowLeft, ArrowRight, Sparkles, Rocket, Star, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import OnboardingParticles from '@/components/onboarding/OnboardingParticles';

type UserType = 'empresa' | 'autonomo' | 'contador';

interface UserTypeOption {
  type: UserType;
  title: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  route: string;
  gradient: string;
  iconBg: string;
  accentColor: string;
}

const userTypeOptions: UserTypeOption[] = [
  {
    type: 'empresa',
    title: 'Empresa',
    description: 'MEI, ME, LTDA ou outra empresa',
    features: ['Simulador de impostos', 'Comparador de regimes', 'Consultoria especializada'],
    icon: Building2,
    route: '/onboarding',
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    accentColor: 'blue',
  },
  {
    type: 'autonomo',
    title: 'Autônomo',
    description: 'Profissional liberal ou freelancer',
    features: ['Análise PF vs PJ', 'Simulador MEI', 'Orientação tributária'],
    icon: Briefcase,
    route: '/autonomo-onboarding',
    gradient: 'from-purple-500 to-pink-500',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    accentColor: 'purple',
  },
  {
    type: 'contador',
    title: 'Contador',
    description: 'Ofereça serviços na plataforma',
    features: ['Captação de clientes', 'Agenda integrada', 'Sistema de saques'],
    icon: Calculator,
    route: '/contador-onboarding',
    gradient: 'from-teal-500 to-emerald-500',
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-500',
    accentColor: 'teal',
  },
];

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredType, setHoveredType] = useState<UserType | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selectedType && !isAnimating) {
        handleContinue();
      }
      // Arrow key navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const currentIndex = selectedType ? userTypeOptions.findIndex(o => o.type === selectedType) : -1;
        const nextIndex = (currentIndex + 1) % userTypeOptions.length;
        setSelectedType(userTypeOptions[nextIndex].type);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const currentIndex = selectedType ? userTypeOptions.findIndex(o => o.type === selectedType) : 0;
        const prevIndex = currentIndex <= 0 ? userTypeOptions.length - 1 : currentIndex - 1;
        setSelectedType(userTypeOptions[prevIndex].type);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedType, isAnimating]);

  const handleSelectType = (option: UserTypeOption) => {
    if (isAnimating) return;
    setSelectedType(option.type);
  };

  const handleContinue = () => {
    const option = userTypeOptions.find(o => o.type === selectedType);
    if (option && !isAnimating) {
      setIsAnimating(true);
      sessionStorage.setItem('selectedUserType', option.type);
      
      setTimeout(() => {
        navigate(option.route);
      }, 500);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden",
      "transition-all duration-700",
      isAnimating && "opacity-0 scale-95"
    )}>
      {/* Animated background */}
      <OnboardingParticles />

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.div 
        className="relative z-10 p-4 md:p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground transition-all hover:scale-105"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-5xl">
          {/* Title Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Animated badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary text-sm font-semibold mb-8 border border-primary/30"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(var(--primary), 0.2)",
                  "0 0 40px rgba(var(--primary), 0.4)",
                  "0 0 20px rgba(var(--primary), 0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Rocket className="h-4 w-4" />
              Começar é simples e rápido
              <Sparkles className="h-4 w-4" />
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Qual é o seu{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                perfil
              </span>
              ?
            </motion.h1>
            
            <motion.p 
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Selecione a opção que melhor descreve você para personalizarmos sua experiência
            </motion.p>
          </motion.div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            {userTypeOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.type;
              const isHovered = hoveredType === option.type;
              
              return (
                <motion.button
                  key={option.type}
                  onClick={() => handleSelectType(option)}
                  onMouseEnter={() => setHoveredType(option.type)}
                  onMouseLeave={() => setHoveredType(null)}
                  disabled={isAnimating}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: isSelected ? 1.02 : 1,
                    rotateY: isHovered ? 5 : 0,
                  }}
                  transition={{ 
                    delay: index * 0.15,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    y: -8,
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative text-left p-8 rounded-3xl border-2 transition-all duration-500",
                    "backdrop-blur-xl overflow-hidden group",
                    "disabled:pointer-events-none",
                    "transform-gpu perspective-1000",
                    isSelected
                      ? "border-primary bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 shadow-2xl shadow-primary/30"
                      : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80"
                  )}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Background gradient */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                      `from-${option.accentColor}-500/20 to-transparent`
                    )}
                    animate={{ opacity: isSelected || isHovered ? 0.5 : 0 }}
                  />

                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.8 }}
                  />

                  {/* Selection ring */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-3xl border-2 border-primary"
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Selection checkmark */}
                  <motion.div 
                    className={cn(
                      "absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      isSelected
                        ? "bg-primary shadow-lg shadow-primary/50"
                        : "border-2 border-muted-foreground/30 bg-transparent"
                    )}
                    animate={{ 
                      scale: isSelected ? 1 : 0.9,
                      rotate: isSelected ? 360 : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {isSelected && (
                      <motion.svg 
                        className="w-4 h-4 text-primary-foreground" 
                        fill="currentColor" 
                        viewBox="0 0 12 12"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </motion.svg>
                    )}
                  </motion.div>

                  {/* Icon */}
                  <motion.div 
                    className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center mb-6",
                      "shadow-xl transition-all duration-300",
                      option.iconBg
                    )}
                    animate={{
                      scale: isSelected ? 1.1 : 1,
                      rotate: isSelected ? [0, 5, -5, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-10 w-10 text-white" />
                    
                    {/* Icon sparkle */}
                    {isSelected && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                    {option.title}
                    {isSelected && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      </motion.span>
                    )}
                  </h3>
                  <p className="text-muted-foreground mb-5">
                    {option.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3">
                    {option.features.map((feature, idx) => (
                      <motion.li 
                        key={idx} 
                        className={cn(
                          "flex items-center gap-3 text-sm transition-all duration-300",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        <motion.div 
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                            isSelected ? "bg-primary/20" : "bg-muted"
                          )}
                          animate={{ scale: isSelected ? 1.1 : 1 }}
                        >
                          <Zap className={cn(
                            "h-3 w-3 transition-colors",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                        </motion.div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col items-center justify-center gap-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative">
              <Button
                size="lg"
                disabled={!selectedType || isAnimating}
                onClick={handleContinue}
                className={cn(
                  "min-w-[280px] h-14 text-lg font-semibold relative overflow-hidden",
                  "bg-gradient-to-r from-primary to-primary/90",
                  "transition-all duration-300",
                  selectedType && "shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105"
                )}
              >
                {/* Button shine */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={selectedType ? { x: ["-100%", "200%"] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />

                <span className="relative z-10 flex items-center">
                  {isAnimating ? (
                    <motion.span
                      className="flex items-center"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Rocket className="h-5 w-5 mr-2 animate-bounce" />
                      Preparando...
                    </motion.span>
                  ) : (
                    <>
                      Continuar
                      <motion.span
                        className="ml-2"
                        animate={selectedType ? { x: [0, 5, 0] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </>
                  )}
                </span>
              </Button>
              
              <AnimatePresence>
                {!selectedType && (
                  <motion.p 
                    className="absolute -bottom-7 left-0 right-0 text-center text-xs text-muted-foreground"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      👆 Selecione um perfil acima
                    </motion.span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-all hover:scale-105"
              onClick={() => navigate('/auth')}
              disabled={isAnimating}
            >
              Já tenho uma conta
            </Button>
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div 
            className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              100% Seguro
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Configuração em 2 minutos
            </span>
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500" />
              +10.000 usuários
            </span>
          </motion.div>
          
          {/* Quick links */}
          <motion.div 
            className="mt-8 pt-6 border-t border-border/50 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-sm text-muted-foreground mb-3">Quer conhecer mais antes de começar?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/planos-perfil')}
                className="hover:text-primary transition-colors"
              >
                Ver todos os planos
              </Button>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/faq')}
                className="hover:text-primary transition-colors"
              >
                Perguntas frequentes
              </Button>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/servicos')}
                className="hover:text-primary transition-colors"
              >
                Nossos serviços
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
