import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CalendarDays, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Building2,
  FileText,
  Scale,
  Calculator,
  Info,
  ArrowRight
} from 'lucide-react';

/**
 * Cronograma de transição tributária conforme LC 214/2025
 */
const TRANSITION_SCHEDULE = [
  {
    year: 2026,
    phase: "Fase de Teste",
    ibs: 0.1,
    cbs: 0.9,
    total: 1.0,
    percentImplemented: 0,
    description: "Início da fase de teste. Os tributos atuais (ICMS, ISS, PIS, COFINS) permanecem com alíquotas integrais. O IBS e CBS são cobrados em paralelo apenas para calibragem do novo sistema.",
    details: [
      "PIS/COFINS: mantidos com alíquotas atuais",
      "ICMS/ISS: mantidos com alíquotas atuais", 
      "IBS + CBS: 1% cobrado para teste de sistemas",
      "Créditos: não há aproveitamento de créditos IBS/CBS nesta fase"
    ],
    highlight: "Empresas devem preparar sistemas para a nova escrituração"
  },
  {
    year: 2027,
    phase: "Fase de Teste",
    ibs: 0.1,
    cbs: 0.9,
    total: 1.0,
    percentImplemented: 0,
    description: "Continuação da fase de teste com ajustes nos sistemas de arrecadação e fiscalização.",
    details: [
      "Ajustes nos sistemas de emissão de documentos fiscais",
      "Aprimoramento da plataforma de créditos tributários",
      "Início da padronização de obrigações acessórias",
      "Teste de integração entre fiscos federal, estaduais e municipais"
    ],
    highlight: "Últimos ajustes antes da transição efetiva"
  },
  {
    year: 2028,
    phase: "Preparação Final",
    ibs: 0.1,
    cbs: 0.9,
    total: 1.0,
    percentImplemented: 0,
    description: "Último ano de teste. Encerramento da fase preparatória e ajustes finais.",
    details: [
      "Consolidação das regras de creditamento",
      "Definição final das alíquotas por setor",
      "Preparação para extinção gradual do PIS/COFINS",
      "Treinamento de contribuintes e contadores"
    ],
    highlight: "Ano de preparação para a transição efetiva em 2029"
  },
  {
    year: 2029,
    phase: "Transição 10%",
    ibs: 1.77,
    cbs: 0.88,
    total: 2.65,
    percentImplemented: 10,
    description: "Início da transição efetiva. O novo sistema passa a substituir 10% dos tributos atuais.",
    details: [
      "CBS substitui 10% do PIS/COFINS",
      "IBS começa a substituir ICMS e ISS (10%)",
      "Redução proporcional nas alíquotas dos tributos antigos",
      "Início do sistema de créditos tributários amplos"
    ],
    highlight: "Primeira redução efetiva nos tributos atuais"
  },
  {
    year: 2030,
    phase: "Transição 20%",
    ibs: 3.54,
    cbs: 1.76,
    total: 5.30,
    percentImplemented: 20,
    description: "Avanço para 20% da implementação. ICMS e ISS começam redução mais significativa.",
    details: [
      "CBS substitui 20% do PIS/COFINS",
      "IBS substitui 20% do ICMS/ISS",
      "Ampliação do sistema de cashback para famílias de baixa renda",
      "Consolidação do split payment"
    ],
    highlight: "Dobra o percentual de implementação do novo sistema"
  },
  {
    year: 2031,
    phase: "Transição 40%",
    ibs: 7.08,
    cbs: 3.52,
    total: 10.60,
    percentImplemented: 40,
    description: "Ponto intermediário da transição. Novo sistema já representa quase metade da arrecadação.",
    details: [
      "CBS substitui 40% do PIS/COFINS",
      "IBS substitui 40% do ICMS/ISS",
      "Sistema de créditos plenamente operacional",
      "Redução significativa da cumulatividade"
    ],
    highlight: "Marco de quase metade da transição concluída"
  },
  {
    year: 2032,
    phase: "Transição 70%",
    ibs: 12.39,
    cbs: 6.16,
    total: 18.55,
    percentImplemented: 70,
    description: "Fase avançada da transição. Tributos antigos já representam apenas 30% da carga.",
    details: [
      "CBS substitui 70% do PIS/COFINS",
      "IBS substitui 70% do ICMS/ISS",
      "Preparação para extinção definitiva dos tributos antigos",
      "Ajustes finais nas alíquotas de referência"
    ],
    highlight: "Últimos 30% dos tributos antigos ainda em vigor"
  },
  {
    year: 2033,
    phase: "Regime Definitivo",
    ibs: 17.7,
    cbs: 8.8,
    total: 26.5,
    percentImplemented: 100,
    description: "Implementação completa do novo sistema tributário. Extinção total de PIS, COFINS, ICMS e ISS.",
    details: [
      "CBS (8,8%): substitui totalmente PIS/COFINS",
      "IBS (17,7%): substitui totalmente ICMS e ISS",
      "Sistema de IVA dual plenamente operacional",
      "Crédito amplo, instantâneo e integral"
    ],
    highlight: "Novo sistema tributário em vigor pleno"
  },
];

const TransicaoTributaria = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const getYearStatus = (year: number) => {
    if (year < currentYear) return "completed";
    if (year === currentYear) return "current";
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold text-white">Transição Tributária 2026-2033</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Cronograma da Reforma Tributária
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Entenda como será a transição do sistema tributário brasileiro de 2026 a 2033, 
            conforme estabelecido pela EC 132/2023 e LC 214/2025.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <CalendarDays className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">8 anos</p>
              <p className="text-slate-400 text-sm">de transição</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Building2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">5 tributos</p>
              <p className="text-slate-400 text-sm">serão extintos</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Scale className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">26,5%</p>
              <p className="text-slate-400 text-sm">alíquota final</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">2 novos</p>
              <p className="text-slate-400 text-sm">IBS + CBS</p>
            </CardContent>
          </Card>
        </div>

        {/* Tributos que serão extintos */}
        <Card className="bg-slate-800/50 border-slate-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-red-400" />
              Tributos que serão extintos
            </CardTitle>
            <CardDescription className="text-slate-400">
              Estes tributos serão gradualmente substituídos pelo IBS e CBS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: "PIS", desc: "Federal", color: "red" },
                { name: "COFINS", desc: "Federal", color: "red" },
                { name: "ICMS", desc: "Estadual", color: "orange" },
                { name: "ISS", desc: "Municipal", color: "yellow" },
                { name: "IPI", desc: "Federal (parcial)", color: "amber" },
              ].map((tributo) => (
                <div key={tributo.name} className="text-center p-4 rounded-lg bg-slate-700/50">
                  <p className="text-xl font-bold text-white">{tributo.name}</p>
                  <p className="text-slate-400 text-sm">{tributo.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="relative mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Cronograma Detalhado</h2>
          
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-teal-500 to-green-500" />
          
          <div className="space-y-8">
            {TRANSITION_SCHEDULE.map((item, index) => {
              const status = getYearStatus(item.year);
              const isLeft = index % 2 === 0;
              
              return (
                <div 
                  key={item.year} 
                  className={`relative ${isLeft ? 'md:pr-[50%] md:pl-0' : 'md:pl-[50%] md:pr-0'} pl-12 md:pl-0`}
                >
                  {/* Timeline dot */}
                  <div 
                    className={`absolute left-2.5 md:left-1/2 md:-ml-2 w-4 h-4 rounded-full border-2 ${
                      status === "completed" 
                        ? "bg-green-500 border-green-500" 
                        : status === "current" 
                          ? "bg-cyan-500 border-cyan-500 animate-pulse" 
                          : item.phase === "Regime Definitivo"
                            ? "bg-primary/20 border-primary"
                            : "bg-slate-700 border-slate-500"
                    }`}
                  />
                  
                  <Card className={`${isLeft ? 'md:mr-8' : 'md:ml-8'} ${
                    status === "current" 
                      ? "border-cyan-500 bg-cyan-900/20" 
                      : item.phase === "Regime Definitivo"
                        ? "border-green-500/50 bg-green-900/20"
                        : "border-slate-700 bg-slate-800/50"
                  }`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                          {status === "current" && <TrendingUp className="h-5 w-5 text-cyan-400 animate-pulse" />}
                          {status === "upcoming" && <CalendarDays className="h-5 w-5 text-slate-400" />}
                          <span className="text-2xl font-bold text-white">{item.year}</span>
                        </div>
                        <Badge className={
                          status === "completed" 
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : status === "current"
                              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                              : item.phase === "Regime Definitivo"
                                ? "bg-primary/20 text-primary border-primary/30"
                                : "bg-slate-600/20 text-slate-400 border-slate-500/30"
                        }>
                          {item.phase}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-300 mt-2">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Tax rates */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-3 rounded bg-blue-900/30">
                          <div className="text-xs text-blue-400 mb-1">IBS</div>
                          <div className="font-bold text-blue-300">{item.ibs}%</div>
                        </div>
                        <div className="text-center p-3 rounded bg-green-900/30">
                          <div className="text-xs text-green-400 mb-1">CBS</div>
                          <div className="font-bold text-green-300">{item.cbs}%</div>
                        </div>
                        <div className="text-center p-3 rounded bg-cyan-900/30">
                          <div className="text-xs text-cyan-400 mb-1">Total</div>
                          <div className="font-bold text-cyan-300">{item.total}%</div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {item.percentImplemented > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Implementação</span>
                            <span>{item.percentImplemented}%</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all"
                              style={{ width: `${item.percentImplemented}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="space-y-2">
                        {item.details.map((detail, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-300 text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>

                      {/* Highlight */}
                      <div className="p-3 rounded bg-amber-900/20 border border-amber-700/30">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-200 text-sm">{item.highlight}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-cyan-900/50 to-teal-900/50 border-cyan-500/30">
          <CardContent className="p-8 text-center">
            <Calculator className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Simule o impacto na sua empresa
            </h3>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              Use nosso simulador para calcular como a transição tributária afetará 
              sua carga de impostos em cada ano até 2033.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => navigate('/simulator')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Abrir Simulador
              </Button>
              <Button
                onClick={() => navigate('/regime-comparator')}
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Scale className="h-4 w-4 mr-2" />
                Comparar Regimes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <div className="mt-8 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-400">
              <strong className="text-amber-400">Aviso Legal:</strong> As informações apresentadas 
              baseiam-se na EC 132/2023 e LC 214/2025. As alíquotas definitivas serão estabelecidas 
              por resoluções do Senado Federal e podem sofrer ajustes durante o período de transição. 
              Este conteúdo não substitui consultoria contábil profissional.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransicaoTributaria;
