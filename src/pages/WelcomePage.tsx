import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Calculator, Briefcase, ArrowRight, Sparkles, CheckCircle, Loader2, Rocket, Star, Shield, Zap, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CleanBackground from '@/components/onboarding/CleanBackground';
import confetti from 'canvas-confetti';

type ProfileType = 'empresa' | 'autonomo' | 'contador';

interface ProfileOption {
  type: ProfileType;
  role: 'user' | 'autonomo' | 'contador';
  title: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  iconBg: string;
  gradient: string;
}

const profileOptions: ProfileOption[] = [
  {
    type: 'empresa',
    role: 'user',
    title: 'Empresa',
    description: 'MEI, ME, LTDA ou outra empresa',
    features: ['Simulador de impostos', 'Comparador de regimes', 'Consultoria especializada'],
    icon: Building2,
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    type: 'autonomo',
    role: 'autonomo',
    title: 'Autônomo',
    description: 'Profissional liberal ou freelancer',
    features: ['Análise PF vs PJ', 'Simulador MEI', 'Orientação tributária'],
    icon: Briefcase,
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    gradient: 'from-purple-500/20 to-pink-500/10',
  },
  {
    type: 'contador',
    role: 'contador',
    title: 'Contador',
    description: 'Ofereça serviços na plataforma',
    features: ['Captação de clientes', 'Agenda integrada', 'Sistema de saques'],
    icon: Calculator,
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-500',
    gradient: 'from-teal-500/20 to-emerald-500/10',
  },
];

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [hoveredType, setHoveredType] = useState<ProfileType | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selectedType && !isActivating) {
        handleActivateProfile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedType, isActivating]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleSelectType = (option: ProfileOption) => {
    if (isActivating) return;
    setSelectedType(option.type);
  };

  const handleActivateProfile = async () => {
    if (!selectedType || !user) return;
    
    const option = profileOptions.find(o => o.type === selectedType);
    if (!option) return;

    setIsActivating(true);

    try {
      // Check if user already has this role
      const { data: existingRole, error: existingRoleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', option.role)
        .maybeSingle();

      if (existingRoleError) throw existingRoleError;

      if (!existingRole) {
        // Add the role to user_roles table
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: option.role
          });

        if (error) throw error;
      }

      // Create profile data based on type
      if (option.type === 'autonomo') {
        const { data: existingProfile, error: existingProfileError } = await supabase
          .from('autonomo_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingProfileError) throw existingProfileError;

        if (!existingProfile) {
          const { error: insertError } = await supabase.from('autonomo_profiles').insert({
            user_id: user.id,
          });

          if (insertError) throw insertError;
        }
      } else if (option.type === 'contador') {
        const { data: existingProfile, error: existingProfileError } = await supabase
          .from('contador_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingProfileError) throw existingProfileError;

        if (!existingProfile) {
          const { error: insertError } = await supabase.from('contador_profiles').insert({
            user_id: user.id,
            available: false,
          });

          if (insertError) throw insertError;
        }
      }

      // Refresh user data to get new roles
      await refreshUserData();

      // Show success animation and confetti
      setSuccessAnimation(true);
      triggerConfetti();
      toast.success(`🎉 Perfil ${option.title} ativado com sucesso!`, {
        description: 'Bem-vindo ao AtentAI!',
        duration: 3000,
      });

      // Navigate after animation
      setTimeout(() => {
        switch (option.type) {
          case 'empresa':
            navigate('/empresa');
            break;
          case 'autonomo':
            navigate('/autonomo');
            break;
          case 'contador':
            navigate('/contador');
            break;
        }
      }, 1000);
    } catch (error) {
      console.error('Error activating profile:', error);
      toast.error('Erro ao ativar perfil. Tente novamente.');
      setIsActivating(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden",
      "transition-all duration-700",
      successAnimation && "opacity-0 scale-110"
    )}>
      {/* Clean background */}
      <CleanBackground />

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
              <PartyPopper className="h-4 w-4" />
              Bem-vindo ao AtentAI!
              <Sparkles className="h-4 w-4" />
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Escolha seu{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                perfil
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Selecione o tipo de perfil que deseja ativar para acessar recursos personalizados
            </motion.p>
          </motion.div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            {profileOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.type;
              const isHovered = hoveredType === option.type;
              
              return (
                <motion.button
                  key={option.type}
                  onClick={() => handleSelectType(option)}
                  onMouseEnter={() => setHoveredType(option.type)}
                  onMouseLeave={() => setHoveredType(null)}
                  disabled={isActivating}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: isSelected ? 1.02 : 1,
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
                    "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0",
                    isSelected
                      ? "border-primary bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 shadow-2xl shadow-primary/30"
                      : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80"
                  )}
                >
                  {/* Background gradient */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                      option.gradient
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

                  {/* Selection checkmark */}
                  <motion.div 
                    className={cn(
                      "absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      isSelected
                        ? "bg-primary shadow-lg shadow-primary/50"
                        : "border-2 border-muted-foreground/30 bg-transparent"
                    )}
                    animate={{ scale: isSelected ? 1 : 0.9 }}
                  >
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-primary-foreground" />
                    )}
                  </motion.div>

                  {/* Icon */}
                  <motion.div 
                    className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl",
                      option.iconBg
                    )}
                    animate={{
                      scale: isSelected ? 1.1 : 1,
                      rotate: isSelected ? [0, 5, -5, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-10 w-10 text-white" />
                    
                    {isSelected && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
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
                      >
                        <motion.div 
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                            isSelected ? "bg-primary/20" : "bg-muted"
                          )}
                        >
                          <Zap className={cn(
                            "h-3 w-3",
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

          {/* Action Button */}
          <motion.div 
            className="flex flex-col items-center justify-center gap-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative">
              <Button
                size="lg"
                disabled={!selectedType || isActivating}
                onClick={handleActivateProfile}
                className={cn(
                  "min-w-[280px] h-14 text-lg font-semibold relative overflow-hidden",
                  "bg-gradient-to-r from-primary to-primary/90",
                  "transition-all duration-300",
                  selectedType && !isActivating && "shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105"
                )}
              >
                {/* Button shine */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={selectedType && !isActivating ? { x: ["-100%", "200%"] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />

                <span className="relative z-10 flex items-center">
                  {isActivating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Ativando...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5 mr-2" />
                      Ativar Perfil
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
              Dados seguros
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Sem compromisso
            </span>
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500" />
              Suporte 24h
            </span>
          </motion.div>
          
          {/* Info */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-sm text-muted-foreground">
              Você pode adicionar outros perfis depois nas configurações
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
