import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  DollarSign, 
  TrendingDown, 
  Users, 
  BarChart3,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { FinancialOverview } from './FinancialOverview';
import { FinancialRevenues } from './FinancialRevenues';
import { FinancialCosts } from './FinancialCosts';
import { FinancialPartnerSplit } from './FinancialPartnerSplit';
import { FinancialAnalytics } from './FinancialAnalytics';

export const FinancialModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    netProfit: 0,
    revenueByService: [] as { name: string; value: number; color: string }[],
    partnerDistribution: [] as { name: string; value: number; color: string }[],
    monthlyData: [] as { month: string; revenue: number; costs: number }[]
  });
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchOverviewData();
  }, [period]);

  const fetchOverviewData = async () => {
    try {
      const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
      const days = daysMap[period] ?? 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const [paymentsRes, subsRes, costsRes, revenuesRes] = await Promise.all([
        supabase.from('payments').select('amount_cents, payment_type, created_at').eq('status', 'completed').gte('created_at', since),
        supabase.from('subscriptions').select('price_cents').eq('status', 'active'),
        supabase.from('financial_costs').select('amount_cents, cost_date').gte('cost_date', since.slice(0, 10)),
        supabase.from('financial_revenues').select('amount_cents, service_category, revenue_date').gte('revenue_date', since.slice(0, 10)),
      ]);

      const paymentsData = paymentsRes.data || [];
      const subscriptionsData = subsRes.data || [];
      const costsData = costsRes.data || [];
      const revenuesData = revenuesRes.data || [];

      const totalPayments = paymentsData.reduce((sum, p: any) => sum + (p.amount_cents || 0), 0);
      const totalSubscriptions = subscriptionsData.reduce((sum, s: any) => sum + (s.price_cents || 0), 0);
      const totalManualRevenue = revenuesData.reduce((sum, r: any) => sum + (r.amount_cents || 0), 0);
      const totalRevenue = totalPayments + totalSubscriptions + totalManualRevenue;
      const totalCosts = costsData.reduce((sum, c: any) => sum + (c.amount_cents || 0), 0);
      const netProfit = totalRevenue - totalCosts;

      // Receita real por serviço
      const serviceRevenues: Record<string, number> = {};
      paymentsData.forEach((p: any) => {
        const t = (p.payment_type || 'outros').toLowerCase();
        let name = 'Outros';
        if (t.includes('limpa') || t.includes('credit_repair')) name = 'Limpa Nome';
        else if (t.includes('fiscal')) name = 'Análise Fiscal';
        else if (t.includes('nf') || t.includes('bi')) name = 'Emissão NF';
        else if (t.includes('ir')) name = 'IR';
        else if (t.includes('carta')) name = 'Cartas Contempladas';
        serviceRevenues[name] = (serviceRevenues[name] || 0) + (p.amount_cents || 0);
      });
      revenuesData.forEach((r: any) => {
        const name = r.service_category || 'Outros';
        serviceRevenues[name] = (serviceRevenues[name] || 0) + (r.amount_cents || 0);
      });
      if (totalSubscriptions > 0) serviceRevenues['Assinaturas'] = totalSubscriptions;

      const colors: Record<string, string> = {
        'Limpa Nome': 'hsl(var(--chart-1))',
        'Análise Fiscal': 'hsl(var(--chart-2))',
        'Emissão NF': 'hsl(var(--chart-3))',
        'Assinaturas': 'hsl(var(--chart-4))',
        'IR': 'hsl(var(--chart-5))',
        'Cartas Contempladas': 'hsl(var(--primary))',
        'Outros': 'hsl(var(--muted-foreground))',
      };

      const revenueByService = Object.entries(serviceRevenues)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value, color: colors[name] || 'hsl(var(--muted-foreground))' }));

      // Divisão societária real via financial_partners + calculate_partner_share
      const { data: partnersData } = await supabase.from('financial_partners').select('id, name, display_order').eq('is_active', true).order('display_order');
      const partnerTotals: Record<string, { name: string; value: number }> = {};
      (partnersData || []).forEach((p: any) => { partnerTotals[p.id] = { name: p.name, value: 0 }; });
      // Aproximação: divide totalRevenue proporcionalmente pelas regras ativas gerais
      const { data: rulesData } = await supabase.from('financial_split_rules').select('partner_id, percentage').eq('is_active', true);
      (rulesData || []).forEach((r: any) => {
        if (partnerTotals[r.partner_id]) {
          partnerTotals[r.partner_id].value += Math.round((totalRevenue * (r.percentage || 0)) / 100);
        }
      });
      const partnerColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
      const partnerDistribution = Object.values(partnerTotals)
        .filter((p) => p.value > 0)
        .map((p, i) => ({ ...p, color: partnerColors[i % partnerColors.length] }));

      // Série mensal real (últimos 6 meses)
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const now = new Date();
      const buckets: { month: string; revenue: number; costs: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        buckets.push({ month: `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, revenue: 0, costs: 0 });
        // preenche
        const revSum = paymentsData
          .filter((p: any) => (p.created_at || '').startsWith(key))
          .reduce((s: number, p: any) => s + (p.amount_cents || 0), 0)
          + revenuesData.filter((r: any) => (r.revenue_date || '').startsWith(key)).reduce((s: number, r: any) => s + (r.amount_cents || 0), 0);
        const costSum = costsData
          .filter((c: any) => (c.cost_date || '').startsWith(key))
          .reduce((s: number, c: any) => s + (c.amount_cents || 0), 0);
        buckets[buckets.length - 1].revenue = revSum;
        buckets[buckets.length - 1].costs = costSum;
      }

      setOverviewData({
        totalRevenue,
        totalCosts,
        netProfit,
        revenueByService,
        partnerDistribution,
        monthlyData: buckets,
      });
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-blue-500/10 rounded-2xl p-6 border border-violet-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              Módulo Financeiro
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão estratégica de receitas, custos e divisão societária
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 py-1.5 px-3">
              <DollarSign className="h-4 w-4 mr-2" />
              Receitas
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 py-1.5 px-3">
              <TrendingDown className="h-4 w-4 mr-2" />
              Custos
            </Badge>
            <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/30 py-1.5 px-3">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Auditável
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="revenues" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <DollarSign className="h-4 w-4" />
            Receitas
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <TrendingDown className="h-4 w-4" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="partner-split" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <Users className="h-4 w-4" />
            Divisão Societária
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <BarChart3 className="h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FinancialOverview
            totalRevenue={overviewData.totalRevenue}
            totalCosts={overviewData.totalCosts}
            netProfit={overviewData.netProfit}
            revenueByService={overviewData.revenueByService}
            partnerDistribution={overviewData.partnerDistribution}
            monthlyData={overviewData.monthlyData}
            period={period}
            onPeriodChange={setPeriod}
          />
        </TabsContent>

        <TabsContent value="revenues" className="space-y-4">
          <FinancialRevenues />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <FinancialCosts />
        </TabsContent>

        <TabsContent value="partner-split" className="space-y-4">
          <FinancialPartnerSplit />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <FinancialAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
