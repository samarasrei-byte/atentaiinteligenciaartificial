import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download } from 'lucide-react';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

export default function CapassiDRE() {
  const [revenue, setRevenue] = useState(0);
  const [costs, setCosts] = useState(0);
  const [costsByType, setCostsByType] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetch = async () => {
      const { data: rev } = await supabase.from('financial_revenues').select('amount_cents');
      const { data: cost } = await supabase.from('financial_costs').select('amount_cents, cost_type');
      setRevenue((rev || []).reduce((s, r) => s + (r.amount_cents || 0), 0));
      const total = (cost || []).reduce((s, c) => s + (c.amount_cents || 0), 0);
      setCosts(total);
      const byType: Record<string, number> = {};
      (cost || []).forEach(c => {
        byType[c.cost_type || 'outros'] = (byType[c.cost_type || 'outros'] || 0) + (c.amount_cents || 0);
      });
      setCostsByType(byType);
    };
    fetch();
  }, []);

  const net = revenue - costs;
  const margin = revenue > 0 ? ((net / revenue) * 100).toFixed(1) : '0';

  const exportPDF = () => {
    // Simple text-based PDF export using jsPDF
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('DRE — Capassi Finance', 20, 20);
      doc.setFontSize(12);
      doc.text(`Receita Bruta: ${fmt(revenue)}`, 20, 40);
      let y = 55;
      Object.entries(costsByType).forEach(([type, amount]) => {
        doc.text(`(-) ${type}: ${fmt(amount)}`, 25, y);
        y += 10;
      });
      doc.text(`Total Custos: ${fmt(costs)}`, 20, y + 5);
      doc.setFontSize(14);
      doc.text(`Lucro Líquido: ${fmt(net)} (${margin}%)`, 20, y + 20);
      doc.save('capassi-dre.pdf');
    });
  };

  const rows = [
    { label: 'Receita Bruta', value: revenue, bold: true, color: 'text-[#55FFAA]' },
    ...Object.entries(costsByType).map(([type, amount]) => ({
      label: `(-) ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      value: -amount,
      bold: false,
      color: 'text-red-400',
    })),
    { label: 'Total de Deduções', value: -costs, bold: true, color: 'text-red-400' },
    { label: 'Lucro Líquido', value: net, bold: true, color: net >= 0 ? 'text-[#55FFAA]' : 'text-red-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">DRE</h2>
          <p className="text-sm text-white/40">Demonstrativo de Resultado do Exercício</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportPDF} className="border-[#372938] text-white/60 hover:text-white bg-transparent">
          <Download className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      <Card className="bg-[#0B0F1A] border-[#372938]">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#55FFAA]" />
            DRE Consolidado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`flex justify-between py-3 px-4 rounded ${row.bold ? 'bg-white/[0.03]' : ''}`}
                style={i < rows.length - 1 ? { borderBottom: '1px solid #372938' } : {}}
              >
                <span className={`text-sm ${row.bold ? 'font-semibold text-white' : 'text-white/60'}`}>
                  {row.label}
                </span>
                <span className={`text-sm font-mono ${row.bold ? 'font-bold' : 'font-medium'} ${row.color}`}>
                  {fmt(Math.abs(row.value))}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <span className="text-xs text-white/30">Margem líquida: {margin}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
