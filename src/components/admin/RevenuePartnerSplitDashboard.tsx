import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Loader2,
  PieChart as PieChartIcon,
  Building2,
  Briefcase
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/servicePricing";

// Partner split configuration
const MARKETPLACE_SPLIT = {
  guilherme_mesquita: 50,
  guilherme_baus: 50,
};

const PLATFORM_SPLIT = {
  guilherme_mesquita: 70,
  guilherme_baus: 30,
};

const PARTNER_COLORS = {
  guilherme_mesquita: "#10b981",
  guilherme_baus: "#3b82f6", 
};

const PARTNER_NAMES = {
  guilherme_mesquita: "Guilherme de Mesquita",
  guilherme_baus: "Guilherme Baus",
};

export function RevenuePartnerSplitDashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const getDateFilter = () => {
    if (period === "all") return null;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return startDate.toISOString();
  };

  // Fetch Limpa Nome (Credit Repair) revenue
  const { data: limpaNomeData, isLoading: loadingLimpaNome } = useQuery({
    queryKey: ["revenue-limpa-nome", period],
    queryFn: async () => {
      let query = supabase
        .from("credit_repair_requests")
        .select("final_price_cents, created_at, payment_status")
        .eq("payment_status", "paid");

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch Análise Fiscal revenue
  const { data: fiscalData, isLoading: loadingFiscal } = useQuery({
    queryKey: ["revenue-fiscal", period],
    queryFn: async () => {
      let query = supabase
        .from("fiscal_analysis_requests")
        .select("service_fee_cents, created_at, payment_status")
        .eq("payment_status", "paid");

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch subscriptions (Platform revenue)
  const { data: subscriptionData, isLoading: loadingSubscriptions } = useQuery({
    queryKey: ["revenue-subscriptions", period],
    queryFn: async () => {
      let query = supabase
        .from("subscriptions")
        .select("price_cents, created_at, status, plan_type")
        .eq("status", "active");

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch IR requests revenue
  const { data: irData, isLoading: loadingIR } = useQuery({
    queryKey: ["revenue-ir", period],
    queryFn: async () => {
      let query = supabase
        .from("ir_requests")
        .select("final_price_cents, created_at, payment_status")
        .eq("payment_status", "paid");

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch certificate requests revenue
  const { data: certificateData, isLoading: loadingCertificates } = useQuery({
    queryKey: ["revenue-certificates", period],
    queryFn: async () => {
      let query = supabase
        .from("certificate_requests")
        .select("amount_cents, created_at, payment_status")
        .eq("payment_status", "paid");

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch company opening revenue
  const { data: companyData, isLoading: loadingCompany } = useQuery({
    queryKey: ["revenue-company", period],
    queryFn: async () => {
      let query = supabase
        .from("company_opening_requests")
        .select("service_price_cents, created_at, payment_status")
        .eq("payment_status", "paid");

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = loadingLimpaNome || loadingFiscal || loadingSubscriptions || loadingIR || loadingCertificates || loadingCompany;

  // Calculate revenues
  const limpaNomeRevenue = limpaNomeData?.reduce((sum, r) => sum + (r.final_price_cents || 0), 0) || 0;
  const fiscalRevenue = fiscalData?.reduce((sum, r) => sum + (r.service_fee_cents || 0), 0) || 0;
  const biRevenue = 0; // BI is success fee based, calculated separately
  const subscriptionRevenue = subscriptionData?.reduce((sum, r) => sum + (r.price_cents || 0), 0) || 0;
  const irRevenue = irData?.reduce((sum, r) => sum + (r.final_price_cents || 0), 0) || 0;
  const certificateRevenue = certificateData?.reduce((sum, r) => sum + (r.amount_cents || 0), 0) || 0;
  const companyRevenue = companyData?.reduce((sum, r) => sum + (r.service_price_cents || 0), 0) || 0;

  // Marketplace revenue (33/33/33 split)
  const marketplaceRevenue = limpaNomeRevenue + fiscalRevenue + biRevenue;

  // Platform revenue (70/15/15 split)
  const platformRevenue = subscriptionRevenue + irRevenue + certificateRevenue + companyRevenue;

  // Total revenue
  const totalRevenue = marketplaceRevenue + platformRevenue;

  // Calculate partner splits
  const calculatePartnerSplits = () => {
    const marketplaceSplits = {
      guilherme_mesquita: Math.round(marketplaceRevenue * (MARKETPLACE_SPLIT.guilherme_mesquita / 100)),
      guilherme_baus: Math.round(marketplaceRevenue * (MARKETPLACE_SPLIT.guilherme_baus / 100)),
    };

    const platformSplits = {
      guilherme_mesquita: Math.round(platformRevenue * (PLATFORM_SPLIT.guilherme_mesquita / 100)),
      guilherme_baus: Math.round(platformRevenue * (PLATFORM_SPLIT.guilherme_baus / 100)),
    };

    return {
      marketplace: marketplaceSplits,
      platform: platformSplits,
      total: {
        guilherme_mesquita: marketplaceSplits.guilherme_mesquita + platformSplits.guilherme_mesquita,
        guilherme_baus: marketplaceSplits.guilherme_baus + platformSplits.guilherme_baus,
      },
    };
  };

  const partnerSplits = calculatePartnerSplits();

  // Chart data
  const serviceRevenueData = [
    { name: "Limpa Nome", value: limpaNomeRevenue / 100, category: "Marketplace" },
    { name: "Análise Fiscal", value: fiscalRevenue / 100, category: "Marketplace" },
    { name: "BI", value: biRevenue / 100, category: "Marketplace" },
    { name: "Assinaturas", value: subscriptionRevenue / 100, category: "Plataforma" },
    { name: "IR", value: irRevenue / 100, category: "Plataforma" },
    { name: "Certidões", value: certificateRevenue / 100, category: "Plataforma" },
    { name: "Abertura Empresa", value: companyRevenue / 100, category: "Plataforma" },
  ].filter(d => d.value > 0);

  const partnerTotalData = Object.entries(partnerSplits.total).map(([key, value]) => ({
    name: PARTNER_NAMES[key as keyof typeof PARTNER_NAMES],
    value: value / 100,
    color: PARTNER_COLORS[key as keyof typeof PARTNER_COLORS],
  }));

  const splitComparisonData = [
    {
      name: "Marketplace (50/50)",
      guilherme_mesquita: partnerSplits.marketplace.guilherme_mesquita / 100,
      guilherme_baus: partnerSplits.marketplace.guilherme_baus / 100,
    },
    {
      name: "Plataforma (70/30)",
      guilherme_mesquita: partnerSplits.platform.guilherme_mesquita / 100,
      guilherme_baus: partnerSplits.platform.guilherme_baus / 100,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Divisão de Receitas por Sócio</h2>
          <p className="text-muted-foreground">
            Marketplace: 33% / 33% / 33% | Plataforma: 70% / 15% / 15%
          </p>
        </div>
        <Select value={period} onValueChange={(v: "7d" | "30d" | "90d" | "all") => setPeriod(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Marketplace (33/33/33)</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(marketplaceRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Limpa Nome + Fiscal + BI</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plataforma (70/15/15)</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(platformRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Assinaturas + IR + Outros</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Split Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(partnerSplits.total).map(([key, value]) => (
          <Card key={key} className="relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: PARTNER_COLORS[key as keyof typeof PARTNER_COLORS] }}
            />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: PARTNER_COLORS[key as keyof typeof PARTNER_COLORS] }} />
                {PARTNER_NAMES[key as keyof typeof PARTNER_NAMES]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(value)}</p>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marketplace ({MARKETPLACE_SPLIT[key as keyof typeof MARKETPLACE_SPLIT].toFixed(1)}%)</span>
                  <span className="font-medium">{formatCurrency(partnerSplits.marketplace[key as keyof typeof partnerSplits.marketplace])}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plataforma ({PLATFORM_SPLIT[key as keyof typeof PLATFORM_SPLIT]}%)</span>
                  <span className="font-medium">{formatCurrency(partnerSplits.platform[key as keyof typeof partnerSplits.platform])}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição por Sócio
            </CardTitle>
            <CardDescription>Divisão total da receita</CardDescription>
          </CardHeader>
          <CardContent>
            {partnerTotalData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={partnerTotalData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name.split(' ')[0]}: R$${value.toFixed(0)}`}
                  >
                    {partnerTotalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Nenhuma receita no período
              </div>
            )}
          </CardContent>
        </Card>

        {/* Split Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparativo por Modelo de Split</CardTitle>
            <CardDescription>Marketplace vs Plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {(marketplaceRevenue > 0 || platformRevenue > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={splitComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => `R$${v}`} />
                  <YAxis type="category" dataKey="name" width={140} className="text-xs" />
                  <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
                  <Legend />
                  <Bar dataKey="guilherme_mesquita" name="G. Mesquita" stackId="a" fill={PARTNER_COLORS.guilherme_mesquita} />
                  <Bar dataKey="guilherme_baus" name="G. Baus" stackId="a" fill={PARTNER_COLORS.guilherme_baus} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Nenhuma receita no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receita por Serviço</CardTitle>
          <CardDescription>Detalhamento de cada fonte de receita</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Marketplace Services */}
            <div className="space-y-3">
              <h4 className="font-semibold text-emerald-600 flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500 text-emerald-600">Marketplace</Badge>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">[LIMPA_NOME]</span>
                  <span className="font-medium">{formatCurrency(limpaNomeRevenue)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">[ANALISE_FISCAL]</span>
                  <span className="font-medium">{formatCurrency(fiscalRevenue)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">[BI]</span>
                  <span className="font-medium">{formatCurrency(biRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Platform Services */}
            <div className="space-y-3 lg:col-span-3">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500 text-blue-600">Plataforma</Badge>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex flex-col p-2 rounded bg-muted/50">
                  <span className="text-xs text-muted-foreground">Assinaturas</span>
                  <span className="font-medium">{formatCurrency(subscriptionRevenue)}</span>
                </div>
                <div className="flex flex-col p-2 rounded bg-muted/50">
                  <span className="text-xs text-muted-foreground">IR</span>
                  <span className="font-medium">{formatCurrency(irRevenue)}</span>
                </div>
                <div className="flex flex-col p-2 rounded bg-muted/50">
                  <span className="text-xs text-muted-foreground">Certidões</span>
                  <span className="font-medium">{formatCurrency(certificateRevenue)}</span>
                </div>
                <div className="flex flex-col p-2 rounded bg-muted/50">
                  <span className="text-xs text-muted-foreground">Abertura Empresa</span>
                  <span className="font-medium">{formatCurrency(companyRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Split Rules Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regras de Divisão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
              <h4 className="font-semibold text-emerald-600 mb-3">Marketplace (33% / 33% / 33%)</h4>
              <p className="text-sm text-muted-foreground mb-2">Serviços com divisão igualitária:</p>
              <ul className="text-sm space-y-1">
                <li>• Limpa Nome (PF/CNPJ)</li>
                <li>• Análise Fiscal Inteligente</li>
                <li>• BI Contabilidade</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <h4 className="font-semibold text-blue-600 mb-3">Plataforma (70% / 15% / 15%)</h4>
              <p className="text-sm text-muted-foreground mb-2">Receita da plataforma AtentAI:</p>
              <ul className="text-sm space-y-1">
                <li>• Assinaturas (Premium, Autônomo, etc.)</li>
                <li>• Declaração de IR</li>
                <li>• Emissão de Certidões</li>
                <li>• Abertura de Empresa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
