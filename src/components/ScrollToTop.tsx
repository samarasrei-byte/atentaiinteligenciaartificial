import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - Componente que faz scroll para o topo da página em cada navegação
 * Garante experiência consistente ao mudar de página
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll instantâneo para o topo ao mudar de rota
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [pathname]);

  return null;
}
