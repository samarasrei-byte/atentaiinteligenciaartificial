import {
  LayoutDashboard,
  Activity,
  BarChart3,
  DollarSign,
  TrendingUp,
  Target,
  MessageCircle,
  Bell,
  Megaphone,
  Headphones,
  Shield,
  Scale,
  Users,
  Building2,
  UserCheck,
  Wallet,
  CreditCard,
  PieChart,
  User,
  Building,
  Lock,
  Link2,
  Star,
  FileText,
} from 'lucide-react';
import type { TabItem, TabGroup } from './SectionTabs';

// Dashboard - Visão macro
export const dashboardTabs: TabItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'realtime', label: 'Tempo Real', icon: Activity, isLive: true },
];

// BI & Contabilidade - Core do produto
export const biContabilidadeTabs: TabItem[] = [
  { id: 'bi-accounting', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'realtime', label: 'Tempo Real', icon: Activity, isLive: true },
  { id: 'saas-metrics', label: 'Métricas SaaS', icon: BarChart3 },
  { id: 'revenue-forecast', label: 'Previsão de Receita', icon: DollarSign },
  { id: 'churn', label: 'Churn & Retenção', icon: TrendingUp },
  { id: 'cohort', label: 'Cohort Analysis', icon: Target },
];

// Comunicação - Hub de comunicação (com grupos)
export const comunicacaoTabGroups: TabGroup[] = [
  {
    id: 'chats',
    label: 'Chats',
    icon: MessageCircle,
    tabs: [
      { id: 'client-chat', label: 'Central de Atendimento', icon: MessageCircle, badge: 'Guilherme' },
      { id: 'smart-chat', label: 'Chat BI', icon: BarChart3, badge: 'César', isLive: true },
    ],
  },
  {
    id: 'alertas',
    label: 'Notificações & Alertas',
    icon: Bell,
    tabs: [
      { id: 'churn-notifications', label: 'Notificações', icon: Bell },
      { id: 'kpi-alerts', label: 'Alertas de KPI', icon: TrendingUp, isLive: true },
    ],
  },
  {
    id: 'mensagens',
    label: 'Mensagens',
    icon: Megaphone,
    tabs: [
      { id: 'mass-messages', label: 'Mensagens em Massa', icon: Megaphone },
    ],
  },
  {
    id: 'suporte',
    label: 'Suporte',
    icon: Headphones,
    tabs: [
      { id: 'support', label: 'Tickets', icon: Headphones },
    ],
  },
];

// Marketplace - Serviços
export const marketplaceTabs: TabItem[] = [
  { id: 'limpa-nome', label: 'Limpa Nome', icon: Shield },
  { id: 'modulo-fiscal', label: 'Análise Fiscal', icon: Scale },
  { id: 'cashback', label: 'Cashback', icon: Star },
];

// Gestão - Usuários, parceiros e financeiro (com grupos)
export const gestaoTabGroups: TabGroup[] = [
  {
    id: 'usuarios',
    label: 'Usuários',
    icon: Users,
    tabs: [
      { id: 'users', label: 'Todos os Usuários', icon: Users },
      { id: 'contadores', label: 'Contadores', icon: UserCheck },
      { id: 'partners', label: 'Parceiros', icon: Building2 },
      { id: 'affiliates', label: 'Afiliados', icon: Star },
      { id: 'affiliate-coupons', label: 'Cupons', icon: Star },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    tabs: [
      { id: 'partner-split', label: 'Divisão Sócios', icon: PieChart },
      { id: 'subscriptions', label: 'Assinaturas', icon: CreditCard },
      { id: 'withdrawals', label: 'Saques', icon: Wallet },
      { id: 'metrics', label: 'Métricas', icon: BarChart3 },
    ],
  },
  {
    id: 'auditoria',
    label: 'Auditoria',
    icon: FileText,
    tabs: [
      { id: 'audit-page', label: 'Auditoria', icon: FileText },
      { id: 'audit-logs', label: 'Logs', icon: FileText },
    ],
  },
];

// Configurações - Sistema e conexões (com grupos)
export const configuracoesTabs: TabItem[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'account', label: 'Conta / Empresa', icon: Building },
  { id: 'security', label: 'Segurança', icon: Lock },
  { id: 'connections', label: 'Conexões', icon: Link2 },
  { id: 'roles', label: 'Gestão de Roles', icon: Shield },
  { id: 'settings', label: 'Configurações Gerais', icon: LayoutDashboard },
];
