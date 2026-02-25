import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCapassi } from '@/contexts/CapassiContext';
import { FileText, Download, TrendingUp, TrendingDown, Percent, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

export default function CapassiDRE() {
  const { currentOrg, currentCompany } = useCapassi();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [period, setPeriod] = useState('all');

  const getDateFrom = (p: string): string | null => {
    const now = new Date();
    if (p === '7d') { now.setDate(now.getDate() - 7); return now.toISOString().split('T')[0]; }
    if (p === '30d') { now.setDate(now.getDate() - 30); return now.toISOString().split('T')[0]; }
    if (p === '90d') { now.setDate(now.getDate() - 90); return now.toISOString().split('T')[0]; }
    return null;
  };

  useEffect(() => {
    if (!currentOrg) return;
    const fetchData = async () => {
      const dateFrom = getDateFrom(period);
      let query = supabase.from('capassi_transactions' as any).select('*').eq('organization_id', currentOrg.id);
      if (currentCompany) query = query.eq('company_id', currentCompany.id);
      if (dateFrom) query = query.gte('date', dateFrom);
      const { data } = await query;
      setTransactions((data || []) as any[]);
    };
    fetchData();
  }, [currentOrg?.id, currentCompany?.id, period]);

  const rev = transactions.filter((t: any) => t.type === 'receita');
  const cost = transactions.filter((t: any) => t.type === 'despesa');
  const revenue = rev.reduce((s: number, t: any) => s + (t.amount_cents || 0), 0);
  const costs = cost.reduce((s: number, t: any) => s + (t.amount_cents || 0), 0);

  const costsByCategory: Record<string, number> = {};
  cost.forEach((t: any) => {
    const key = t.category || 'outros';
    costsByCategory[key] = (costsByCategory[key] || 0) + (t.amount_cents || 0);
  });

  const revenueByCategory: Record<string, number> = {};
  rev.forEach((t: any) => {
    const key = t.category || 'outros';
    revenueByCategory[key] = (revenueByCategory[key] || 0) + (t.amount_cents || 0);
  });

  const net = revenue - costs;
  const margin = revenue > 0 ? ((net / revenue) * 100).toFixed(1) : '0';
  const costRatio = revenue > 0 ? ((costs / revenue) * 100).toFixed(1) : '0';

  const COLORS = ['#55FFAA', '#33DDFF', '#7C5CFC', '#FFB84D', '#FF6B6B', '#00CC77'];
  const costPieData = Object.entries(costsByCategory).map(([name, value], i) => ({
    name, value, color: COLORS[i % COLORS.length]
  }));

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('DRE — Capassi Finance Suite', 20, 20);
      doc.setFontSize(11);
      doc.text(`Org: ${currentOrg?.name || ''} | Gerado: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
      doc.setFontSize(13);
      doc.text(`Receita Bruta: ${fmt(revenue)}`, 20, 48);
      let y = 63;
      doc.setFontSize(11);
      Object.entries(revenueByCategory).forEach(([cat, amount]) => { doc.text(`  • ${cat}: ${fmt(amount)}`, 25, y); y += 8; });
      y += 5;
      doc.setFontSize(13);
      doc.text('Custos e Deduções:', 20, y); y += 12;
      doc.setFontSize(11);
      Object.entries(costsByCategory).forEach(([cat, amount]) => { doc.text(`  (-) ${cat}: ${fmt(amount)}`, 25, y); y += 8; });
      y += 5;
      doc.setFontSize(15);
      doc.text(`LUCRO LÍQUIDO: ${fmt(net)} (${margin}%)`, 20, y);
      doc.save('capassi-dre.pdf');
    });
  };

  const rows = [
    { label: 'RECEITA BRUTA', value: revenue, bold: true, color: 'text-[#55FFAA]', section: true },
    ...Object.entries(revenueByCategory).map(([cat, amount]) => ({
      label: `  ${cat.replace(/_/g, ' ')}`, value: amount, bold: false, color: 'text-[#55FFAA]/60', section: false
    })),
    { label: '', value: 0, bold: false, color: '', section: false },
    { label: 'CUSTOS E DEDUÇÕES', value: -costs, bold: true, color: 'text-red-400', section: true },
    ...Object.entries(costsByCategory).map(([cat, amount]) => ({
      label: `  (-) ${cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')}`, value: -amount, bold: false, color: 'text-red-400/60', section: false
    })),
    { label: '', value: 0, bold: false, color: '', section: false },
    { label: 'LUCRO LÍQUIDO', value: net, bold: true, color: net >= 0 ? 'text-[#55FFAA]' : 'text-red-400', section: true },
  ];

  if (!currentOrg) return <div className="py-20 text-center text-white/30">Selecione uma organização</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">DRE</h2>
          <p className="text-sm text-white/30">Demonstrativo de Resultado — {currentOrg.name}</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] bg-white/[0.03] border-white/10 text-white/70 h-9 text-xs">
              <Calendar className="h-3.5 w-3.5 mr-2" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportPDF} className="border-white/10 text-white/50 hover:text-white bg-transparent hover:bg-white/5">
            <Download className="h-3.5 w-3.5 mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Receita', value: fmt(revenue), icon: TrendingUp, color: '#55FFAA' },
          { label: 'Custos', value: fmt(costs), icon: TrendingDown, color: '#ef4444' },
          { label: 'Margem', value: `${margin}%`, icon: Percent, color: '#7C5CFC' },
          { label: 'Custo/Receita', value: `${costRatio}%`, icon: FileText, color: '#FFB84D' },
        ].map(k => (
          <div key={k.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${k.color}10` }}>
              <k.icon className="h-4 w-4" style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{k.value}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white/80 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#55FFAA]" /> DRE Consolidado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {rows.filter(r => r.label || r.section).map((row, i) => {
                if (!row.label) return <div key={i} className="h-3" />;
                return (
                  <div key={i} className={`flex justify-between py-3 px-4 rounded-lg ${row.section ? 'bg-white/[0.02]' : ''}`}
                    style={row.section ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : {}}>
                    <span className={`text-sm ${row.bold ? 'font-bold text-white' : 'text-white/50'}`}>{row.label}</span>
                    <span className={`text-sm font-mono ${row.bold ? 'font-bold' : 'font-medium'} ${row.color}`}>
                      {row.value !== 0 ? fmt(Math.abs(row.value)) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white/80">Composição de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            {costPieData.length > 0 ? (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={costPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                        {costPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {costPieData.map(c => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-white/50 capitalize">{c.name.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-white/70 font-mono">{fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-white/30 text-sm">Sem dados de custos</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
