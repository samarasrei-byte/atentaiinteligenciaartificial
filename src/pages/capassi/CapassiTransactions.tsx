import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download, Upload, Calendar, Trash2, Edit2, RefreshCw } from 'lucide-react';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

export default function CapassiTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [revenues, setRevenues] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [rev, cost] = await Promise.all([
      supabase.from('financial_revenues').select('*').order('revenue_date', { ascending: false }),
      supabase.from('financial_costs').select('*').order('cost_date', { ascending: false }),
    ]);
    setRevenues(rev.data || []);
    setCosts(cost.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const allTransactions = [
    ...revenues.map(r => ({ ...r, _type: 'revenue', _date: r.revenue_date, _amount: r.amount_cents })),
    ...costs.map(c => ({ ...c, _type: 'cost', _date: c.cost_date, _amount: c.amount_cents })),
  ].sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());

  const exportCSV = () => {
    const header = 'Data,Tipo,Descrição,Valor\n';
    const rows = allTransactions.map(t =>
      `${t._date},${t._type === 'revenue' ? 'Receita' : 'Custo'},${t.description || t.service_slug || '-'},${(t._amount / 100).toFixed(2)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'capassi-transacoes.csv'; a.click();
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(1).filter(Boolean);
      let imported = 0;
      for (const line of lines) {
        const [date, type, desc, amount] = line.split(',');
        const cents = Math.round(parseFloat(amount) * 100);
        if (type?.trim().toLowerCase() === 'receita') {
          await supabase.from('financial_revenues').insert({ revenue_date: date.trim(), amount_cents: cents, service_slug: desc.trim() || 'import', source: 'csv' });
        } else {
          await supabase.from('financial_costs').insert({ cost_date: date.trim(), amount_cents: cents, cost_type: 'outros', description: desc.trim(), user_id: user!.id });
        }
        imported++;
      }
      toast({ title: `${imported} transações importadas` });
      fetchAll();
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Transações</h2>
          <p className="text-sm text-white/40">Receitas e custos unificados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} className="border-[#372938] text-white/60 hover:text-white bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-[#372938] text-white/60 hover:text-white bg-transparent">
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-[#372938] text-white/60 hover:text-white bg-transparent">
            <Upload className="h-4 w-4 mr-2" /> Importar CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={importCSV} />
        </div>
      </div>

      <Card className="bg-[#0B0F1A] border-[#372938]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">
            {allTransactions.length} transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white/40">Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#372938' }}>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Descrição</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-white/40">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((t, i) => (
                    <tr key={t.id || i} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: '#372938' }}>
                      <td className="py-3 px-4 text-sm text-white/70">
                        {new Date(t._date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={t._type === 'revenue' ? 'bg-[#55FFAA]/10 text-[#55FFAA] border-[#55FFAA]/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}>
                          {t._type === 'revenue' ? 'Receita' : 'Custo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-white/60">
                        {t.description || t.service_slug || t.cost_type || '-'}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${t._type === 'revenue' ? 'text-[#55FFAA]' : 'text-red-400'}`}>
                        {t._type === 'revenue' ? '+' : '-'}{formatCurrency(t._amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
