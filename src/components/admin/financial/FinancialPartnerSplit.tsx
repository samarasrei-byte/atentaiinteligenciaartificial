import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users,
  DollarSign,
  Percent,
  TrendingUp,
  RefreshCw,
  Info,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
  display_order: number;
}

interface SplitRule {
  id: string;
  partner_id: string;
  partner_name: string;
  service_category: string;
  percentage: number;
  effective_from: string;
  effective_until: string | null;
  is_active: boolean;
}

interface PartnerShare {
  partnerId: string;
  partnerName: string;
  totalRevenue: number;
  marketplaceShare: number;
  subscriptionShare: number;
  totalShare: number;
  color: string;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const formatDate = (date: string) => 
  new Date(date).toLocaleDateString('pt-BR');

const partnerColors: Record<string, string> = {
  'Guilherme Mesquita': '#10b981',
  'Guilherme Mesquita (Op)': '#3b82f6'
};

export const FinancialPartnerSplit: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [splitRules, setSplitRules] = useState<SplitRule[]>([]);
  const [partnerShares, setPartnerShares] = useState<PartnerShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState({ marketplace: 0, subscriptions: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscar sócios
      const { data: partnersData } = await supabase
        .from('financial_partners')
        .select('*')
        .order('display_order');

      // Buscar regras de divisão ativas
      const today = new Date().toISOString().split('T')[0];
      const { data: rulesData } = await supabase
        .from('financial_split_rules')
        .select('*')
        .eq('is_active', true)
        .lte('effective_from', today)
        .or(`effective_until.is.null,effective_until.gte.${today}`);

      // Buscar receitas totais
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount_cents, payment_type')
        .eq('status', 'completed');

      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('price_cents')
        .eq('status', 'active');

      // Calcular totais
      const marketplaceRevenue = (paymentsData || [])
        .filter((p: any) => ['limpa-nome', 'analise-fiscal', 'bi-contabilidade'].includes(p.payment_type || ''))
        .reduce((sum: number, p: any) => sum + p.amount_cents, 0);

      const subscriptionsRevenue = (subscriptionsData || [])
        .reduce((sum: number, s: any) => sum + s.price_cents, 0);

      setTotalRevenue({ marketplace: marketplaceRevenue, subscriptions: subscriptionsRevenue });

      // Mapear partners
      const formattedPartners: Partner[] = (partnersData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        is_active: p.is_active,
        display_order: p.display_order
      }));
      setPartners(formattedPartners);

      // Mapear regras com nome do sócio
      const formattedRules: SplitRule[] = (rulesData || []).map((r: any) => {
        const partner = formattedPartners.find(p => p.id === r.partner_id);
        return {
          id: r.id,
          partner_id: r.partner_id,
          partner_name: partner?.name || 'Desconhecido',
          service_category: r.service_category,
          percentage: parseFloat(r.percentage),
          effective_from: r.effective_from,
          effective_until: r.effective_until,
          is_active: r.is_active
        };
      });
      setSplitRules(formattedRules);

      // Calcular shares por sócio
      const shares: PartnerShare[] = formattedPartners.map(partner => {
        const marketplaceRule = formattedRules.find(
          r => r.partner_id === partner.id && r.service_category === 'marketplace_services'
        );
        const subscriptionRule = formattedRules.find(
          r => r.partner_id === partner.id && r.service_category === 'subscriptions'
        );

        const marketplaceShare = marketplaceRule 
          ? Math.round(marketplaceRevenue * marketplaceRule.percentage / 100)
          : 0;
        const subscriptionShare = subscriptionRule 
          ? Math.round(subscriptionsRevenue * subscriptionRule.percentage / 100)
          : 0;

        return {
          partnerId: partner.id,
          partnerName: partner.name,
          totalRevenue: marketplaceRevenue + subscriptionsRevenue,
          marketplaceShare,
          subscriptionShare,
          totalShare: marketplaceShare + subscriptionShare,
          color: partnerColors[partner.name] || '#64748b'
        };
      });
      setPartnerShares(shares);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentRule = (partnerId: string, category: string) => {
    return splitRules.find(r => r.partner_id === partnerId && r.service_category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Divisão Societária</h2>
          <p className="text-sm text-muted-foreground">Cálculo automático de participação dos sócios</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Regras ativas */}
      <Card className="bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-5 w-5 text-indigo-500" />
            Regras de Divisão Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Marketplace */}
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  Marketplace
                </Badge>
                <span className="text-xs text-muted-foreground">(Limpa Nome, Análise Fiscal, BI)</span>
              </div>
              <div className="space-y-2">
                {partners.map(partner => {
                  const rule = getCurrentRule(partner.id, 'marketplace_services');
                  return (
                    <div key={partner.id} className="flex items-center justify-between text-sm">
                      <span>{partner.name}</span>
                      <Badge variant="secondary">{rule?.percentage || 0}%</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assinaturas */}
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                  Assinaturas
                </Badge>
                <span className="text-xs text-muted-foreground">(Planos mensais)</span>
              </div>
              <div className="space-y-2">
                {partners.map(partner => {
                  const rule = getCurrentRule(partner.id, 'subscriptions');
                  return (
                    <div key={partner.id} className="flex items-center justify-between text-sm">
                      <span>{partner.name}</span>
                      <Badge variant="secondary">{rule?.percentage || 0}%</Badge>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Regra atual desde {formatDate('2025-03-01')}: 70% / 15% / 15%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de participação */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {partnerShares.map((share) => (
            <Card key={share.partnerId} className="overflow-hidden">
              <div 
                className="h-2" 
                style={{ backgroundColor: share.color }}
              />
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: share.color }}
                  >
                    {share.partnerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{share.partnerName}</h3>
                    <p className="text-xs text-muted-foreground">Sócio</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Marketplace:</span>
                    <span className="font-medium">{formatCurrency(share.marketplaceShare)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Assinaturas:</span>
                    <span className="font-medium">{formatCurrency(share.subscriptionShare)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total a receber:</span>
                      <span 
                        className="text-xl font-bold"
                        style={{ color: share.color }}
                      >
                        {formatCurrency(share.totalShare)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabela detalhada */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Detalhamento por Sócio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sócio</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Serviço</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Receita Total</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Percentual</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor a Receber</th>
                </tr>
              </thead>
              <tbody>
                {partnerShares.map((share) => (
                  <React.Fragment key={share.partnerId}>
                    <tr className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4" rowSpan={2}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: share.color }}
                          >
                            {share.partnerName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium">{share.partnerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                          Marketplace
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(totalRevenue.marketplace)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">
                          {getCurrentRule(share.partnerId, 'marketplace_services')?.percentage || 0}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold" style={{ color: share.color }}>
                        {formatCurrency(share.marketplaceShare)}
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                          Assinaturas
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(totalRevenue.subscriptions)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">
                          {getCurrentRule(share.partnerId, 'subscriptions')?.percentage || 0}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold" style={{ color: share.color }}>
                        {formatCurrency(share.subscriptionShare)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50">
                  <td colSpan={4} className="py-4 px-4 text-right font-semibold">
                    Total Distribuído:
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(partnerShares.reduce((sum, s) => sum + s.totalShare, 0))}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
