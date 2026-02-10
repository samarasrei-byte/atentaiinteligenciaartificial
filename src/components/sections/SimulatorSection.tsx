import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, TrendingDown, Minus, RefreshCw, Download, MapPin, Lock, Sparkles, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useScroll, useTransform } from "framer-motion";
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
import { STRIPE_PLANS, formatPrice } from "@/lib/stripe";

export function SimulatorSection() {
  const navigate = useNavigate();
  const { subscription, user } = useAuth();
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [revenue, setRevenue] = useState("");
  const [revenueType, setRevenueType] = useState<"monthly" | "annual">("monthly");
  const [sector, setSector] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [state, setState] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [40, -40]);

  // Verifica se tem plano ativo
  const hasAccess = subscription.subscribed;

  const selectedSector = sectors.find(s => s.value === sector);
  const showStateSelector = selectedSector && selectedSector.icms > 0;

  // Limites tributários
  const MEI_ANNUAL_LIMIT = 81000;
  const SIMPLES_ANNUAL_LIMIT = 4800000;
  
  // Calcula faturamento anual para validação
  const rawRevenueValue = parseCurrencyInput(revenue) || 0;
  const annualRevenue = revenueType === "annual" ? rawRevenueValue : rawRevenueValue * 12;
  
  // Alertas de limites
  const exceedsMEILimit = annualRevenue > MEI_ANNUAL_LIMIT && annualRevenue <= SIMPLES_ANNUAL_LIMIT;
  const exceedsSimplesLimit = annualRevenue > SIMPLES_ANNUAL_LIMIT;
  const nearMEILimit = annualRevenue > MEI_ANNUAL_LIMIT * 0.8 && annualRevenue <= MEI_ANNUAL_LIMIT;
  const nearSimplesLimit = annualRevenue > SIMPLES_ANNUAL_LIMIT * 0.9 && annualRevenue <= SIMPLES_ANNUAL_LIMIT;

  const handleCalculate = () => {
    if (!revenue || !sector || !companyType) return;

    setIsCalculating(true);

    setTimeout(() => {
      const rawRevenueValue = parseCurrencyInput(revenue);
      // Convert to monthly if annual was entered
      const revenueValue = revenueType === "annual" ? rawRevenueValue / 12 : rawRevenueValue;
      
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
        description: revenueType === "annual" 
          ? "Valores mensais calculados a partir do faturamento anual" 
          : "Veja o comparativo abaixo",
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
    setRevenueType("monthly");
    setSector("");
    setCompanyType("");
    setState("");
    setResult(null);
  };

  return (
    <section ref={containerRef} id="simulator" className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-background">
      {/* Clean Light Background with Subtle Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        
        {/* Floating orbs with parallax - much lighter */}
        <motion.div 
          className="absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-br from-primary/10 to-info/5 rounded-full blur-[100px]"
          style={{ y: y1 }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-[10%] w-80 h-80 bg-gradient-to-br from-accent/10 to-success/5 rounded-full blur-[80px]"
          style={{ y: y2 }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            {/* Futuristic badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 text-primary text-sm font-semibold mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
            >
              <Calculator className="w-4 h-4" />
              <span>SIMULADOR INTELIGENTE</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
              <span className="text-foreground">Compare Seus Impostos</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent">
                Antes e Depois
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Descubra como a <span className="text-primary font-semibold">Reforma Tributária 2026</span> vai impactar seu negócio.
              <br className="hidden md:block" />
              Simulação com alíquotas oficiais IBS, CBS e IS.
            </p>
          </div>

          {/* Futuristic Card */}
          <Card className="overflow-hidden border border-border bg-card shadow-xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border-b border-border pb-6">
              <CardTitle className="flex items-center gap-4 text-foreground">
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Calculator className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <div>
                  <span className="text-xl md:text-2xl font-bold">Simulador de Impacto Tributário</span>
                  <CardDescription className="text-muted-foreground mt-1">
                    Preencha os dados e veja a estimativa em tempo real
                  </CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6">
                {/* Input Fields - Row 1 */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenue" className="flex items-center justify-between text-foreground">
                      <span>Faturamento {revenueType === "monthly" ? "Mensal" : "Anual"}</span>
                      <button
                        type="button"
                        onClick={() => setRevenueType(prev => prev === "monthly" ? "annual" : "monthly")}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {revenueType === "monthly" ? "Usar anual?" : "Usar mensal?"}
                      </button>
                    </Label>
                    <Input
                      id="revenue"
                      placeholder={revenueType === "monthly" ? "R$ 0,00" : "R$ 0,00 (anual)"}
                      value={revenue}
                      onChange={handleRevenueChange}
                      className="h-12 bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                    {revenueType === "annual" && (
                      <p className="text-xs text-muted-foreground">
                        Faturamento anual é mais preciso para enquadramento tributário
                      </p>
                    )}
                  </div>
                </div>

                {/* Tax Limit Alerts */}
                {rawRevenueValue > 0 && (
                  <div className="space-y-3">
                    {exceedsSimplesLimit && (
                      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="font-medium">
                          <strong>Faturamento excede o limite do Simples Nacional!</strong>
                          <br />
                          <span className="text-sm font-normal">
                            Com R$ {annualRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} anuais, você ultrapassa o limite de R$ 4.800.000/ano. 
                            Considere <strong>Lucro Presumido</strong> ou <strong>Lucro Real</strong>.
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {exceedsMEILimit && (
                      <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-700">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription>
                          <strong>Faturamento excede o limite MEI!</strong>
                          <br />
                          <span className="text-sm">
                            Com R$ {annualRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} anuais, você ultrapassa R$ 81.000/ano do MEI. 
                            Considere <strong>ME - Simples Nacional</strong> ou outro regime.
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {nearMEILimit && (
                      <Alert className="border-blue-500/50 bg-blue-500/10 text-blue-700">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                          <strong>Atenção: Aproximando-se do limite MEI</strong>
                          <br />
                          <span className="text-sm">
                            Você está em {((annualRevenue / MEI_ANNUAL_LIMIT) * 100).toFixed(0)}% do limite de R$ 81.000/ano. 
                            Planeje a transição para evitar desenquadramento.
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {nearSimplesLimit && !exceedsSimplesLimit && (
                      <Alert className="border-orange-500/50 bg-orange-500/10 text-orange-700">
                        <Info className="h-4 w-4 text-orange-600" />
                        <AlertDescription>
                          <strong>Atenção: Aproximando-se do limite Simples Nacional</strong>
                          <br />
                          <span className="text-sm">
                            Você está em {((annualRevenue / SIMPLES_ANNUAL_LIMIT) * 100).toFixed(0)}% do limite de R$ 4,8M/ano. 
                            Avalie migração para Lucro Presumido.
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Row 2 - Sector and Regime */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Setor de Atuação</Label>
                    <Select value={sector} onValueChange={(value) => { setSector(value); setState(""); }}>
                      <SelectTrigger className="h-12 bg-background border-input text-foreground">
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
                    <Label className="text-foreground">Regime Tributário</Label>
                    <Select value={companyType} onValueChange={setCompanyType}>
                      <SelectTrigger className="h-12 bg-background border-input text-foreground">
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
                      <Label className="flex items-center gap-2 text-foreground">
                        <MapPin className="w-4 h-4" />
                        Estado (ICMS)
                      </Label>
                      <Select value={state || "default"} onValueChange={(value) => setState(value === "default" ? "" : value)}>
                        <SelectTrigger className="h-12 bg-background border-input text-foreground">
                          <SelectValue placeholder="Selecione o estado (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Usar alíquota padrão ({selectedSector?.icms}%)</SelectItem>
                          {brazilianStates.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label} ({stateICMSRates[s.value]}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <p className="text-sm text-slate-400">
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
                  <div ref={resultRef} className="mt-8 space-y-6 animate-slide-up relative">
                    {/* Paywall Overlay - shows when user has no access */}
                    {!hasAccess && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg" />
                        <Card className="relative z-30 max-w-md mx-4 border-2 border-primary/20 shadow-xl">
                          <CardContent className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-gold">
                              <Lock className="w-8 h-8 text-accent-foreground" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-foreground mb-2">Resultado Bloqueado</h3>
                              <p className="text-sm text-muted-foreground">
                                Assine um plano para ver o resultado completo da simulação e comparar os impostos antes e depois da reforma.
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              <Sparkles className="w-4 h-4 text-accent" />
                              <span>A partir de {formatPrice(STRIPE_PLANS.simulator.price)}/mês</span>
                            </div>
                            <Button 
                              variant="accent" 
                              className="w-full"
                              onClick={() => navigate('/pricing')}
                            >
                              <Lock className="w-4 h-4" />
                              Ver Planos
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Comparison Grid */}
                    <div className={`grid md:grid-cols-2 gap-6 ${!hasAccess ? 'opacity-20 blur-sm pointer-events-none select-none' : ''}`}>
                      {/* Before */}
                      <Card variant="outlined" className="p-6 bg-slate-800/50 border-white/10">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
                          <span className="w-3 h-3 rounded-full bg-slate-400" />
                          Sistema Atual
                        </h4>
                        <div className="space-y-3 text-sm">
                          {result.beforeTaxes.icms > 0 && (
                            <div className="flex justify-between">
                              <span className="text-white/70">ICMS</span>
                              <span className="font-medium text-white">{formatCurrency(result.beforeTaxes.icms)}</span>
                            </div>
                          )}
                          {result.beforeTaxes.iss > 0 && (
                            <div className="flex justify-between">
                              <span className="text-white/70">ISS</span>
                              <span className="font-medium text-white">{formatCurrency(result.beforeTaxes.iss)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-white/70">PIS</span>
                            <span className="font-medium text-white">{formatCurrency(result.beforeTaxes.pis)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">COFINS</span>
                            <span className="font-medium text-white">{formatCurrency(result.beforeTaxes.cofins)}</span>
                          </div>
                          {result.beforeTaxes.ipi > 0 && (
                            <div className="flex justify-between">
                              <span className="text-white/70">IPI</span>
                              <span className="font-medium text-white">{formatCurrency(result.beforeTaxes.ipi)}</span>
                            </div>
                          )}
                          <div className="pt-3 border-t border-white/10 flex justify-between font-bold text-lg">
                            <span className="text-white">Total</span>
                            <span className="text-white">{formatCurrency(result.beforeTaxes.total)}</span>
                          </div>
                        </div>
                      </Card>

                      {/* After */}
                      <Card variant="premium" className="p-6 bg-gradient-to-br from-cyan-900/50 to-violet-900/50 border-cyan-500/30">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
                          <span className="w-3 h-3 rounded-full bg-cyan-400" />
                          Reforma 2026 (LC 214/2025)
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">IBS (Estadual/Municipal)</span>
                            <span className="font-medium text-white">{formatCurrency(result.afterTaxes.ibs)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">CBS (Federal)</span>
                            <span className="font-medium text-white">{formatCurrency(result.afterTaxes.cbs)}</span>
                          </div>
                          {result.afterTaxes.is > 0 && (
                            <div className="flex justify-between">
                              <span className="text-white/70">IS (Seletivo)</span>
                              <span className="font-medium text-white">{formatCurrency(result.afterTaxes.is)}</span>
                            </div>
                          )}
                          <div className="pt-3 border-t border-white/10 flex justify-between font-bold text-lg">
                            <span className="text-white">Total</span>
                            <span className="text-cyan-400">{formatCurrency(result.afterTaxes.total)}</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Summary */}
                    <Card variant="gradient" className={`p-6 bg-slate-800/50 border-white/10 ${!hasAccess ? 'opacity-20 blur-sm pointer-events-none select-none' : ''}`}>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                          <p className="text-sm text-white/60 mb-1">Diferença Estimada</p>
                          <div className="flex items-center gap-2">
                            {result.difference > 0 ? (
                              <TrendingUp className="w-6 h-6 text-red-400" />
                            ) : result.difference < 0 ? (
                              <TrendingDown className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <Minus className="w-6 h-6 text-white/60" />
                            )}
                            <span className={`text-2xl md:text-3xl font-bold ${
                              result.difference > 0 ? "text-red-400" : 
                              result.difference < 0 ? "text-emerald-400" : "text-white"
                            }`}>
                              {result.difference > 0 ? "+" : ""}{formatCurrency(result.difference)}
                            </span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                              result.difference > 0 ? "bg-red-500/20 text-red-400" :
                              result.difference < 0 ? "bg-emerald-500/20 text-emerald-400" :
                              "bg-slate-700 text-white/60"
                            }`}>
                              {result.percentChange > 0 ? "+" : ""}{result.percentChange.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-white/60 text-center md:text-right max-w-xs">
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
                    <p className={`text-xs text-white/50 text-center ${!hasAccess ? 'opacity-20' : ''}`}>
                      * Simulação baseada na LC 214/2025 e alíquotas de referência (IBS 17,7% + CBS 8,8% = 26,5%). 
                      Valores reais podem variar de acordo com regimes especiais, créditos tributários e regulamentações específicas.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
