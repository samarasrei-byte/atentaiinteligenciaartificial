import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Sparkles,
  ArrowUp,
  Calculator,
  Building2,
  Zap,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueBoardProps {
  monthlyRevenue: number;
  employeeCount: number;
  onRevenueChange: (value: number) => void;
  onEmployeeChange: (value: number) => void;
  companyType?: string;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
};

const formatNumber = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
};

// Revenue tier definitions based on annual revenue
// MEI: até R$ 81.000/ano
// Microempresa: até R$ 360.000/ano
// EPP: até R$ 4.800.000/ano
// Grande Porte: acima de R$ 4.800.000/ano
const getRevenueTier = (monthlyCents: number) => {
  const annualCents = monthlyCents * 12;
  
  // MEI limit: R$ 81.000/year = 8.100.000 cents
  if (annualCents <= 8100000) return { 
    label: 'MEI', 
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/30',
    description: 'Microempreendedor Individual'
  };
  // Microempresa limit: R$ 360.000/year = 36.000.000 cents
  if (annualCents <= 36000000) return { 
    label: 'Microempresa', 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500/30',
    description: 'Empresa de Pequeno Porte I'
  };
  // EPP limit: R$ 4.800.000/year = 480.000.000 cents
  if (annualCents <= 480000000) return { 
    label: 'EPP', 
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-500/30',
    description: 'Empresa de Pequeno Porte II'
  };
  // Grande Porte: above R$ 4.800.000/year
  return { 
    label: 'Grande Porte', 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
    description: 'Empresa de Grande Porte'
  };
};

// Fiscal benefit threshold
const FISCAL_BENEFIT_THRESHOLD = 60000000; // R$ 600.000/month

export const RevenueBoard: React.FC<RevenueBoardProps> = ({
  monthlyRevenue,
  employeeCount,
  onRevenueChange,
  onEmployeeChange,
  companyType
}) => {
  const [inputValue, setInputValue] = useState(monthlyRevenue > 0 ? formatNumber(monthlyRevenue) : '');
  const [isFocused, setIsFocused] = useState(false);
  const tier = getRevenueTier(monthlyRevenue);
  const annualRevenue = monthlyRevenue * 12;
  const qualifiesForFiscalBenefit = monthlyRevenue >= FISCAL_BENEFIT_THRESHOLD;

  const handleRevenueInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const cents = parseInt(value) * 100 || 0;
    setInputValue(value ? formatNumber(cents) : '');
    onRevenueChange(cents);
  };

  return (
    <div className="space-y-6">
      {/* Main Revenue Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={cn(
          "relative overflow-hidden border-2 transition-all duration-500",
          isFocused 
            ? `${tier.borderColor} shadow-xl` 
            : "border-border"
        )}>
          {/* Gradient background effect */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity duration-500",
            tier.color,
            isFocused && "opacity-10"
          )} />
          
          {/* Animated corner glow */}
          <AnimatePresence>
            {monthlyRevenue > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl",
                  `bg-gradient-to-br ${tier.color} opacity-30`
                )}
              />
            )}
          </AnimatePresence>

          <CardContent className="relative p-6 md:p-8">
            {/* Header with tier badge */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div 
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                    `bg-gradient-to-br ${tier.color}`
                  )}
                  animate={{ 
                    scale: isFocused ? [1, 1.05, 1] : 1,
                    rotate: isFocused ? [0, 5, -5, 0] : 0 
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <DollarSign className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Faturamento Mensal</h3>
                  <p className="text-sm text-muted-foreground">Média dos últimos 12 meses</p>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {monthlyRevenue > 0 && (
                  <motion.div
                    key={tier.label}
                    initial={{ opacity: 0, y: -10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge className={cn(
                      "px-4 py-1.5 text-sm font-semibold",
                      tier.bgColor,
                      tier.textColor,
                      "border",
                      tier.borderColor
                    )}>
                      <Building2 className="h-3.5 w-3.5 mr-1.5" />
                      {tier.label}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Revenue Input */}
            <div className="space-y-3">
              <div className="relative">
                <span className={cn(
                  "absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold transition-colors duration-300",
                  isFocused ? tier.textColor : "text-muted-foreground"
                )}>
                  R$
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleRevenueInput}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="0"
                  className={cn(
                    "pl-16 pr-4 h-20 text-4xl font-bold bg-background/50 border-2 rounded-xl transition-all duration-300",
                    isFocused 
                      ? `${tier.borderColor} ring-4 ring-offset-0 ${tier.bgColor.replace('bg-', 'ring-').replace('/10', '/20')}`
                      : "border-border"
                  )}
                />
              </div>
              
              {/* Annual Revenue Display */}
              <AnimatePresence>
                {monthlyRevenue > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 pt-2"
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Anual:</span>
                      <motion.span 
                        className="text-sm font-bold text-foreground"
                        key={annualRevenue}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {formatCurrency(annualRevenue)}
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Employees Input - Compact */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="employees" className="text-sm font-medium text-foreground">
                      Número de Funcionários
                    </Label>
                  </div>
                </div>
                <Input
                  id="employees"
                  type="number"
                  min="0"
                  value={employeeCount || ''}
                  onChange={(e) => onEmployeeChange(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-28 h-12 text-center text-lg font-semibold"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fiscal Benefit Indicator (teaser) */}
      <AnimatePresence>
        {monthlyRevenue > 0 && monthlyRevenue < FISCAL_BENEFIT_THRESHOLD && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border"
          >
            <Gift className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Empresas com faturamento acima de <strong className="text-foreground">R$ 600.000/mês</strong> ganham uma Análise Fiscal gratuita!
              </p>
            </div>
          </motion.div>
        )}
        
        {qualifiesForFiscalBenefit && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Sparkles className="h-6 w-6 text-emerald-500" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-600">
                🎉 Você se qualifica para uma Análise Fiscal GRATUITA!
              </p>
              <p className="text-xs text-emerald-500/80 mt-0.5">
                Continue para liberar seu benefício exclusivo
              </p>
            </div>
            <ArrowUp className="h-5 w-5 text-emerald-500 animate-bounce" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Preview Card */}
      <AnimatePresence>
        {monthlyRevenue > 0 && companyType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Análise Prévia Ativada
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Com base nos dados informados, vamos calcular os impactos da reforma tributária e identificar oportunidades de economia.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevenueBoard;
