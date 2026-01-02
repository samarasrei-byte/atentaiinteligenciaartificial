import { useState, useEffect } from 'react';
import { History, TrendingUp, Calendar, CheckCircle, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CashbackHistoryItem {
  id: string;
  month_year: string;
  services_used: number;
  cashback_percent: number;
  cashback_amount_cents: number;
  total_spent_cents: number;
  is_claimed: boolean;
  claimed_at: string | null;
  expires_at: string | null;
}

export function CashbackHistoryCard() {
  const { user, subscription } = useAuth();
  const [history, setHistory] = useState<CashbackHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClaimed, setTotalClaimed] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_cashback')
          .select('*')
          .eq('user_id', user.id)
          .order('month_year', { ascending: false });

        if (error) throw error;

        setHistory(data || []);
        
        // Calculate total claimed
        const claimed = (data || [])
          .filter(item => item.is_claimed)
          .reduce((sum, item) => sum + item.cashback_amount_cents, 0);
        setTotalClaimed(claimed);
      } catch (err) {
        console.error('Error fetching cashback history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  if (!subscription.subscribed) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Histórico de Cashback</CardTitle>
          </div>
          <CardDescription>
            Assine um plano para começar a acumular cashback
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3 mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Histórico de Cashback</CardTitle>
          </div>
          {totalClaimed > 0 && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              <Gift className="h-3 w-3 mr-1" />
              Total: {formatCurrency(totalClaimed)}
            </Badge>
          )}
        </div>
        <CardDescription>
          Histórico completo de cashback acumulado e resgatado
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum cashback ainda</p>
            <p className="text-sm mt-1">
              Use 2+ serviços diferentes no mês para começar!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-3">
              {history.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        item.is_claimed 
                          ? 'bg-success/10 text-success' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {item.is_claimed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Calendar className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {formatMonthYear(item.month_year)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.services_used} serviços • {item.cashback_percent}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold ${
                        item.is_claimed ? 'text-success' : 'text-primary'
                      }`}>
                        {formatCurrency(item.cashback_amount_cents)}
                      </p>
                      {item.is_claimed && item.claimed_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.claimed_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  {index < history.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Summary Stats */}
        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-primary">{history.length}</p>
              <p className="text-xs text-muted-foreground">Meses</p>
            </div>
            <div>
              <p className="text-xl font-bold text-success">
                {history.filter(h => h.is_claimed).length}
              </p>
              <p className="text-xs text-muted-foreground">Resgatados</p>
            </div>
            <div>
              <p className="text-xl font-bold">
                {formatCurrency(history.reduce((sum, h) => sum + h.cashback_amount_cents, 0))}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
