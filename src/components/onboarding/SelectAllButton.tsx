import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectAllButtonProps {
  allSelected: boolean;
  someSelected: boolean;
  onClick: () => void;
  label?: string;
  count?: { selected: number; total: number };
}

const SelectAllButton: React.FC<SelectAllButtonProps> = ({
  allSelected,
  someSelected,
  onClick,
  label = "Selecionar Todos",
  count,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full flex items-center justify-between gap-4 p-4 rounded-2xl",
        "border-2 overflow-hidden transition-all duration-300",
        "backdrop-blur-xl cursor-pointer group",
        allSelected
          ? "border-primary bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 shadow-lg shadow-primary/20"
          : someSelected
            ? "border-primary/50 bg-primary/5"
            : "border-dashed border-muted-foreground/30 bg-card/30 hover:border-primary/50 hover:bg-card/50"
      )}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"
        animate={{
          backgroundPosition: allSelected ? ['0% 50%', '200% 50%'] : '0% 50%',
        }}
        transition={{
          duration: 3,
          repeat: allSelected ? Infinity : 0,
          ease: 'linear',
        }}
      />

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
        initial={{ x: "-100%" }}
        whileHover={{ x: "200%" }}
        transition={{ duration: 0.8 }}
      />

      {/* Left side */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Animated checkbox */}
        <motion.div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
            allSelected
              ? "bg-primary shadow-lg shadow-primary/40"
              : someSelected
                ? "bg-primary/50"
                : "bg-muted border-2 border-muted-foreground/30"
          )}
          animate={{
            scale: allSelected ? [1, 1.1, 1] : 1,
            rotate: allSelected ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: allSelected ? Infinity : 0,
            repeatDelay: 2,
          }}
        >
          <AnimatePresence mode="wait">
            {allSelected || someSelected ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <CheckCheck className={cn(
                  "h-5 w-5",
                  allSelected ? "text-primary-foreground" : "text-primary-foreground/80"
                )} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Zap className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex flex-col items-start">
          <motion.span
            className={cn(
              "font-bold text-base transition-colors duration-300",
              allSelected ? "text-primary" : "text-foreground"
            )}
            animate={{ x: allSelected ? 2 : 0 }}
          >
            {allSelected ? "✓ Todos Selecionados" : label}
          </motion.span>
          {count && (
            <motion.span
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {count.selected} de {count.total} selecionados
            </motion.span>
          )}
        </div>
      </div>

      {/* Right side - visual indicator */}
      <div className="relative z-10 flex items-center gap-2">
        {allSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          </motion.div>
        )}
        
        {/* Progress dots */}
        <div className="flex gap-1">
          {count && Array.from({ length: Math.min(count.total, 8) }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i < count.selected ? "bg-primary" : "bg-muted-foreground/30"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>
    </motion.button>
  );
};

export default SelectAllButton;
