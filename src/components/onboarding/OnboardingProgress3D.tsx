import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

interface OnboardingProgress3DProps {
  steps: Step[];
  currentStep: number;
}

const OnboardingProgress3D: React.FC<OnboardingProgress3DProps> = ({ steps, currentStep }) => {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="relative py-8">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-full h-24 bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-3xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Progress bar container */}
      <div className="relative z-10 flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step node */}
              <div className="relative flex flex-col items-center">
                {/* Pulse ring for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 m-auto w-20 h-20 rounded-3xl bg-primary/30"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Main step circle */}
                <motion.div
                  className={cn(
                    "relative w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center",
                    "shadow-lg transition-all duration-500 cursor-default",
                    "transform-gpu perspective-1000",
                    isCompleted && "bg-gradient-to-br from-primary to-primary/80 shadow-primary/40",
                    isActive && "bg-gradient-to-br from-primary via-primary to-primary/90 shadow-xl shadow-primary/50",
                    isUpcoming && "bg-card border-2 border-border shadow-md"
                  )}
                  initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    opacity: 1,
                    rotateY: 0,
                    rotateX: isActive ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.6,
                    rotateX: isActive ? {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    } : undefined,
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                  whileHover={{ scale: 1.05, rotateY: 10 }}
                >
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Check className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={cn(
                          isActive ? "text-primary-foreground" : "text-muted-foreground"
                        )}
                      >
                        <StepIcon className="h-6 w-6 md:h-7 md:w-7" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Sparkle effect for active */}
                  {isActive && (
                    <>
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-1 -left-1"
                        animate={{
                          scale: [1.2, 1, 1.2],
                          rotate: [360, 180, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Sparkles className="h-3 w-3 text-primary-foreground/60" />
                      </motion.div>
                    </>
                  )}
                </motion.div>

                {/* Step label */}
                <motion.span
                  className={cn(
                    "mt-3 text-xs md:text-sm font-medium transition-colors duration-300 text-center max-w-[80px]",
                    isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 + 0.3 }}
                >
                  {step.title}
                </motion.span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    className="absolute -bottom-8 w-2 h-2 rounded-full bg-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                )}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="relative w-12 md:w-20 h-1 mx-1 overflow-hidden -mt-6">
                  {/* Background line */}
                  <div className="absolute inset-0 bg-border rounded-full" />
                  
                  {/* Progress line */}
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{
                      width: currentStep > step.id + 1 ? "100%" : currentStep === step.id + 1 ? "50%" : "0%"
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  
                  {/* Shimmer effect */}
                  {(currentStep >= step.id + 1) && (
                    <motion.div
                      className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
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
      <motion.div
        className="mt-8 mx-auto max-w-md h-2 bg-muted rounded-full overflow-hidden"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full relative"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </motion.div>

      <motion.p
        className="text-center text-sm text-muted-foreground mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Etapa {currentStep} de {steps.length} • {Math.round(progress)}% concluído
      </motion.p>
    </div>
  );
};

export default OnboardingProgress3D;
