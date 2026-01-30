import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { KPIMetric, KPIAlert, ServiceType } from './types';

interface SmartChatData {
  kpis: KPIMetric[];
  alerts: KPIAlert[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useSmartChatData(): SmartChatData {
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [alerts, setAlerts] = useState<KPIAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Fetch real data from multiple tables in parallel
      const [
        creditRepairRes,
        fiscalRes,
        subscriptionsRes,
        paymentsRes,
      ] = await Promise.all([
        supabase.from('credit_repair_requests').select('id, status, payment_status, created_at, final_price_cents'),
        supabase.from('fiscal_analysis_requests').select('id, status, payment_status, created_at'),
        supabase.from('subscriptions').select('id, status, plan_type, price_cents'),
        supabase.from('payments').select('id, amount_cents, status, created_at').eq('status', 'completed'),
      ]);

      const creditRepair = creditRepairRes.data || [];
      const fiscal = fiscalRes.data || [];
      const subscriptions = subscriptionsRes.data || [];
      const payments = paymentsRes.data || [];

      // Calculate KPIs
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Limpa Nome KPIs
      const lnTotal = creditRepair.length;
      const lnCompleted = creditRepair.filter(r => r.status === 'completed').length;
      const lnPending = creditRepair.filter(r => r.status === 'pending').length;
      const lnConversion = lnTotal > 0 ? (lnCompleted / lnTotal) * 100 : 0;
      const lnRevenue = creditRepair.filter(r => r.payment_status === 'completed').reduce((sum, r) => sum + (r.final_price_cents || 0), 0);

      // Fiscal KPIs
      const fiscalTotal = fiscal.length;
      const fiscalCompleted = fiscal.filter(r => r.status === 'completed').length;
      const fiscalPending = fiscal.filter(r => r.status === 'pending').length;

      // BI / Subscriptions KPIs
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.price_cents || 0), 0);

      // Total Revenue
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount_cents, 0);

      const calculatedKpis: KPIMetric[] = [
        // Limpa Nome
        {
          id: 'ln_conversion',
          service: 'limpa_nome',
          label: 'Taxa de Conversão',
          value: lnConversion,
          target: 50,
          unit: 'percent',
          trend: lnConversion >= 40 ? 'up' : 'down',
          trendPercent: lnConversion >= 40 ? 5 : -8,
          status: lnConversion >= 50 ? 'excellent' : lnConversion >= 40 ? 'good' : lnConversion >= 25 ? 'warning' : 'critical',
        },
        {
          id: 'ln_pending',
          service: 'limpa_nome',
          label: 'Solicitações Pendentes',
          value: lnPending,
          unit: 'count',
          trend: lnPending <= 5 ? 'down' : 'up',
          status: lnPending <= 3 ? 'excellent' : lnPending <= 5 ? 'good' : lnPending <= 10 ? 'warning' : 'critical',
        },
        {
          id: 'ln_revenue',
          service: 'limpa_nome',
          label: 'Receita Total',
          value: lnRevenue,
          unit: 'currency',
          trend: 'up',
          trendPercent: 12,
          status: lnRevenue > 50000 ? 'excellent' : lnRevenue > 20000 ? 'good' : 'warning',
        },
        // Análise Fiscal
        {
          id: 'fiscal_pending',
          service: 'analise_fiscal',
          label: 'Análises Pendentes',
          value: fiscalPending,
          unit: 'count',
          trend: fiscalPending <= 3 ? 'down' : 'up',
          status: fiscalPending <= 2 ? 'excellent' : fiscalPending <= 5 ? 'good' : fiscalPending <= 8 ? 'warning' : 'critical',
        },
        {
          id: 'fiscal_completed',
          service: 'analise_fiscal',
          label: 'Análises Concluídas',
          value: fiscalCompleted,
          unit: 'count',
          trend: 'up',
          trendPercent: 15,
          status: 'good',
        },
        // BI
        {
          id: 'bi_mrr',
          service: 'bi',
          label: 'MRR',
          value: mrr,
          unit: 'currency',
          trend: 'up',
          trendPercent: 8,
          status: mrr > 100000 ? 'excellent' : mrr > 50000 ? 'good' : 'warning',
        },
        {
          id: 'bi_subscribers',
          service: 'bi',
          label: 'Assinantes Ativos',
          value: activeSubscriptions,
          unit: 'count',
          trend: 'up',
          trendPercent: 10,
          status: activeSubscriptions > 50 ? 'excellent' : activeSubscriptions > 20 ? 'good' : 'warning',
        },
        {
          id: 'total_revenue',
          service: 'geral',
          label: 'Receita Total',
          value: totalRevenue,
          unit: 'currency',
          trend: 'up',
          trendPercent: 18,
          status: 'excellent',
        },
      ];

      setKpis(calculatedKpis);

      // Generate alerts based on KPIs
      const generatedAlerts: KPIAlert[] = [];

      if (lnConversion < 40) {
        generatedAlerts.push({
          id: 'alert_ln_conversion',
          service: 'limpa_nome',
          metric: 'Taxa de Conversão',
          level: lnConversion < 25 ? 'critical' : 'warning',
          title: 'Conversão abaixo do esperado',
          description: `A taxa de conversão do Limpa Nome está em ${lnConversion.toFixed(1)}%, abaixo da meta de 50%.`,
          impact: 'Perda potencial de R$ ' + ((50 - lnConversion) * 780).toFixed(0) + ' em receita/mês.',
          suggestion: 'Considere revisar o follow-up de leads pendentes ou ajustar o preço.',
          actionLabel: 'Ver Leads Pendentes',
          createdAt: new Date(),
          isRead: false,
          isDismissed: false,
        });
      }

      if (lnPending > 5) {
        generatedAlerts.push({
          id: 'alert_ln_pending',
          service: 'limpa_nome',
          metric: 'Solicitações Pendentes',
          level: lnPending > 10 ? 'critical' : 'warning',
          title: 'Backlog de solicitações',
          description: `Há ${lnPending} solicitações de Limpa Nome aguardando processamento.`,
          impact: 'Atraso no atendimento pode gerar insatisfação e cancelamentos.',
          suggestion: 'Priorize o processamento das solicitações mais antigas.',
          actionLabel: 'Processar Agora',
          createdAt: new Date(),
          isRead: false,
          isDismissed: false,
        });
      }

      if (fiscalPending > 5) {
        generatedAlerts.push({
          id: 'alert_fiscal_pending',
          service: 'analise_fiscal',
          metric: 'Análises Pendentes',
          level: fiscalPending > 8 ? 'critical' : 'warning',
          title: 'Análises fiscais em atraso',
          description: `${fiscalPending} análises fiscais estão pendentes de processamento.`,
          impact: 'Clientes aguardando análise podem buscar concorrentes.',
          suggestion: 'Alocar recursos adicionais para reduzir o backlog.',
          actionLabel: 'Ver Análises',
          createdAt: new Date(),
          isRead: false,
          isDismissed: false,
        });
      }

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error fetching SmartChat data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set up realtime subscriptions
    const channel = supabase
      .channel('smart-chat-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_repair_requests' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fiscal_analysis_requests' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return { kpis, alerts, isLoading, refetch: fetchData };
}
