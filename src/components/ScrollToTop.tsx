import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - Componente que faz scroll para o topo da página em cada navegação
 * Garante experiência consistente ao mudar de página e na primeira carga
 * Usa behavior: 'instant' para evitar animação e garantir scroll imediato
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  // useLayoutEffect para garantir scroll antes da renderização visual
  useLayoutEffect(() => {
    // Força scroll para o topo imediatamente com behavior instant
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  // Também executa na montagem inicial do componente
  useEffect(() => {
    // Scroll imediato na montagem
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return null;
}
