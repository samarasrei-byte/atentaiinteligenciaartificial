import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Sparkles, 
  BarChart3, 
  Shield, 
  Scale, 
  Bell,
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from './ChatMessage';
import { KPICard } from './KPICard';
import { KPIAlertPopup } from './KPIAlertPopup';
import { useSmartChatData } from './useSmartChatData';
import type { ChatMessage as ChatMessageType, ServiceType, KPIAlert } from './types';
import { serviceConfig } from './types';

const quickActions = [
  { icon: BarChart3, label: 'Resumo do dia', query: 'Me dê um resumo de performance de hoje' },
  { icon: Shield, label: 'Status Limpa Nome', query: 'Qual o status das solicitações de Limpa Nome?' },
  { icon: Scale, label: 'Análises pendentes', query: 'Quantas análises fiscais estão pendentes?' },
  { icon: AlertCircle, label: 'Alertas críticos', query: 'Quais são os alertas críticos do momento?' },
];

export const SmartChatHub: React.FC = () => {
  const { kpis, alerts, isLoading } = useSmartChatData();
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou a **IA Central** do AtentAI. Posso te ajudar com:\n\n- 📊 **KPIs em tempo real** de todos os serviços\n- 🔔 **Alertas de performance** e anomalias\n- 💡 **Insights automáticos** e recomendações\n\nO que você gostaria de saber?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'all'>('all');
  const [activeAlert, setActiveAlert] = useState<KPIAlert | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Show first unread alert as popup
  useEffect(() => {
    const firstUnread = alerts.find(a => !a.isRead && !a.isDismissed);
    if (firstUnread && !activeAlert) {
      setActiveAlert(firstUnread);
    }
  }, [alerts, activeAlert]);

  const handleSend = useCallback(async (query?: string) => {
    const messageText = query || input.trim();
    if (!messageText) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulate AI thinking
      await new Promise(resolve => setTimeout(resolve, 800));

      // Build context-aware response
      let response = '';
      let kpiData: typeof kpis = [];

      const lowerQuery = messageText.toLowerCase();

      if (lowerQuery.includes('resumo') || lowerQuery.includes('hoje') || lowerQuery.includes('geral')) {
        kpiData = kpis.filter(k => ['ln_conversion', 'fiscal_pending', 'bi_mrr', 'total_revenue'].includes(k.id));
        response = `📊 **Resumo de Performance - ${new Date().toLocaleDateString('pt-BR')}**\n\nAqui estão os KPIs principais:`;
      } else if (lowerQuery.includes('limpa nome') || lowerQuery.includes('limpa-nome')) {
        kpiData = kpis.filter(k => k.service === 'limpa_nome');
        response = `🛡️ **Status do Limpa Nome**\n\nAqui estão os indicadores atuais:`;
      } else if (lowerQuery.includes('fiscal') || lowerQuery.includes('análise')) {
        kpiData = kpis.filter(k => k.service === 'analise_fiscal');
        response = `📋 **Status das Análises Fiscais**\n\nAqui estão os indicadores:`;
      } else if (lowerQuery.includes('alerta') || lowerQuery.includes('crítico')) {
        const criticalAlerts = alerts.filter(a => a.level === 'critical');
        if (criticalAlerts.length > 0) {
          response = `⚠️ **Alertas Críticos (${criticalAlerts.length})**\n\n`;
          criticalAlerts.forEach(alert => {
            response += `• **${alert.title}** (${serviceConfig[alert.service].label})\n  ${alert.description}\n\n`;
          });
        } else {
          response = `✅ **Nenhum alerta crítico!**\n\nTudo está operando dentro dos parâmetros esperados.`;
        }
      } else if (lowerQuery.includes('bi') || lowerQuery.includes('mrr') || lowerQuery.includes('assinatura')) {
        kpiData = kpis.filter(k => k.service === 'bi');
        response = `📈 **Métricas de BI & Assinaturas**\n\nAqui estão os indicadores:`;
      } else {
        response = `Entendi sua pergunta sobre "${messageText}". Aqui está um resumo geral dos indicadores mais relevantes:`;
        kpiData = kpis.slice(0, 4);
      }

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        kpiData: kpiData.length > 0 ? kpiData : undefined,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input, kpis, alerts]);

  const filteredKpis = serviceFilter === 'all' 
    ? kpis 
    : kpis.filter(k => k.service === serviceFilter);

  const unreadAlerts = alerts.filter(a => !a.isRead);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/60">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Central Inteligente</h1>
              <p className="text-xs text-muted-foreground">Chat + KPIs + Alertas em tempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alerts Badge */}
            <Button variant="outline" size="sm" className="gap-2 relative">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
              {unreadAlerts.length > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  {unreadAlerts.length}
                </Badge>
              )}
            </Button>

            {/* Service Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {serviceFilter === 'all' ? 'Todos' : serviceConfig[serviceFilter].label}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setServiceFilter('all')}>
                  Todos os Serviços
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.entries(serviceConfig).map(([key, config]) => (
                  <DropdownMenuItem 
                    key={key} 
                    onClick={() => setServiceFilter(key as ServiceType)}
                  >
                    <span className={cn('mr-2', config.color)}>●</span>
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {isTyping && (
                <ChatMessage 
                  message={{
                    id: 'typing',
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                    isTyping: true,
                  }}
                />
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="flex-shrink-0 px-4 py-2 border-t border-border/50">
            <div className="flex gap-2 overflow-x-auto pb-2 max-w-3xl mx-auto">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(action.query)}
                    disabled={isTyping}
                    className="shrink-0 gap-2 text-xs"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-card/50">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Input
                placeholder="Pergunte sobre métricas, alertas ou performance..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="flex-1 bg-background"
                disabled={isTyping}
              />
              <Button onClick={() => handleSend()} disabled={isTyping || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Sidebar (Desktop) */}
        <div className="hidden lg:flex flex-col w-80 border-l border-border bg-card/30">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">KPIs em Tempo Real</h2>
              {!isLoading && (
                <Badge variant="outline" className="text-xs gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : (
                filteredKpis.map((kpi) => (
                  <KPICard key={kpi.id} kpi={kpi} />
                ))
              )}
            </div>
          </ScrollArea>

          {/* Alerts Summary */}
          {unreadAlerts.length > 0 && (
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-foreground">
                  {unreadAlerts.length} alerta(s) pendente(s)
                </span>
              </div>
              <div className="space-y-1.5">
                {unreadAlerts.slice(0, 2).map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => setActiveAlert(alert)}
                    className={cn(
                      'w-full text-left p-2 rounded-lg text-xs transition-colors',
                      'hover:bg-muted/50',
                      serviceConfig[alert.service].bgColor
                    )}
                  >
                    <p className="font-medium text-foreground truncate">{alert.title}</p>
                    <p className="text-muted-foreground truncate">{alert.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Popup */}
      <KPIAlertPopup
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
        onAction={() => setActiveAlert(null)}
      />
    </div>
  );
};
