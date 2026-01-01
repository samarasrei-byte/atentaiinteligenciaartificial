import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { 
  formatCPF, 
  formatCNPJ, 
  formatCPFOrCNPJ, 
  formatPhone,
  validateCPF,
  validateCNPJ,
  validateCPFOrCNPJ,
  validatePhone,
  cleanDocument
} from '@/lib/documentValidation';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle } from 'lucide-react';

type MaskType = 'cpf' | 'cnpj' | 'cpf-cnpj' | 'phone';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: MaskType;
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  showValidation?: boolean;
  onValidationChange?: (isValid: boolean, message?: string) => void;
}

export function MaskedInput({ 
  mask, 
  value, 
  onChange, 
  showValidation = true,
  onValidationChange,
  className,
  ...props 
}: MaskedInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');

  const formatValue = (inputValue: string): string => {
    switch (mask) {
      case 'cpf':
        return formatCPF(inputValue);
      case 'cnpj':
        return formatCNPJ(inputValue);
      case 'cpf-cnpj':
        return formatCPFOrCNPJ(inputValue);
      case 'phone':
        return formatPhone(inputValue);
      default:
        return inputValue;
    }
  };

  const validateValue = (inputValue: string): { valid: boolean; message: string } => {
    const cleanValue = cleanDocument(inputValue);
    
    if (cleanValue.length === 0) {
      return { valid: false, message: '' };
    }

    switch (mask) {
      case 'cpf':
        if (cleanValue.length < 11) return { valid: false, message: 'CPF incompleto' };
        return { valid: validateCPF(cleanValue), message: validateCPF(cleanValue) ? 'CPF válido' : 'CPF inválido' };
      case 'cnpj':
        if (cleanValue.length < 14) return { valid: false, message: 'CNPJ incompleto' };
        return { valid: validateCNPJ(cleanValue), message: validateCNPJ(cleanValue) ? 'CNPJ válido' : 'CNPJ inválido' };
      case 'cpf-cnpj':
        const result = validateCPFOrCNPJ(cleanValue);
        if (!result.valid && result.message) {
          return { valid: false, message: result.message };
        }
        return { valid: result.valid, message: result.valid ? `${result.type?.toUpperCase()} válido` : (result.message || 'Documento inválido') };
      case 'phone':
        if (cleanValue.length < 10) return { valid: false, message: 'Telefone incompleto' };
        return { valid: validatePhone(cleanValue), message: validatePhone(cleanValue) ? 'Telefone válido' : 'Telefone inválido' };
      default:
        return { valid: true, message: '' };
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatValue(rawValue);
    const validation = validateValue(formattedValue);
    
    setIsValid(validation.valid);
    setValidationMessage(validation.message);
    onChange(formattedValue, validation.valid);
    onValidationChange?.(validation.valid, validation.message);
  };

  // Validate on mount if value exists
  useEffect(() => {
    if (value) {
      const validation = validateValue(value);
      setIsValid(validation.valid);
      setValidationMessage(validation.message);
    }
  }, []);

  const getPlaceholder = (): string => {
    switch (mask) {
      case 'cpf':
        return '000.000.000-00';
      case 'cnpj':
        return '00.000.000/0001-00';
      case 'cpf-cnpj':
        return 'CPF ou CNPJ';
      case 'phone':
        return '(00) 00000-0000';
      default:
        return '';
    }
  };

  const cleanValue = cleanDocument(value);
  const showIcon = showValidation && cleanValue.length > 0;
  const isComplete = mask === 'cpf' ? cleanValue.length === 11 : 
                     mask === 'cnpj' ? cleanValue.length === 14 :
                     mask === 'cpf-cnpj' ? (cleanValue.length === 11 || cleanValue.length === 14) :
                     cleanValue.length >= 10;

  return (
    <div className="relative">
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        placeholder={props.placeholder || getPlaceholder()}
        className={cn(
          showIcon && isComplete && 'pr-10',
          isComplete && isValid === false && 'border-destructive focus-visible:ring-destructive',
          isComplete && isValid === true && 'border-success focus-visible:ring-success',
          className
        )}
      />
      {showIcon && isComplete && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid ? (
            <CheckCircle className="h-4 w-4 text-success" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
      )}
      {showValidation && validationMessage && isComplete && (
        <p className={cn(
          "text-xs mt-1",
          isValid ? "text-success" : "text-destructive"
        )}>
          {validationMessage}
        </p>
      )}
    </div>
  );
}
