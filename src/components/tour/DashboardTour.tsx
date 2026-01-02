import { useEffect } from 'react';
import { GuidedTour } from './GuidedTour';
import { useGuidedTour, TourStep } from '@/hooks/useGuidedTour';
import { useAuth } from '@/contexts/AuthContext';

// Steps for Empresa panel
const empresaSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="dashboard-header"]',
    title: 'Bem-vindo ao seu Painel!',
    content: 'Este é o seu painel de controle. Aqui você pode gerenciar sua empresa e acessar todas as funcionalidades.',
    position: 'bottom',
  },
  {
    id: 'stats',
    target: '[data-tour="stats-cards"]',
    title: 'Estatísticas Rápidas',
    content: 'Visualize métricas importantes da sua empresa em tempo real, como faturamento e economia tributária.',
    position: 'bottom',
  },
  {
    id: 'quick-actions',
    target: '[data-tour="quick-actions"]',
    title: 'Ações Rápidas',
    content: 'Acesse rapidamente as funcionalidades mais usadas: simulador, consultas com contadores e mais.',
    position: 'top',
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar-menu"]',
    title: 'Menu de Navegação',
    content: 'Use o menu lateral para acessar todas as seções do painel: simuladores, serviços, perfil e configurações.',
    position: 'right',
  },
  {
    id: 'ai-chat',
    target: '[data-tour="ai-chat"]',
    title: 'Assistente IA',
    content: 'Tire dúvidas tributárias instantaneamente com nossa IA especializada. Clique para começar uma conversa!',
    position: 'left',
  },
];

// Steps for Autônomo panel
const autonomoSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="dashboard-header"]',
    title: 'Painel do Autônomo',
    content: 'Bem-vindo ao seu painel exclusivo! Aqui você gerencia sua atividade profissional e otimiza seus impostos.',
    position: 'bottom',
  },
  {
    id: 'mei-alert',
    target: '[data-tour="mei-limit"]',
    title: 'Limite do MEI',
    content: 'Acompanhe seu faturamento em relação ao limite do MEI. Nós avisamos quando você estiver próximo do teto.',
    position: 'bottom',
  },
  {
    id: 'simulator',
    target: '[data-tour="autonomo-simulator"]',
    title: 'Simulador de Regime',
    content: 'Compare os regimes tributários e descubra qual é o melhor para seu perfil: MEI, ME Simples ou Lucro Presumido.',
    position: 'bottom',
  },
  {
    id: 'goals',
    target: '[data-tour="financial-goals"]',
    title: 'Metas Financeiras',
    content: 'Defina e acompanhe suas metas de faturamento, economia e reserva de emergência.',
    position: 'top',
  },
];

// Steps for Contador panel
const contadorSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="dashboard-header"]',
    title: 'Painel do Contador',
    content: 'Gerencie seus clientes, consultas e serviços em um só lugar. Bem-vindo ao seu hub profissional!',
    position: 'bottom',
  },
  {
    id: 'stats',
    target: '[data-tour="contador-stats"]',
    title: 'Suas Estatísticas',
    content: 'Acompanhe consultas realizadas, avaliação média e ganhos do período.',
    position: 'bottom',
  },
  {
    id: 'clients',
    target: '[data-tour="client-list"]',
    title: 'Gestão de Clientes',
    content: 'Visualize e gerencie todas as solicitações de serviços dos seus clientes.',
    position: 'top',
  },
  {
    id: 'availability',
    target: '[data-tour="availability"]',
    title: 'Disponibilidade',
    content: 'Defina sua disponibilidade para receber novas consultas e configure sua agenda.',
    position: 'left',
  },
];

// Steps for Admin panel
const adminSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="dashboard-header"]',
    title: 'Painel Administrativo',
    content: 'Visão completa da plataforma. Monitore usuários, métricas e gerencie toda a operação.',
    position: 'bottom',
  },
  {
    id: 'metrics',
    target: '[data-tour="admin-metrics"]',
    title: 'Métricas Gerais',
    content: 'Acompanhe usuários ativos, receita, consultas e outros KPIs importantes.',
    position: 'bottom',
  },
  {
    id: 'users',
    target: '[data-tour="user-management"]',
    title: 'Gestão de Usuários',
    content: 'Gerencie usuários, roles e permissões da plataforma.',
    position: 'top',
  },
  {
    id: 'reports',
    target: '[data-tour="admin-reports"]',
    title: 'Relatórios',
    content: 'Acesse relatórios detalhados e exporte dados para análise.',
    position: 'left',
  },
];

interface DashboardTourProps {
  panelType: 'empresa' | 'autonomo' | 'contador' | 'admin';
}

export function DashboardTour({ panelType }: DashboardTourProps) {
  const { user } = useAuth();
  
  const getSteps = () => {
    switch (panelType) {
      case 'empresa':
        return empresaSteps;
      case 'autonomo':
        return autonomoSteps;
      case 'contador':
        return contadorSteps;
      case 'admin':
        return adminSteps;
      default:
        return empresaSteps;
    }
  };

  const tour = useGuidedTour({
    steps: getSteps(),
    storageKey: `tour_${panelType}_completed`,
    autoStart: true,
  });

  // Check if this is a new user (first login)
  useEffect(() => {
    if (user && !tour.hasCompletedTour) {
      const timer = setTimeout(() => {
        tour.startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, tour.hasCompletedTour]);

  return (
    <GuidedTour
      isActive={tour.isActive}
      currentStep={tour.currentStep}
      currentStepIndex={tour.currentStepIndex}
      totalSteps={tour.totalSteps}
      progress={tour.progress}
      isFirstStep={tour.isFirstStep}
      isLastStep={tour.isLastStep}
      onNext={tour.nextStep}
      onPrev={tour.prevStep}
      onSkip={() => tour.endTour(true)}
      onClose={() => tour.endTour(false)}
    />
  );
}

// Hook to manually trigger tour
export function useDashboardTour(panelType: 'empresa' | 'autonomo' | 'contador' | 'admin') {
  const getSteps = () => {
    switch (panelType) {
      case 'empresa':
        return empresaSteps;
      case 'autonomo':
        return autonomoSteps;
      case 'contador':
        return contadorSteps;
      case 'admin':
        return adminSteps;
      default:
        return empresaSteps;
    }
  };

  return useGuidedTour({
    steps: getSteps(),
    storageKey: `tour_${panelType}_completed`,
    autoStart: false,
  });
}
