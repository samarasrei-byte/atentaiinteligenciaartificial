// SmartChat Type Definitions

export type ServiceType = 'limpa_nome' | 'analise_fiscal' | 'bi' | 'geral';

export type AlertLevel = 'info' | 'warning' | 'critical';

export type MessageRole = 'user' | 'assistant' | 'system' | 'kpi_alert';

export interface KPIMetric {
  id: string;
  service: ServiceType;
  label: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit: 'percent' | 'currency' | 'count' | 'days';
  trend: 'up' | 'down' | 'stable';
  trendPercent?: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface KPIAlert {
  id: string;
  service: ServiceType;
  metric: string;
  level: AlertLevel;
  title: string;
  description: string;
  impact: string;
  suggestion: string;
  actionLabel?: string;
  actionHandler?: () => void;
  createdAt: Date;
  isRead: boolean;
  isDismissed: boolean;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  service?: ServiceType;
  kpiData?: KPIMetric[];
  alert?: KPIAlert;
  isTyping?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ChatConversation {
  id: string;
  title: string;
  service?: ServiceType;
  lastMessage?: string;
  lastMessageAt: Date;
  unreadCount: number;
  isPinned: boolean;
}

export interface SmartChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  alerts: KPIAlert[];
  kpis: KPIMetric[];
  isLoading: boolean;
}

// Service config for styling
export const serviceConfig: Record<ServiceType, { label: string; color: string; bgColor: string; icon: string }> = {
  limpa_nome: {
    label: 'Limpa Nome',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'Shield',
  },
  analise_fiscal: {
    label: 'Análise Fiscal',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    icon: 'Scale',
  },
  bi: {
    label: 'BI',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'BarChart3',
  },
  geral: {
    label: 'Geral',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-950/30',
    icon: 'MessageCircle',
  },
};

export const alertLevelConfig: Record<AlertLevel, { color: string; bgColor: string; borderColor: string }> = {
  info: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  warning: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  critical: {
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
};
