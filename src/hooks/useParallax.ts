import { useEffect, useState, useRef, RefObject } from 'react';

interface ParallaxConfig {
  speed?: number; // -1 to 1, negative moves opposite to scroll
  offset?: number; // Starting offset in pixels
  clamp?: boolean; // Whether to clamp values
}

interface ParallaxResult {
  ref: RefObject<HTMLElement>;
  style: {
    transform: string;
  };
  y: number;
  progress: number; // 0 to 1 based on element visibility
}

export function useParallax(config: ParallaxConfig = {}): ParallaxResult {
  const { speed = 0.2, offset = 0, clamp = true } = config;
  const ref = useRef<HTMLElement>(null);
  const [y, setY] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is through the viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Calculate parallax offset
      let parallaxY = distanceFromCenter * speed + offset;
      
      if (clamp) {
        parallaxY = Math.max(-200, Math.min(200, parallaxY));
      }
      
      setY(parallaxY);
      
      // Calculate progress (0 = bottom of viewport, 1 = top of viewport)
      const elementProgress = 1 - (rect.top / (windowHeight + rect.height));
      setProgress(Math.max(0, Math.min(1, elementProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, offset, clamp]);

  return {
    ref: ref as RefObject<HTMLElement>,
    style: {
      transform: `translateY(${y}px)`,
    },
    y,
    progress,
  };
}

// Hook for multiple parallax layers
export function useMultiLayerParallax(layerSpeeds: number[]): {
  containerRef: RefObject<HTMLElement>;
  layers: { transform: string; opacity: number }[];
} {
  const containerRef = useRef<HTMLElement>(null);
  const [layers, setLayers] = useState(
    layerSpeeds.map(() => ({ transform: 'translateY(0px)', opacity: 1 }))
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollProgress = -rect.top / windowHeight;

      const newLayers = layerSpeeds.map((speed, index) => {
        const y = scrollProgress * speed * 100;
        const opacity = Math.max(0, Math.min(1, 1 - Math.abs(scrollProgress * 0.3)));
        return {
          transform: `translateY(${y}px)`,
          opacity: index === 0 ? 1 : opacity,
        };
      });

      setLayers(newLayers);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [layerSpeeds]);

  return { containerRef: containerRef as RefObject<HTMLElement>, layers };
}

// Hook for fade in on scroll with parallax
export function useScrollFadeParallax(config: {
  fadeStart?: number;
  fadeEnd?: number;
  parallaxSpeed?: number;
} = {}): {
  ref: RefObject<HTMLElement>;
  style: {
    opacity: number;
    transform: string;
  };
} {
  const { fadeStart = 0.1, fadeEnd = 0.3, parallaxSpeed = 0.1 } = config;
  const ref = useRef<HTMLElement>(null);
  const [style, setStyle] = useState({ opacity: 0, transform: 'translateY(40px)' });

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top / windowHeight;
      
      // Calculate opacity based on position
      let opacity = 0;
      if (elementTop < 1 - fadeStart) {
        opacity = Math.min(1, (1 - fadeStart - elementTop) / (fadeEnd - fadeStart));
      }
      
      // Calculate parallax Y
      const parallaxY = Math.max(0, (elementTop - 0.5) * 100 * parallaxSpeed);
      
      setStyle({
        opacity: Math.max(0, Math.min(1, opacity)),
        transform: `translateY(${parallaxY}px)`,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [fadeStart, fadeEnd, parallaxSpeed]);

  return { ref: ref as RefObject<HTMLElement>, style };
}
