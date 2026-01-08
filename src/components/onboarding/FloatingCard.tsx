import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingCardProps {
  type: string;
  title: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  gradient: string;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}

const FloatingCard: React.FC<FloatingCardProps> = ({
  type,
  title,
  description,
  features,
  icon: Icon,
  gradient,
  selected,
  onClick,
  delay = 0,
}) => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <motion.button
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -15 }}
      animate={{
        opacity: 1,
        y: selected ? -8 : 0,
        scale: selected ? 1.03 : 1,
        rotateX: isHovering ? mousePosition.y * -10 : 0,
        rotateY: isHovering ? mousePosition.x * 10 : 0,
      }}
      transition={{
        delay,
        duration: 0.6,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{ scale: 1.04, y: -10 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full text-left p-6 md:p-8 rounded-3xl border-2 overflow-hidden",
        "transition-all duration-500 cursor-pointer group",
        "transform-gpu perspective-1000 backdrop-blur-xl",
        selected
          ? "border-primary bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 shadow-2xl shadow-primary/30"
          : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/70"
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Animated border */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            border: '2px solid transparent',
            background: `linear-gradient(90deg, transparent, hsl(var(--primary)), transparent) border-box`,
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}

      {/* Background gradient */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
          gradient
        )}
        animate={{ opacity: isHovering || selected ? 0.4 : 0 }}
      />

      {/* Dynamic light effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isHovering
            ? `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
            : "none",
        }}
      />

      {/* Shine sweep effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
        initial={{ x: "-100%" }}
        whileHover={{ x: "200%" }}
        transition={{ duration: 0.8 }}
      />

      {/* Selection ring animation */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-primary pointer-events-none"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Selection checkmark */}
      <motion.div
        className={cn(
          "absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
          selected
            ? "bg-primary shadow-lg shadow-primary/50"
            : "border-2 border-muted-foreground/30"
        )}
        animate={{
          scale: selected ? 1 : 0.9,
          rotate: selected ? 360 : 0,
        }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <Check className="h-5 w-5 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>

      {/* Icon with 3D effect */}
      <motion.div
        className={cn(
          "relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6",
          "shadow-xl transition-all duration-300",
          `bg-gradient-to-br ${gradient}`
        )}
        animate={{
          scale: selected ? 1.15 : 1,
          rotateZ: selected ? [0, 5, -5, 0] : 0,
        }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
      >
        <Icon className="h-10 w-10 text-white drop-shadow-lg" />
        
        {/* Icon sparkle */}
        {selected && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="h-5 w-5 text-yellow-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <motion.h3
          className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2"
          animate={{ x: selected ? 3 : 0 }}
        >
          {title}
          {selected && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </motion.span>
          )}
        </motion.h3>
        
        <motion.p
          className="text-muted-foreground mb-5"
          animate={{ opacity: selected ? 1 : 0.8 }}
        >
          {description}
        </motion.p>

        {/* Features list */}
        <ul className="space-y-2.5">
          {features.map((feature, idx) => (
            <motion.li
              key={idx}
              className={cn(
                "flex items-center gap-3 text-sm transition-all duration-300",
                selected ? "text-foreground" : "text-muted-foreground"
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 * idx }}
            >
              <motion.div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                  selected ? "bg-primary/20" : "bg-muted"
                )}
                animate={{ scale: selected ? 1.1 : 1 }}
              >
                <Zap className={cn(
                  "h-3 w-3 transition-colors",
                  selected ? "text-primary" : "text-muted-foreground"
                )} />
              </motion.div>
              {feature}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Bottom glow */}
      {selected && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  );
};

export default FloatingCard;
