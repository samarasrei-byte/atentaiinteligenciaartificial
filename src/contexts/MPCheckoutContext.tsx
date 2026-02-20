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
import { formatPrice } from '@/lib/stripe';
import { GuestEmailCapture } from '@/components/payments/GuestEmailCapture';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type PaymentTab = 'pix' | 'card';

interface MPCheckoutOptions {
  amountCents: number;
  serviceName: string;
  serviceType: string;
  description?: string;
  gradient?: string;
  icon?: React.ElementType;
  metadata?: Record<string, string>;
  onSuccess?: (paymentId: number, processResult?: any) => void;
  allowedMethods?: PaymentTab[];
  isRecurring?: boolean;
  // Guest checkout fields (used when user is not authenticated)
  guestEmail?: string;
  guestName?: string;
  // If true, show inline email capture when user is not logged in
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
  const [guestEmail, setGuestEmail] = useState<string | null>(null);

  const openCheckout = useCallback((opts: MPCheckoutOptions) => {
    // If user is logged in, go straight to checkout
    if (user?.email) {
      setOptions(opts);
      setGuestEmail(null);
      setIsOpen(true);
      return;
    }

    // If guest data already provided, go straight to checkout
    const hasGuestData = opts.guestEmail && opts.guestEmail.trim().length > 0;
    if (hasGuestData) {
      setOptions(opts);
      setGuestEmail(opts.guestEmail!);
      setIsOpen(true);
      return;
    }

    // Guest user without data → open modal, will show email capture inline
    if (opts.requireGuestInfo) {
      setOptions(opts);
      setGuestEmail(null);
      setIsOpen(true);
      return;
    }

    // No user and no guest info → error
    toast.error('Você precisa estar logado para continuar.');
  }, [user]);

  const closeCheckout = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
    setGuestEmail(null);
  }, []);

  const handleGuestEmailSubmit = useCallback((email: string) => {
    setGuestEmail(email);
  }, []);

  const navigate = useNavigate();

  const handleSuccess = useCallback(async (paymentId: number, processResult?: any) => {
    // Auto-login centralized: set session tokens if available
    let loginSucceeded = false;
    
    if (processResult?.accessToken && processResult?.refreshToken) {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: processResult.accessToken,
          refresh_token: processResult.refreshToken,
        });
        if (!error) loginSucceeded = true;
      } catch (e) {
        console.error('[MPCheckout] Auto-login setSession failed:', e);
      }
    } else if (processResult?.isNewUser && processResult?.tempPassword) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: processResult.email,
          password: processResult.tempPassword,
        });
        if (!error) loginSucceeded = true;
      } catch (e) {
        console.error('[MPCheckout] Auto-login password failed:', e);
      }
    }

    // Call original onSuccess callback
    options?.onSuccess?.(paymentId, processResult);
    closeCheckout();

    // Auto-redirect to chat if redirectPath is available
    if (processResult?.redirectPath) {
      toast.success(`Serviço ativado! Redirecionando ao chat com ${processResult.specialist || 'especialista'}...`);
      
      if (loginSucceeded) {
        // Wait for AuthContext to process the new session before navigating
        // This prevents ProtectedRoute from seeing user=null and redirecting to /auth
        await new Promise<void>((resolve) => {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
              subscription.unsubscribe();
              resolve();
            }
          });
          // Safety timeout — don't wait forever
          setTimeout(() => {
            subscription.unsubscribe();
            resolve();
          }, 2000);
        });
      }
      
      navigate(processResult.redirectPath);
    }
  }, [options, closeCheckout, navigate]);

  const payerEmail = user?.email || guestEmail || options?.guestEmail || '';
  const payerName = profile?.full_name || options?.guestName || 'Cliente';
  const isGuestWithoutEmail = !user?.email && !payerEmail;

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
            {isGuestWithoutEmail && options ? (
              <GuestEmailCapture
                serviceName={options.serviceName}
                onSubmit={handleGuestEmailSubmit}
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
