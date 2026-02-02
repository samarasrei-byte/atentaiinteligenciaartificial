import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface OnboardingSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ElementType;
  required?: boolean;
  error?: string;
  hint?: string;
  delay?: number;
  className?: string;
}

const OnboardingSelect: React.FC<OnboardingSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  icon: Icon,
  required = false,
  error,
  hint,
  delay = 0,
  className,
}) => {
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
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          id={id}
          className={cn(
            "h-12 text-base",
            error && "border-destructive"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="py-3"
            >
              <div>
                <span className="font-medium">{option.label}</span>
                {option.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <motion.p
          className="text-xs text-destructive"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      
      {hint && !error && (
        <p className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </motion.div>
  );
};

export default OnboardingSelect;
