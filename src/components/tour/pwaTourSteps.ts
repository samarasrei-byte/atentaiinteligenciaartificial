import type { TourStep } from '@/hooks/useGuidedTour';

export const pwaTourSteps: TourStep[] = [
  {
    id: 'pwa-welcome',
    target: '[data-tour="pwa-welcome"]',
    title: '🎉 Bem-vindo ao App!',
    content: 'Você instalou o AtentAI como aplicativo. Agora você tem acesso rápido e uma experiência ainda melhor no celular!',
    position: 'bottom',
  },
  {
    id: 'pwa-offline',
    target: '[data-tour="pwa-offline"]',
    title: '📴 Funciona Offline',
    content: 'O app funciona mesmo sem internet! Você pode acessar suas simulações salvas e dados do perfil a qualquer momento.',
    position: 'bottom',
  },
  {
    id: 'pwa-notifications',
    target: '[data-tour="pwa-notifications"]',
    title: '🔔 Notificações Inteligentes',
    content: 'Receba alertas sobre vencimentos de impostos, lembretes fiscais e atualizações importantes diretamente no seu celular.',
    position: 'bottom',
  },
  {
    id: 'pwa-quick-access',
    target: '[data-tour="pwa-quick-access"]',
    title: '⚡ Acesso Rápido',
    content: 'Use a navegação inferior para acessar rapidamente todas as funcionalidades: simuladores, consultas, alertas e seu perfil.',
    position: 'top',
  },
  {
    id: 'pwa-sync',
    target: '[data-tour="pwa-sync"]',
    title: '🔄 Sincronização Automática',
    content: 'Seus dados são sincronizados automaticamente quando você está online. Nunca perca uma simulação ou configuração!',
    position: 'bottom',
  },
];

export const pwaTourStorageKey = 'pwa_tour_completed';
