import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20 shadow-sm safe-area-top">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate("hero")}
            className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
          >
            <img 
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-8 sm:h-10 w-auto transition-all duration-300 group-hover:brightness-110"
            />
          </button>

          {/* Desktop - Minimal CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="text-muted-foreground hover:text-foreground"
            >
              <Link to="/auth">
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Link>
            </Button>
            <Button 
              size="sm" 
              asChild 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
            >
              <Link to="/trial-onboarding" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Começar Grátis
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-10 w-10"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Simplified */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/30 animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Button 
                variant="ghost"
                className="justify-start gap-3 h-12"
                asChild
              >
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </Link>
              </Button>
              <Button 
                className="justify-start gap-3 h-12 bg-gradient-to-r from-primary to-primary/80"
                asChild
              >
                <Link to="/trial-onboarding" onClick={() => setIsMenuOpen(false)}>
                  <Sparkles className="w-5 h-5" />
                  Começar Grátis
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
