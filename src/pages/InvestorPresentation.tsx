import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, TrendingUp, Users, DollarSign, Target, 
  Zap, Shield, Brain, Building2, ArrowRight, CheckCircle2,
  PieChart, BarChart3, LineChart, Rocket, Globe, Award
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const revenueProjection = [
  { year: '2025', mrr: 15000, users: 500 },
  { year: '2026', mrr: 75000, users: 2500 },
  { year: '2027', mrr: 250000, users: 8000 },
  { year: '2028', mrr: 600000, users: 20000 },
  { year: '2029', mrr: 1200000, users: 45000 },
];

const revenueBreakdown = [
  { name: 'Assinaturas', value: 65, color: 'hsl(var(--primary))' },
  { name: 'Serviços Avulsos', value: 25, color: 'hsl(var(--info))' },
  { name: 'Marketplace', value: 10, color: 'hsl(var(--success))' },
];

const marketSegments = [
  { segment: 'MEI', tam: 15000000, sam: 3000000, som: 150000 },
  { segment: 'ME/EPP', tam: 6000000, sam: 1200000, som: 60000 },
  { segment: 'Autônomos', tam: 25000000, sam: 5000000, som: 250000 },
];

const successMetrics = [
  { metric: 'Economia Média', value: 'R$ 42.000', subtext: 'por empresa/ano' },
  { metric: 'Tempo Economizado', value: '15h', subtext: 'por mês/usuário' },
  { metric: 'Precisão IA', value: '98.5%', subtext: 'em simulações' },
  { metric: 'NPS Score', value: '72', subtext: 'promotores' },
];

const competitiveAdvantages = [
  { title: 'IA Proprietária', desc: 'Algoritmos exclusivos para LC 214/2025', icon: Brain },
  { title: 'Primeira no Mercado', desc: 'Pioneiros em simulação da reforma', icon: Rocket },
  { title: 'Marketplace Integrado', desc: 'Contadores + serviços em um lugar', icon: Globe },
  { title: 'Compliance Automático', desc: 'Atualização em tempo real', icon: Shield },
];

const roadmap = [
  { quarter: 'Q1 2025', items: ['Launch MVP', 'Primeiros 100 clientes', 'Validação de mercado'] },
  { quarter: 'Q2 2025', items: ['Marketplace de contadores', 'App mobile PWA', 'Parcerias estratégicas'] },
  { quarter: 'Q3 2025', items: ['Expansão B2B', 'API para escritórios', 'White-label'] },
  { quarter: 'Q4 2025', items: ['Série A', 'Expansão nacional', '10.000 usuários'] },
];

export default function InvestorPresentation() {
  const presentationRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
    return `R$ ${value}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const exportToPDF = async () => {
    if (!presentationRef.current) return;
    
    const canvas = await html2canvas(presentationRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save('AtentAI_Investor_Presentation.pdf');
  };

  const totalTAM = marketSegments.reduce((sum, s) => sum + s.tam, 0);
  const totalSAM = marketSegments.reduce((sum, s) => sum + s.sam, 0);
  const totalSOM = marketSegments.reduce((sum, s) => sum + s.som, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-atentai.png" alt="AtentAI" className="h-8" />
            <Badge variant="outline" className="text-primary border-primary">
              Investor Deck 2025
            </Badge>
          </div>
          <Button onClick={exportToPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div ref={presentationRef} className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Slide 1: Hero */}
        <section className="py-16 text-center space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1">
            Seed Round • 2025
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            AtentAI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            A plataforma de inteligência fiscal que prepara empresas brasileiras 
            para a maior reforma tributária da história
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span>LC 214/2025 Compliance</span>
            </div>
            <div className="flex items-center gap-2 text-info">
              <CheckCircle2 className="w-5 h-5" />
              <span>IA Generativa</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <span>SaaS B2B/B2C</span>
            </div>
          </div>
        </section>

        {/* Slide 2: O Problema */}
        <section className="py-12">
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Target className="w-8 h-8 text-destructive" />
                O Problema
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="text-3xl font-bold text-destructive">R$ 470 Bi</h4>
                <p className="text-muted-foreground">
                  Perdidos anualmente por empresas em erros tributários
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-bold text-destructive">1.500 horas</h4>
                <p className="text-muted-foreground">
                  Gastas por empresa/ano em compliance fiscal
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-bold text-destructive">2026</h4>
                <p className="text-muted-foreground">
                  Nova reforma tributária entra em vigor sem preparação
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Slide 3: A Solução */}
        <section className="py-12 space-y-6">
          <h2 className="text-3xl font-bold text-center">Nossa Solução</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitiveAdvantages.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Slide 4: Métricas de Sucesso */}
        <section className="py-12 space-y-6">
          <h2 className="text-3xl font-bold text-center">Métricas de Impacto</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {successMetrics.map((item, index) => (
              <Card key={index} className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary">{item.value}</p>
                  <p className="font-medium text-foreground mt-2">{item.metric}</p>
                  <p className="text-sm text-muted-foreground">{item.subtext}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Slide 5: Tamanho do Mercado */}
        <section className="py-12 space-y-6">
          <h2 className="text-3xl font-bold text-center">Tamanho do Mercado</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <h3 className="text-sm text-muted-foreground mb-2">TAM</h3>
                <p className="text-4xl font-bold text-foreground">{formatNumber(totalTAM)}</p>
                <p className="text-muted-foreground">empresas potenciais</p>
                <p className="text-xl font-semibold text-primary mt-2">R$ 920 Bi</p>
                <p className="text-sm text-muted-foreground">mercado total</p>
              </CardContent>
            </Card>
            <Card className="text-center border-primary">
              <CardContent className="pt-6">
                <h3 className="text-sm text-muted-foreground mb-2">SAM</h3>
                <p className="text-4xl font-bold text-primary">{formatNumber(totalSAM)}</p>
                <p className="text-muted-foreground">empresas acessíveis</p>
                <p className="text-xl font-semibold text-primary mt-2">R$ 184 Bi</p>
                <p className="text-sm text-muted-foreground">mercado endereçável</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <h3 className="text-sm text-muted-foreground mb-2">SOM</h3>
                <p className="text-4xl font-bold text-success">{formatNumber(totalSOM)}</p>
                <p className="text-muted-foreground">meta 5 anos</p>
                <p className="text-xl font-semibold text-success mt-2">R$ 18 Bi</p>
                <p className="text-sm text-muted-foreground">receita potencial</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Slide 6: Projeção de Receita */}
        <section className="py-12 space-y-6">
          <h2 className="text-3xl font-bold text-center">Projeção de Crescimento</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  MRR Projetado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueProjection}>
                      <defs>
                        <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="year" className="text-xs" />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'MRR']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))' 
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="mrr" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorMrr)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-info" />
                  Base de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueProjection}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="year" className="text-xs" />
                      <YAxis tickFormatter={(v) => formatNumber(v)} className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => [formatNumber(value), 'Usuários']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))' 
                        }}
                      />
                      <Bar 
                        dataKey="users" 
                        fill="hsl(var(--info))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Slide 7: Modelo de Receita */}
        <section className="py-12 space-y-6">
          <h2 className="text-3xl font-bold text-center">Modelo de Receita</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Breakdown de Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planos e Preços</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Simulador</p>
                    <p className="text-sm text-muted-foreground">Ferramentas básicas</p>
                  </div>
                  <p className="text-lg font-bold">R$ 29/mês</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div>
                    <p className="font-medium text-primary">AtentAI Premium</p>
                    <p className="text-sm text-muted-foreground">IA + Consultas</p>
                  </div>
                  <p className="text-lg font-bold text-primary">R$ 79/mês</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Contador Premium</p>
                    <p className="text-sm text-muted-foreground">Para profissionais</p>
                  </div>
                  <p className="text-lg font-bold">R$ 149/mês</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ARPU médio</span>
                    <span className="font-bold">R$ 65/mês</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-muted-foreground">LTV estimado</span>
                    <span className="font-bold text-success">R$ 1.560</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-muted-foreground">CAC alvo</span>
                    <span className="font-bold">R$ 120</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Slide 8: Roadmap */}
        <section className="py-12 space-y-6">
          <h2 className="text-3xl font-bold text-center">Roadmap 2025</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {roadmap.map((phase, index) => (
              <Card key={index} className={index === 0 ? 'border-primary' : ''}>
                <CardHeader className="pb-2">
                  <Badge variant={index === 0 ? 'default' : 'outline'}>{phase.quarter}</Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Slide 9: Team & Ask */}
        <section className="py-12 space-y-6">
          <h2 className="text-3xl font-bold text-center">O Pedido</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  Seed Round
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-primary">R$ 2M</p>
                  <p className="text-muted-foreground">Captação alvo</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Produto & Tech</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing & Vendas</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operações</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserva</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-success" />
                  Por que Investir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Timing Perfeito</p>
                    <p className="text-sm text-muted-foreground">Reforma tributária cria demanda urgente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Mercado Gigante</p>
                    <p className="text-sm text-muted-foreground">46M+ empresas precisam de solução</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Tecnologia Proprietária</p>
                    <p className="text-sm text-muted-foreground">IA exclusiva para LC 214/2025</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Unit Economics Sólido</p>
                    <p className="text-sm text-muted-foreground">LTV/CAC projetado de 13x</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Slide 10: Contato */}
        <section className="py-16 text-center space-y-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl">
          <h2 className="text-3xl font-bold">Vamos Conversar?</h2>
          <p className="text-xl text-muted-foreground">
            Estamos prontos para transformar o mercado tributário brasileiro
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-lg font-medium">AtentAI Tecnologia Ltda</span>
            </div>
            <Badge variant="outline" className="text-base px-4 py-2">
              contato@atentai.com.br
            </Badge>
          </div>
          <img src="/logo-atentai.png" alt="AtentAI" className="h-12 mx-auto mt-8 opacity-50" />
        </section>

      </div>
    </div>
  );
}
