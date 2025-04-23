import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronRight as ChessKnight, Paintbrush, Sparkles, Brain, Heart } from 'lucide-react';

const questions = [
  { 
    id: 'dream',
    label: "What was your childhood dream?",
    type: 'text',
    examples: [
      "To start a business",
      "Obtain financial freedom",
      "Get rich and famous",
      "Become president",
      "Build meaningful connections",
      "Play Professional",
      "Create innovative technology",
      "Figure it out",
      "Become world leader",
      "Build a sustainable business",
      "Impact education globally",
      "Revolutionize an industry",
      "Create art that moves people",
      "Solve climate change",
      "Build a loving family",
      "Help others succeed",
      "Make scientific discoveries",
      "Write a bestselling book",
      "Create a social movement",
      "Build a tech startup",
      "Change people's lives",
      "Lead a global company"
    ]
  },
  { 
    id: 'struggle',
    label: "Who would you have gone to for help?",
    type: 'text',
    examples: [
      "God",
      "Myself",
      "Someone like me",
      "A Co-founder",
      "A realist",
      "Another athlete",
      "Someone who can help",
      "Someone in my town",
      "A partner",
      "A parent",
      "Someone wise",
      "An investor",
      "A mentor",
      "Someone nearby",
      "Study buddies",
      "An educator",
      "Someone experienced",
      "Anyone interested",
      "Someone who's been there",
      "A friend of a friend",
      "Someone who understands",
      "A listening ear",
      "An accountability partner",
      "Someone to brainstorm with",
      "My next boss",
      "Someone who shares my goals",
      "A practice partner",
      "Someone to learn from"
    ]
  },
  {
    id: 'personality',
    label: "What best describes you?",
    type: 'icon',
    options: [
      { 
        personality: 'Analytical',
        name: 'Vera',
        colorCode: '#95A5A6'
      },
      { 
        personality: 'Creative',
        name: 'Jaren',
        colorCode: '#4ECDC4'
      },
      { 
        personality: 'Optimistic',
        name: 'Jess',
        colorCode: '#FFD93D'
      },
      { 
        personality: 'Intuitive',
        name: 'Pat',
        colorCode: '#6C5CE7'
      },
      { 
        personality: 'Passionate',
        name: 'Alex',
        colorCode: '#FF6B6B'
      }
    ]
  }
];

export const Survey = ({ onComplete, onBack, onLearnMore }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showBubbleAnimation, setShowBubbleAnimation] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePersonalityChange = (direction) => {
    const options = questions[2].options;
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentPersonality + 1) % options.length;
    } else {
      newIndex = currentPersonality - 1;
      if (newIndex < 0) newIndex = options.length - 1;
    }
    setCurrentPersonality(newIndex);
    setAnswers(prev => ({
      ...prev,
      [questions[2].id]: options[newIndex].personality
    }));
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    const currentQ = questions[currentQuestion];
    if (!currentQ) return;

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        const selectedOption = questions[2].options.find(opt => 
          answers[questions[2].id] === opt.personality
        );
        
        if (selectedOption) {
          onComplete({
            ...answers,
            personality: selectedOption.personality,
            colorName: selectedOption.name,
            colorCode: selectedOption.colorCode
          });
        }
      }
      setIsTransitioning(false);
    }, 500);
  };

  const handleBack = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    setTimeout(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      onBack();
    }
    setIsTransitioning(false);
    }, 500);
  };

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;
  
  const isComplete = answers[currentQ.id]?.trim();

  const getPersonalityDescription = (personality) => {
    const descriptions = {
      'Analytical': 'Logical Problem Solver',
      'Creative': 'Imaginative Thinker',
      'Optimistic': 'Positive Visionary',
      'Intuitive': 'Naturally Insightful',
      'Passionate': 'Purpose Driven'
    };
    return descriptions[personality] || '';
  };

  return (
    <motion.div
      className="w-full max-w-2xl px-8 md:px-12 lg:px-16"
      initial={{ opacity: 0 }}
      animate={showBubbleAnimation ? {
        scale: [1, 1.2, 0],
        opacity: [1, 1, 0],
        filter: ["blur(0px)", "blur(4px)", "blur(12px)"]
      } : { opacity: 1 }}
      transition={showBubbleAnimation ? {
        duration: 0.5,
        times: [0, 0.3, 1],
        ease: "easeInOut"
      } : { duration: 0.5 }}
      onAnimationComplete={() => {
        if (showBubbleAnimation) {
          onComplete(answers);
        }
      }}
    >
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-black/5 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <motion.div
        key={currentQ.id}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <label className="block text-2xl font-medium">{currentQ.label}</label>
        
        {currentQ.type === 'text' && (
          <>
            <input
              type="text"
              className="input-field text-lg"
              value={answers[currentQ.id] || ''}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [currentQ.id]: e.target.value
              }))}
            />

            {currentQ.examples && (
              <div className="relative">
                <div className="overflow-x-auto pb-4 hide-scrollbar">
                  <div className="flex gap-4 w-max">
                    {currentQ.examples.map((example, index) => (
                      <motion.div
                        key={example}
                        data-example={example}
                        className="text-black/70 p-4 rounded-lg border border-black/10 hover:border-black/30 survey-option cursor-pointer whitespace-nowrap flex-shrink-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          if (isTransitioning) return;
                          setAnswers(prev => ({
                            ...prev,
                            [currentQ.id]: example
                          }));
                        }}
                      >
                        {example}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <motion.button
              className="button-primary mt-8"
              onClick={handleNext}
              disabled={!isComplete || isTransitioning}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: isComplete ? 1 : 0.5 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </>
        )}

        {currentQ.type === 'icon' && (
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
            {questions[2].options.map((option, index) => (
              <motion.button
                key={option.personality}
                onClick={() => {
                  setAnswers(prev => ({
                    ...prev,
                    [currentQ.id]: option.personality
                  }));
                  // Pass complete option data to onComplete
                  onComplete({
                    ...answers,
                    [currentQ.id]: option.personality,
                    personality: option.personality,
                    colorName: option.name,
                    colorCode: option.colorCode
                  });
                  handleNext();
                }}
                className={`relative rounded-xl p-4 flex items-center gap-6 survey-option w-full ${
                  answers[currentQ.id] === option.personality 
                    ? 'bg-black/5 border-2 border-black/20 py-4' 
                    : 'hover:bg-black/5 border-2 border-transparent py-4'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  src={index === 0 
                    ? "https://qdcgqxijycvoetblfnji.supabase.co/storage/v1/object/sign/3/Memoji%20Vera.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiIzL01lbW9qaSBWZXJhLnBuZyIsImlhdCI6MTc0MTc4MTI2NCwiZXhwIjoxNzczMzE3MjY0fQ.t5tbo0IHEqDSOpINiLg_EokVH9wRKVeDXjHQgwpzJzY"
                    : index === 2
                    ? "https://qdcgqxijycvoetblfnji.supabase.co/storage/v1/object/sign/4/Memoji%20(3).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiI0L01lbW9qaSAoMykucG5nIiwiaWF0IjoxNzQxNzgyMTAxLCJleHAiOjE3NzMzMTgxMDF9.vcEA0ZpiEErvhC0bJoc43_rt8fdsmdJL_DUiHbgqaJ0"
                    : index === 3
                    ? "https://qdcgqxijycvoetblfnji.supabase.co/storage/v1/object/sign/5/Memoji%20(2).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiI1L01lbW9qaSAoMikucG5nIiwiaWF0IjoxNzQxNzgyMjQwLCJleHAiOjE3NzMzMTgyNDB9.oFJQtk7sDE4083JO3UI1md6HdWE3Cg0hMKQBWjx383U"
                    : index === 1
                    ? "https://qdcgqxijycvoetblfnji.supabase.co/storage/v1/object/sign/8/Memoji%20(5).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiI4L01lbW9qaSAoNSkucG5nIiwiaWF0IjoxNzQxNzgyNjg5LCJleHAiOjE3NzMzMTg2ODl9.PecFsOw4kjKWBI_e39ZTzrIwe2SUUllE_1Al0cPdXCc"
                    : "https://qdcgqxijycvoetblfnji.supabase.co/storage/v1/object/sign/7/Memoji%20(4).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiI3L01lbW9qaSAoNCkucG5nIiwiaWF0IjoxNzQxNzgyNTE0LCJleHAiOjE3NzMzMTg1MTR9.v6V_QasGUagWuxp9aR5l238L8IikaL6XEKG7l9oSBoY"
                  }
                  alt={`${option.personality} Memoji`}
                  className="w-12 h-12 object-contain flex-shrink-0"
                />
                <div className="flex flex-col items-start gap-1">
                  <p className="text-base font-medium">
                    {option.name}
                  </p>
                  <p className="text-xs text-black/70">
                    {getPersonalityDescription(option.personality)}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};