import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Cronograma de transição tributária conforme LC 214/2025
 * Percentual do novo sistema implementado em cada ano
 */
export const TRANSITION_RATES = {
  2026: { ibs: 0.1, cbs: 0.9, total: 1.0, percentImplemented: 0, phase: "Teste" },
  2027: { ibs: 0.1, cbs: 0.9, total: 1.0, percentImplemented: 0, phase: "Teste" },
  2028: { ibs: 0.1, cbs: 0.9, total: 1.0, percentImplemented: 0, phase: "Teste" },
  2029: { ibs: 1.77, cbs: 0.88, total: 2.65, percentImplemented: 10, phase: "10%" },
  2030: { ibs: 3.54, cbs: 1.76, total: 5.30, percentImplemented: 20, phase: "20%" },
  2031: { ibs: 7.08, cbs: 3.52, total: 10.60, percentImplemented: 40, phase: "40%" },
  2032: { ibs: 12.39, cbs: 6.16, total: 18.55, percentImplemented: 70, phase: "70%" },
  2033: { ibs: 17.7, cbs: 8.8, total: 26.5, percentImplemented: 100, phase: "Definitivo" },
} as const;

export type TransitionYear = keyof typeof TRANSITION_RATES;

interface YearSelectorProps {
  value: TransitionYear;
  onChange: (year: TransitionYear) => void;
  className?: string;
}

export function YearSelector({ value, onChange, className }: YearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const selectedRate = TRANSITION_RATES[value];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label className="text-slate-300 flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Ano de Referência
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-slate-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Selecione o ano para ver a carga tributária progressiva conforme o cronograma de transição da reforma (LC 214/2025).</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v) as TransitionYear)}>
        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
          <SelectValue placeholder="Selecione o ano" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {Object.entries(TRANSITION_RATES).map(([year, rates]) => (
            <SelectItem key={year} value={year}>
              <div className="flex items-center gap-2">
                <span>{year}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    rates.phase === "Definitivo" 
                      ? "border-green-500 text-green-400" 
                      : rates.phase === "Teste"
                        ? "border-amber-500 text-amber-400"
                        : "border-cyan-500 text-cyan-400"
                  }`}
                >
                  {rates.phase}
                </Badge>
                {Number(year) === currentYear && (
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">Atual</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected year info */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="text-center p-2 rounded bg-blue-900/30">
          <div className="text-xs text-blue-400">IBS</div>
          <div className="font-semibold text-blue-300">{selectedRate.ibs}%</div>
        </div>
        <div className="text-center p-2 rounded bg-green-900/30">
          <div className="text-xs text-green-400">CBS</div>
          <div className="font-semibold text-green-300">{selectedRate.cbs}%</div>
        </div>
        <div className="text-center p-2 rounded bg-cyan-900/30">
          <div className="text-xs text-cyan-400">Total</div>
          <div className="font-bold text-cyan-300">{selectedRate.total}%</div>
        </div>
      </div>

      {selectedRate.percentImplemented > 0 && selectedRate.percentImplemented < 100 && (
        <div className="text-xs text-slate-400 text-center">
          {selectedRate.percentImplemented}% do novo sistema implementado
        </div>
      )}
    </div>
  );
}

/**
 * Calcula as alíquotas ajustadas para um ano específico da transição
 */
export function getTransitionRates(year: TransitionYear) {
  return TRANSITION_RATES[year];
}

/**
 * Calcula o imposto com base no ano de transição
 */
export function calculateTransitionTax(
  revenue: number, 
  year: TransitionYear,
  creditFactor: number = 0
): { ibs: number; cbs: number; total: number; netRate: number } {
  const rates = TRANSITION_RATES[year];
  
  // Apply credit factor reduction
  const effectiveIbs = rates.ibs * (1 - creditFactor);
  const effectiveCbs = rates.cbs * (1 - creditFactor);
  const effectiveTotal = effectiveIbs + effectiveCbs;
  
  return {
    ibs: revenue * (effectiveIbs / 100),
    cbs: revenue * (effectiveCbs / 100),
    total: revenue * (effectiveTotal / 100),
    netRate: effectiveTotal,
  };
}
