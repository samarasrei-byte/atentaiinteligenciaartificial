 import React from 'react';
 import { CreditCard, ExternalLink } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { cn } from '@/lib/utils';
 
 interface PaymentLinkRendererProps {
   content: string;
   variant?: 'admin' | 'user';
   className?: string;
 }
 
 /**
  * PaymentLinkRenderer - Detecta links do Stripe e renderiza como botões interativos
  * 
  * Usado nos chats de:
  * - AdminClientChat (Guilherme)
  * - CesarClientChat (César)
  * - UserRequestDetail (Cliente)
  */
 export const PaymentLinkRenderer: React.FC<PaymentLinkRendererProps> = ({
   content,
   variant = 'user',
   className,
 }) => {
  // Regex para detectar URLs do Stripe e Mercado Pago
    const paymentUrlRegex = /(https?:\/\/(?:(?:www\.)?mercadopago\.com\.br\/checkout|mpago\.la)[^\s\)]+)/gi;
    
    // Verifica se há links de pagamento no conteúdo
    const paymentLinks = content.match(paymentUrlRegex);
    
    if (!paymentLinks || paymentLinks.length === 0) {
      // Sem links de pagamento - renderiza texto normal
      return <p className={cn("text-sm whitespace-pre-wrap leading-relaxed", className)}>{content}</p>;
    }
    
    // Divide o conteúdo em partes (texto + links)
    const parts = content.split(paymentUrlRegex);
   
   return (
     <div className={cn("text-sm whitespace-pre-wrap leading-relaxed space-y-2", className)}>
      {parts.map((part, index) => {
          // Verifica se essa parte é um link de pagamento
          const isPaymentLink = paymentLinks.some(link => link === part);
          
          if (isPaymentLink) {
           return (
             <Button
               key={index}
               asChild
               className={cn(
                 "w-full h-12 font-semibold shadow-lg gap-2 group my-2",
                 variant === 'admin' 
                   ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                   : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
               )}
             >
               <a href={part} target="_blank" rel="noopener noreferrer">
                 <CreditCard className="h-5 w-5" />
                 <span>💳 Pagar Agora</span>
                 <ExternalLink className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
               </a>
             </Button>
           );
         }
         
         // Texto normal
         if (part.trim()) {
           return <span key={index}>{part}</span>;
         }
         
         return null;
       })}
     </div>
   );
 };
 
 export default PaymentLinkRenderer;