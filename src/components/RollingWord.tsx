import { useEffect, useState } from 'react';

interface RollingWordProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseBetweenWords?: number;
}

export const RollingWord: React.FC<RollingWordProps> = ({
  words = [],
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseBetweenWords = 1500,
}) => {
  const [displayText, setDisplayText] = useState('_');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (words.length === 0) return;
    
    const currentWord = words[currentWordIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      // Typing effect
      if (displayText.replace('_', '').length < currentWord.length) {
        timeout = setTimeout(() => {
          const newText = currentWord.substring(0, displayText.length) + '_';
          setDisplayText(newText);
        }, typingSpeed);
      } else {
        // Pause at the end of typing
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, pauseBetweenWords);
      }
    } else {
      // Deleting effect
      if (displayText.length > 1) { // Keep at least the underscore
        timeout = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, deletingSpeed);
      } else {
        // Move to next word when done deleting
        setCurrentWordIndex((currentWordIndex + 1) % words.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentWordIndex, isTyping, words, typingSpeed, deletingSpeed, pauseBetweenWords]);

  // Calculate the width of the widest word to prevent layout shift
  const maxWidth = Math.max(...words.map(word => word.length)) * 0.6; // Approximate width in rem

  return (
    <span 
      className="inline-block text-center"
      style={{ 
        minWidth: `${maxWidth}rem`,
      }}
    >
      {displayText}
    </span>
  );
};

export default RollingWord;
