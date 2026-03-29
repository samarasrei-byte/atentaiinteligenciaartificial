import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Radar, Eye, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, BarChart3, Scale, FileText, Lightbulb, ArrowRight, Building2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface LegislativeRadarProps {
  taxRegime?: string;
  sector?: string;
  companyType?: string;
  annualRevenue?: number;
  monthlyRevenue?: number;
}

interface LegislativeUpdate {
  id: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  impactLevel: number; // 1-5
  date: string;
  source: string;
  applicableTo: string[];
  category: 'tributario' | 'trabalhista' | 'regulatorio' | 'reforma';
}

// Atualizações legislativas relevantes
const LEGISLATIVE_UPDATES: LegislativeUpdate[] = [
  { id: '1', title: 'LC 214/2025 - IBS e CBS aprovados', description: 'Novo sistema tributário com IBS (17,7%) e CBS (8,8%) substituindo PIS, COFINS, ICMS, ISS e IPI. Transição de 2027 a 2032.', impact: 'neutral', impactLevel: 5, date: '2025-01-16', source: 'Diário Oficial', applicableTo: ['simples_nacional', 'lucro_presumido', 'lucro_real'], category: 'reforma' },
  { id: '2', title: 'Novo limite MEI 2025', description: 'PL em tramitação para aumentar limite do MEI de R$ 81.000 para R$ 130.000 anuais.', impact: 'positive', impactLevel: 4, date: '2025-03-01', source: 'Câmara dos Deputados', applicableTo: ['mei'], category: 'tributario' },
  { id: '3', title: 'Split Payment obrigatório 2026', description: 'Sistema de pagamento dividido será obrigatório, com recolhimento automático de impostos no ato da transação.', impact: 'negative', impactLevel: 4, date: '2025-06-15', source: 'Receita Federal', applicableTo: ['simples_nacional', 'lucro_presumido', 'lucro_real'], category: 'reforma' },
  { id: '4', title: 'EFD-Reinf ampliada', description: 'Novas obrigações de retenções na fonte incluídas na EFD-Reinf a partir de 2026.', impact: 'negative', impactLevel: 3, date: '2025-04-01', source: 'IN RFB', applicableTo: ['lucro_presumido', 'lucro_real'], category: 'tributario' },
  { id: '5', title: 'Cashback tributário para baixa renda', description: 'Devolução de CBS e IBS para famílias de baixa renda. Pode afetar precificação de serviços.', impact: 'neutral', impactLevel: 2, date: '2025-05-01', source: 'Regulamentação LC 214', applicableTo: ['simples_nacional', 'lucro_presumido', 'lucro_real'], category: 'reforma' },
  { id: '6', title: 'eSocial simplificado para MEI', description: 'Nova versão do eSocial simplificada para MEI com empregado, reduzindo burocracia.', impact: 'positive', impactLevel: 3, date: '2025-07-01', source: 'MTE', applicableTo: ['mei'], category: 'trabalhista' },
  { id: '7', title: 'DIRF extinta a partir de 2026', description: 'A DIRF será substituída pela EFD-Reinf e eSocial. Empresas devem se adequar aos novos formatos.', impact: 'positive', impactLevel: 3, date: '2025-01-01', source: 'IN RFB 2.096', applicableTo: ['lucro_presumido', 'lucro_real'], category: 'regulatorio' },
];

// Benchmark setorial
const SECTOR_BENCHMARKS: Record<string, { avgTaxRate: number; avgMargin: number; avgCompliance: number }> = {
  comercio: { avgTaxRate: 12.5, avgMargin: 8.2, avgCompliance: 72 },
  servicos: { avgTaxRate: 15.3, avgMargin: 22.5, avgCompliance: 78 },
  tecnologia: { avgTaxRate: 9.8, avgMargin: 35.0, avgCompliance: 85 },
  industria: { avgTaxRate: 18.2, avgMargin: 12.0, avgCompliance: 70 },
  saude: { avgTaxRate: 14.0, avgMargin: 18.0, avgCompliance: 82 },
  educacao: { avgTaxRate: 8.5, avgMargin: 20.0, avgCompliance: 88 },
  construcao: { avgTaxRate: 16.0, avgMargin: 10.5, avgCompliance: 65 },
  alimentacao: { avgTaxRate: 13.0, avgMargin: 6.5, avgCompliance: 68 },
  agronegocio: { avgTaxRate: 11.0, avgMargin: 15.0, avgCompliance: 60 },
  transporte: { avgTaxRate: 14.5, avgMargin: 9.0, avgCompliance: 66 },
};

export const LegislativeRadar: React.FC<LegislativeRadarProps> = ({
  taxRegime = 'simples_nacional',
  sector = 'servicos',
  companyType = 'me',
  annualRevenue = 0,
  monthlyRevenue = 0,
}) => {
  const [activeTab, setActiveTab] = useState('radar');
  const effectiveRegime = companyType === 'mei' ? 'mei' : taxRegime;

  // Filtrar atualizações relevantes
  const relevantUpdates = LEGISLATIVE_UPDATES.filter(u => u.applicableTo.includes(effectiveRegime));

  const benchmark = SECTOR_BENCHMARKS[sector] || SECTOR_BENCHMARKS.servicos;
  const revenue = monthlyRevenue > 0 ? monthlyRevenue : (annualRevenue > 0 ? annualRevenue / 12 : 5000000);

  // Calcula carga tributária estimada para comparação
  const estimatedTaxRate = companyType === 'mei' ? 5.0 :
    taxRegime === 'simples_nacional' ? (revenue * 12 <= 18000000 ? 6.0 : revenue * 12 <= 36000000 ? 11.2 : 16.0) :
    taxRegime === 'lucro_presumido' ? 16.33 : 34.0;

  const taxDiff = estimatedTaxRate - benchmark.avgTaxRate;

  // Dados do radar chart
  const radarData = [
    { subject: 'Carga Tributária', yours: Math.min(100, Math.round((estimatedTaxRate / 40) * 100)), average: Math.round((benchmark.avgTaxRate / 40) * 100) },
    { subject: 'Conformidade', yours: 75, average: benchmark.avgCompliance },
    { subject: 'Eficiência', yours: Math.round(100 - (estimatedTaxRate / 40) * 100), average: Math.round(100 - (benchmark.avgTaxRate / 40) * 100) },
    { subject: 'Margem', yours: Math.min(100, Math.round(benchmark.avgMargin * 2.5)), average: Math.round(benchmark.avgMargin * 2.5) },
    { subject: 'Planejamento', yours: 60, average: 55 },
    { subject: 'Digitalização', yours: 80, average: 50 },
  ];

  // Comparativo setorial para bar chart
  const comparisonData = Object.entries(SECTOR_BENCHMARKS).map(([key, val]) => ({
    setor: key.charAt(0).toUpperCase() + key.slice(1),
    aliquota: val.avgTaxRate,
    isYours: key === sector,
  })).sort((a, b) => a.aliquota - b.aliquota);

  const impactColors = {
    positive: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', icon: TrendingUp },
    negative: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', icon: TrendingDown },
    neutral: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', icon: Eye },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Radar className="h-6 w-6 text-white" />
          </div>
          Radar Legislativo & Benchmark
        </h2>
        <p className="text-muted-foreground mt-1">
          Monitoramento de novas leis e comparativo com seu setor
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="radar" className="gap-2"><FileText className="h-4 w-4" /> Legislação</TabsTrigger>
          <TabsTrigger value="benchmark" className="gap-2"><BarChart3 className="h-4 w-4" /> Benchmark</TabsTrigger>
        </TabsList>

        <TabsContent value="radar" className="space-y-4 mt-4">
          {/* Resumo de impacto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Impacto Positivo', count: relevantUpdates.filter(u => u.impact === 'positive').length, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
              { label: 'Atenção Necessária', count: relevantUpdates.filter(u => u.impact === 'negative').length, color: 'text-red-600', bg: 'bg-red-500/10' },
              { label: 'Neutro/Informativo', count: relevantUpdates.filter(u => u.impact === 'neutral').length, color: 'text-blue-600', bg: 'bg-blue-500/10' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <p className={`text-3xl font-bold ${item.color}`}>{item.count}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Lista de atualizações */}
          <div className="space-y-3">
            {relevantUpdates.map((update, i) => {
              const config = impactColors[update.impact];
              const ImpactIcon = config.icon;
              return (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`border ${config.border} ${config.bg}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className={`${config.text} border-current text-[10px]`}>
                              {update.category === 'reforma' ? 'Reforma Tributária' :
                               update.category === 'tributario' ? 'Tributário' :
                               update.category === 'trabalhista' ? 'Trabalhista' : 'Regulatório'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              Impacto: {'●'.repeat(update.impactLevel)}{'○'.repeat(5 - update.impactLevel)}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{update.date}</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{update.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{update.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-1.5">Fonte: {update.source}</p>
                        </div>
                        <ImpactIcon className={`h-5 w-5 ${config.text} flex-shrink-0 mt-1`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-4 mt-4">
          {/* Sua posição vs mercado */}
          <Card className={`border ${taxDiff > 2 ? 'border-red-500/20 bg-red-500/5' : taxDiff < -2 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <Zap className={`h-5 w-5 mt-0.5 flex-shrink-0 ${taxDiff > 2 ? 'text-red-500' : taxDiff < -2 ? 'text-emerald-500' : 'text-blue-500'}`} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Sua carga tributária é de ~{estimatedTaxRate.toFixed(1)}%
                  {taxDiff > 2 ? ` (${taxDiff.toFixed(1)}pp acima da média do setor)` :
                   taxDiff < -2 ? ` (${Math.abs(taxDiff).toFixed(1)}pp abaixo da média do setor)` :
                   ' (dentro da média do setor)'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Média do setor ({sector}): {benchmark.avgTaxRate}% · Margem média: {benchmark.avgMargin}%
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Você vs Média do Setor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                      <RechartsRadar name="Sua Empresa" dataKey="yours" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      <RechartsRadar name="Média Setor" dataKey="average" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3 rounded bg-primary/30 border border-primary" />
                    Sua Empresa
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3 rounded bg-amber-500/15 border border-amber-500" />
                    Média do Setor
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparativo bar chart */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Alíquota Efetiva por Setor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v}%`} />
                      <YAxis type="category" dataKey="setor" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`${v}%`, 'Alíquota']} />
                      <Bar dataKey="aliquota" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))">
                        {comparisonData.map((entry, index) => (
                          <rect key={`cell-${index}`} fill={entry.isYours ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
