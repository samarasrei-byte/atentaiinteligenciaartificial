import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { MPTransparentCheckout } from '@/components/payments/MPTransparentCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/stripe';
import { GuestInfoForm } from '@/components/payments/GuestInfoForm';

type PaymentTab = 'pix' | 'card';

interface MPCheckoutOptions {
  amountCents: number;
  serviceName: string;
  serviceType: string;
  description?: string;
  gradient?: string;
  icon?: React.ElementType;
  metadata?: Record<string, string>;
  onSuccess?: (paymentId: number) => void;
  allowedMethods?: PaymentTab[];
  isRecurring?: boolean;
  // Guest checkout fields (used when user is not authenticated)
  guestEmail?: string;
  guestName?: string;
  // If true, show guest form before checkout when user is not logged in
  requireGuestInfo?: boolean;
}

interface MPCheckoutContextType {
  openCheckout: (options: MPCheckoutOptions) => void;
  closeCheckout: () => void;
}

const MPCheckoutContext = createContext<MPCheckoutContextType | null>(null);

export const useMPCheckout = () => {
  const ctx = useContext(MPCheckoutContext);
  if (!ctx) throw new Error('useMPCheckout must be used within MPCheckoutProvider');
  return ctx;
};

export const MPCheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<MPCheckoutOptions | null>(null);
  const [guestStep, setGuestStep] = useState<'form' | 'checkout'>('checkout');
  const [guestData, setGuestData] = useState<{ name: string; email: string; phone: string } | null>(null);

  const openCheckout = useCallback((opts: MPCheckoutOptions) => {
    // If user is logged in, go straight to checkout
    if (user?.email) {
      setOptions(opts);
      setGuestStep('checkout');
      setGuestData(null);
      setIsOpen(true);
      return;
    }

    // If guest data already provided, go straight to checkout
    const hasGuestData = opts.guestEmail && opts.guestEmail.trim().length > 0;
    if (hasGuestData) {
      setOptions(opts);
      setGuestStep('checkout');
      setGuestData(null);
      setIsOpen(true);
      return;
    }

    // Guest user without data → show form first
    if (opts.requireGuestInfo) {
      setOptions(opts);
      setGuestStep('form');
      setGuestData(null);
      setIsOpen(true);
      return;
    }

    // No user and no guest info → error
    toast.error('Você precisa estar logado para continuar.');
  }, [user]);

  const closeCheckout = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
    setGuestStep('checkout');
    setGuestData(null);
  }, []);

  const handleGuestSubmit = useCallback((data: { name: string; email: string; phone: string }) => {
    setGuestData(data);
    if (options) {
      setOptions({
        ...options,
        guestEmail: data.email,
        guestName: data.name,
        metadata: {
          ...options.metadata,
          fullName: data.name,
          email: data.email,
          phone: data.phone,
        },
      });
    }
    setGuestStep('checkout');
  }, [options]);

  const handleSuccess = useCallback((paymentId: number) => {
    options?.onSuccess?.(paymentId);
    closeCheckout();
  }, [options, closeCheckout]);

  const payerEmail = user?.email || options?.guestEmail || guestData?.email || '';
  const payerName = profile?.full_name || options?.guestName || guestData?.name || 'Cliente';

  return (
    <MPCheckoutContext.Provider value={{ openCheckout, closeCheckout }}>
      {children}

      <Dialog open={isOpen} onOpenChange={closeCheckout}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden max-h-[90vh] md:max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full mx-auto [&>button.absolute]:hidden">
          {/* Header */}
          <div className={`bg-gradient-to-br ${options?.gradient || 'from-primary to-primary/70'} p-6 text-white relative`}>
            <button
              onClick={closeCheckout}
              className="absolute top-4 right-4 z-10 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-bold text-white">
                {options?.serviceName || 'Pagamento'}
              </DialogTitle>
              {options?.description && (
                <DialogDescription className="text-white/80">
                  {options.description}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {options ? formatPrice(options.amountCents) : ''}
              </span>
              <span className="text-white/70 text-sm">{options?.isRecurring ? '/mês' : 'pagamento único'}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {guestStep === 'form' && options ? (
              <GuestInfoForm
                serviceName={options.serviceName}
                onSubmit={handleGuestSubmit}
                onCancel={closeCheckout}
              />
            ) : (
              options && payerEmail && (
                <MPTransparentCheckout
                  amountCents={options.amountCents}
                  serviceName={options.serviceName}
                  serviceType={options.serviceType}
                  description={options.description}
                  payerEmail={payerEmail}
                  payerName={payerName}
                  accessToken={session?.access_token}
                  metadata={options.metadata}
                  onSuccess={handleSuccess}
                  allowedMethods={options.allowedMethods}
                  isRecurring={options.isRecurring}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MPCheckoutContext.Provider>
  );
};
