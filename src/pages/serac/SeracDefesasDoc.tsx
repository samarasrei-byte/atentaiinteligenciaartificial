import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Shield, Users, TrendingUp, Lock, DollarSign, Building2,
  Rocket, Scale, Target, ArrowRight, CheckCircle2, AlertTriangle,
  Zap, Globe, Brain, Briefcase, FileText, BarChart3, Award,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DefenseItem {
  id: number;
  question: string;
  answer: string;
  details?: string[];
  table?: { headers: string[]; rows: string[][] };
  icon: React.ElementType;
  category: 'serac' | 'socios';
}

const seracDefenses: DefenseItem[] = [
  {
    id: 1,
    question: 'Como funciona a qualificação do lead antes de chegar no nosso time?',
    answer: 'O lead entra por 3 portas: marketplace AtentAI, campanhas G8 ou tráfego orgânico. Imediatamente, o DIEC (Departamento de Inteligência Fiscal e Crescimento) assume com 5 agentes de IA especializados.',
    details: [
      'SDR Tributário — aborda, conversa e filtra curiosos',
      'Diagnóstico Tributário — analisa regime, faturamento, oportunidades',
      'Especialista em Cartórios — qualificação exclusiva para esse segmento',
      'Customer Success — nutrição e follow-up automatizado',
      'Diretor de Inteligência — supervisão e otimização contínua do funil',
      'O vendedor SERAC recebe: nome, CNPJ, regime tributário, faturamento estimado, dor principal e score de qualificação. Não perde 1 minuto com lead frio.',
    ],
    icon: Target,
    category: 'serac',
  },
  {
    id: 2,
    question: 'Vocês podem adicionar mais agentes ou departamentos?',
    answer: 'O ecossistema é 100% modular. A Clauthor (nossa startup de agentes IA) é especializada nisso. Cada agente é treinado com o conhecimento e tom de voz da SERAC.',
    details: [
      'SERAC tem departamento de RH? → Criamos agente de recrutamento contábil',
      'Quer call center? → Agente de voz com IA para triagem',
      'Precisa de follow-up pós-venda? → Agente de retenção e NPS',
      'Quer nutrição por WhatsApp? → Agente de nurturing com conteúdo automatizado',
      'É como clonar seus melhores funcionários — plug-and-play.',
    ],
    icon: Zap,
    category: 'serac',
  },
  {
    id: 3,
    question: 'E o tráfego? De onde vêm os leads?',
    answer: '3 motores simultâneos — nenhum concorrente tem isso. Não dependemos de um canal só. Se um desacelera, os outros compensam. É anti-frágil.',
    table: {
      headers: ['Motor', 'Capacidade', 'Diferencial'],
      rows: [
        ['AtentAI', 'Tráfego orgânico + SEO + marketplace', 'Aporte de investimento em andamento'],
        ['G8 Prospect', '5 campanhas/mês, prospecção ativa B2B', '7 anos, R$ 360M+ gerados'],
        ['Marketplace SERAC', 'Vitrine exclusiva de 22 serviços', 'Único player contábil'],
      ],
    },
    icon: TrendingUp,
    category: 'serac',
  },
  {
    id: 4,
    question: 'Como separar os clientes que vieram pela AtentAI dos que a SERAC já tem?',
    answer: 'Arquitetura de rastreamento de nível enterprise. Regra de ouro: Se o lead já existia na base SERAC antes da ativação da plataforma → não cobra. É auditável, transparente e à prova de contestação.',
    details: [
      'ID único por lead (UUID)',
      'UTM completo: source, campaign, medium, content',
      'Tag "atentai_origin" automática para todos que entram pela nossa infra',
      'Dashboard de auditoria com filtros por data, canal e status',
      'API de reconciliação para cruzar com o CRM da SERAC',
    ],
    icon: Shield,
    category: 'serac',
  },
  {
    id: 5,
    question: 'Qual modelo de cobrança: por cliente ou valor fechado?',
    answer: 'Modelo híbrido recomendado — previsibilidade para os dois lados. Cada startup cuida do seu P&L. A AtentAI lucra com a plataforma + coordenação + maior fatia da performance.',
    table: {
      headers: ['Componente', 'Valor', 'O que inclui'],
      rows: [
        ['Setup', 'R$ 50.000 (único)', 'Implantação completa: White Label + DIEC + integrações'],
        ['AtentAI White Label', 'R$ 30.000/mês', 'Plataforma, marketplace, simuladores, dashboard'],
        ['G8 Prospect', 'R$ 20.000/mês', '5 campanhas/mês, prospecção ativa, relatórios'],
        ['Clauthor Agentes', 'R$ 6.000/mês', '5 agentes IA operando 24/7'],
        ['Performance', '10% sobre contratos', 'Alinhamento total de interesses'],
      ],
    },
    icon: DollarSign,
    category: 'serac',
  },
  {
    id: 6,
    question: 'Os clientes da SERAC também podem usar a plataforma?',
    answer: 'Sim! Clientes ativos acessam marketplace, simuladores e IA. Isso agrega valor ao serviço contábil que a SERAC já vende — reduz churn. Zero cobrança adicional para clientes existentes.',
    details: [
      'Clientes ativos acessam marketplace, simuladores e IA',
      'Agrega valor ao serviço contábil que a SERAC já vende',
      'Reduz churn → cliente que usa a plataforma sai menos',
      'Zero cobrança adicional para clientes que a SERAC já tem',
      'É benefício incluído no White Label',
      'Visão futura (Em Breve): plataforma SaaS completa onde cada cliente SERAC terá seus próprios agentes IA, prospecção automatizada e mentorias',
    ],
    icon: Users,
    category: 'serac',
  },
  {
    id: 7,
    question: 'E se a AtentAI acabar? Ficamos sem plataforma?',
    answer: 'Atrás da AtentAI existem 3 startups consolidadas. Contrato de 12 meses com renovação automática. É ecossistema, não freelancer.',
    table: {
      headers: ['Startup', 'Especialidade', 'Track Record'],
      rows: [
        ['AtentAI', 'Tecnologia fiscal e IA preditiva', 'Plataforma operacional com tráfego crescente'],
        ['G8 Prospect', 'Prospecção B2B', '7 anos, R$ 360M+ gerados'],
        ['Clauthor', 'Agentes IA (americana)', 'Compliance e operações comerciais'],
      ],
    },
    details: [
      'Infraestrutura dedicada — roda com a marca SERAC independentemente',
      'Código-fonte e dados ficam disponíveis em caso de rescisão',
      'São empresas com CNPJ, equipe e histórico',
    ],
    icon: Lock,
    category: 'serac',
  },
  {
    id: 8,
    question: 'Por que não fazemos isso internamente?',
    answer: 'Podem. Mas o custo real seria de aproximadamente R$ 190.000/mês, sem contar 12-18 meses para ficar pronto. Conosco: R$ 56.000/mês, pronto em 30 dias, já validado.',
    table: {
      headers: ['Recurso', 'Custo mensal estimado'],
      rows: [
        ['3 devs full-stack sênior', 'R$ 75.000'],
        ['1 especialista em IA/ML', 'R$ 25.000'],
        ['1 time de prospecção B2B (5 pessoas)', 'R$ 40.000'],
        ['Infraestrutura cloud (AWS/GCP)', 'R$ 15.000'],
        ['Product Manager', 'R$ 20.000'],
        ['Design/UX', 'R$ 15.000'],
        ['TOTAL', 'R$ 190.000/mês'],
      ],
    },
    icon: Building2,
    category: 'serac',
  },
  {
    id: 9,
    question: 'Vocês oferecem isso para concorrentes nossos?',
    answer: 'Não. Exclusividade total. Está no contrato. Nenhum outro escritório contábil terá acesso ao marketplace AtentAI. A SERAC é o único player. Vantagem competitiva irreversível.',
    details: [
      'Nenhum outro escritório contábil terá acesso ao marketplace AtentAI',
      'A SERAC é o único player no vertical de contabilidade',
      'Se outro escritório quiser, terá que esperar o contrato vencer — e a SERAC tem direito de renovação prioritária',
      'Enquanto concorrentes buscam soluções genéricas, vocês têm infraestrutura exclusiva',
    ],
    icon: Award,
    category: 'serac',
  },
  {
    id: 10,
    question: 'Como funciona o funil completo?',
    answer: 'Do clique ao contrato — tudo automatizado, rastreável e otimizado por IA.',
    details: [
      '1. ENTRADA → Lead entra por G8 Prospect, AtentAI ou Marketplace',
      '2. SDR TRIBUTÁRIO → Agente conversa, filtra curiosos, coleta dados',
      '3. DIAGNÓSTICO → Análise tributária, score, ficha técnica completa',
      '4. LEAD QUENTE → Time Comercial SERAC recebe: nome, CNPJ, regime, faturamento, dor principal, score',
      '5. CONTRATO FECHADO → 10% performance para AtentAI + registro no dashboard de auditoria',
    ],
    icon: BarChart3,
    category: 'serac',
  },
  {
    id: 11,
    question: 'E a Reforma Tributária 2026?',
    answer: 'A SERAC será a única empresa do Brasil com simulador White Label da Reforma Tributária integrado à plataforma. Não é marketing — é posicionamento estratégico irreversível.',
    details: [
      'Simulador White Label da Reforma Tributária integrado à plataforma',
      'Agentes IA treinados nas novas regras (IBS, CBS, IS)',
      'Diagnóstico automático de impacto para cada cliente',
      'Conteúdo educativo gerado por IA para nutrição de leads',
      'Enquanto concorrentes estão estudando, a SERAC já terá a ferramenta pronta',
    ],
    icon: Scale,
    category: 'serac',
  },
  {
    id: 12,
    question: 'Qual a garantia de resultado?',
    answer: 'Não prometemos X leads por mês — prometemos infraestrutura de excelência. Nosso interesse é fechar contratos — ganhamos quando vocês ganham.',
    details: [
      'G8 tem 7 anos e R$ 360M+ em negócios gerados',
      'Modelo de 10% de performance alinha nossos interesses',
      'Dashboard em tempo real para acompanhar tudo',
      'Relatórios mensais de performance por canal',
      'Se em 90 dias os KPIs não atingirem o baseline acordado, renegociamos termos',
    ],
    icon: CheckCircle2,
    category: 'serac',
  },
];

const sociosDefenses: DefenseItem[] = [
  {
    id: 13,
    question: 'Por que trazer mais startups? Não diluímos valor?',
    answer: 'Ao contrário — multiplicamos. A AtentAI é o hub central — o ecossistema. Quanto mais startups orbitam, mais valor a plataforma tem. Modelo AWS: integram serviços, não fazem tudo sozinhos.',
    table: {
      headers: ['Startup', 'O que traz', 'Sem ela, teríamos que...'],
      rows: [
        ['G8', 'Prospecção B2B validada (7 anos)', 'Montar time de SDRs do zero'],
        ['Clauthor', 'Agentes IA especializados', 'Desenvolver IA internamente (12+ meses)'],
        ['Novas startups', 'Verticals específicos', 'Recusar clientes ou entregar mal'],
      ],
    },
    icon: Rocket,
    category: 'socios',
  },
  {
    id: 14,
    question: 'Mas eu já tinha falado que teria startups, por que a surpresa?',
    answer: 'Não é surpresa — é execução do plano original. O modelo sempre foi ecossistema.',
    details: [
      'Cliente âncora conquistado (SERAC — 2º maior do Brasil)',
      'Receita previsível (R$ 56k/mês + performance)',
      'Case para atrair as próximas startups',
      'Cada startup que entra fortalece o ecossistema e aumenta o valuation da AtentAI',
    ],
    icon: Brain,
    category: 'socios',
  },
  {
    id: 15,
    question: 'Como dividimos receita com tantas startups?',
    answer: 'Divisão clara e justa. Cada startup cuida do seu P&L. A AtentAI lucra com a plataforma + coordenação + maior fatia da performance.',
    table: {
      headers: ['Componente', 'Quem recebe', '%'],
      rows: [
        ['Setup R$ 50k', 'AtentAI (coordenação)', '100%'],
        ['AtentAI White Label R$ 30k', 'AtentAI', '100%'],
        ['G8 Prospect R$ 20k', 'G8', '100% (serviço deles)'],
        ['Clauthor Agentes R$ 6k', 'Clauthor', '100% (serviço deles)'],
        ['Performance 10%', 'Split proporcional', 'AtentAI 60% / G8 25% / Clauthor 15%'],
      ],
    },
    icon: DollarSign,
    category: 'socios',
  },
  {
    id: 16,
    question: 'E se uma startup parceira falhar?',
    answer: 'O ecossistema é modular. A infraestrutura AtentAI nunca depende de uma única startup. É como um marketplace: se um vendedor sai, o shopping continua funcionando.',
    details: [
      'G8 sai? → Substituímos por outro player de prospecção ou internalizamos',
      'Clauthor sai? → Os agentes já estão treinados na plataforma, contratamos outro provider',
      'A infraestrutura AtentAI nunca depende de uma única startup',
    ],
    icon: AlertTriangle,
    category: 'socios',
  },
  {
    id: 17,
    question: 'Qual o valuation impact de trazer startups?',
    answer: 'Positivo em todas as métricas. Para um investidor, uma plataforma com 3 startups integradas e cliente âncora vale 3-5x mais que uma plataforma solo.',
    details: [
      'ARR aumenta: R$ 56k/mês = R$ 672k/ano só com SERAC',
      'Replicabilidade: modelo funciona para qualquer vertical (saúde, advocacia, etc.)',
      'Moat competitivo: ecossistema é mais difícil de copiar que produto',
      'Atratividade para investidores: ecossistema > produto isolado',
    ],
    icon: Globe,
    category: 'socios',
  },
  {
    id: 18,
    question: 'Quem manda? Quem decide?',
    answer: 'A AtentAI é o hub central — decisão final é nossa. Modelo de governança: AtentAI como holding operacional, startups como braços especializados com SLAs definidos.',
    details: [
      'Produto e roadmap → AtentAI decide',
      'Relacionamento com cliente → AtentAI lidera',
      'Execução de prospecção → G8 executa com autonomia operacional',
      'Agentes IA → Clauthor executa com autonomia técnica',
    ],
    icon: Briefcase,
    category: 'socios',
  },
  {
    id: 19,
    question: 'O White Label funciona como? A SERAC paga e tem direito a quê?',
    answer: 'O White Label dá à SERAC uma plataforma completa com a marca deles. Eles pagam a mensalidade (R$ 56k/mês) e têm direito a TUDO — marketplace, simuladores, agentes IA, dashboard. Porém, os leads que entram pela infraestrutura AtentAI (tráfego, G8, marketplace) têm ID rastreável. Só cobramos performance (10%) sobre esses. Os clientes que a SERAC já tem? Usam a plataforma de graça — é benefício do White Label.',
    details: [
      'SERAC paga mensalidade fixa → tem a plataforma inteira com marca deles',
      'Clientes existentes da SERAC → usam de graça, sem cobrança extra',
      'Leads novos via AtentAI → têm ID único, UTM, tag "atentai_origin"',
      'Performance 10% → só sobre contratos de leads que vieram pela nossa infra',
      'É justo: a SERAC paga pela ferramenta, nós ganhamos pelo que geramos',
      'Modelo win-win: quanto mais a plataforma converte, mais os dois ganham',
    ],
    icon: Shield,
    category: 'socios',
  },
  {
    id: 20,
    question: 'Por que você quer ganhar na G8, na Clauthor E ainda na AtentAI? Não é demais?',
    answer: 'Não é "ganhar 3 vezes" — são 3 funções diferentes com custos diferentes. Eu coordeno o ecossistema inteiro. A AtentAI é a plataforma (R$ 30k), a G8 é prospecção (R$ 20k custo operacional real), a Clauthor é IA (R$ 6k). Eu ganho como integrador e gestor do ecossistema, não como intermediário.',
    table: {
      headers: ['Papel', 'O que faço', 'Justificativa'],
      rows: [
        ['AtentAI (hub)', 'Plataforma, marketplace, produto, relacionamento', 'É o core — sem isso não existe ecossistema'],
        ['G8 (prospecção)', 'Campanhas ativas B2B, SDR, qualificação', 'Custo operacional real: equipe, ferramentas, ads'],
        ['Clauthor (IA)', 'Agentes treinados, manutenção, evolução', 'Tecnologia americana com custo de desenvolvimento'],
        ['Performance 10%', 'Split entre as 3 startups', 'AtentAI fica com 60% = 6% do contrato'],
      ],
    },
    details: [
      'Cada startup tem seu próprio custo operacional — não é lucro puro',
      'Se eu montasse tudo sozinho, custaria R$ 190k+/mês em equipe',
      'O cliente (SERAC) paga R$ 56k por algo que valeria R$ 190k — é barato pra eles',
      'A margem real da AtentAI é sobre a plataforma (R$ 30k) + 6% de performance',
      'Sem as outras startups, não temos capacidade de entrega — elas são essenciais',
    ],
    icon: DollarSign,
    category: 'socios',
  },
  {
    id: 21,
    question: 'A porcentagem da AtentAI não é muito pequena?',
    answer: 'A AtentAI fica com a maior fatia do ecossistema: R$ 30k fixo/mês + 60% da performance + 100% do setup. Com a SERAC só, o ARR é R$ 360k+/ano líquido para a AtentAI. E o modelo é replicável — próximo cliente (saúde, advocacia, etc.) entra com a mesma estrutura.',
    table: {
      headers: ['Receita AtentAI', 'Valor/mês', 'Valor/ano'],
      rows: [
        ['Mensalidade White Label', 'R$ 30.000', 'R$ 360.000'],
        ['Performance (60% de 10%)', 'Variável (~R$ 6k-15k)', 'R$ 72k-180k'],
        ['Setup (único)', '-', 'R$ 50.000'],
        ['TOTAL AtentAI', 'R$ 36k-45k', 'R$ 482k-590k'],
      ],
    },
    details: [
      'R$ 482k-590k/ano só com a SERAC — primeiro cliente',
      'Segundo cliente replica o modelo com margem ainda maior (infra já existe)',
      'Terceiro cliente em diante é quase 100% margem sobre a mensalidade',
      'Em 3 clientes: ARR de R$ 1.5M+ — valuation de R$ 7-15M com múltiplo de ecossistema',
      'A porcentagem é "pequena" por contrato, mas o VOLUME é o que importa',
    ],
    icon: TrendingUp,
    category: 'socios',
  },
  {
    id: 22,
    question: 'Por que não cobramos mais da SERAC?',
    answer: 'Porque R$ 56k/mês já é o limite justo para uma primeira parceria. Se cobrarmos mais, eles fazem internamente ou buscam alternativa. O jogo é: entrar com preço competitivo, provar valor, depois escalar — seja com mais serviços, seja replicando pra outros clientes.',
    details: [
      'R$ 56k/mês < R$ 190k/mês (custo de fazer interno) — argumento forte',
      'Preço competitivo na entrada → cria dependência tecnológica → retenção de longo prazo',
      'Contrato de 12 meses = receita garantida de R$ 672k no mínimo',
      'Performance (10%) é o upside — quanto mais a SERAC cresce, mais ganhamos',
      'Depois de provar valor, renegociamos para cima no segundo ano',
      'É melhor R$ 56k/mês certo do que R$ 100k/mês que não fecha',
    ],
    icon: Scale,
    category: 'socios',
  },
  {
    id: 23,
    question: 'E se os sócios quiserem participação na G8 ou Clauthor?',
    answer: 'A G8 e a Clauthor são empresas independentes com seus próprios sócios. Não faz sentido misturar cap tables. O que faz sentido é: a AtentAI lucra como hub, e os sócios da AtentAI participam desse lucro. É mais limpo, mais escalável e evita conflitos societários.',
    details: [
      'Cada startup tem seu cap table independente — misturar gera conflito',
      'A AtentAI é a holding operacional — sócios ganham via AtentAI',
      'Se quiserem investir na G8 ou Clauthor diretamente, é negociação separada',
      'Modelo limpo: cada empresa cuida do seu, AtentAI coordena e lucra como hub',
      'Analogia: o shopping (AtentAI) lucra com aluguel, não precisa ser sócio de cada loja',
    ],
    icon: Briefcase,
    category: 'socios',
  },
  {
    id: 24,
    question: 'E se a SERAC quiser sair do contrato?',
    answer: 'Contrato de 12 meses com multa proporcional. Mas o ponto real é: depois de 3-6 meses usando a plataforma, o custo de migração é alto demais. Os clientes estão no CRM, os agentes estão treinados, o funil está rodando. Sair significaria reconstruir tudo do zero.',
    details: [
      'Contrato de 12 meses com cláusula de rescisão proporcional',
      'Lock-in tecnológico natural: dados, agentes treinados, integrações',
      'Custo de migração estimado: R$ 200k+ e 6 meses de retrabalho',
      'Performance alinhada garante que a SERAC quer ficar — estamos gerando resultado',
      'Renovação automática com reajuste anual baseado em performance',
    ],
    icon: Lock,
    category: 'socios',
  },
];

function DefenseCard({ item }: { item: DefenseItem }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left p-5 flex items-start gap-4 cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <item.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary mb-1">PERGUNTA #{item.id}</p>
            <h3 className="text-base font-bold text-foreground leading-snug pr-6">
              "{item.question}"
            </h3>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 text-muted-foreground flex-shrink-0 mt-1 transition-transform duration-200",
            open && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4">
                <Separator />
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                  <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Resposta</p>
                  <p className="text-sm text-foreground leading-relaxed">{item.answer}</p>
                </div>

                {item.table && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-muted">
                          {item.table.headers.map((h, i) => (
                            <th key={i} className="text-left p-3 font-semibold text-foreground text-xs uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item.table.rows.map((row, i) => (
                          <tr key={i} className={cn("border-t border-border", i === item.table!.rows.length - 1 && row[0] === 'TOTAL' && 'bg-primary/5 font-bold')}>
                            {row.map((cell, j) => (
                              <td key={j} className="p-3 text-foreground/80">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {item.details && (
                  <div className="space-y-2">
                    {item.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/80">{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default function SeracDefesasDoc() {
  const [filter, setFilter] = useState<'all' | 'serac' | 'socios'>('all');

  const allDefenses = [...seracDefenses, ...sociosDefenses];
  const filtered = filter === 'all' ? allDefenses : allDefenses.filter(d => d.category === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(210 50% 12%) 0%, hsl(215 60% 20%) 50%, hsl(200 50% 16%) 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <Badge className="bg-accent/20 text-accent border-accent/30 mb-4">DOCUMENTO CONFIDENCIAL</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
            Guia de Defesas Estratégicas
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto mb-6">
            24 perguntas que a SERAC e seus sócios da AtentAI podem fazer — com respostas completas, tabelas e argumentos validados.
          </p>
          <div className="flex items-center justify-center gap-6 text-white/50 text-xs">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> Uso interno</span>
            <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-accent" /> 24 defesas</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-accent" /> Confidencial</span>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="sticky top-0 z-20 bg-card/98 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          {[
            { id: 'all' as const, label: 'Todas (24)', icon: FileText },
            { id: 'serac' as const, label: 'SERAC (12)', icon: Building2 },
            { id: 'socios' as const, label: 'Sócios AtentAI (12)', icon: Users },
          ].map(f => (
            <Button
              key={f.id}
              variant={filter === f.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.id)}
              className={cn(filter === f.id && 'serac-gradient text-white')}
            >
              <f.icon className="h-3.5 w-3.5 mr-1.5" />
              {f.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          {filter !== 'socios' && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Perguntas da SERAC</h2>
                <Badge variant="outline" className="text-xs">12 defesas</Badge>
              </div>
              {seracDefenses.map(item => (
                <DefenseCard key={item.id} item={item} />
              ))}
            </>
          )}

          {filter !== 'serac' && (
            <>
              {filter === 'all' && <Separator className="my-8" />}
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Defesas para Sócios AtentAI</h2>
                <Badge variant="outline" className="text-xs">12 defesas</Badge>
              </div>
              {sociosDefenses.map(item => (
                <DefenseCard key={item.id} item={item} />
              ))}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <section className="py-6 bg-card border-t border-border">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <p className="text-[10px] text-muted-foreground">Powered by AtentAI — Documento Confidencial</p>
          </div>
        </div>
      </section>
    </div>
  );
}
