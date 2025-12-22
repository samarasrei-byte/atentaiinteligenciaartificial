import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Calculator, MessageCircle, Users, BookOpen, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Simulador", icon: Calculator, section: "simulator" },
    { label: "Consultar IA", icon: MessageCircle, section: "ai" },
    { label: "Planos", icon: Users, section: "pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button 
            onClick={() => onNavigate("hero")}
            className="flex items-center gap-2 group"
          >
            <img 
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-14 md:h-20 w-auto"
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.section}
                variant="ghost"
                onClick={() => onNavigate(item.section)}
                className="flex items-center gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </Button>
            <Button variant="hero" size="sm" onClick={() => onNavigate("ai")}>
              Começar Grátis
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.section}
                  variant="ghost"
                  onClick={() => {
                    onNavigate(item.section);
                    setIsMenuOpen(false);
                  }}
                  className="justify-start gap-3"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Button>
              ))}
              <Button 
                variant="ghost" 
                className="mt-2 justify-start gap-3"
                asChild
              >
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
              </Button>
              <Button 
                variant="hero" 
                className="mt-2"
                onClick={() => {
                  onNavigate("ai");
                  setIsMenuOpen(false);
                }}
              >
                Começar Grátis
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
