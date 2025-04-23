import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = [
  "co-founder",
  "investor",
  "employer",
  "hire",
  "co-founder",
  "motivator",
  "coach",
  "inspiration",
  "biggest supporter",
  "wingman",
  "tutor",
  "coder",
  "teammate",
  "big brother",
  "mentor",
  "life changer",
  "life saver",
  "best friend",
  "___"
];

const TYPING_SPEED = 60; // milliseconds per character
const WORD_DISPLAY_TIME = 2000; // how long to show completed word

export const RollingWord = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const wordTimeout = useRef<NodeJS.Timeout | null>(null);

  const typeWord = useCallback((word: string) => {
    let i = 0;
    setDisplayText('');

    const type = () => {
      if (i < word.length) {
        setDisplayText(word.slice(0, i + 1));
        i++;
        typingTimeout.current = setTimeout(type, TYPING_SPEED);
      }
    };

    type();
  }, []);

  useEffect(() => {
    const nextWord = () => {
      const word = words[currentIndex];
      typeWord(word);
      
      wordTimeout.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }, WORD_DISPLAY_TIME);
    };

    nextWord();

    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      if (wordTimeout.current) {
        clearTimeout(wordTimeout.current);
      }
    };
  }, [currentIndex, typeWord]);

  return (
    <div className="inline-block min-w-[180px] text-xl sm:text-2xl font-medium">
      {displayText}
      <motion.div
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="inline-block"
      >
        _
      </motion.div>
    </div>
  );
};