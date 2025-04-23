import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const memojis = [
  {
    url: 'https://stackblitz.com/storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMHlwVXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--170b02c2cf39ddaa0ff31eafc771e39e8ec059ce/seriesfav.jpeg',
    color: '#6C5CE7',
    scale: 0.8
  },
  {
    url: 'https://stackblitz.com/storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMHlwVXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--170b02c2cf39ddaa0ff31eafc771e39e8ec059ce/seriesfav.jpeg',
    color: '#4ECDC4',
    scale: 0.7
  },
  {
    url: 'https://stackblitz.com/storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMHlwVXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--170b02c2cf39ddaa0ff31eafc771e39e8ec059ce/seriesfav.jpeg',
    color: '#FFD93D',
    scale: 0.9
  },
  {
    url: 'https://stackblitz.com/storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMHlwVXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--170b02c2cf39ddaa0ff31eafc771e39e8ec059ce/seriesfav.jpeg',
    color: '#FF6B6B',
    scale: 0.75
  }
];

const getRandomPosition = () => ({
  x: Math.random() * (window.innerWidth - 100),
  y: Math.random() * (window.innerHeight - 100),
  rotation: Math.random() * 360
});

interface MemojiProps {
  src: string;
  color: string;
  scale: number;
  delay: number;
}

const Memoji = ({ src, color, scale, delay }: MemojiProps) => {
  const [position, setPosition] = useState(getRandomPosition());

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(getRandomPosition());
    }, Math.random() * 8000 + 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute"
      initial={{
        x: position.x,
        y: position.y,
        scale: 0,
        rotate: position.rotation,
        opacity: 0
      }}
      animate={{
        x: position.x,
        y: position.y,
        scale,
        rotate: position.rotation,
        opacity: 0.8
      }}
      transition={{
        delay,
        duration: 10,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror"
      }}
    >
      <div 
        className="relative w-32 h-32 rounded-full"
        style={{ 
          background: `linear-gradient(45deg, ${color}22, ${color}11)`,
          boxShadow: `0 12px 48px ${color}33`,
          border: `2px solid ${color}22`
        }}
      >
        <motion.img
          src={src}
          className="absolute inset-0 w-full h-full object-cover rounded-full select-none"
          style={{ mixBlendMode: 'multiply' }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 6,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      </div>
    </motion.div>
  );
};

export const FloatingMemojis = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {memojis.map((memoji, index) => (
        <Memoji 
          key={index} 
          src={memoji.url} 
          color={memoji.color}
          scale={memoji.scale}
          delay={index * 0.8}
        />
      ))}
    </div>
  );
};