import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Calculator, Brain, LogIn, Shield, Briefcase, Users, LayoutDashboard, Rocket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Navigation menu items - Updated 2026-02-02
  const navItems = [
    { label: "Simulador", icon: Calculator, section: "simulator" },
    { label: "Módulo Fiscal", icon: Shield, section: "fiscal" },
    { label: "BI Contabilidade", icon: Brain, href: "/bi-contabilidade" },
    { label: "Serviços", icon: Briefcase, href: "/servicos" },
    { label: "Seja Afiliado", icon: Users, href: "/afiliado/cadastro" },
  ];

  /**
   * COMEÇAR: Always goes to profile selection (for new users)
   * - If logged in: goes to /comecar (profile selection)
   * - If not logged in: stores redirect and goes to /auth, after auth goes to /comecar
   */
  const handleComecar = () => {
    if (user) {
      // User is logged in, go to profile selection
      navigate('/comecar');
    } else {
      // User is not logged in, save redirect and go to auth
      sessionStorage.setItem('postAuthRedirect', '/comecar');
      navigate('/auth');
    }
  };

  /**
   * ENTRAR: Goes directly to auth or dashboard
   * - If logged in: goes to dashboard
   * - If not logged in: goes to auth page (login form)
   */
  const handleEntrar = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

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

          {/* CTA Buttons - COMEÇAR vs ENTRAR */}
          <div className="hidden md:flex items-center gap-3">
            {/* COMEÇAR - Always visible, goes to profile selection */}
            <Button 
              variant="accent" 
              size="sm" 
              onClick={handleComecar}
              className="shadow-lg shadow-accent/25"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Começar
            </Button>
            
            {!loading && user ? (
              // User is logged in - show Dashboard button
              <Button size="sm" variant="outline" onClick={handleEntrar} className="border-primary/50 text-primary hover:bg-primary/10">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Meu Painel
              </Button>
            ) : (
              // User is not logged in - show Login button
              <Button size="sm" variant="outline" onClick={handleEntrar} className="border-primary/50 text-primary hover:bg-primary/10">
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
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
                {/* COMEÇAR button - mobile */}
                <Button 
                  variant="accent"
                  className="justify-start gap-3 h-12"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleComecar();
                  }}
                >
                  <Rocket className="w-5 h-5" />
                  Começar
                </Button>
                
                {!loading && user ? (
                  // User is logged in - show Dashboard button
                  <Button 
                    variant="outline"
                    className="justify-start gap-3 h-12"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleEntrar();
                    }}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Meu Painel
                  </Button>
                ) : (
                  // User is not logged in - show Login button
                  <Button 
                    variant="outline"
                    className="justify-start gap-3 h-12"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleEntrar();
                    }}
                  >
                    <LogIn className="w-5 h-5" />
                    Entrar
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
