import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Download, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface PremiumMessageBubbleProps {
  content: string;
  sender: 'user' | 'specialist' | 'system';
  timestamp: Date;
  isRead?: boolean;
  avatar?: React.ReactNode;
  senderName?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isNew?: boolean;
  className?: string;
}

/**
 * Balão de mensagem premium com UX otimizada
 * - Max-width: 70% (nunca 100%)
 * - Padding interno: 16-20px
 * - Line-height: 1.5
 * - Border-radius: 16px
 */
export const PremiumMessageBubble: React.FC<PremiumMessageBubbleProps> = ({
  content,
  sender,
  timestamp,
  isRead,
  avatar,
  senderName,
  attachmentUrl,
  attachmentName,
  isNew = false,
  className,
}) => {
  const isUser = sender === 'user';
  const isSystem = sender === 'system';

  // System messages are centered
  if (isSystem) {
    return (
      <motion.div
        initial={isNew ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center py-2"
      >
        <span className="text-xs text-muted-foreground bg-muted/60 px-4 py-1.5 rounded-full">
          {content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar - only for specialist */}
      {!isUser && avatar && (
        <div className="shrink-0 pt-1">
          {avatar}
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'flex flex-col',
        // CRÍTICO: max-width de 70% para leitura confortável
        'max-w-[70%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Sender name for specialist */}
        {!isUser && senderName && (
          <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
            {senderName}
          </span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            // CRÍTICO: padding interno adequado
            'px-4 py-3 sm:px-5 sm:py-3.5',
            // CRÍTICO: border-radius suave
            'rounded-2xl',
            // Cantos ajustados por lado
            isUser ? 'rounded-br-md' : 'rounded-bl-md',
            // Cores
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-white border border-border/60 text-foreground shadow-sm',
          )}
        >
          {/* Message text with proper line-height */}
          <div className={cn(
            'text-sm leading-relaxed', // line-height: 1.625
            'prose prose-sm max-w-none',
            isUser ? 'prose-invert' : ''
          )}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-0 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="mb-0.5">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Attachment */}
          {attachmentUrl && attachmentName && (
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-1.5 mt-2 text-xs',
                isUser 
                  ? 'text-primary-foreground/80 hover:text-primary-foreground' 
                  : 'text-primary hover:text-primary/80',
                'underline underline-offset-2'
              )}
            >
              <Download className="h-3.5 w-3.5" />
              {attachmentName}
            </a>
          )}
        </div>

        {/* Timestamp and read status */}
        <div className={cn(
          'flex items-center gap-1.5 mt-1 px-1',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-[11px] text-muted-foreground">
            {timestamp.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {isUser && (
            isRead ? (
              <CheckCheck className="h-3 w-3 text-emerald-500" />
            ) : (
              <Check className="h-3 w-3 text-muted-foreground" />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumMessageBubble;
