import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Receipt, 
  CreditCard, 
  Building2, 
  ArrowRight,
  Calculator,
  Info,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Banknote,
  Clock,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, IBS_RATE, CBS_RATE, BASE_TAX_RATE } from '@/lib/taxConstants';
import { HelpTooltip } from '@/components/ui/help-tooltip';

/**
 * Calculadora de Split Payment LC 214/2025
 * 
 * Conforme Art. 28 a 32 da LC 214/2025:
 * - Split Payment obrigatório a partir de 2026
 * - Retenção automática de CBS e IBS no momento do pagamento
 * - Integração com sistemas de pagamento eletrônico
 */

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  splitRequired: boolean;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'pix',
    name: 'PIX',
    icon: <Wallet className="h-5 w-5" />,
    splitRequired: true,
    description: 'Retenção automática via integração com SPI (Sistema de Pagamentos Instantâneos)'
  },
  {
    id: 'cartao_credito',
    name: 'Cartão de Crédito',
    icon: <CreditCard className="h-5 w-5" />,
    splitRequired: true,
    description: 'Credenciadoras e bandeiras devem reter automaticamente os tributos'
  },
  {
    id: 'cartao_debito',
    name: 'Cartão de Débito',
    icon: <CreditCard className="h-5 w-5" />,
    splitRequired: true,
    description: 'Mesma regra de retenção automática do cartão de crédito'
  },
  {
    id: 'boleto',
    name: 'Boleto Bancário',
    icon: <Receipt className="h-5 w-5" />,
    splitRequired: true,
    description: 'Banco emissor retém tributos no momento da liquidação'
  },
  {
    id: 'transferencia',
    name: 'Transferência Bancária',
    icon: <Banknote className="h-5 w-5" />,
    splitRequired: true,
    description: 'Retenção no momento da transferência entre contas'
  },
  {
    id: 'dinheiro',
    name: 'Dinheiro',
    icon: <Banknote className="h-5 w-5" />,
    splitRequired: false,
    description: 'Não aplicável. Empresa recolhe via GNRE ou documento próprio'
  }
];

interface CompanyType {
  id: string;
  name: string;
  hasCredits: boolean;
  creditFactor: number;
}

const companyTypes: CompanyType[] = [
  { id: 'mei', name: 'MEI', hasCredits: false, creditFactor: 0 },
  { id: 'simples', name: 'Simples Nacional', hasCredits: false, creditFactor: 0 },
  { id: 'lucro_presumido', name: 'Lucro Presumido', hasCredits: true, creditFactor: 0.4 },
  { id: 'lucro_real', name: 'Lucro Real', hasCredits: true, creditFactor: 0.5 }
];

interface SplitPaymentCalculatorProps {
  className?: string;
}

export function SplitPaymentCalculator({ className }: SplitPaymentCalculatorProps) {
  const [transactionValue, setTransactionValue] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [companyType, setCompanyType] = useState('simples');
  const [hasInvoice, setHasInvoice] = useState(true);
  const [year, setYear] = useState(2026);

  const selectedPayment = paymentMethods.find(p => p.id === paymentMethod);
  const selectedCompany = companyTypes.find(c => c.id === companyType);

  // Taxas por ano de transição
  // Alíquotas de transição conforme LC 214/2025
  // CBS: plena (8,8%) a partir de 2027
  // IBS: transição estadual/municipal 2029-2033 (10%, 20%, 30%, 40%, 100% da alíquota final)
  const getTransitionRates = (year: number) => {
    const rates: Record<number, { ibsPercent: number; cbsPercent: number }> = {
      2026: { ibsPercent: 0.1, cbsPercent: 0.9 },
      2027: { ibsPercent: 0.1, cbsPercent: CBS_RATE },
      2028: { ibsPercent: 0.1, cbsPercent: CBS_RATE },
      2029: { ibsPercent: IBS_RATE * 0.10, cbsPercent: CBS_RATE }, // 1,77%
      2030: { ibsPercent: IBS_RATE * 0.20, cbsPercent: CBS_RATE }, // 3,54%
      2031: { ibsPercent: IBS_RATE * 0.30, cbsPercent: CBS_RATE }, // 5,31%
      2032: { ibsPercent: IBS_RATE * 0.40, cbsPercent: CBS_RATE }, // 7,08%
      2033: { ibsPercent: IBS_RATE, cbsPercent: CBS_RATE }          // 17,7%
    };
    return rates[year] || { ibsPercent: IBS_RATE, cbsPercent: CBS_RATE };
  };

  // Cálculos do Split Payment
  const calculation = useMemo(() => {
    const rates = getTransitionRates(year);
    const totalRate = rates.ibsPercent + rates.cbsPercent;
    
    // Valor base (sem impostos inclusos)
    const taxIncluded = transactionValue * (totalRate / 100);
    const netValue = transactionValue - taxIncluded;
    
    // CBS e IBS calculados
    const cbsValue = transactionValue * (rates.cbsPercent / 100);
    const ibsValue = transactionValue * (rates.ibsPercent / 100);
    
    // Créditos (se aplicável)
    const creditFactor = selectedCompany?.creditFactor || 0;
    const potentialCredit = (cbsValue + ibsValue) * creditFactor;
    
    // Valor líquido para o vendedor
    const sellerReceives = transactionValue - cbsValue - ibsValue;
    
    // Se não tem NF, não há split payment automático
    const splitApplied = hasInvoice && selectedPayment?.splitRequired;

    return {
      grossValue: transactionValue,
      cbsValue,
      ibsValue,
      totalTax: cbsValue + ibsValue,
      totalRate,
      netValue,
      sellerReceives,
      potentialCredit,
      netAfterCredit: sellerReceives + potentialCredit,
      splitApplied,
      rates
    };
  }, [transactionValue, year, selectedCompany, hasInvoice, selectedPayment]);

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm border-border/50", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Calculadora de Split Payment
            </CardTitle>
            <CardDescription className="mt-1">
              Simule a retenção automática de CBS e IBS nas transações
            </CardDescription>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400">
            Obrigatório 2026+
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configurações */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Valor da Transação */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Valor da Transação
            </Label>
            <Input
              type="number"
              value={transactionValue}
              onChange={(e) => setTransactionValue(Number(e.target.value))}
              className="bg-muted/50"
              min={0}
            />
          </div>

          {/* Ano de Referência */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Ano de Referência
            </Label>
            <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033].map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Forma de Pagamento
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <span>{method.name}</span>
                      {method.splitRequired && (
                        <Badge variant="outline" className="text-xs ml-2">Split</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Empresa */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Regime Tributário
            </Label>
            <Select value={companyType} onValueChange={setCompanyType}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {companyTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <span>{type.name}</span>
                      {type.hasCredits && (
                        <Badge variant="outline" className="text-xs text-emerald-400">
                          Créditos
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* NF-e */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <Label>Nota Fiscal Eletrônica (NF-e)</Label>
            <HelpTooltip content="Split Payment só é aplicado em transações com documento fiscal" />
          </div>
          <Switch checked={hasInvoice} onCheckedChange={setHasInvoice} />
        </div>

        {/* Método de Pagamento Info */}
        {selectedPayment && (
          <div className={cn(
            "p-3 rounded-lg flex items-start gap-2",
            selectedPayment.splitRequired 
              ? "bg-blue-500/10 border border-blue-500/30"
              : "bg-amber-500/10 border border-amber-500/30"
          )}>
            {selectedPayment.splitRequired ? (
              <Shield className="h-4 w-4 text-blue-400 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
            )}
            <div>
              <p className={cn(
                "font-medium text-sm",
                selectedPayment.splitRequired ? "text-blue-400" : "text-amber-400"
              )}>
                {selectedPayment.name}
              </p>
              <p className="text-xs text-muted-foreground">{selectedPayment.description}</p>
            </div>
          </div>
        )}

        {/* Alíquotas do Ano */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/30">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">CBS {year}</div>
            <div className="text-lg font-bold text-primary">{calculation.rates.cbsPercent}%</div>
          </div>
          <div className="text-center border-x border-border/50">
            <div className="text-xs text-muted-foreground">IBS {year}</div>
            <div className="text-lg font-bold text-primary">{calculation.rates.ibsPercent}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold text-amber-400">{calculation.totalRate.toFixed(1)}%</div>
          </div>
        </div>

        {/* Resultado do Split Payment */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            {calculation.splitApplied ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold text-foreground">Split Payment Aplicado</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="font-semibold text-foreground">Split Payment Não Aplicável</span>
              </>
            )}
          </div>

          {/* Fluxo Visual */}
          <div className="flex items-center justify-between gap-2 mb-4 overflow-x-auto pb-2">
            <div className="text-center min-w-[80px]">
              <div className="text-xs text-muted-foreground">Cliente Paga</div>
              <div className="text-lg font-bold text-foreground">{formatCurrency(calculation.grossValue)}</div>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            
            <div className="text-center min-w-[80px] p-2 rounded-lg bg-background/50">
              <div className="text-xs text-muted-foreground">Retenção CBS</div>
              <div className="text-sm font-bold text-red-400">-{formatCurrency(calculation.cbsValue)}</div>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            
            <div className="text-center min-w-[80px] p-2 rounded-lg bg-background/50">
              <div className="text-xs text-muted-foreground">Retenção IBS</div>
              <div className="text-sm font-bold text-red-400">-{formatCurrency(calculation.ibsValue)}</div>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            
            <div className="text-center min-w-[80px]">
              <div className="text-xs text-muted-foreground">Vendedor Recebe</div>
              <div className="text-lg font-bold text-emerald-500">{formatCurrency(calculation.sellerReceives)}</div>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-background/50 text-center">
              <div className="text-xs text-muted-foreground">Total de Tributos</div>
              <div className="text-xl font-bold text-red-400">{formatCurrency(calculation.totalTax)}</div>
              <div className="text-xs text-muted-foreground">({calculation.totalRate.toFixed(1)}%)</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 text-center">
              <div className="text-xs text-muted-foreground">Valor Líquido</div>
              <div className="text-xl font-bold text-emerald-500">{formatCurrency(calculation.sellerReceives)}</div>
              <div className="text-xs text-muted-foreground">({(100 - calculation.totalRate).toFixed(1)}%)</div>
            </div>
          </div>

          {/* Créditos (se aplicável) */}
          {selectedCompany?.hasCredits && calculation.potentialCredit > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-400">Crédito Tributário Estimado</span>
                </div>
                <span className="font-bold text-emerald-500">+{formatCurrency(calculation.potentialCredit)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado em fator de creditamento de {(selectedCompany.creditFactor * 100).toFixed(0)}% 
                para {selectedCompany.name}
              </p>
            </div>
          )}
        </div>

        {/* Destino dos Tributos */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Para onde vão os tributos retidos?</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
              <div className="text-xs text-muted-foreground">CBS (Federal)</div>
              <div className="font-bold text-blue-400">{formatCurrency(calculation.cbsValue)}</div>
              <div className="text-xs text-muted-foreground mt-1">→ União (RFB)</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
              <div className="text-xs text-muted-foreground">IBS (Est./Mun.)</div>
              <div className="font-bold text-purple-400">{formatCurrency(calculation.ibsValue)}</div>
              <div className="text-xs text-muted-foreground mt-1">→ Estado/Município</div>
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-blue-400 mb-1">O que é Split Payment?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Retenção automática de CBS e IBS no momento do pagamento</li>
              <li>Obrigatório para todas as transações com NF-e a partir de 2026</li>
              <li>Credenciadoras, bancos e fintechs são responsáveis pela retenção</li>
              <li>Vendedor recebe valor líquido já descontado dos tributos</li>
              <li>Elimina inadimplência tributária e sonegação</li>
            </ul>
          </div>
        </div>

        {/* Referência Legal */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
          Fonte: LC 214/2025 • Art. 28 a 32 (Split Payment)
        </p>
      </CardContent>
    </Card>
  );
}

export default SplitPaymentCalculator;
