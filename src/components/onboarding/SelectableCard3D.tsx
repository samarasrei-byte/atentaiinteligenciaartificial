import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectableCard3DProps {
  id: string;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ElementType;
  compact?: boolean;
  gradient?: string;
  delay?: number;
  accentColor?: string;
}

const SelectableCard3D: React.FC<SelectableCard3DProps> = ({
  id,
  label,
  description,
  selected,
  onClick,
  icon: Icon,
  compact = false,
  gradient = "from-primary/20 to-primary/5",
  delay = 0,
  accentColor = 'primary',
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
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: selected ? 1.02 : 1,
        rotateX: isHovering ? mousePosition.y * -8 : 0,
        rotateY: isHovering ? mousePosition.x * 8 : 0,
      }}
      transition={{
        delay,
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative w-full text-left rounded-2xl border-2 overflow-hidden",
        "transition-all duration-300 cursor-pointer",
        "transform-gpu perspective-1000",
        compact ? "p-4" : "p-5",
        selected
          ? "border-primary bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 shadow-xl shadow-primary/20"
          : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80"
      )}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Animated border glow */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)`,
          }}
          animate={{
            backgroundPosition: ['0% 50%', '200% 50%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Glow effect on hover */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
          gradient
        )}
        animate={{
          opacity: isHovering || selected ? 0.4 : 0,
        }}
      />

      {/* Dynamic shine effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isHovering
            ? `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(255,255,255,0.2) 0%, transparent 50%)`
            : "none",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-start gap-4">
        {/* Checkbox with animation */}
        <motion.div
          className={cn(
            "flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
            selected 
              ? "border-primary bg-primary shadow-lg shadow-primary/30" 
              : "border-muted-foreground/40 bg-transparent hover:border-primary/50"
          )}
          animate={{
            scale: selected ? 1.1 : 1,
            rotateZ: selected ? [0, -10, 10, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
            </motion.div>
          )}
        </motion.div>

        {/* Icon */}
        {Icon && (
          <motion.div
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              selected 
                ? "bg-primary/20 text-primary" 
                : "bg-muted text-muted-foreground"
            )}
            animate={{
              scale: selected ? [1, 1.1, 1] : 1,
              rotate: selected ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        )}

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <motion.p
            className={cn(
              "font-semibold transition-colors duration-300",
              compact ? "text-sm" : "text-base",
              selected ? "text-foreground" : "text-foreground/80"
            )}
            animate={{ x: selected ? 2 : 0 }}
          >
            {label}
          </motion.p>
          {description && (
            <motion.p
              className={cn(
                "text-muted-foreground mt-1 transition-colors duration-300",
                compact ? "text-xs" : "text-sm"
              )}
              animate={{ opacity: selected ? 1 : 0.7 }}
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Selection sparkle */}
        {selected && (
          <motion.div
            className="absolute top-3 right-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Bottom border glow */}
      {selected && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  );
};

export default SelectableCard3D;
