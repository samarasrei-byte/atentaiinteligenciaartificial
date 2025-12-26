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
  { path: "/perfil", icon: User, label: "Perfil", requiresAuth: true },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Paths where bottom nav should be hidden
  const hiddenPaths = ["/auth", "/onboarding", "/user-type"];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

  const handleNavigation = (item: NavItem) => {
    if (item.requiresAuth && !user) {
      navigate("/auth");
      return;
    }
    navigate(item.path);
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200",
                "active:scale-95 touch-manipulation",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                active && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                active && "font-semibold"
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
