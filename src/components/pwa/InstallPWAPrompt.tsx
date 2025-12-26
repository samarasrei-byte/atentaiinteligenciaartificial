import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone, Share, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if dismissed recently
    const dismissedTime = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
      }
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!standalone && !dismissed) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show iOS prompt after delay
    if (ios && !standalone && !dismissed) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:w-96 animate-slide-up">
      <Card className="border-border/50 bg-card/95 backdrop-blur-lg shadow-2xl">
        <CardContent className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Instalar AtentAI
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Use como um app nativo no seu celular. Acesso rápido e offline.
              </p>

              {isIOS ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Para instalar no iPhone/iPad:
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <Share className="h-3 w-3" />
                      <span>Compartilhar</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <Plus className="h-3 w-3" />
                      <span>Tela de Início</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    className="flex-1 h-9 text-sm"
                    disabled={!deferredPrompt}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Instalar App
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                <Feature icon={CheckCircle2} text="Acesso rápido" />
                <Feature icon={CheckCircle2} text="Funciona offline" />
                <Feature icon={CheckCircle2} text="Sem downloads" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-1">
      <Icon className="h-3 w-3 text-primary" />
      <span className="text-[10px] text-muted-foreground">{text}</span>
    </div>
  );
}

// Floating Install Button for header/fixed position
export function InstallPWAButton({ className }: { className?: string }) {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || !canInstall) return null;

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className={cn("gap-2", className)}
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Instalar App</span>
    </Button>
  );
}
