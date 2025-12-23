import type { TourStep } from '@/hooks/useGuidedTour';

export const dashboardTourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="welcome"]',
    title: '🎉 Bem-vindo ao AtentAI!',
    content: 'Este é o seu painel de controle para a Reforma Tributária. Vamos te guiar pelas principais funcionalidades para você aproveitar ao máximo a plataforma.',
    position: 'bottom',
  },
  {
    id: 'company-card',
    target: '[data-tour="company-card"]',
    title: '🏢 Dados da sua Empresa',
    content: 'Aqui você visualiza e edita os dados da sua empresa. Manter essas informações atualizadas garante simulações mais precisas sobre o impacto da Reforma Tributária.',
    position: 'bottom',
  },
  {
    id: 'stats',
    target: '[data-tour="stats"]',
    title: '📊 Suas Estatísticas',
    content: 'Acompanhe quantas simulações você fez, conversas com a IA e consultorias com contadores. Esses números mostram o quanto você está aproveitando a plataforma.',
    position: 'bottom',
  },
  {
    id: 'economy-calculator',
    target: '[data-tour="economy-calculator"]',
    title: '💰 Calcule sua Economia',
    content: 'Esta é a ferramenta mais poderosa! Com um clique, descubra quanto você pode economizar com a Reforma Tributária baseado nos dados da sua empresa.',
    position: 'right',
  },
  {
    id: 'quick-actions',
    target: '[data-tour="quick-actions"]',
    title: '⚡ Ações Rápidas',
    content: 'Acesse rapidamente as principais funcionalidades: Chat IA, Calculadora de Economia, Simulador de Locação e Decisão PF/PJ.',
    position: 'top',
  },
  {
    id: 'sidebar-autopilot',
    target: '[data-tour="sidebar-autopilot"]',
    title: '🚀 Piloto Automático',
    content: 'O Piloto Automático monitora continuamente sua situação tributária e te alerta sobre oportunidades de economia e mudanças importantes na legislação.',
    position: 'right',
  },
  {
    id: 'sidebar-ai',
    target: '[data-tour="sidebar-ai"]',
    title: '🤖 Agente IA Tributário',
    content: 'Tire dúvidas sobre impostos, IBS, CBS, Reforma Tributária e muito mais. A IA é treinada com a Lei Complementar 214/2025 e legislação atualizada.',
    position: 'right',
  },
  {
    id: 'sidebar-contador',
    target: '[data-tour="sidebar-contador"]',
    title: '👨‍💼 Fale com um Contador',
    content: 'Precisa de ajuda especializada? Conecte-se com contadores certificados para consultorias personalizadas sobre sua situação tributária.',
    position: 'right',
  },
  {
    id: 'sidebar-glossary',
    target: '[data-tour="sidebar-glossary"]',
    title: '📚 Glossário Tributário',
    content: 'Não conhece algum termo? O Glossário explica todos os impostos e conceitos da Reforma Tributária de forma simples e didática.',
    position: 'right',
  },
  {
    id: 'plan-upgrade',
    target: '[data-tour="plan-upgrade"]',
    title: '👑 Upgrade de Plano',
    content: 'Desbloqueie recursos premium como consultas ilimitadas com IA, Piloto Automático e acesso a contadores especializados.',
    position: 'left',
  },
  {
    id: 'notifications',
    target: '[data-tour="notifications"]',
    title: '🔔 Notificações',
    content: 'Receba alertas sobre consultas agendadas, novas mensagens de contadores e atualizações importantes sobre a Reforma Tributária.',
    position: 'bottom',
  },
];

export const taxGlossaryHelp = {
  ibs: {
    title: 'IBS - Imposto sobre Bens e Serviços',
    content: 'Novo imposto estadual/municipal que substitui ICMS e ISS. Alíquota de referência: 17,7%. Incide sobre consumo de bens e serviços.',
  },
  cbs: {
    title: 'CBS - Contribuição sobre Bens e Serviços',
    content: 'Novo tributo federal que substitui PIS e COFINS. Alíquota de referência: 8,8%. Base ampla com poucas exceções.',
  },
  iva: {
    title: 'IVA Dual - Imposto sobre Valor Agregado',
    content: 'Modelo brasileiro com IBS (estados/municípios) + CBS (federal). Alíquota combinada estimada: 26,5%. Sistema não cumulativo.',
  },
  is: {
    title: 'IS - Imposto Seletivo',
    content: 'Incide sobre produtos prejudiciais à saúde e meio ambiente: cigarros, bebidas alcoólicas, açucaradas e veículos poluentes.',
  },
  simplesNacional: {
    title: 'Simples Nacional',
    content: 'Regime especial para micro e pequenas empresas. Pode optar por permanecer ou migrar para IVA Dual conforme vantagem tributária.',
  },
  lucroPresumido: {
    title: 'Lucro Presumido',
    content: 'Regime com presunção de lucro sobre faturamento. Base de cálculo simplificada. Indicado para empresas com margens acima da presunção.',
  },
  lucroReal: {
    title: 'Lucro Real',
    content: 'Regime com tributação sobre lucro efetivo. Obrigatório para algumas empresas. Permite aproveitamento de créditos tributários.',
  },
  transicao: {
    title: 'Período de Transição',
    content: 'De 2026 a 2032, os sistemas antigo e novo coexistirão. Empresas devem se preparar para operar em ambos simultaneamente.',
  },
};

export const featureHelp = {
  economyCalculator: {
    title: 'Calculadora de Economia',
    content: 'Calcula automaticamente quanto sua empresa pode economizar com a Reforma Tributária, comparando regime atual vs IVA Dual.',
  },
  pfPjDecision: {
    title: 'Decisão PF ou PJ',
    content: 'Simula se é mais vantajoso receber como Pessoa Física ou Jurídica considerando a nova legislação tributária.',
  },
  locacaoSimulator: {
    title: 'Simulador de Locação',
    content: 'Compare a tributação de aluguéis como PF vs PJ. Inclui análise de IRPF, IBS, CBS e contribuições.',
  },
  autopilot: {
    title: 'Piloto Automático Tributário',
    content: 'Sistema inteligente que monitora sua situação fiscal e sugere otimizações automaticamente com base nas mudanças da legislação.',
  },
  aiChat: {
    title: 'Agente IA Tributário',
    content: 'Inteligência artificial treinada com a LC 214/2025 e legislação tributária. Responde dúvidas sobre impostos, obrigações e planejamento.',
  },
  chatContador: {
    title: 'Chat com Contador',
    content: 'Comunicação direta com contadores especializados. Envie mensagens, áudios e documentos para obter orientação profissional.',
  },
  glossary: {
    title: 'Glossário Tributário',
    content: 'Dicionário completo dos termos da Reforma Tributária. Explica cada imposto, alíquota e conceito de forma simples.',
  },
  history: {
    title: 'Histórico de Simulações',
    content: 'Registro de todas as simulações realizadas. Acompanhe a evolução das suas análises tributárias ao longo do tempo.',
  },
  metrics: {
    title: 'Métricas de Economia',
    content: 'Dashboard com gráficos mostrando sua economia tributária acumulada, tendências e projeções futuras.',
  },
};
