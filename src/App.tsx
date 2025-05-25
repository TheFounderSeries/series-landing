import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useCallback } from 'react';
import { Logo } from './components/Logo';
import { ArrowLeft, ArrowRight, Phone, Copy, Check, Share2 } from 'lucide-react';
import { RotatingText } from './components/RotatingText';
import { LoadingOverlay } from './components/LoadingOverlay';
import { RollingWord } from './components/RollingWord';
import { RollingText } from './components/RollingText';
import { Survey } from './components/Survey';
import { EduCheck } from './components/EduCheck';
import { EduSurvey } from './components/EduSurvey';
import { AboutPanels } from './components/AboutPanels';
import { Confetti } from './components/Confetti';
import { VideoEmbed } from './components/VideoEmbed';
import { supabase } from './lib/supabase';

const slides = {
  WELCOME: 'welcome',
  LOADING: 'loading',
  SURVEY: 'survey',
  EDU_SURVEY: 'edu-survey',
  SCORING: 'scoring',
  EDU_CHECK: 'edu-check',
  FINAL_LOADING: 'final-loading',
  MEET_VERA: 'meet-vera',
  MANIFESTO: 'manifesto'
};

const headingVariants = {
  initial: { 
    filter: 'blur(8px)',
    opacity: 0,
    x: 0
  },
  animate: {
    filter: 'blur(0px)',
    opacity: 1,
    x: 0,
    transition: {
      filter: { duration: 0.01, delay: 0.2 },
      opacity: { duration: 0.3, delay: 0.2 }
    }
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const slideVariants = {
  enter: {
    x: 100,
    opacity: 0
  },
  center: {
    x: 0,
    opacity: 1
  },
  exit: {
    x: -100,
    opacity: 0
  }
};

const App = () => {
  const [currentSlide, setCurrentSlide] = useState(slides.WELCOME);
  const [scrollProgress, setScrollProgress] = useState(0);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [previousSlide, setPreviousSlide] = useState(slides.WELCOME);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [answers, setAnswers] = useState<{
    dream?: string;
    struggle?: string;
    personality?: string;
    colorName?: string;
    eduEmail?: string;
    colorCode?: string;
  }>({
    personality: 'Creative',
    colorCode: '#4ECDC4',
    colorName: 'Teal'
  });
  const [showSurvey, setShowSurvey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [matchingWords, setMatchingWords] = useState(['transcend', 'cultivate']);
  const [selectedColor, setSelectedColor] = useState('#4ECDC4');
  const [showConfetti, setShowConfetti] = useState(true);
  const [shouldShatter, setShouldShatter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const scrollTimeout = useRef<number | null>(null);
  
  const handleNotebookClick = () => {
    setShowLoadingOverlay(true);
    setTimeout(() => {
      const newWindow = window.open('https://race.series.so', '_blank');
      if (newWindow) {
        newWindow.focus();
      } else {
        window.location.href = 'https://race.series.so';
      }
      setShowLoadingOverlay(false);
    }, 2000);
  };

  useEffect(() => {
    if (currentSlide === slides.FINAL_LOADING) {
      const timer = setTimeout(() => {
        setCurrentSlide(slides.MEET_VERA);
        setPreviousSlide(slides.FINAL_LOADING);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  useEffect(() => {
    if (answers.personality) {
      const colorMap: { [key: string]: string } = {
        'Passionate': '#FF6B6B',
        'Creative': '#4ECDC4',
        'Optimistic': '#FFD93D',
        'Analytical': '#95A5A6',
        'Intuitive': '#6C5CE7'
      };
      setSelectedColor(colorMap[answers.personality] || '#4ECDC4');
    }
  }, [answers.personality]);

  const generateMatchingWords = (answers) => {
    const { dream, struggle, personality } = answers;
    
    if (!dream || !struggle || !personality) {
      return ['transcend', 'cultivate'];
    }

    const personalityWords = {
      Passionate: [
        'optimize', 'impact', 'transform', 'create',
        'engineer', 'design', 'calibrate', 'catalyze'
      ],
      Creative: [
        'synthesize', 'metamorphose', 'transcend', 'envision',
        'conceptualize', 'innovate', 'harmonize'
      ],
      Optimistic: [
        'elevate', 'propagate', 'illuminate', 'cultivate',
        'amplify', 'flourish', 'transcend', 'manifest'
      ],
      Analytical: [
        'synthesize', 'quantify', 'optimize', 'systematize',
        'calibrate', 'elucidate', 'crystallize', 'formulate'
      ],
      Intuitive: [
        'metamorphose', 'harmonize', 'synthesize', 'transcend',
        'illuminate', 'envision', 'cultivate', 'manifest'
      ]
    };

    const baseWords = personalityWords[personality] || ['transcend', 'cultivate'];
    const word1 = baseWords[Math.floor(Math.random() * baseWords.length)];
    const word2 = baseWords.filter(w => w !== word1)[Math.floor(Math.random() * (baseWords.length - 1))];

    return [word1, word2];
  };

  const handleNext = () => {
    if (currentSlide === slides.WELCOME) {
      // Skip directly to the final page when clicking next from welcome
      setShouldShatter(true);
      setTimeout(() => {
        setPreviousSlide(slides.WELCOME);
        setCurrentSlide(slides.MEET_VERA);
      }, 500);
    } else {
      // Original behavior for other cases
      setShouldShatter(true);
      setTimeout(() => {
        const slideOrder = Object.values(slides);
        const currentIndex = slideOrder.indexOf(currentSlide);
        if (currentIndex < slideOrder.length - 1) {
          setPreviousSlide(currentSlide);
          setCurrentSlide(slideOrder[currentIndex + 1]);
        }
      }, 1000);
    }
  };

  const handleBack = () => {
    if (currentSlide === slides.MEET_VERA) {
      setCurrentSlide(slides.WELCOME); 
      setPreviousSlide(slides.WELCOME); 
    } else if (currentSlide === slides.WELCOME) {
      // Already at welcome, do nothing or handle as needed
      return;
    } else if (previousSlide) { 
      if (previousSlide === slides.LOADING) {
        setCurrentSlide(slides.WELCOME);
        setPreviousSlide(slides.WELCOME);
      } else if (previousSlide === slides.FINAL_LOADING) {
        setShowSurvey(true);
        setCurrentSlide(slides.SURVEY);
        setPreviousSlide(slides.WELCOME);
      } else {
        setCurrentSlide(previousSlide);
        if (previousSlide === slides.WELCOME) {
          setPreviousSlide(slides.WELCOME);
        } else if (previousSlide === slides.SURVEY) {
          setPreviousSlide(slides.WELCOME);
        }
      }
    }
  };

  const handleLearnMore = () => {
    setPreviousSlide(currentSlide);
    setCurrentSlide(slides.MANIFESTO);
  };

  const handleSurveyComplete = async (surveyAnswers) => {
    setAnswers(surveyAnswers);
    setIsTransitioning(true);
    setSelectedColor(surveyAnswers.colorCode || '#4ECDC4');
    setShowSurvey(false);

    const words = generateMatchingWords(surveyAnswers);
    setMatchingWords(words);

    // Silently attempt to save survey responses
    await supabase.from('survey_responses').insert([
      {
        session_id: sessionId,
        dream: surveyAnswers.dream,
        struggle: surveyAnswers.struggle,
        personality: surveyAnswers.personality
      }
    ]).then(() => {}, () => {});

    await new Promise(resolve => setTimeout(resolve, 100));
    setCurrentSlide(slides.EDU_CHECK);
    setIsTransitioning(false);
  };

  const handleEduEmailSubmit = async (email: string) => {
    setIsTransitioning(true);
    setAnswers(prev => ({ ...prev, eduEmail: email }));

    // Silently attempt to save edu email
    await supabase.from('survey_responses').update({
      edu_email: email
    }).eq('session_id', sessionId).then(() => {}, () => {});

    // Skip loading and go directly to EDU survey
    setCurrentSlide(slides.EDU_SURVEY);
    setPreviousSlide(slides.EDU_CHECK);
    setIsTransitioning(false);
  };

  const handleEduCheck = async (hasEdu: boolean) => {
    setIsTransitioning(true);
    if (!hasEdu) {
      try {
        await supabase.from('survey_responses').update({
          edu_email: ''
        }).eq('session_id', sessionId);
      } catch (error) {
        console.error('Error saving edu status:', error);
      }
      setCurrentSlide(slides.EDU_SURVEY);
      setPreviousSlide(slides.EDU_CHECK);
    } else {
      setCurrentSlide(slides.EDU_SURVEY);
      setPreviousSlide(slides.EDU_CHECK);
    }
    setIsTransitioning(false);
  };

  const handleGetStarted = () => {
    const isAppleDevice = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    const colorText = answers.colorCode === '#95A5A6' ? 'Gray' :
                     answers.colorCode === '#4ECDC4' ? 'Teal' :
                     answers.colorCode === '#FFD93D' ? 'Yellow' :
                     answers.colorCode === '#6C5CE7' ? 'Purple' :
                     answers.colorCode === '#FF6B6B' ? 'Red' : 'Teal';
    const messageText = isAppleDevice 
      ? `Welcome to Series! Text your color to get started: ${colorText}`
      : `Hey! I'm using Series, the first AI social network. Text your color to get started: ${colorText}`;
    const phoneNumber = "+19495965450";
    
    const url = isAppleDevice
      ? `imessage://${phoneNumber}&body=${encodeURIComponent(messageText)}`
      : `sms:${phoneNumber}?body=${encodeURIComponent(messageText)}`;
    
    window.location.href = url;
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('+1 (646) 263-8972');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: 'Join Series: The Next Iteration in Human Connection',
        text: 'Join me on Series, where AI enhances human connection.',
        url: window.location.href
      };

      if (navigator.canShare(shareData)) {
        navigator.share(shareData).then(() => {}, () => {});
        return;
      }
    }

    // Fallback to copying URL
    navigator.clipboard.writeText(window.location.href).then(() => {}, () => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToVideo = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const progress = container.scrollTop / scrollHeight;
    
    // Update progress smoothly
    setScrollProgress(Math.min(Math.max(progress, 0), 1));
    
    // Clear any existing scroll timeout
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    // Set a new timeout to ensure we've stopped scrolling
    scrollTimeout.current = setTimeout(() => {
      const snapPoints = [0, container.clientHeight];
      const currentScroll = container.scrollTop;
      
      // Find the closest snap point
      const closest = snapPoints.reduce((prev, curr) => 
        Math.abs(curr - currentScroll) < Math.abs(prev - currentScroll) ? curr : prev
      );
      
      // Smooth scroll to the nearest section
      container.scrollTo({
        top: closest,
        behavior: 'smooth'
      });
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <AnimatePresence>
        {showLoadingOverlay && <LoadingOverlay />}
      </AnimatePresence>

      <AnimatePresence>
        {currentSlide === slides.WELCOME && (
          <motion.div 
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <a
              onClick={handleNotebookClick}
              className="p-2 text-3xl emoji-button"
              style={{ cursor: 'pointer' }}
              aria-label="Open portal"
            >
              <span className="text-2xl">🔑</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`h-screen ${currentSlide === slides.WELCOME ? 'snap-y snap-proximity overflow-y-auto' : 'overflow-hidden'} overflow-x-hidden`}
        onScroll={handleScroll}
        ref={containerRef}
      >
        <div 
          className="snap-start h-screen flex items-center justify-center p-0.5 md:p-0.75 lg:p-1 relative"
          style={{
            filter: `blur(${scrollProgress * 24}px)`,
            opacity: Math.max(0, 1 - (scrollProgress * 0.48)),
            transform: `scale(${1 + scrollProgress * 0.125})`,
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <AnimatePresence mode="wait">
            {currentSlide === slides.WELCOME && !isTransitioning && (
              <motion.div
                key="welcome"
                className="flex flex-col items-center justify-center space-y-8"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <motion.h1
                  className="text-5xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Series
                </motion.h1>
                <div className="flex items-center justify-center gap-2 mt-[0.008rem] ml-12">
                  <motion.span
                    className="text-xl sm:text-2xl font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    meet your next
                  </motion.span><RollingWord />
                </div>
                <motion.div
                  className="text-base text-black/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <span className="text-sm text-black/60 hover:text-black/80 transition-colors block">The First AI Social Network</span>
                </motion.div>
                <motion.div
                  className="button-primary px-6 py-2 mb-24"
                  onClick={handleNext}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                  transition={{ delay: 1.5 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            )}

            {currentSlide === slides.LOADING && !isTransitioning && (
              <motion.div
                key="loading"
                className="text-center"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                onAnimationComplete={() => {
                  setTimeout(handleNext, 5000);
                }}
              >
                <Logo />
              </motion.div>
            )}

            {currentSlide === slides.SURVEY && !isTransitioning && showSurvey && (
              <Survey 
                onComplete={handleSurveyComplete}
                onBack={handleBack}
                onLearnMore={handleLearnMore}
              />
            )}

            {currentSlide === slides.FINAL_LOADING && (
              <motion.div
                key="final-loading"
                className="text-center space-y-8"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                onAnimationComplete={() => {
                  setTimeout(() => {
                    setCurrentSlide(slides.MEET_VERA); 
                    setPreviousSlide(slides.FINAL_LOADING);
                  }, 8000);
                }}
              >
                <Logo />
                <div className="mt-16">
                  <RollingText />
                </div>
              </motion.div>
            )}
            
            {currentSlide === slides.EDU_CHECK && !isTransitioning && (
              <motion.div
                key="edu-check"
                className="w-full max-w-4xl px-8 md:px-12 lg:px-16"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <EduCheck onNext={handleEduCheck} />
              </motion.div>
            )}

            {currentSlide === slides.EDU_SURVEY && !isTransitioning && (
              <EduSurvey
                onComplete={async (eduAnswers) => {
                  setIsTransitioning(true);
                  try {
                    await supabase.from('survey_responses').update({
                      edu_major: eduAnswers.major,
                      edu_year: eduAnswers.year,
                      edu_goal: eduAnswers.goal
                    }).eq('session_id', sessionId);
                  } catch (error) {
                    console.error('Error saving edu survey responses:', error);
                  }
                  // Always transition regardless of database success
                  setCurrentSlide(slides.SCORING);
                  setPreviousSlide(slides.EDU_SURVEY);
                  setIsTransitioning(false);
                }}
                onBack={handleBack}
              />
            )}

            {currentSlide === slides.SCORING && !isTransitioning && (
              <motion.div
                key="scoring"
                className="text-center space-y-8 max-w-md w-full relative"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                onAnimationComplete={() => {
                  setTimeout(() => {
                    setCurrentSlide(slides.MEET_VERA);
                    setPreviousSlide(slides.SCORING);
                  }, 2000);
                }}
              >
                <motion.div 
                  className="space-y-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="space-y-4">
                    <motion.p
                      className="text-lg text-black/60"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Almost there 🔒
                    </motion.p>
                  </div>
                  <div className="flex flex-col items-center gap-8">
                    <motion.div 
                      className="w-full h-[2px] bg-black/10 relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-black"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>
                    <motion.p
                      className="text-base text-black/60"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      Let's see if you're fit to join our society of AI friends and students like you...
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {currentSlide === slides.MEET_VERA && !isTransitioning && (
              <motion.div
                key="meet-vera"
                className="text-center space-y-8 max-w-md w-full relative px-4 pt-12"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="absolute top-0 left-4">
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-full icon-button"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                </div>

                {/* Initial confetti burst */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onAnimationStart={() => {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 2000);
                  }}
                >
                  <Confetti x={window.innerWidth / 2} y={window.innerHeight / 4} />
                  <Confetti x={window.innerWidth / 4} y={window.innerHeight / 3} />
                  <Confetti x={(window.innerWidth / 4) * 3} y={window.innerHeight / 3} />
                </motion.div>
                
                {showConfetti && (
                  <>
                    <Confetti x={window.innerWidth / 4} y={window.innerHeight / 3} />
                    <Confetti x={(window.innerWidth / 4) * 3} y={window.innerHeight / 3} />
                  </>
                )}
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <motion.h2 
                      className="text-3xl sm:text-4xl font-bold tracking-tight"
                      variants={headingVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      Welcome to Series
                    </motion.h2>
                    <motion.p
                      className="text-lg text-black/60"
                      variants={headingVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      Your AI friend is ready to connect
                    </motion.p>
                    
                  </div>
                  
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium" style={{ color: selectedColor }}>
                      Your Color
                    </p>
                    <p className="text-2xl font-bold">
                      {answers.colorCode === '#95A5A6' ? 'Gray' :
                       answers.colorCode === '#4ECDC4' ? 'Teal' :
                       answers.colorCode === '#FFD93D' ? 'Yellow' :
                       answers.colorCode === '#6C5CE7' ? 'Purple' :
                       answers.colorCode === '#FF6B6B' ? 'Red' : 'Teal'} ({answers.personality || 'Creative'})
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button 
                    className="button-primary bg-black/10 text-black hover:bg-black/20"
                    onClick={handleGetStarted}
                  >
                    {/Android/i.test(navigator.userAgent) ? 'Text to Join' : 'Open iMessage'}
                  </button>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-2 text-sm text-black/70">
                      <Phone className="w-4 h-4" />
                      <span>(855) 714-1806</span>
                    </div>
                    <p className="text-sm text-black/60 mt-2">
                      Android user? Text "Join" to this number!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            {currentSlide === slides.WELCOME && (
              <motion.div
                className="absolute bottom-8 inset-x-0 flex justify-center items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: 2,
                }}
              >
                <button
                  onClick={handleLearnMore}
                  className="px-6 py-2 text-sm text-black/60 hover:text-black/80 transition-colors"
                >
                  About Us
                </button>
              </motion.div>
            )}

            {currentSlide === slides.MANIFESTO && !isTransitioning && (
              <motion.div
                key="manifesto"
                className="w-full"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <AboutPanels onBack={handleBack} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {currentSlide === slides.WELCOME && (
          <div className="snap-start h-screen relative p-4 bg-white">
            <VideoEmbed />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
