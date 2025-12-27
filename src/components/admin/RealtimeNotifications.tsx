import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlus, 
  CreditCard, 
  Activity, 
  Bell, 
  Volume2, 
  VolumeX,
  Trash2,
  Clock
} from "lucide-react";

interface RealtimeEvent {
  id: string;
  type: "new_user" | "new_subscription" | "subscription_update";
  title: string;
  description: string;
  timestamp: Date;
  data?: any;
}

export function RealtimeNotifications() {
  const { toast } = useToast();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const addEvent = (event: Omit<RealtimeEvent, "id" | "timestamp">) => {
    const newEvent: RealtimeEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setEvents((prev) => [newEvent, ...prev].slice(0, 50));
    playNotificationSound();
    
    toast({
      title: event.title,
      description: event.description,
    });
  };

  const clearEvents = () => {
    setEvents([]);
  };

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleF4OKIGSxLaMNAw0c43Jrq5RIhVNo72XZQ8dQX6n1a2QNQYecJK4vHklCyhxk66xiSsXLHaXuLl4JQ0kdZa5wnQkDid3l7m+cSQOJneYub1wIw8ndpm6vnAjDyd3mLq/cCMPJ3eYur9wIw8nd5i6v3AjDyd3mLq/cCMPJ3eYur9wIw==");
    audioRef.current.volume = 0.5;

    // Subscribe to profiles (new users)
    const profilesChannel = supabase
      .channel("realtime-profiles")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          const profile = payload.new as any;
          addEvent({
            type: "new_user",
            title: "🎉 Novo Usuário Registrado!",
            description: profile.full_name || profile.email || "Novo usuário",
            data: profile,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    // Subscribe to subscriptions
    const subscriptionsChannel = supabase
      .channel("realtime-subscriptions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "subscriptions" },
        (payload) => {
          const sub = payload.new as any;
          const planNames: Record<string, string> = {
            simulator: "Simulador",
            premium: "Premium",
            contador: "Contador Plus",
            autonomo: "Autônomo Master",
          };
          addEvent({
            type: "new_subscription",
            title: "💳 Nova Assinatura!",
            description: `Plano ${planNames[sub.plan_type] || sub.plan_type} ativado`,
            data: sub,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "subscriptions" },
        (payload) => {
          const sub = payload.new as any;
          const oldSub = payload.old as any;
          
          if (oldSub.status !== sub.status) {
            addEvent({
              type: "subscription_update",
              title: "🔄 Atualização de Assinatura",
              description: `Status alterado para ${sub.status}`,
              data: sub,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(subscriptionsChannel);
    };
  }, [soundEnabled]);

  const getEventIcon = (type: RealtimeEvent["type"]) => {
    switch (type) {
      case "new_user":
        return <UserPlus className="h-4 w-4 text-primary" />;
      case "new_subscription":
        return <CreditCard className="h-4 w-4 text-success" />;
      case "subscription_update":
        return <Activity className="h-4 w-4 text-info" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventColor = (type: RealtimeEvent["type"]) => {
    switch (type) {
      case "new_user":
        return "bg-primary/10 border-primary/20";
      case "new_subscription":
        return "bg-success/10 border-success/20";
      case "subscription_update":
        return "bg-info/10 border-info/20";
      default:
        return "bg-muted/50";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Notificações em Tempo Real</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={isConnected ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}
            >
              <span className={`w-2 h-2 rounded-full mr-1.5 ${isConnected ? "bg-success animate-pulse" : "bg-destructive"}`} />
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-8 w-8"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearEvents}
              className="h-8 w-8"
              disabled={events.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Receba alertas instantâneos sobre novos usuários e assinaturas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Aguardando eventos em tempo real...
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Novos usuários e assinaturas aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${getEventColor(event.type)} animate-in fade-in slide-in-from-top-2 duration-300`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {event.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
