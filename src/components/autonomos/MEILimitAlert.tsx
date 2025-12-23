import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';

interface MEILimitAlertProps {
  monthlyRevenue: number;
  onSimulate?: () => void;
}

const MEI_ANNUAL_LIMIT = 8100000; // R$ 81.000,00 em centavos
const MEI_MONTHLY_LIMIT = MEI_ANNUAL_LIMIT / 12; // ~R$ 6.750,00

export function MEILimitAlert({ monthlyRevenue, onSimulate }: MEILimitAlertProps) {
  const annualRevenue = monthlyRevenue * 12;
  const percentOfLimit = (annualRevenue / MEI_ANNUAL_LIMIT) * 100;
  
  // Não mostrar se não tem receita ou está bem abaixo do limite
  if (monthlyRevenue <= 0 || percentOfLimit < 70) {
    return null;
  }

  const isOverLimit = annualRevenue > MEI_ANNUAL_LIMIT;
  const isNearLimit = percentOfLimit >= 70 && percentOfLimit <= 100;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  if (isOverLimit) {
    return (
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="font-bold">⚠️ Limite MEI Ultrapassado!</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Seu faturamento anual projetado é de <strong>{formatCurrency(annualRevenue)}</strong>, 
            ultrapassando o limite do MEI de <strong>{formatCurrency(MEI_ANNUAL_LIMIT)}</strong> em{' '}
            <strong>{formatCurrency(annualRevenue - MEI_ANNUAL_LIMIT)}</strong>.
          </p>
          <div className="bg-destructive/20 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">O que acontece agora?</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Você deve migrar para ME (Microempresa) ou outro regime</li>
              <li>Se ultrapassar até 20%, paga DAS complementar sobre o excedente</li>
              <li>Se ultrapassar mais de 20%, desenquadramento retroativo ao início do ano</li>
            </ul>
          </div>
          {onSimulate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSimulate}
              className="gap-2 border-destructive/50 hover:bg-destructive/20"
            >
              <TrendingUp className="h-4 w-4" />
              Simular Migração para ME
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isNearLimit) {
    return (
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="font-bold text-amber-700">
          ⚡ Atenção: Próximo do Limite MEI
        </AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Seu faturamento anual projetado é de <strong>{formatCurrency(annualRevenue)}</strong>, 
            representando <strong>{percentOfLimit.toFixed(1)}%</strong> do limite MEI.
          </p>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${Math.min(percentOfLimit, 100)}%` }}
            />
          </div>
          <p className="text-sm">
            Falta <strong>{formatCurrency(MEI_ANNUAL_LIMIT - annualRevenue)}</strong> para atingir o limite.
            Considere avaliar a migração para ME antes de ultrapassar.
          </p>
          {onSimulate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSimulate}
              className="gap-2 border-amber-500/50 hover:bg-amber-500/20"
            >
              <TrendingUp className="h-4 w-4" />
              Simular Comparativo MEI vs ME
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
