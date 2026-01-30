import React from 'react';
import { Bot, User, AlertTriangle, BarChart3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from './types';
import { serviceConfig, alertLevelConfig } from './types';
import { KPICard } from './KPICard';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isKPIAlert = message.role === 'kpi_alert';
  const isSystem = message.role === 'system';

  const service = message.service ? serviceConfig[message.service] : null;

  if (isKPIAlert && message.alert) {
    const level = alertLevelConfig[message.alert.level];
    
    return (
      <div className={cn(
        'flex gap-3 p-4 rounded-xl border',
        level.bgColor,
        level.borderColor
      )}>
        <div className={cn('p-2 rounded-lg h-fit', level.bgColor)}>
          <AlertTriangle className={cn('h-4 w-4', level.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {service && (
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', service.bgColor, service.color)}>
                {service.label}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">{message.alert.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{message.alert.description}</p>
        </div>
      </div>
    );
  }

  if (message.kpiData && message.kpiData.length > 0) {
    return (
      <div className="space-y-3">
        <div className={cn(
          'flex gap-3',
          isUser ? 'flex-row-reverse' : ''
        )}>
          <div className={cn(
            'p-2 rounded-xl h-fit shrink-0',
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-gradient-to-br from-primary/10 to-primary/5 text-primary'
          )}>
            {isUser ? <User className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
          </div>
          <div className={cn(
            'flex-1 max-w-[85%]',
            isUser ? 'text-right' : ''
          )}>
            <div className={cn(
              'inline-block p-4 rounded-2xl',
              isUser
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-muted/50 text-foreground rounded-tl-sm'
            )}>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 ml-12">
          {message.kpiData.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex gap-3',
      isUser ? 'flex-row-reverse' : ''
    )}>
      <div className={cn(
        'p-2 rounded-xl h-fit shrink-0',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-gradient-to-br from-primary/10 to-primary/5 text-primary'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn(
        'flex-1 max-w-[85%]',
        isUser ? 'text-right' : ''
      )}>
        <div className={cn(
          'inline-block p-4 rounded-2xl',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted/50 text-foreground rounded-tl-sm'
        )}>
          {message.isTyping ? (
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <p className={cn(
          'text-xs text-muted-foreground mt-1',
          isUser ? 'text-right' : 'text-left'
        )}>
          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};
