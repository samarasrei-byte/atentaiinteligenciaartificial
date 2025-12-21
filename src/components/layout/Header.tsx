import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Calculator, MessageCircle, Users, BookOpen } from "lucide-react";

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Simulador", icon: Calculator, section: "simulator" },
    { label: "Consultar IA", icon: MessageCircle, section: "ai" },
    { label: "Contador", icon: Users, section: "accountant" },
    { label: "FAQ", icon: BookOpen, section: "faq" },
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">TRIBUTAR</span>
            </span>
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

          {/* CTA Button */}
          <div className="hidden md:block">
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
