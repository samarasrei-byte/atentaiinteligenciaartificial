import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Download, 
  Smartphone, 
  Share, 
  Plus, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Bell,
  ArrowLeft,
  Monitor,
  Apple,
  Chrome
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type DeviceType = "android" | "ios" | "desktop" | "unknown";

export default function InstallApp() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType>("unknown");
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) setDeviceType("ios");
    else if (isAndroid) setDeviceType("android");
    else setDeviceType("desktop");

    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const benefits = [
    { icon: Zap, title: "Acesso Instantâneo", description: "Abra direto da tela inicial" },
    { icon: Shield, title: "Funciona Offline", description: "Use mesmo sem internet" },
    { icon: Bell, title: "Notificações", description: "Alertas importantes em tempo real" },
    { icon: Smartphone, title: "App Nativo", description: "Experiência de aplicativo real" },
  ];

  if (isStandalone || installed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">App Instalado!</h1>
            <p className="text-muted-foreground mb-6">
              O AtentAI já está na sua tela inicial. Aproveite a experiência completa!
            </p>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Ir para o Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold ml-2">Instalar Aplicativo</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* App Preview */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <img src="/logo-atentai.png" alt="AtentAI" className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold mb-2">AtentAI</h2>
          <p className="text-muted-foreground">O Waze dos Impostos Brasileiros</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-border/50">
              <CardContent className="p-4">
                <benefit.icon className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-medium text-sm">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Install Instructions based on device */}
        <Card className="border-primary/20 bg-primary/5 mb-6">
          <CardContent className="p-6">
            {deviceType === "android" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Chrome className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">Instalar no Android</h3>
                </div>
                {deferredPrompt ? (
                  <Button onClick={handleInstall} className="w-full h-12 text-base">
                    <Download className="h-5 w-5 mr-2" />
                    Instalar Aplicativo
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Se o botão de instalação não aparecer:
                    </p>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">1</span>
                        <span>Toque no menu (⋮) do Chrome</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">2</span>
                        <span>Selecione "Adicionar à tela inicial"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">3</span>
                        <span>Confirme tocando em "Adicionar"</span>
                      </li>
                    </ol>
                  </div>
                )}
              </>
            )}

            {deviceType === "ios" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Apple className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">Instalar no iPhone/iPad</h3>
                </div>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Share className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Toque em Compartilhar</p>
                      <p className="text-xs text-muted-foreground">Na barra inferior do Safari</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Tela de Início</p>
                      <p className="text-xs text-muted-foreground">Role e selecione "Adicionar à Tela de Início"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Confirme a instalação</p>
                      <p className="text-xs text-muted-foreground">Toque em "Adicionar" no canto superior</p>
                    </div>
                  </li>
                </ol>
              </>
            )}

            {deviceType === "desktop" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">Instalar no Computador</h3>
                </div>
                {deferredPrompt ? (
                  <Button onClick={handleInstall} className="w-full h-12 text-base">
                    <Download className="h-5 w-5 mr-2" />
                    Instalar Aplicativo
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      No Chrome ou Edge, clique no ícone de instalação na barra de endereço:
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Instalar AtentAI...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Security note */}
        <p className="text-center text-xs text-muted-foreground">
          <Shield className="h-3 w-3 inline mr-1" />
          Seus dados estão protegidos. Nenhum download pesado necessário.
        </p>
      </main>
    </div>
  );
}
