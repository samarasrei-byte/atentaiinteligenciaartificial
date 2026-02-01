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
      // Buscar pagamentos
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount_cents, payment_type, created_at')
        .eq('status', 'completed');

      // Buscar assinaturas
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('price_cents')
        .eq('status', 'active');

      // Buscar custos
      const { data: costsData } = await supabase
        .from('financial_costs')
        .select('amount_cents, cost_date');

      // Calcular totais
      const totalPayments = (paymentsData || []).reduce((sum, p) => sum + p.amount_cents, 0);
      const totalSubscriptions = (subscriptionsData || []).reduce((sum, s) => sum + s.price_cents, 0);
      const totalRevenue = totalPayments + totalSubscriptions;
      const totalCosts = (costsData || []).reduce((sum, c) => sum + c.amount_cents, 0);
      const netProfit = totalRevenue - totalCosts;

      // Receita por serviço
      const serviceRevenues: Record<string, number> = {};
      (paymentsData || []).forEach((p: any) => {
        const service = p.payment_type || 'Outros';
        let name = 'Outros';
        if (service.includes('limpa')) name = 'Limpa Nome';
        else if (service.includes('fiscal')) name = 'Análise Fiscal';
        else if (service.includes('bi')) name = 'BI Contabilidade';
        serviceRevenues[name] = (serviceRevenues[name] || 0) + p.amount_cents;
      });
      serviceRevenues['Assinaturas'] = totalSubscriptions;

      const colors: Record<string, string> = {
        'Limpa Nome': '#10b981',
        'Análise Fiscal': '#8b5cf6',
        'BI Contabilidade': '#3b82f6',
        'Assinaturas': '#f59e0b',
        'Outros': '#64748b'
      };

      const revenueByService = Object.entries(serviceRevenues)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value,
          color: colors[name] || '#64748b'
        }));

      // Distribuição por sócio (simulado - 33% cada para marketplace)
      const partnerDistribution = [
        { name: 'Guilherme Mesquita', value: Math.round(totalRevenue * 0.45), color: '#10b981' },
        { name: 'César', value: Math.round(totalRevenue * 0.275), color: '#8b5cf6' },
        { name: 'Guilherme Barros', value: Math.round(totalRevenue * 0.275), color: '#3b82f6' }
      ];

      // Dados mensais
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const monthlyData = monthNames.map((month, i) => ({
        month,
        revenue: Math.round(totalRevenue * (0.12 + Math.random() * 0.08)),
        costs: Math.round(totalCosts * (0.12 + Math.random() * 0.08))
      }));

      setOverviewData({
        totalRevenue,
        totalCosts,
        netProfit,
        revenueByService,
        partnerDistribution,
        monthlyData
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
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
