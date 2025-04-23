import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassText } from './GlassText';

const words = [
  "relationships",
  "networking",
  "partnerships",
  "friendships",
  "goal chasing",
  "communication",
  "mindsets",
  "life"
];

interface RotatingTextProps {
  onShatterComplete?: () => void;
  shouldShatter?: boolean;
}

export const RotatingText = ({ onShatterComplete, shouldShatter }: RotatingTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === words.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <motion.div
        className="h-8 relative flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {words.map((word, index) => (
          <motion.span
            key={word}
            className="absolute text-xl font-medium tracking-tight whitespace-nowrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: currentIndex === index ? 1 : 0,
              y: currentIndex === index ? 0 : 20
            }}
            transition={{ duration: 0.5 }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>

      <motion.p
        className="text-4xl font-bold tracking-tight whitespace-nowrap flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          className="inline-block"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
        >
          meet your next
        </motion.span>
        <span className="inline-block ml-1">
          <GlassText text="friend" isShattered={shouldShatter} onShatterComplete={onShatterComplete} />
        </span>
      </motion.p>
    </div>
  );
};