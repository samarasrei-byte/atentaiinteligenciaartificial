import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, AlertTriangle, TrendingUp, CheckCircle2, XCircle, Lightbulb, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface FiscalScoreProps {
  companyType?: string;
  taxRegime?: string;
  annualRevenue?: number;
  monthlyRevenue?: number;
  sector?: string;
  employeeCount?: number;
  hasOnboardingCompleted?: boolean;
  simulationsCount?: number;
  aiChatsCount?: number;
}

interface ScoreFactor {
  label: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'critical';
  recommendation: string;
  icon: React.ElementType;
}

export const FiscalScore: React.FC<FiscalScoreProps> = ({
  companyType = 'me',
  taxRegime = 'simples_nacional',
  annualRevenue = 0,
  monthlyRevenue = 0,
  sector = 'servicos',
  employeeCount = 0,
  hasOnboardingCompleted = false,
  simulationsCount = 0,
  aiChatsCount = 0,
}) => {
  const factors = useMemo<ScoreFactor[]>(() => {
    const items: ScoreFactor[] = [];

    // 1. Regime tributário adequado ao faturamento
    const revenueCents = annualRevenue || monthlyRevenue * 12;
    let regimeScore = 15;
    let regimeRec = 'Regime tributário adequado ao seu faturamento';
    if (companyType === 'mei' && revenueCents > 8100000) {
      regimeScore = 0;
      regimeRec = 'URGENTE: Faturamento ultrapassa limite MEI (R$ 81k). Migre para ME.';
    } else if (companyType === 'mei' && revenueCents > 6480000) {
      regimeScore = 5;
      regimeRec = 'Faturamento próximo do limite MEI (80%). Planeje migração.';
    } else if (taxRegime === 'simples_nacional' && revenueCents > 480000000) {
      regimeScore = 0;
      regimeRec = 'Faturamento ultrapassa limite do Simples Nacional.';
    }
    items.push({ label: 'Adequação do Regime', score: regimeScore, maxScore: 15, status: regimeScore >= 12 ? 'good' : regimeScore >= 5 ? 'warning' : 'critical', recommendation: regimeRec, icon: Target });

    // 2. Completude cadastral
    const cadastroScore = hasOnboardingCompleted ? 15 : 5;
    items.push({ label: 'Cadastro Completo', score: cadastroScore, maxScore: 15, status: cadastroScore >= 12 ? 'good' : 'warning', recommendation: hasOnboardingCompleted ? 'Dados cadastrais completos' : 'Complete seu cadastro para análises mais precisas', icon: CheckCircle2 });

    // 3. Uso de simulações (engajamento com planejamento)
    const simScore = simulationsCount >= 5 ? 15 : simulationsCount >= 2 ? 10 : simulationsCount >= 1 ? 5 : 0;
    items.push({ label: 'Planejamento Tributário', score: simScore, maxScore: 15, status: simScore >= 12 ? 'good' : simScore >= 5 ? 'warning' : 'critical', recommendation: simScore >= 12 ? 'Excelente uso das ferramentas de simulação' : 'Faça mais simulações para otimizar sua carga tributária', icon: TrendingUp });

    // 4. Uso de IA (proatividade)
    const aiScore = aiChatsCount >= 10 ? 10 : aiChatsCount >= 3 ? 7 : aiChatsCount >= 1 ? 3 : 0;
    items.push({ label: 'Consultoria IA', score: aiScore, maxScore: 10, status: aiScore >= 7 ? 'good' : aiScore >= 3 ? 'warning' : 'critical', recommendation: aiScore >= 7 ? 'Uso ativo da IA tributária' : 'Use o Agente IA para tirar dúvidas fiscais', icon: Lightbulb });

    // 5. Diversificação fiscal
    const diversScore = employeeCount > 0 ? 10 : 5;
    items.push({ label: 'Gestão de Obrigações', score: diversScore, maxScore: 10, status: diversScore >= 8 ? 'good' : 'warning', recommendation: diversScore >= 8 ? 'Obrigações trabalhistas sob controle' : 'Atenção às obrigações previdenciárias', icon: ShieldCheck });

    // 6. Exposição a riscos da Reforma Tributária
    const reformaScore = taxRegime === 'simples_nacional' ? 10 : taxRegime === 'lucro_presumido' ? 7 : 5;
    items.push({ label: 'Preparo Reforma Tributária', score: reformaScore, maxScore: 10, status: reformaScore >= 8 ? 'good' : reformaScore >= 5 ? 'warning' : 'critical', recommendation: reformaScore >= 8 ? 'Baixo impacto esperado da Reforma' : 'A Reforma pode impactar significativamente. Use o Radar Reforma.', icon: AlertTriangle });

    // 7. Setor e sazonalidade
    const sectorRisk: Record<string, number> = { tecnologia: 10, servicos: 8, comercio: 7, industria: 6, construcao: 5, alimentacao: 7, saude: 8, educacao: 9, agronegocio: 6, transporte: 5 };
    const sectorScore = sectorRisk[sector] || 7;
    items.push({ label: 'Risco Setorial', score: sectorScore, maxScore: 10, status: sectorScore >= 8 ? 'good' : sectorScore >= 5 ? 'warning' : 'critical', recommendation: sectorScore >= 8 ? 'Setor com baixo risco tributário' : 'Seu setor requer atenção especial com obrigações acessórias', icon: Target });

    // 8. Margem de segurança
    const marginScore = revenueCents > 0 ? 8 : 3;
    items.push({ label: 'Saúde Financeira', score: marginScore, maxScore: 15, status: marginScore >= 10 ? 'good' : marginScore >= 5 ? 'warning' : 'critical', recommendation: marginScore >= 10 ? 'Margem saudável para obrigações fiscais' : 'Cadastre seu faturamento para análise precisa', icon: TrendingUp });

    return items;
  }, [companyType, taxRegime, annualRevenue, monthlyRevenue, sector, employeeCount, hasOnboardingCompleted, simulationsCount, aiChatsCount]);

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  const maxScore = factors.reduce((sum, f) => sum + f.maxScore, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return { ring: 'text-emerald-500', bg: 'from-emerald-500 to-green-600', label: 'Excelente', emoji: '🛡️' };
    if (pct >= 60) return { ring: 'text-blue-500', bg: 'from-blue-500 to-cyan-600', label: 'Bom', emoji: '✅' };
    if (pct >= 40) return { ring: 'text-amber-500', bg: 'from-amber-500 to-orange-600', label: 'Atenção', emoji: '⚠️' };
    return { ring: 'text-red-500', bg: 'from-red-500 to-rose-600', label: 'Crítico', emoji: '🚨' };
  };

  const scoreConfig = getScoreColor(percentage);
  const criticalFactors = factors.filter(f => f.status === 'critical');
  const warningFactors = factors.filter(f => f.status === 'warning');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          Score Fiscal & Health Check
        </h2>
        <p className="text-muted-foreground mt-1">
          Diagnóstico completo da saúde tributária da sua empresa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score principal */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-card border-border h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className={scoreConfig.ring} strokeWidth="8" strokeDasharray={`${percentage * 2.64} 264`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{percentage}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              <Badge className={`bg-gradient-to-r ${scoreConfig.bg} text-white border-0 text-sm px-4 py-1`}>
                {scoreConfig.emoji} {scoreConfig.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {percentage >= 80
                  ? 'Sua empresa está com a saúde fiscal em dia!'
                  : percentage >= 60
                  ? 'Alguns pontos de atenção identificados.'
                  : 'Ações urgentes recomendadas para evitar riscos.'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fatores detalhados */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Fatores de Avaliação
              <Badge variant="outline" className="text-[10px]">
                {criticalFactors.length} críticos · {warningFactors.length} alertas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
            {factors.map((factor, i) => {
              const Icon = factor.icon;
              const pct = Math.round((factor.score / factor.maxScore) * 100);
              return (
                <motion.div
                  key={factor.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${
                        factor.status === 'good' ? 'text-emerald-500' :
                        factor.status === 'warning' ? 'text-amber-500' : 'text-red-500'
                      }`} />
                      <span className="text-sm font-medium text-foreground">{factor.label}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{factor.score}/{factor.maxScore}</span>
                  </div>
                  <Progress value={pct} className="h-1.5 mb-1.5" />
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {factor.status === 'critical' && <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />}
                    {factor.status === 'warning' && <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                    {factor.status === 'good' && <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />}
                    {factor.recommendation}
                  </p>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recomendações prioritárias */}
      {criticalFactors.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Ações Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {criticalFactors.map(f => (
              <div key={f.label} className="flex items-center gap-2 text-sm">
                <ArrowRight className="h-3 w-3 text-red-500 flex-shrink-0" />
                <span className="text-foreground">{f.recommendation}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
