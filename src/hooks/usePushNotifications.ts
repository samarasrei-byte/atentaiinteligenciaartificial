import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NotificationPermission {
  status: "default" | "granted" | "denied";
  isSupported: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>({
    status: "default",
    isSupported: false,
  });
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = "Notification" in window && "serviceWorker" in navigator;
    
    setPermission({
      status: isSupported ? (Notification.permission as "default" | "granted" | "denied") : "denied",
      isSupported,
    });

    // Check if already subscribed
    if (isSupported && Notification.permission === "granted") {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!permission.isSupported) {
      toast.error("Notificações não são suportadas neste navegador");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission((prev) => ({ ...prev, status: result }));

      if (result === "granted") {
        toast.success("Notificações ativadas com sucesso!");
        return true;
      } else if (result === "denied") {
        toast.error("Permissão de notificações negada");
      }
      return false;
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("Erro ao solicitar permissão de notificações");
      return false;
    }
  }, [permission.isSupported]);

  const sendLocalNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission.status !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      try {
        const notification = new Notification(title, {
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    },
    [permission.status]
  );

  // Schedule a notification for tax deadlines
  const scheduleTaxReminder = useCallback(
    (taxName: string, dueDate: Date, daysBefore: number = 3) => {
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);

      const now = new Date();
      const timeDiff = reminderDate.getTime() - now.getTime();

      if (timeDiff > 0) {
        setTimeout(() => {
          sendLocalNotification(`Lembrete: ${taxName}`, {
            body: `O prazo para ${taxName} vence em ${daysBefore} dias (${dueDate.toLocaleDateString("pt-BR")})`,
            tag: `tax-reminder-${taxName}`,
            requireInteraction: true,
          });
        }, timeDiff);

        return true;
      }
      return false;
    },
    [sendLocalNotification]
  );

  // Common tax deadlines for MEI and small businesses
  const getMEIDeadlines = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return [
      {
        name: "DAS-MEI",
        description: "Pagamento do DAS mensal",
        day: 20,
        monthly: true,
      },
      {
        name: "DASN-SIMEI",
        description: "Declaração Anual do MEI",
        dueDate: new Date(currentYear, 4, 31), // May 31st
        annual: true,
      },
    ];
  };

  const getAutonomoDeadlines = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    return [
      {
        name: "Carnê-Leão",
        description: "Recolhimento mensal do IR",
        day: 30,
        monthly: true,
      },
      {
        name: "IRPF",
        description: "Declaração de Imposto de Renda",
        dueDate: new Date(currentYear, 3, 30), // April 30th
        annual: true,
      },
    ];
  };

  return {
    permission,
    isSubscribed,
    requestPermission,
    sendLocalNotification,
    scheduleTaxReminder,
    getMEIDeadlines,
    getAutonomoDeadlines,
  };
}
