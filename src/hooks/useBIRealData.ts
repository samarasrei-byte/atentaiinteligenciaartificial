import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BIStats {
  totalRevenue: number;
  monthlyRevenue: number;
  previousMonthRevenue: number;
  revenueGrowth: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  averageTicket: number;
  totalExpenses: number;
  monthlyExpenses: number;
}

interface MonthlyData {
  month: string;
  receita: number;
  despesas: number;
}

interface ServiceDistribution {
  name: string;
  value: number;
}

export function useBIRealData() {
  const [stats, setStats] = useState<BIStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    previousMonthRevenue: 0,
    revenueGrowth: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    averageTicket: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
  });
  
  const [revenueData, setRevenueData] = useState<MonthlyData[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<ServiceDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // Fetch all payments
      const { data: payments } = await supabase
        .from('payments')
        .select('amount_cents, created_at')
        .eq('status', 'completed');

      // Fetch subscriptions
      const { data: subscriptions, count: totalSubs } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact' });

      // Fetch real expenses from financial_costs table
      const { data: expenses } = await supabase
        .from('financial_costs')
        .select('amount_cents, cost_date');

      // Fetch real revenues from financial_revenues table
      const { data: revenues } = await supabase
        .from('financial_revenues')
        .select('amount_cents, revenue_date');

      const activeSubs = subscriptions?.filter(s => s.status === 'active').length || 0;
      const totalRevenue = payments?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount_cents, 0) || 0;

      // Calculate monthly revenue data
      const chartData: MonthlyData[] = [];
      let currentMonthRevenue = 0;
      let previousMonthRevenue = 0;
      let currentMonthExpenses = 0;
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        
        // Calculate revenue for this month
        const monthPayments = payments?.filter(p => {
          const pDate = new Date(p.created_at);
          return pDate >= monthStart && pDate < monthEnd;
        }) || [];
        
        const monthRevenues = revenues?.filter(r => {
          const rDate = new Date(r.revenue_date);
          return rDate >= monthStart && rDate < monthEnd;
        }) || [];
        
        const monthRevenueTotal = monthPayments.reduce((sum, p) => sum + p.amount_cents, 0) + 
                                   monthRevenues.reduce((sum, r) => sum + r.amount_cents, 0);
        
        // Calculate expenses for this month
        const monthExpenses = expenses?.filter(e => {
          const eDate = new Date(e.cost_date);
          return eDate >= monthStart && eDate < monthEnd;
        }) || [];
        
        const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount_cents, 0);
        
        chartData.push({
          month: monthNames[date.getMonth()],
          receita: monthRevenueTotal / 100,
          despesas: monthExpenseTotal / 100,
        });
        
        // Track current and previous month
        if (i === 0) {
          currentMonthRevenue = monthRevenueTotal;
          currentMonthExpenses = monthExpenseTotal;
        } else if (i === 1) {
          previousMonthRevenue = monthRevenueTotal;
        }
      }

      // Calculate growth percentage
      const revenueGrowth = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : 0;

      // Fetch service distribution counts
      const [creditRepair, fiscal, ir, certificates, companyOpening] = await Promise.all([
        supabase.from('credit_repair_requests').select('id', { count: 'exact', head: true }),
        supabase.from('fiscal_analysis_requests').select('id', { count: 'exact', head: true }),
        supabase.from('ir_requests').select('id', { count: 'exact', head: true }),
        supabase.from('certificate_requests').select('id', { count: 'exact', head: true }),
        supabase.from('company_opening_requests').select('id', { count: 'exact', head: true }),
      ]);

      setServiceDistribution([
        { name: 'Limpa Nome', value: creditRepair.count || 0 },
        { name: 'Análise Fiscal', value: fiscal.count || 0 },
        { name: 'Declaração IR', value: ir.count || 0 },
        { name: 'Certidões', value: certificates.count || 0 },
        { name: 'Abertura Empresa', value: companyOpening.count || 0 },
      ].filter(s => s.value > 0));

      setStats({
        totalRevenue,
        monthlyRevenue: currentMonthRevenue,
        previousMonthRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        totalSubscriptions: totalSubs || 0,
        activeSubscriptions: activeSubs,
        averageTicket: payments?.length ? Math.round(totalRevenue / payments.length) : 0,
        totalExpenses,
        monthlyExpenses: currentMonthExpenses,
      });

      setRevenueData(chartData);
    } catch (error) {
      console.error('Error fetching BI data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { stats, revenueData, serviceDistribution, loading, refresh: fetchData };
}
