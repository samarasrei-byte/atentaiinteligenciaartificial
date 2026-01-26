import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Cloud, CheckCircle } from 'lucide-react';

interface SplitLoginLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  features?: { icon: React.ElementType; label: string }[];
  accentColor?: 'primary' | 'red' | 'blue';
}

const defaultFeatures = [
  { icon: Shield, label: 'Dados Protegidos' },
  { icon: Cloud, label: '100% Cloud' },
  { icon: Zap, label: 'Alta Performance' }
];

export function SplitLoginLayout({
  children,
  title,
  subtitle,
  features = defaultFeatures,
  accentColor = 'primary'
}: SplitLoginLayoutProps) {
  const accentStyles = {
    primary: {
      glow: 'from-primary/20 via-teal-500/10 to-transparent',
      text: 'text-primary',
      border: 'border-primary/30'
    },
    red: {
      glow: 'from-red-500/20 via-orange-500/10 to-transparent',
      text: 'text-red-400',
      border: 'border-red-500/30'
    },
    blue: {
      glow: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      text: 'text-blue-400',
      border: 'border-blue-500/30'
    }
  };

  const accent = accentStyles[accentColor];

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
        
        {/* Subtle glow effect */}
        <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br ${accent.glow} rounded-full blur-[120px] opacity-50`} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <img 
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-10 w-auto drop-shadow-[0_0_20px_rgba(45,212,191,0.4)]"
            />
          </motion.div>
          
          {/* Main content */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              {title}
            </h1>
            <p className="text-lg text-slate-400 max-w-md">
              {subtitle}
            </p>
            
            {/* Feature carousel placeholder */}
            <motion.div 
              className="flex items-center gap-4 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.glow} border ${accent.border} flex items-center justify-center`}>
                <Zap className={`h-6 w-6 ${accent.text}`} />
              </div>
              <div>
                <h3 className="text-white font-medium">Inteligência Tributária</h3>
                <p className="text-slate-500 text-sm">Análises automatizadas com IA</p>
              </div>
            </motion.div>
            
            {/* Progress dots */}
            <div className="flex gap-2 mt-6">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all ${
                    i === 1 ? `w-6 ${accent.text.replace('text-', 'bg-')}` : 'w-2 bg-slate-700'
                  }`} 
                />
              ))}
            </div>
          </motion.div>
          
          {/* Bottom features */}
          <motion.div 
            className="flex items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-slate-400">
                  <Icon className={`h-4 w-4 ${accent.text}`} />
                  <span className="text-sm">{feature.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
