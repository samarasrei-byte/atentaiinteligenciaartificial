// QA Mode Configuration
// This module handles all QA testing environment logic

// QA Test User email - only this email gets QA privileges
export const QA_USER_EMAIL = 'teste@atentai.com.br';

// Check if a user is the QA test user
export const isQAUser = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return email.toLowerCase() === QA_USER_EMAIL.toLowerCase();
};

// QA Mode flags - these only apply to QA_USER
export interface QAFlags {
  QA_MODE: boolean;
  BYPASS_PAYWALL: boolean;
  DISABLE_BILLING: boolean;
  BYPASS_SUBSCRIPTION_CHECK: boolean;
}

// Get QA flags for a user
export const getQAFlags = (email: string | null | undefined): QAFlags => {
  const isQA = isQAUser(email);
  
  return {
    QA_MODE: isQA,
    BYPASS_PAYWALL: isQA,
    DISABLE_BILLING: isQA,
    BYPASS_SUBSCRIPTION_CHECK: isQA,
  };
};

// All routes in the system organized by category
export const systemRoutes = {
  public: [
    { path: '/', name: 'Home', description: 'Página inicial' },
    { path: '/auth', name: 'Login/Signup', description: 'Autenticação' },
    { path: '/comecar', name: 'Começar', description: 'Seleção de tipo de usuário' },
    { path: '/onboarding', name: 'Onboarding', description: 'Onboarding público' },
    { path: '/pricing', name: 'Preços', description: 'Planos e preços' },
    { path: '/simulador', name: 'Simulador Público', description: 'Simulador tributário' },
    { path: '/faq', name: 'FAQ', description: 'Perguntas frequentes' },
    { path: '/termos', name: 'Termos de Uso', description: 'Termos legais' },
    { path: '/privacidade', name: 'Privacidade', description: 'Política de privacidade' },
    { path: '/contadores-publico', name: 'Contadores Público', description: 'Lista pública de contadores' },
    { path: '/planos-perfil', name: 'Planos por Perfil', description: 'Planos por tipo de usuário' },
    { path: '/limpa-nome', name: 'Limpa Nome', description: 'Serviço limpa nome' },
    { path: '/abertura-empresa', name: 'Abertura Empresa', description: 'Abertura de empresa' },
    { path: '/modulo-fiscal', name: 'Módulo Fiscal', description: 'Análise fiscal' },
    { path: '/servicos', name: 'Serviços', description: 'Hub de serviços' },
    { path: '/ir', name: 'IR', description: 'Imposto de Renda' },
    { path: '/certidoes', name: 'Certidões', description: 'Solicitação de certidões' },
    { path: '/transicao', name: 'Transição', description: 'Simulador de transição' },
    { path: '/transicao-tributaria', name: 'Transição Tributária', description: 'Transição tributária' },
    { path: '/ferramentas-lc214', name: 'Ferramentas LC214', description: 'Ferramentas da reforma' },
    { path: '/timeline-reforma', name: 'Timeline Reforma', description: 'Linha do tempo da reforma' },
    { path: '/investor', name: 'Investor Presentation', description: 'Apresentação para investidores' },
  ],
  protected: [
    { path: '/dashboard', name: 'Dashboard', description: 'Painel principal (roteador)' },
    { path: '/bem-vindo', name: 'Bem-vindo', description: 'Página de boas-vindas' },
    { path: '/perfil', name: 'Perfil', description: 'Perfil do usuário' },
    { path: '/minhas-solicitacoes', name: 'Minhas Solicitações', description: 'Histórico de solicitações' },
    { path: '/consultations', name: 'Consultas', description: 'Histórico de consultas' },
    { path: '/payment-success', name: 'Pagamento Sucesso', description: 'Confirmação de pagamento' },
  ],
  plans: [
    { path: '/plano/simulador', name: 'Plano Simulador', description: 'Página do plano Simulador' },
    { path: '/plano/atente-ai', name: 'Plano Atente AI', description: 'Página do plano Atente AI' },
    { path: '/plano/autonomo', name: 'Plano Autônomo', description: 'Página do plano Autônomo' },
    { path: '/plano/comparar', name: 'Comparar Planos', description: 'Comparação de planos' },
  ],
  premium: [
    { path: '/ai-chat', name: 'AI Chat', description: 'Chat com IA (Premium)' },
    { path: '/locacao', name: 'Locação', description: 'Simulador locação (Premium)' },
    { path: '/regime-comparator', name: 'Comparador Regimes', description: 'Comparador de regimes (Premium/Autônomo)' },
    { path: '/contadores', name: 'Contadores', description: 'Lista de contadores (Premium)' },
  ],
  roleBased: [
    { path: '/empresa', name: 'Painel Empresa', description: 'Painel do usuário empresa', role: 'user' },
    { path: '/autonomo', name: 'Painel Autônomo', description: 'Painel do autônomo', role: 'autonomo' },
    { path: '/contador', name: 'Painel Contador', description: 'Painel do contador', role: 'contador' },
    { path: '/parceiro', name: 'Painel Parceiro', description: 'Painel do parceiro', role: 'partner' },
    { path: '/admin', name: 'Painel Admin', description: 'Painel administrativo', role: 'admin' },
    { path: '/admin/roles', name: 'Admin Roles', description: 'Gerenciamento de roles', role: 'admin' },
    { path: '/admin/reports', name: 'Admin Reports', description: 'Relatórios admin', role: 'admin' },
    { path: '/admin/metrics', name: 'Admin Metrics', description: 'Métricas admin', role: 'admin' },
  ],
  onboarding: [
    { path: '/autonomo-onboarding', name: 'Onboarding Autônomo', description: 'Onboarding para autônomos' },
    { path: '/contador-onboarding', name: 'Onboarding Contador', description: 'Onboarding para contadores' },
    { path: '/autonomo/onboarding', name: 'Onboarding Autônomo (Protegido)', description: 'Onboarding autônomo (logado)' },
    { path: '/contador/onboarding', name: 'Onboarding Contador (Protegido)', description: 'Onboarding contador (logado)' },
  ],
};

// Get all routes as flat array
export const getAllRoutes = () => {
  return [
    ...systemRoutes.public,
    ...systemRoutes.protected,
    ...systemRoutes.plans,
    ...systemRoutes.premium,
    ...systemRoutes.roleBased,
    ...systemRoutes.onboarding,
  ];
};
