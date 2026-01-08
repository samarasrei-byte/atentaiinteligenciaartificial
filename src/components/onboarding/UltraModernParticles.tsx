import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
  pulse: number;
}

const UltraModernParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles with more variety
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 5 + 1,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          opacity: Math.random() * 0.6 + 0.2,
          hue: Math.random() * 80 + 240, // Blue to purple range
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };
    initParticles();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      timeRef.current += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background overlay
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      bgGradient.addColorStop(0, 'rgba(120, 80, 200, 0.02)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        // Pulsing effect
        particle.pulse += 0.02;
        const pulseFactor = 1 + Math.sin(particle.pulse) * 0.3;

        // Mouse interaction with stronger attraction
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 200) {
            const force = (200 - distance) / 200;
            particle.speedX += (dx / distance) * force * 0.03;
            particle.speedY += (dy / distance) * force * 0.03;
          }
        }

        // Update position with wave motion
        particle.x += particle.speedX + Math.sin(timeRef.current + i) * 0.3;
        particle.y += particle.speedY + Math.cos(timeRef.current + i) * 0.3;

        // Damping
        particle.speedX *= 0.98;
        particle.speedY *= 0.98;

        // Add small random movement
        particle.speedX += (Math.random() - 0.5) * 0.03;
        particle.speedY += (Math.random() - 0.5) * 0.03;

        // Wrap around edges smoothly
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        const currentSize = particle.size * pulseFactor;

        // Draw outer glow
        ctx.save();
        ctx.globalAlpha = particle.opacity * 0.3;
        const outerGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, currentSize * 6
        );
        outerGlow.addColorStop(0, `hsla(${particle.hue}, 90%, 65%, 0.4)`);
        outerGlow.addColorStop(0.5, `hsla(${particle.hue}, 90%, 65%, 0.1)`);
        outerGlow.addColorStop(1, `hsla(${particle.hue}, 90%, 65%, 0)`);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize * 6, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();
        ctx.restore();

        // Draw inner glow
        ctx.save();
        ctx.globalAlpha = particle.opacity * 0.6;
        const innerGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, currentSize * 3
        );
        innerGlow.addColorStop(0, `hsla(${particle.hue}, 85%, 70%, 1)`);
        innerGlow.addColorStop(0.6, `hsla(${particle.hue}, 85%, 70%, 0.3)`);
        innerGlow.addColorStop(1, `hsla(${particle.hue}, 85%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = innerGlow;
        ctx.fill();
        ctx.restore();

        // Draw core with white center
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        const coreGradient = ctx.createRadialGradient(
          particle.x - currentSize * 0.3, particle.y - currentSize * 0.3, 0,
          particle.x, particle.y, currentSize
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        coreGradient.addColorStop(0.5, `hsla(${particle.hue}, 80%, 75%, 1)`);
        coreGradient.addColorStop(1, `hsla(${particle.hue}, 80%, 60%, 1)`);
        ctx.fillStyle = coreGradient;
        ctx.fill();
        ctx.restore();

        // Draw connections with gradient
        particlesRef.current.slice(i + 1).forEach(other => {
          const otherDx = particle.x - other.x;
          const otherDy = particle.y - other.y;
          const dist = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
          
          if (dist < 150) {
            ctx.save();
            const lineOpacity = (1 - dist / 150) * 0.2;
            ctx.globalAlpha = lineOpacity;
            
            const lineGradient = ctx.createLinearGradient(
              particle.x, particle.y, other.x, other.y
            );
            lineGradient.addColorStop(0, `hsl(${particle.hue}, 70%, 60%)`);
            lineGradient.addColorStop(1, `hsl(${other.hue}, 70%, 60%)`);
            
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.7 }}
      />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </>
  );
};

export default UltraModernParticles;
