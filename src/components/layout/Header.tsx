import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Calculator, MessageCircle, Users, User, LogIn, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { InstallPWAButton } from "@/components/pwa/InstallPWAPrompt";

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Simulador", icon: Calculator, section: "simulator" },
    { label: "Consultar IA", icon: MessageCircle, section: "ai" },
    { label: "Autônomos", icon: User, href: "/plano/autonomo" },
    { label: "Planos", icon: Users, section: "pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/30 shadow-sm safe-area-top">
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
              className="h-8 sm:h-10 md:h-12 w-auto transition-all duration-300 group-hover:brightness-110"
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              'href' in item ? (
                <Button
                  key={item.label}
                  variant="ghost"
                  asChild
                  className="flex items-center gap-2"
                >
                  <Link to={item.href}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              ) : (
                <Button
                  key={item.section}
                  variant="ghost"
                  onClick={() => onNavigate(item.section)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              )
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <InstallPWAButton />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                'href' in item ? (
                  <Button
                    key={item.label}
                    variant="ghost"
                    asChild
                    className="justify-start gap-3 h-12"
                  >
                    <Link to={item.href} onClick={() => setIsMenuOpen(false)}>
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    key={item.section}
                    variant="ghost"
                    onClick={() => {
                      onNavigate(item.section);
                      setIsMenuOpen(false);
                    }}
                    className="justify-start gap-3 h-12"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                )
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/50">
                <Button 
                  variant="outline"
                  className="justify-start gap-3 h-12"
                  asChild
                >
                  <Link to="/instalar" onClick={() => setIsMenuOpen(false)}>
                    <Download className="w-5 h-5" />
                    Instalar Aplicativo
                  </Link>
                </Button>
                <Button 
                  className="justify-start gap-3 h-12"
                  asChild
                >
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <LogIn className="w-5 h-5" />
                    Entrar / Criar Conta
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
