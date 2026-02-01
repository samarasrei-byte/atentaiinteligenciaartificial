import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Calculator, Brain, LogIn, Shield, Briefcase, Users, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  // Navigation menu items - Updated 2026-01-28
  const navItems = [
    { label: "Simulador", icon: Calculator, section: "simulator" },
    { label: "Módulo Fiscal", icon: Shield, section: "fiscal" },
    { label: "BI Contabilidade", icon: Brain, href: "/bi-contabilidade" },
    { label: "Serviços", icon: Briefcase, href: "/servicos" },
    { label: "Seja Afiliado", icon: Users, href: "/afiliado/cadastro" },
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

          {/* CTA Buttons - Show different options based on auth state */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="border-primary/50 text-primary hover:bg-primary/10">
              <Link to="/planos-perfil" className="flex items-center gap-2">
                Ver Planos
              </Link>
            </Button>
            
            {!loading && user ? (
              // User is logged in - show Dashboard button
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Meu Painel
                </Link>
              </Button>
            ) : (
              // User is not logged in - show Login button
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                <Link to="/auth" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
              </Button>
            )}
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
                {!loading && user ? (
                  // User is logged in - show Dashboard button
                  <Button 
                    className="justify-start gap-3 h-12"
                    asChild
                  >
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard className="w-5 h-5" />
                      Meu Painel
                    </Link>
                  </Button>
                ) : (
                  // User is not logged in - show Login button
                  <Button 
                    className="justify-start gap-3 h-12"
                    asChild
                  >
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="w-5 h-5" />
                      Entrar / Criar Conta
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
