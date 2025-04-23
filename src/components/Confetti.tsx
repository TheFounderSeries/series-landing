import { useState, useEffect, useRef } from 'react';

interface ConfettiProps {
  x: number;
  y: number;
}

export const Confetti = ({ x, y }: ConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [shouldRemove, setShouldRemove] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#95A5A6'];
    const particleCount = 50; // Reduced count per burst

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 8 + 4;
      particles.push({
        x,
        y,
        size,
        speedX: (Math.random() - 0.5) * 15,
        speedY: (Math.random() - 0.5) * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
      });
    }

    let frame = 0;
    const maxFrames = 120;

    // Start animation
    const animate = () => {
      if (frame >= maxFrames) {
        setShouldRemove(true);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();

        particle.x += particle.speedX;
        particle.y += particle.speedY + 1;
        particle.speedY += 0.1;
        particle.rotation += particle.rotationSpeed;
      });

      frame++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [x, y]);

  if (shouldRemove) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};