import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - Componente que faz scroll para o topo da página em cada navegação
 * Garante experiência consistente ao mudar de página e na primeira carga
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  // useLayoutEffect para garantir scroll antes da renderização visual
  useLayoutEffect(() => {
    // Força scroll para o topo imediatamente
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  // Também executa na montagem inicial do componente
  useEffect(() => {
    // Pequeno delay para garantir que funcione após hidratação
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
