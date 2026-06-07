'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export default function FloatingParticles () {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return;

    // Créer des particules initiales
    const initialParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      color: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#f97316' : '#60a5fa',
    }));

    setParticles(initialParticles);

    // Animation loop
    let animationId: number;
    const animate = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;

          // Rebondir sur les bords
          if (newX <= 0 || newX >= window.innerWidth) {
            particle.speedX *= -1;
            newX = particle.x;
          }
          if (newY <= 0 || newY >= window.innerHeight) {
            particle.speedY *= -1;
            newY = particle.y;
          }

          // Attraction vers la souris
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const force = (100 - distance) / 100;
            newX += dx * force * 0.01;
            newY += dy * force * 0.01;
          }

          return {
            ...particle,
            x: newX,
            y: newY,
          };
        }),
      );

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Gestionnaire de souris
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Gestionnaire de redimensionnement
    const handleResize = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle,
          x: Math.min(particle.x, window.innerWidth),
          y: Math.min(particle.y, window.innerHeight),
        })),
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePosition]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-float"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animationDelay: `${particle.id * 0.2}s`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      {/* Lignes de connexion entre particules proches */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {particles.map((particle, i) =>
          particles.slice(i + 1).map((otherParticle, j) => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              const opacity = Math.max(0, (150 - distance) / 150) * 0.3;

              return (
                <line
                  key={`${i}-${j}`}
                  x1={particle.x}
                  y1={particle.y}
                  x2={otherParticle.x}
                  y2={otherParticle.y}
                  stroke="url(#lineGradient)"
                  strokeWidth={1}
                  opacity={opacity}
                  className="transition-opacity duration-300"
                />
              );
            }
            return null;
          }),
        )}
      </svg>
    </div>
  );
}
