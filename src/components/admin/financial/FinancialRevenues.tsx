import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search,
  Download,
  Filter,
  ArrowUpDown,
  DollarSign,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface Revenue {
  id: string;
  date: string;
  service: string;
  plan: string | null;
  type: 'one_time' | 'subscription';
  amount: number;
  source: string;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const formatDate = (date: string) => 
  new Date(date).toLocaleDateString('pt-BR');

export const FinancialRevenues: React.FC = () => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async () => {
    setIsLoading(true);
    try {
      // Buscar de financial_revenues
      const { data: revenuesData } = await supabase
        .from('financial_revenues')
        .select('*')
        .order('revenue_date', { ascending: false });

      // Buscar pagamentos de serviços
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      // Buscar assinaturas ativas
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const combinedRevenues: Revenue[] = [];

      // Adicionar receitas manuais/registradas
      (revenuesData || []).forEach((r: any) => {
        combinedRevenues.push({
          id: r.id,
          date: r.revenue_date,
          service: r.service_slug || 'Outros',
          plan: r.plan_name,
          type: r.revenue_type === 'subscription' ? 'subscription' : 'one_time',
          amount: r.amount_cents,
          source: r.source
        });
      });

      // Adicionar pagamentos
      (paymentsData || []).forEach((p: any) => {
        combinedRevenues.push({
          id: p.id,
          date: p.created_at,
          service: p.service_type || 'Pagamento',
          plan: null,
          type: 'one_time',
          amount: p.amount_cents,
          source: 'stripe'
        });
      });

      // Adicionar assinaturas
      (subscriptionsData || []).forEach((s: any) => {
        combinedRevenues.push({
          id: s.id,
          date: s.created_at,
          service: 'Assinatura',
          plan: s.plan_type,
          type: 'subscription',
          amount: s.price_cents,
          source: 'stripe'
        });
      });

      // Ordenar por data
      combinedRevenues.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setRevenues(combinedRevenues);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRevenues = revenues.filter(r => {
    const matchesSearch = r.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (r.plan?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesService = serviceFilter === 'all' || r.service.toLowerCase().includes(serviceFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesService && matchesType;
  });

  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.amount, 0);

  const getServiceBadge = (service: string) => {
    const colors: Record<string, string> = {
      'limpa-nome': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      'analise-fiscal': 'bg-violet-500/10 text-violet-600 border-violet-500/30',
      'bi-contabilidade': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
      'assinatura': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    };
    const key = service.toLowerCase().replace(/\s/g, '-');
    return colors[key] || 'bg-slate-500/10 text-slate-600 border-slate-500/30';
  };

  const getTypeBadge = (type: 'one_time' | 'subscription') => {
    return type === 'subscription' 
      ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
      : 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Receitas</h2>
          <p className="text-sm text-muted-foreground">Histórico detalhado de todas as receitas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRevenues}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por serviço ou plano..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Serviços</SelectItem>
                <SelectItem value="limpa-nome">Limpa Nome</SelectItem>
                <SelectItem value="analise-fiscal">Análise Fiscal</SelectItem>
                <SelectItem value="bi">BI Contabilidade</SelectItem>
                <SelectItem value="assinatura">Assinaturas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="one_time">Venda Única</SelectItem>
                <SelectItem value="subscription">Assinatura</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de receitas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Histórico de Receitas
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              {filteredRevenues.length} registros
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                        Data <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Serviço</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plano</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRevenues.map((revenue) => (
                    <tr key={revenue.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(revenue.date)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getServiceBadge(revenue.service)}>
                          {revenue.service}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {revenue.plan || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getTypeBadge(revenue.type)}>
                          {revenue.type === 'subscription' ? 'Assinatura' : 'Venda Única'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(revenue.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="capitalize">
                          {revenue.source}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50">
                    <td colSpan={4} className="py-4 px-4 text-right font-semibold">
                      Total:
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(totalRevenue)}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
