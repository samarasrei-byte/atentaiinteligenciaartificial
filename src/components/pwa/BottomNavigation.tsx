import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calculator, Bot, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/simulador", icon: Calculator, label: "Simular" },
  { path: "/ai-chat", icon: Bot, label: "IA" },
  { path: "/dashboard", icon: Bell, label: "Painel", requiresAuth: true },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Paths where bottom nav should be hidden
  const hiddenPaths = [
    "/auth", 
    "/onboarding", 
    "/user-type", 
    "/autonomo-onboarding", 
    "/contador-onboarding",
    "/comecar",
    "/admin",
    "/checkout"
  ];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

  const handleNavigation = (item: NavItem) => {
    if (item.requiresAuth && !user) {
      navigate("/auth");
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    navigate(item.path);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-[72px] px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item)}
              className={cn(
                // Aumentado touch target: min-w-16 (64px) e min-h-16 (64px)
                "flex flex-col items-center justify-center flex-1 min-w-16 min-h-16 gap-1 transition-all duration-200",
                "active:scale-95 touch-manipulation select-none",
                "-webkit-tap-highlight-color-transparent",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-200",
                active && "bg-primary/15 shadow-sm"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-all duration-200 leading-tight",
                active && "font-semibold text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
