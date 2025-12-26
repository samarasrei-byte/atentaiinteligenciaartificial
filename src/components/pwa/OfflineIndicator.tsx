import { WifiOff } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground",
      "flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium",
      "animate-slide-down safe-area-top"
    )}>
      <WifiOff className="h-4 w-4" />
      <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
    </div>
  );
}
