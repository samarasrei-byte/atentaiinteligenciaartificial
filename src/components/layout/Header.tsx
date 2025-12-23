import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Calculator, MessageCircle, Users, User, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border/30 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18">
          {/* Logo */}
          <button 
            onClick={() => onNavigate("hero")}
            className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
          >
            <img 
              src="/logo-atentai.png" 
              alt="AtentAI" 
              className="h-10 sm:h-12 md:h-14 w-auto transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-lg"
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
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
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
                'href' in item ? (
                  <Button
                    key={item.label}
                    variant="ghost"
                    asChild
                    className="justify-start gap-3"
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
                    className="justify-start gap-3"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                )
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
