import { TourStep } from '@/hooks/useGuidedTour';

export const autonomoTourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="autonomo-header"]',
    title: 'Bem-vindo ao Painel Autônomo! 🎉',
    content: 'Este é o seu painel master para gestão tributária. Vamos conhecer as principais funcionalidades disponíveis.',
    position: 'bottom',
  },
  {
    id: 'dashboard-stats',
    target: '[data-tour="stats-cards"]',
    title: 'Seus números em destaque',
    content: 'Aqui você vê suas estatísticas: simulações realizadas, economia potencial identificada e seu regime tributário atual.',
    position: 'bottom',
  },
  {
    id: 'simulator',
    target: '[data-tour="quick-simulator"]',
    title: 'Simulador IA Tributário',
    content: 'Descubra o melhor regime para sua profissão. Compare PF, MEI, ME Simples e Lucro Presumido instantaneamente.',
    position: 'right',
  },
  {
    id: 'ai-chat',
    target: '[data-tour="quick-ai-chat"]',
    title: 'Chat com IA Tributária',
    content: 'Tire dúvidas sobre impostos, deduções, MEI e planejamento tributário com nossa IA especializada.',
    position: 'right',
  },
  {
    id: 'contadores',
    target: '[data-tour="quick-contadores"]',
    title: 'Contadores Especializados',
    content: 'Precisa de ajuda profissional? Conecte-se com contadores especializados em autônomos e profissionais liberais.',
    position: 'left',
  },
  {
    id: 'history',
    target: '[data-tour="history-section"]',
    title: 'Histórico de Simulações',
    content: 'Todas as suas simulações ficam salvas aqui. Você pode revisar, comparar e exportar em PDF a qualquer momento.',
    position: 'top',
  },
  {
    id: 'sidebar-menu',
    target: '[data-tour="sidebar-menu"]',
    title: 'Menu Principal',
    content: 'Use o menu lateral para navegar entre todas as seções: Simulador, Histórico, Chat IA, Glossário e mais.',
    position: 'right',
  },
  {
    id: 'profile',
    target: '[data-tour="profile-menu"]',
    title: 'Seu Perfil',
    content: 'Configure suas informações profissionais para receber simulações e recomendações personalizadas.',
    position: 'right',
  },
];
