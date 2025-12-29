import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Coins, 
  Users, 
  ShoppingCart, 
  Zap, 
  Fuel, 
  Home, 
  Calculator,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/taxConstants';
import { HelpTooltip } from '@/components/ui/help-tooltip';

/**
 * Simulador de Cashback LC 214/2025
 * 
 * Conforme Art. 134 a 140 da LC 214/2025:
 * - Cashback destinado a famílias de baixa renda inscritas no CadÚnico
 * - Devolução de CBS e IBS sobre produtos essenciais
 * - Percentuais diferenciados por categoria de consumo
 */

interface CashbackCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  cbsReturn: number; // % de devolução da CBS
  ibsReturn: number; // % de devolução do IBS
  description: string;
  examples: string[];
}

const cashbackCategories: CashbackCategory[] = [
  {
    id: 'energia',
    name: 'Energia Elétrica',
    icon: <Zap className="h-5 w-5" />,
    cbsReturn: 100, // 100% da CBS devolvida
    ibsReturn: 100, // 100% do IBS devolvido
    description: 'Devolução integral de CBS e IBS sobre energia elétrica residencial',
    examples: ['Conta de luz residencial']
  },
  {
    id: 'gas',
    name: 'Gás de Cozinha',
    icon: <Fuel className="h-5 w-5" />,
    cbsReturn: 100,
    ibsReturn: 100,
    description: 'Devolução integral sobre GLP até 13kg (botijão de gás)',
    examples: ['Botijão de gás 13kg', 'Gás encanado residencial']
  },
  {
    id: 'agua',
    name: 'Água e Esgoto',
    icon: <Home className="h-5 w-5" />,
    cbsReturn: 100,
    ibsReturn: 100,
    description: 'Devolução integral sobre fornecimento de água e tratamento de esgoto',
    examples: ['Conta de água', 'Tarifa de esgoto']
  },
  {
    id: 'alimentos',
    name: 'Cesta Básica',
    icon: <ShoppingCart className="h-5 w-5" />,
    cbsReturn: 100,
    ibsReturn: 20, // Estados podem definir até 20%
    description: 'Devolução de 100% CBS e até 20% IBS sobre alimentos da cesta básica',
    examples: ['Arroz', 'Feijão', 'Leite', 'Pão', 'Carnes', 'Ovos']
  },
  {
    id: 'outros',
    name: 'Outros Produtos',
    icon: <ShoppingCart className="h-5 w-5" />,
    cbsReturn: 20,
    ibsReturn: 20,
    description: 'Devolução parcial sobre demais bens e serviços',
    examples: ['Produtos de higiene', 'Vestuário básico', 'Medicamentos']
  }
];

interface FamilyProfile {
  id: string;
  name: string;
  description: string;
  monthlyIncome: number;
  familySize: number;
  eligible: boolean;
}

const familyProfiles: FamilyProfile[] = [
  {
    id: 'extrema_pobreza',
    name: 'Extrema Pobreza',
    description: 'Renda per capita até R$ 218/mês',
    monthlyIncome: 872,
    familySize: 4,
    eligible: true
  },
  {
    id: 'pobreza',
    name: 'Pobreza',
    description: 'Renda per capita até R$ 660/mês',
    monthlyIncome: 2640,
    familySize: 4,
    eligible: true
  },
  {
    id: 'baixa_renda',
    name: 'Baixa Renda',
    description: 'Até 3 salários mínimos familiar',
    monthlyIncome: 4236,
    familySize: 4,
    eligible: true
  },
  {
    id: 'nao_elegivel',
    name: 'Acima do Limite',
    description: 'Renda acima do limite do CadÚnico',
    monthlyIncome: 6000,
    familySize: 4,
    eligible: false
  }
];

// Alíquotas de referência LC 214/2025
const CBS_RATE = 8.8;
const IBS_RATE = 17.7;

interface CashbackSimulatorProps {
  className?: string;
}

export function CashbackSimulator({ className }: CashbackSimulatorProps) {
  const [selectedProfile, setSelectedProfile] = useState<string>('pobreza');
  const [familySize, setFamilySize] = useState(4);
  const [monthlySpending, setMonthlySpending] = useState({
    energia: 150,
    gas: 100,
    agua: 80,
    alimentos: 800,
    outros: 400
  });

  const profile = familyProfiles.find(p => p.id === selectedProfile);
  const isEligible = profile?.eligible ?? false;

  // Calcula o cashback por categoria
  const cashbackDetails = useMemo(() => {
    return cashbackCategories.map(category => {
      const spending = monthlySpending[category.id as keyof typeof monthlySpending] || 0;
      
      // Valor dos impostos embutidos
      const cbsAmount = spending * (CBS_RATE / (100 + CBS_RATE + IBS_RATE));
      const ibsAmount = spending * (IBS_RATE / (100 + CBS_RATE + IBS_RATE));
      
      // Valor devolvido
      const cbsReturned = cbsAmount * (category.cbsReturn / 100);
      const ibsReturned = ibsAmount * (category.ibsReturn / 100);
      
      return {
        ...category,
        spending,
        cbsAmount,
        ibsAmount,
        cbsReturned,
        ibsReturned,
        totalReturned: cbsReturned + ibsReturned
      };
    });
  }, [monthlySpending]);

  // Totais
  const totals = useMemo(() => {
    const totalSpending = Object.values(monthlySpending).reduce((a, b) => a + b, 0);
    const totalCashback = cashbackDetails.reduce((sum, cat) => sum + cat.totalReturned, 0);
    const annualCashback = totalCashback * 12;
    
    return {
      totalSpending,
      totalCashback,
      annualCashback,
      percentageReturn: (totalCashback / totalSpending) * 100
    };
  }, [cashbackDetails, monthlySpending]);

  const handleSpendingChange = (category: string, value: number) => {
    setMonthlySpending(prev => ({
      ...prev,
      [category]: value
    }));
  };

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm border-border/50", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" />
              Simulador de Cashback LC 214/2025
            </CardTitle>
            <CardDescription className="mt-1">
              Calcule a devolução de impostos para famílias de baixa renda
            </CardDescription>
          </div>
          <HelpTooltip content="Programa de devolução de CBS e IBS para famílias inscritas no CadÚnico, conforme Art. 134-140 da LC 214/2025" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Perfil da Família */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <Label className="font-semibold">Perfil da Família</Label>
          </div>
          
          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger className="bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {familyProfiles.map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center gap-2">
                    <span>{profile.name}</span>
                    {!profile.eligible && (
                      <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive">
                        Não elegível
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {profile && (
            <div className="p-3 rounded-lg bg-muted/30 text-sm">
              <p className="text-muted-foreground">{profile.description}</p>
              <p className="mt-1">
                Renda familiar: <span className="font-medium text-foreground">
                  {formatCurrency(profile.monthlyIncome)}
                </span>
              </p>
            </div>
          )}

          {/* Tamanho da Família */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Número de pessoas na família</Label>
              <span className="text-sm font-medium text-primary">{familySize}</span>
            </div>
            <Slider
              value={[familySize]}
              onValueChange={([v]) => setFamilySize(v)}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
          </div>
        </div>

        {/* Elegibilidade */}
        {!isEligible ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Família não elegível</p>
              <p className="text-sm text-muted-foreground mt-1">
                O programa de cashback é destinado exclusivamente a famílias inscritas no CadÚnico 
                com renda dentro dos limites estabelecidos pela LC 214/2025.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Gastos por Categoria */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <Label className="font-semibold">Gastos Mensais Estimados</Label>
              </div>
              
              <div className="grid gap-3">
                {cashbackCategories.map(category => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span className="text-sm">{category.name}</span>
                        <HelpTooltip content={category.description} />
                      </div>
                      <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400">
                        CBS {category.cbsReturn}% + IBS {category.ibsReturn}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={monthlySpending[category.id as keyof typeof monthlySpending]}
                        onChange={(e) => handleSpendingChange(category.id, Number(e.target.value))}
                        className="bg-muted/50"
                        min={0}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Cashback: {formatCurrency(cashbackDetails.find(c => c.id === category.id)?.totalReturned || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resultado */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-primary/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold text-foreground">Resumo do Cashback</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-sm text-muted-foreground">Gasto Mensal Total</div>
                  <div className="text-xl font-bold text-foreground">{formatCurrency(totals.totalSpending)}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-sm text-muted-foreground">Cashback Mensal</div>
                  <div className="text-xl font-bold text-emerald-500">{formatCurrency(totals.totalCashback)}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-sm text-muted-foreground">Cashback Anual</div>
                  <div className="text-xl font-bold text-emerald-500">{formatCurrency(totals.annualCashback)}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-sm text-muted-foreground">% de Retorno</div>
                  <div className="text-xl font-bold text-primary">{totals.percentageReturn.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Detalhamento */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Detalhamento por Categoria</Label>
              <div className="divide-y divide-border/50">
                {cashbackDetails.filter(c => c.spending > 0).map(category => (
                  <div key={category.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-emerald-500">
                        +{formatCurrency(category.totalReturned)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        CBS: {formatCurrency(category.cbsReturned)} | IBS: {formatCurrency(category.ibsReturned)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Informações Legais */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-blue-400 mb-1">Como funciona o Cashback?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Família deve estar inscrita no CadÚnico</li>
              <li>CPF deve ser informado nas compras (NF-e)</li>
              <li>Devolução automática via PIX cadastrado no CadÚnico</li>
              <li>Valores depositados mensalmente a partir de 2026</li>
            </ul>
          </div>
        </div>

        {/* Referência Legal */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
          Fonte: LC 214/2025 • Art. 134 a 140 (Cashback para Famílias de Baixa Renda)
        </p>
      </CardContent>
    </Card>
  );
}

export default CashbackSimulator;
