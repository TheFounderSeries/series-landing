import { useEffect, useState } from 'react';

interface RollingWordProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseBetweenWords?: number;
  pauseAtEnd?: number;
}

export const RollingWord: React.FC<RollingWordProps> = ({
  words = [],
  typingSpeed = 70,
  deletingSpeed = 30,
  pauseBetweenWords = 1500,
  pauseAtEnd = 6000,
}) => {
  const [displayText, setDisplayText] = useState('_');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [pauseBeforeDelete, setPauseBeforeDelete] = useState(false);

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
        // When typing is complete, always pause before deleting
        setPauseBeforeDelete(true);
        setIsTyping(false);
      }
    } else if (pauseBeforeDelete) {
      // Wait for the pause before starting to delete
      const pauseTime = currentWordIndex === words.length - 1 ? pauseAtEnd : pauseBetweenWords;
      timeout = setTimeout(() => {
        setPauseBeforeDelete(false);
      }, pauseTime);
    } else {
      // Deleting effect
      if (displayText.length > 1) { // Keep at least the underscore
        timeout = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, deletingSpeed);
      } else {
        // Move to next word
        const nextIndex = (currentWordIndex + 1) % words.length;
        setCurrentWordIndex(nextIndex);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentWordIndex, isTyping, words, typingSpeed, deletingSpeed, pauseBetweenWords, pauseAtEnd, pauseBeforeDelete]);

  // Calculate the width of the widest word to prevent layout shift
  const maxWidth = Math.max(...words.map(word => word.length)) * 0.6; // Approximate width in rem

  return (
    <span 
      className="inline-block text-center text-3xl"
      style={{ 
        minWidth: `${maxWidth}rem`,
      }}
    >
      {displayText}
    </span>
  );
};

export default RollingWord;