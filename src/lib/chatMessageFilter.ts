// Chat message filter to prevent sharing contact information outside the platform

export interface FilterResult {
  isBlocked: boolean;
  reason: string | null;
  sanitizedMessage: string | null;
}

// Regex patterns for detecting contact information
const patterns = {
  // Phone numbers (Brazilian format)
  phone: /(\+?55\s?)?(\(?\d{2}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}/g,
  
  // WhatsApp mentions
  whatsapp: /\b(whats\s*app|whatsapp|wpp|zap|zapzap|whats|what'?s\s*app)\b/gi,
  
  // Email addresses
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  
  // Phone-related keywords
  phoneKeywords: /\b(telefone|fone|celular|liga\s+pra\s+mim|me\s+liga|meu\s+numero|meu\s+número|contato\s+pessoal)\b/gi,
  
  // Direct contact attempts
  directContact: /\b(fala\s+comigo|me\s+chama|me\s+add|adiciona\s+eu|chama\s+no|manda\s+mensagem|msg\s+no|dm\s+no)\b/gi,
};

const blockedReasons: Record<string, string> = {
  phone: 'Números de telefone não são permitidos para proteger sua privacidade.',
  whatsapp: 'Menções a WhatsApp ou outros aplicativos de mensagem não são permitidas.',
  email: 'Endereços de email não são permitidos nas mensagens.',
  phoneKeywords: 'Solicitações de contato por telefone não são permitidas.',
  directContact: 'Solicitações de contato fora da plataforma não são permitidas.',
};

export const filterChatMessage = (message: string): FilterResult => {
  const trimmedMessage = message.trim();
  
  // Check each pattern
  for (const [patternName, pattern] of Object.entries(patterns)) {
    pattern.lastIndex = 0; // Reset regex state
    if (pattern.test(trimmedMessage)) {
      return {
        isBlocked: true,
        reason: blockedReasons[patternName],
        sanitizedMessage: null,
      };
    }
  }

  return {
    isBlocked: false,
    reason: null,
    sanitizedMessage: trimmedMessage,
  };
};

// Sanitize message by removing blocked content (alternative to blocking)
export const sanitizeChatMessage = (message: string): string => {
  let sanitized = message;
  
  // Replace phone numbers with placeholder
  sanitized = sanitized.replace(patterns.phone, '[NÚMERO REMOVIDO]');
  
  // Replace emails with placeholder
  sanitized = sanitized.replace(patterns.email, '[EMAIL REMOVIDO]');
  
  return sanitized;
};

// Check if message contains blocked content without blocking
export const hasBlockedContent = (message: string): { hasBlocked: boolean; types: string[] } => {
  const blockedTypes: string[] = [];
  
  for (const [patternName, pattern] of Object.entries(patterns)) {
    pattern.lastIndex = 0;
    if (pattern.test(message)) {
      blockedTypes.push(patternName);
    }
  }
  
  return {
    hasBlocked: blockedTypes.length > 0,
    types: blockedTypes,
  };
};
