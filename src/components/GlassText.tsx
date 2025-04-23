import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  char: string;
  velocity: {
    x: number;
    y: number;
  };
  rotation: number;
}

interface GlassTextProps {
  text: string;
  onShatterComplete?: () => void;
  isShattered: boolean;
}

export const GlassText = ({ text, onShatterComplete, isShattered }: GlassTextProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hasShattered, setHasShattered] = useState(false);

  useEffect(() => {
    if (isShattered && !hasShattered) {
      setHasShattered(true);
      const chars = text.split('');
      const newParticles = chars.map((char, i) => ({
        char,
        x: 0,
        y: 0,
        velocity: {
          x: (Math.random() - 0.5) * 15,
          y: (Math.random() - 0.5) * 10 - 5
        },
        rotation: Math.random() * 360
      }));
      setParticles(newParticles);

      setTimeout(() => {
        onShatterComplete?.();
      }, 1000);
    }
  }, [isShattered, text, onShatterComplete]);

  if (!isShattered) {
    return (
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="relative inline-block"
      >
        {text}
      </motion.span>
    );
  }

  return (
    <span className="relative inline-block">
      {particles.map((particle, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: particle.velocity.x * 50,
            y: particle.velocity.y * 50,
            rotate: particle.rotation,
            opacity: 0
          }}
          transition={{
            duration: 1,
            ease: [0.23, 1, 0.32, 1]
          }}
          className="absolute inline-block origin-center text-black/40 pointer-events-none"
          style={{ WebkitFontSmoothing: 'subpixel-antialiased' }}
        >
          {particle.char}
        </motion.span>
      ))}
    </span>
  );
};