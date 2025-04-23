import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Timer } from 'lucide-react';

const QUESTION_TIMER = 10;

const questions = [
  {
    id: 'mcq1',
    question: "Your friend says they need help getting a coffee with their crush. What's your reply?",
    options: [
      '"You need to build enough confidence to do it yourself!"',
      '"Let me see which one of my friends knows them so I can put in a word."',
      '"Only if they\'re buying me coffee too."',
      '"Already DM\'d them. Check your inbox."'
    ]
  },
  {
    id: 'mcq2',
    question: "You're offered to rejoin a mentor's successful startup, but your friend's startup needs a co-founder. What do you do?",
    options: [
      '"Take the successful startup offer - it will pay us all off."',
      '"Join your friend\'s startup because you believe in their vision."',
      '"Try to find someone just as good and accept the offer."',
      '"Ask for 50/50 company splits."'
    ]
  },
  {
    id: 'mcq3',
    question: "If you had to spend $100,000 in 24 hours, what would you do?",
    options: [
      '"Take the money, delete all social media, and disappear to a remote island"',
      '"Invest in index funds and wait 15-20 years"',
      '"Bet big on Tesla."',
      '"Host a city-wide scavenger hunt with cash prizes to grow a personal brand."'
    ]
  }
];

interface EduSurveyProps {
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export const EduSurvey = ({ onComplete, onBack }: EduSurveyProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMER);
  
  useEffect(() => {
    setProgress((currentQuestion / questions.length) * 100);
  }, [currentQuestion]);

  useEffect(() => {
    setTimeLeft(QUESTION_TIMER); // Reset timer when question changes

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-select first option when time runs out
          handleOptionSelect(questions[currentQuestion].options[0]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleOptionSelect = (answer: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answer
    }));

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        onComplete({ ...answers, [questions[currentQuestion].id]: answer });
      }
      setIsTransitioning(false);
    }, 500);
  };
  
  // Guard against invalid question index
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  return (
    <div className="w-full max-w-2xl mx-auto relative px-8 md:px-12 lg:px-16">
      <motion.div 
        className="h-1 bg-black absolute top-0 left-0"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />

      <div className="flex justify-between items-center mb-12 mt-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-black/60" />
          <span 
            className={`text-sm font-medium ${timeLeft <= 3 ? 'text-red-500' : 'text-black/60'}`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="relative">
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          {currentQ.question}
        </h2>

        <div className="grid grid-cols-1 gap-4 mt-8">
          {currentQ.options.map((option) => (
            <motion.button
              key={option}
              onClick={() => handleOptionSelect(option)}
              data-option={option}
              className="w-full p-6 text-left rounded-xl border-2 border-black/10 hover:border-black/30 survey-option"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isTransitioning}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </motion.div>
      </div>
    </div>
  );
};