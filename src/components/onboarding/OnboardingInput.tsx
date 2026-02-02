import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, AlertCircle } from 'lucide-react';

interface OnboardingInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  required?: boolean;
  error?: string;
  success?: boolean;
  successMessage?: string;
  hint?: string;
  autoFocus?: boolean;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email';
  maxLength?: number;
  delay?: number;
  className?: string;
}

const OnboardingInput: React.FC<OnboardingInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon: Icon,
  required = false,
  error,
  success,
  successMessage,
  hint,
  autoFocus = false,
  inputMode = 'text',
  maxLength,
  delay = 0,
  className,
}) => {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <motion.div
      className={cn("space-y-2", className)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Label 
        htmlFor={id} 
        className="flex items-center gap-2 text-sm font-medium"
      >
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          inputMode={inputMode}
          maxLength={maxLength}
          className={cn(
            "h-12 text-base transition-all duration-200",
            "focus:ring-2 focus:ring-primary/20 focus:border-primary",
            hasError && "border-destructive focus:ring-destructive/20 focus:border-destructive",
            hasSuccess && "border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500",
            (hasError || hasSuccess) && "pr-10"
          )}
        />
        
        {/* Status icon */}
        {(hasError || hasSuccess) && (
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {hasError && <AlertCircle className="h-5 w-5 text-destructive" />}
            {hasSuccess && <Check className="h-5 w-5 text-emerald-500" />}
          </motion.div>
        )}
      </div>

      {/* Messages */}
      {hasError && (
        <motion.p
          className="text-xs text-destructive flex items-center gap-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      
      {hasSuccess && successMessage && (
        <motion.p
          className="text-xs text-emerald-600 flex items-center gap-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Check className="h-3 w-3" />
          {successMessage}
        </motion.p>
      )}
      
      {hint && !hasError && !hasSuccess && (
        <p className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </motion.div>
  );
};

export default OnboardingInput;
