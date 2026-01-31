import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumChatLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container premium para chat SaaS
 * Max-width: 1180px, centralizado, padding adequado
 * Nunca usa chat full-width no desktop
 */
export const PremiumChatLayout: React.FC<PremiumChatLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      'w-full max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
};

interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container do chat com visual premium
 * Bordas suaves, sombra elegante, fundo clean
 */
export const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col bg-card rounded-2xl border border-border/50',
        'shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]',
        'overflow-hidden',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface ChatHeaderProps {
  avatar: React.ReactNode;
  title: string;
  subtitle: string;
  badges?: React.ReactNode;
  className?: string;
}

/**
 * Header do chat com hierarquia visual correta
 * Avatar, nome, especialidade e badges de status
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  avatar,
  title,
  subtitle,
  badges,
  className,
}) => {
  return (
    <div className={cn(
      'flex items-center justify-between gap-4 px-5 py-4',
      'bg-gradient-to-r from-emerald-600 to-teal-600',
      'border-b border-white/10',
      className
    )}>
      <div className="flex items-center gap-3 min-w-0">
        {avatar}
        <div className="min-w-0">
          <h2 className="font-semibold text-white text-base sm:text-lg flex items-center gap-2 truncate">
            {title}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-white" />
            </span>
          </h2>
          <p className="text-emerald-100/90 text-sm truncate">{subtitle}</p>
        </div>
      </div>
      
      {badges && (
        <div className="flex items-center gap-2 shrink-0">
          {badges}
        </div>
      )}
    </div>
  );
};

interface ChatMessagesAreaProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Área de mensagens com scroll e padding adequado
 */
export const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      'flex-1 overflow-y-auto',
      'px-4 sm:px-6 py-5',
      'bg-gradient-to-b from-slate-50/50 to-white',
      className
    )}>
      <div className="space-y-4 max-w-full">
        {children}
      </div>
    </div>
  );
};

interface ChatInputAreaProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Área de input fixa no rodapé
 */
export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn(
      'shrink-0 px-4 sm:px-6 py-4',
      'bg-white border-t border-border/50',
      className
    )}>
      {children}
    </div>
  );
};

export default PremiumChatLayout;
