import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Calendar, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { cn } from "@/lib/utils";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

export function NotificationSettings() {
  const { permission, requestPermission, sendLocalNotification } = usePushNotifications();
  const [isRequesting, setIsRequesting] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "reforma-tributaria",
      label: "🚨 Reforma Tributária",
      description: "Alertas sobre prazos da LC 214/2025 e transição IBS/CBS",
      icon: AlertTriangle,
      enabled: true,
    },
    {
      id: "tax-deadlines",
      label: "Vencimento de Impostos",
      description: "Lembretes 3 dias antes do vencimento",
      icon: Calendar,
      enabled: true,
    },
    {
      id: "declarations",
      label: "Declarações Obrigatórias",
      description: "Alertas de declarações anuais e mensais",
      icon: FileText,
      enabled: true,
    },
    {
      id: "mei-limit",
      label: "Limite MEI",
      description: "Aviso quando próximo do limite de faturamento",
      icon: AlertTriangle,
      enabled: true,
    },
    {
      id: "updates",
      label: "Atualizações Fiscais",
      description: "Mudanças legislativas e novidades",
      icon: Bell,
      enabled: true,
    },
  ]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
  };

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const testNotification = () => {
    sendLocalNotification("AtentAI - Teste", {
      body: "Suas notificações estão funcionando corretamente!",
      tag: "test-notification",
    });
  };

  const isEnabled = permission.status === "granted";
  const isDenied = permission.status === "denied";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notificações
        </CardTitle>
        <CardDescription>
          Receba lembretes sobre prazos fiscais e atualizações importantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className={cn(
          "p-4 rounded-lg flex items-start gap-3",
          isEnabled ? "bg-primary/10" : isDenied ? "bg-destructive/10" : "bg-muted"
        )}>
          {isEnabled ? (
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
          ) : isDenied ? (
            <BellOff className="h-5 w-5 text-destructive mt-0.5" />
          ) : (
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">
              {isEnabled
                ? "Notificações ativadas"
                : isDenied
                ? "Notificações bloqueadas"
                : "Notificações desativadas"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isEnabled
                ? "Você receberá lembretes sobre prazos fiscais"
                : isDenied
                ? "Habilite nas configurações do navegador"
                : "Ative para receber lembretes importantes"}
            </p>
          </div>
          {!isEnabled && !isDenied && (
            <Button
              size="sm"
              onClick={handleRequestPermission}
              disabled={isRequesting}
            >
              {isRequesting ? "Ativando..." : "Ativar"}
            </Button>
          )}
        </div>

        {/* Preferences */}
        {isEnabled && (
          <>
            <div className="space-y-4">
              {preferences.map((pref) => (
                <div
                  key={pref.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <pref.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor={pref.id} className="text-sm font-medium cursor-pointer">
                        {pref.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{pref.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={pref.id}
                    checked={pref.enabled}
                    onCheckedChange={() => togglePreference(pref.id)}
                  />
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={testNotification}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Testar Notificação
            </Button>
          </>
        )}

        {!permission.isSupported && (
          <p className="text-sm text-muted-foreground text-center">
            Seu navegador não suporta notificações push.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
