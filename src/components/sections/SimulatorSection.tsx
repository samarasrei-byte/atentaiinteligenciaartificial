import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, TrendingDown, Minus, RefreshCw, Download, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  sectors,
  companyTypes,
  brazilianStates,
  stateICMSRates,
  calculateTaxes,
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  SimulationResult,
} from "@/lib/taxData";
import { exportSimulationToPdf } from "@/lib/exportPdf";

export function SimulatorSection() {
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);
  const [revenue, setRevenue] = useState("");
  const [sector, setSector] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [state, setState] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const selectedSector = sectors.find(s => s.value === sector);
  const showStateSelector = selectedSector && selectedSector.icms > 0;

  const handleCalculate = () => {
    if (!revenue || !sector || !companyType) return;

    setIsCalculating(true);

    setTimeout(() => {
      const revenueValue = parseCurrencyInput(revenue);
      
      const simulationResult = calculateTaxes({
        revenue: revenueValue,
        sector,
        companyType,
        state: state || undefined,
      });
      
      setResult(simulationResult);
      setIsCalculating(false);
      
      toast({
        title: "Simulação concluída!",
        description: "Veja o comparativo abaixo",
      });
    }, 1000);
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRevenue(formatCurrencyInput(e.target.value));
  };

  const handleExportPdf = async () => {
    if (!result) return;
    
    setIsExporting(true);
    try {
      await exportSimulationToPdf(result);
      toast({
        title: "PDF exportado!",
        description: "O arquivo foi baixado com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF",
      });
    }
    setIsExporting(false);
  };

  const reset = () => {
    setRevenue("");
    setSector("");
    setCompanyType("");
    setState("");
    setResult(null);
  };

  return (
    <section id="simulator" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Calculator className="w-4 h-4" />
              Simulador Gratuito
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
              Compare Seus Impostos
              <span className="gradient-text"> Antes e Depois</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubra como a Reforma Tributária de 2026 vai impactar o seu negócio. 
              Simulação baseada nas alíquotas oficiais do IBS, CBS e IS.
            </p>
          </div>

          <Card variant="elevated" className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                Simulador de Impacto Tributário
              </CardTitle>
              <CardDescription>
                Preencha os dados do seu negócio para ver a estimativa de impostos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6">
                {/* Input Fields - Row 1 */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenue">Faturamento Mensal</Label>
                    <Input
                      id="revenue"
                      placeholder="R$ 0,00"
                      value={revenue}
                      onChange={handleRevenueChange}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Setor de Atuação</Label>
                    <Select value={sector} onValueChange={(value) => { setSector(value); setState(""); }}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Regime Tributário</Label>
                    <Select value={companyType} onValueChange={setCompanyType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o regime" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyTypes.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* State Selector - Row 2 (conditional) */}
                {showStateSelector && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Estado (ICMS)
                      </Label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione o estado (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Usar alíquota padrão ({selectedSector?.icms}%)</SelectItem>
                          {brazilianStates.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label} ({stateICMSRates[s.value]}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <p className="text-sm text-muted-foreground">
                        {state 
                          ? `Alíquota de ICMS para ${brazilianStates.find(s => s.value === state)?.label}: ${stateICMSRates[state]}%`
                          : "Selecione um estado para usar a alíquota de ICMS específica"
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="hero" 
                    size="lg"
                    className="flex-1"
                    onClick={handleCalculate}
                    disabled={!revenue || !sector || !companyType || isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5" />
                        Calcular Impostos
                      </>
                    )}
                  </Button>
                  {result && (
                    <>
                      <Button variant="outline" size="lg" onClick={handleExportPdf} disabled={isExporting}>
                        {isExporting ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                        Exportar PDF
                      </Button>
                      <Button variant="ghost" size="lg" onClick={reset}>
                        <RefreshCw className="w-5 h-5" />
                        Limpar
                      </Button>
                    </>
                  )}
                </div>

                {/* Results */}
                {result && (
                  <div ref={resultRef} className="mt-8 space-y-6 animate-slide-up">
                    {/* Comparison Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Before */}
                      <Card variant="outlined" className="p-6">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                          Sistema Atual
                        </h4>
                        <div className="space-y-3 text-sm">
                          {result.beforeTaxes.icms > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ICMS</span>
                              <span className="font-medium">{formatCurrency(result.beforeTaxes.icms)}</span>
                            </div>
                          )}
                          {result.beforeTaxes.iss > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ISS</span>
                              <span className="font-medium">{formatCurrency(result.beforeTaxes.iss)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">PIS</span>
                            <span className="font-medium">{formatCurrency(result.beforeTaxes.pis)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">COFINS</span>
                            <span className="font-medium">{formatCurrency(result.beforeTaxes.cofins)}</span>
                          </div>
                          {result.beforeTaxes.ipi > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">IPI</span>
                              <span className="font-medium">{formatCurrency(result.beforeTaxes.ipi)}</span>
                            </div>
                          )}
                          <div className="pt-3 border-t flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(result.beforeTaxes.total)}</span>
                          </div>
                        </div>
                      </Card>

                      {/* After */}
                      <Card variant="premium" className="p-6">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-primary" />
                          Reforma 2026
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">IBS (Estadual/Municipal)</span>
                            <span className="font-medium">{formatCurrency(result.afterTaxes.ibs)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CBS (Federal)</span>
                            <span className="font-medium">{formatCurrency(result.afterTaxes.cbs)}</span>
                          </div>
                          {result.afterTaxes.is > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">IS (Seletivo)</span>
                              <span className="font-medium">{formatCurrency(result.afterTaxes.is)}</span>
                            </div>
                          )}
                          <div className="pt-3 border-t flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-primary">{formatCurrency(result.afterTaxes.total)}</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Summary */}
                    <Card variant="gradient" className="p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                          <p className="text-sm text-muted-foreground mb-1">Diferença Estimada</p>
                          <div className="flex items-center gap-2">
                            {result.difference > 0 ? (
                              <TrendingUp className="w-6 h-6 text-destructive" />
                            ) : result.difference < 0 ? (
                              <TrendingDown className="w-6 h-6 text-success" />
                            ) : (
                              <Minus className="w-6 h-6 text-muted-foreground" />
                            )}
                            <span className={`text-2xl md:text-3xl font-bold ${
                              result.difference > 0 ? "text-destructive" : 
                              result.difference < 0 ? "text-success" : ""
                            }`}>
                              {result.difference > 0 ? "+" : ""}{formatCurrency(result.difference)}
                            </span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              result.difference > 0 ? "bg-destructive/10 text-destructive" :
                              result.difference < 0 ? "bg-success/10 text-success" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {result.percentChange > 0 ? "+" : ""}{result.percentChange.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground text-center md:text-right max-w-xs">
                          {result.difference < 0 
                            ? "Você pode economizar com a reforma! Consulte um contador para otimizar ainda mais."
                            : result.difference > 0
                            ? "A carga pode aumentar. Um contador pode ajudar a encontrar benefícios específicos."
                            : "Impacto neutro estimado. Consulte um especialista para análise detalhada."
                          }
                        </p>
                      </div>
                    </Card>

                    {/* Disclaimer */}
                    <p className="text-xs text-muted-foreground text-center">
                      * Simulação baseada em estimativas e alíquotas de referência. Valores reais podem variar 
                      de acordo com regimes especiais, créditos tributários e regulamentações específicas.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
