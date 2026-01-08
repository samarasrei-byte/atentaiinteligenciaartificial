import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface GlowingProgressProps {
  steps: Step[];
  currentStep: number;
}

const GlowingProgress: React.FC<GlowingProgressProps> = ({ steps, currentStep }) => {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="relative py-6">
      {/* Background glow pulse */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-16 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-2xl" />
      </motion.div>

      {/* Steps container */}
      <div className="relative z-10 flex items-center justify-between max-w-2xl mx-auto px-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step node */}
              <div className="relative flex flex-col items-center">
                {/* Outer pulse ring for active */}
                {isActive && (
                  <>
                    <motion.div
                      className="absolute w-16 h-16 rounded-2xl bg-primary/30"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                    <motion.div
                      className="absolute w-16 h-16 rounded-2xl bg-primary/20"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0.5,
                      }}
                    />
                  </>
                )}

                {/* Main step circle */}
                <motion.div
                  className={cn(
                    "relative w-14 h-14 rounded-2xl flex items-center justify-center",
                    "shadow-lg transition-all duration-500",
                    isCompleted && "bg-gradient-to-br from-primary to-primary/80 shadow-primary/40",
                    isActive && "bg-gradient-to-br from-primary via-primary to-purple-500 shadow-xl shadow-primary/50",
                    isUpcoming && "bg-card/80 backdrop-blur border-2 border-border"
                  )}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    opacity: 1,
                    y: isActive ? -4 : 0,
                  }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Check className="h-6 w-6 text-primary-foreground" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={isActive ? "text-primary-foreground" : "text-muted-foreground"}
                      >
                        <StepIcon className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Sparkles for active */}
                  {isActive && (
                    <>
                      <motion.div
                        className="absolute -top-2 -right-2"
                        animate={{
                          scale: [1, 1.3, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-1 -left-2"
                        animate={{
                          scale: [1.2, 1, 1.2],
                          rotate: [360, 180, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                      </motion.div>
                    </>
                  )}
                </motion.div>

                {/* Step label */}
                <motion.span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[70px] transition-colors",
                    isActive ? "text-primary font-semibold" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {step.title}
                </motion.span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 relative h-1 mx-2 -mt-6 overflow-hidden rounded-full bg-border">
                  {/* Animated progress */}
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-purple-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{
                      width: currentStep > step.id + 1 ? "100%" : currentStep === step.id + 1 ? "50%" : "0%"
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                  
                  {/* Shimmer effect */}
                  {currentStep >= step.id + 1 && (
                    <motion.div
                      className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="mt-6 mx-auto max-w-sm px-4">
        <motion.div
          className="h-1.5 bg-muted rounded-full overflow-hidden"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full relative"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
        
        <motion.p
          className="text-center text-xs text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {Math.round(progress)}% completo
        </motion.p>
      </div>
    </div>
  );
};

export default GlowingProgress;
