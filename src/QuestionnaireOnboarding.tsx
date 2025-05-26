import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
// SmallScreenMessage import removed as it's no longer used
import { useScreenSize } from './lib/useScreenSize';

interface QuestionnaireOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: QuestionnaireOption[];
}

const QuestionnaireOnboarding = () => {
  const location = useLocation();
  const { bio = '', userId = '' } = location.state as { bio: string; userId: string } || {};
  
  // Debug logging for userId
  console.log('QuestionnaireOnboarding - Received userId:', userId);
  console.log('QuestionnaireOnboarding - Received location state:', location.state);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [enhanceWithAI, setEnhanceWithAI] = useState(true);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get screen size information
  const { isMobile } = useScreenSize();
  
  // Animation variants
  const slideVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };
  
  // We now support mobile devices with a responsive layout

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const questions: Question[] = [
    {
      id: 'successful_people',
      text: "I'm _____ to know the most successful people around.",
      options: [
        { id: 'never_going', text: 'never going' },
        { id: 'likely', text: 'likely' },
        { id: 'guaranteed', text: 'guaranteed' }
      ]
    },
    {
      id: 'career_status',
      text: "I'm _____ with my career and academic and goals.",
      options: [
        { id: 'behind', text: 'behind' },
        { id: 'satisfied', text: 'satisfied' },
        { id: 'killing_it', text: 'killing it' }
      ]
    },
    {
      id: 'meeting_people',
      text: "I'm _____ to meet all types of people who can help.",
      options: [
        { id: 'not_ready', text: 'not ready' },
        { id: 'curious', text: 'curious' },
        { id: 'super_hype', text: 'super hype' }
      ]
    }
  ];

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const saveAnswersToDatabase = async () => {
    try {
      // Debug logging for userId before API calls
      console.log('saveAnswersToDatabase - Using userId:', userId);
      if (!userId) {
        console.warn('WARNING: userId is empty or undefined!');
      }
      
      // Debug logging for userId before API calls
      console.log('saveAnswersToDatabase - Using userId:', userId);
      if (!userId) {
        console.warn('WARNING: userId is empty or undefined!');
      }
      
      // Convert answers to the format needed for the database
      const pcaData = {
        pca_successful: answers['successful_people'] === 'never_going' ? 0 : 
                        answers['successful_people'] === 'likely' ? 1 : 2,
        pca_goals: answers['career_status'] === 'behind' ? 0 : 
                   answers['career_status'] === 'satisfied' ? 1 : 2,
        pca_meet: answers['meeting_people'] === 'not_ready' ? 0 : 
                  answers['meeting_people'] === 'curious' ? 1 : 2,
        enhance_with_ai: enhanceWithAI
      };
      
      console.log('Saving questionnaire answers to database:', pcaData);
      
      // Save PCA data to the database
      const pcaResponse = await fetch('https://series-api-202642739529.us-central1.run.app/api/users/update-pca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          pcaData: pcaData
        }),
      });
      
      if (!pcaResponse.ok) {
        console.error(`PCA update API error: ${pcaResponse.status}`);
      } else {
        const pcaResult = await pcaResponse.json();
        console.log('PCA update API response:', pcaResult);
      }
      
      // Trigger the search endpoint with the AI enhancement preference
      const searchResponse = await fetch(`https://series-api-202642739529.us-central1.run.app/api/users/${userId}/search?enhance_with_ai=${enhanceWithAI}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!searchResponse.ok) {
        console.error(`Search API error: ${searchResponse.status}`);
      } else {
        const searchResult = await searchResponse.json();
        console.log('Search API response:', searchResult);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving questionnaire answers:', error);
      return false;
    }
  };

  // Check if all questions have been answered
  const allQuestionsAnswered = Object.keys(answers).length >= questions.length;
  
  // Get a list of unanswered question IDs
  const unansweredQuestions = questions
    .filter(question => !answers[question.id])
    .map(question => question.id);
  
  const handleNext = async () => {
    if (allQuestionsAnswered) {
      setIsLoading(true);
      
      // Debug logging before saving answers
      console.log('handleNext - Before saving answers, userId:', userId);
      
      // Save answers to database
      await saveAnswersToDatabase();
      
      // Debug logging for navigation
      console.log('handleNext - Navigating to complete page with bio:', bio);
      
      // Simulate API delay
      setTimeout(() => {
        setIsLoading(false);
        navigate('/join/complete', { state: { bio } });
      }, 2000);
    } else {
      // Scroll to the first unanswered question
      if (unansweredQuestions.length > 0) {
        const firstUnansweredQuestion = document.getElementById(unansweredQuestions[0]);
        if (firstUnansweredQuestion) {
          firstUnansweredQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 flex flex-col items-center relative overflow-hidden">
      <div className="flex-1 flex items-center w-full">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col">
            {/* Questions Section */}
            <div className="mt-32 flex-1 flex flex-col justify-center">
              <motion.div 
                className={`${isMobile ? 'space-y-12' : 'space-y-16'}`}
                initial="hidden"
                animate="visible"
                variants={fadeVariants}
              >
                {questions.map((question) => (
                  <div key={question.id} id={question.id} className={`${isMobile ? 'space-y-2' : 'space-y-4'}`}>
                    <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-medium text-center`}>
                      {question.text}
                      {/* {!answers[question.id] && (
                        <span className="ml-2 text-sm text-red-500 font-normal">*</span>
                      )} */}
                    </h2>
                    
                    <div className={`flex flex-wrap justify-center ${isMobile ? 'gap-2' : 'gap-16'} pt-8`}>
                      {question.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(question.id, option.id)}
                          className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-full border ${
                            answers[question.id] === option.id 
                              ? 'bg-gray-700 text-white border-gray-700' 
                              : 'bg-white text-black border-gray-200 hover:bg-gray-50'
                          } transition-colors duration-200 ${isMobile ? 'min-w-[100px]' : 'min-w-[120px]'} text-center`}
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Submit Button Section */}
            <div className="mt-32 mb-16 flex justify-center">
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    key="loading"
                    className="fixed inset-0 flex items-center justify-center bg-white z-40"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <div className="flex items-center">
                      <motion.span
                        className="text-[10rem] font-bold leading-none inline-block relative"
                      >
                        S
                      </motion.span>
                      <motion.div
                        className="w-20 h-4 overflow-hidden ml-4 relative -bottom-12"
                        initial={{ scaleX: 0 }}
                        animate={{ 
                          scaleX: 1,
                          transformOrigin: 'left center',
                        }}
                        transition={{ 
                          duration: 3,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                      >
                        <motion.div 
                          className="h-full bg-black absolute top-0 left-0"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ 
                            duration: 3,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                <motion.button
                  key="button"
                  className={`${
                    isLoading 
                      ? 'bg-gray-400' 
                      : allQuestionsAnswered 
                        ? 'bg-black hover:bg-black/80' 
                        : 'bg-gray-300'
                  } text-white rounded-full ${
                    isMobile ? 'p-2 w-20 h-8' : 'p-3 w-24 h-9'
                  } inline-flex items-center justify-center transition-colors relative group`}
                  initial="initial"
                  animate="animate"
                  variants={fadeInUp}
                  whileHover={!isLoading && allQuestionsAnswered ? { scale: 1.05 } : {}}
                  whileTap={!isLoading && allQuestionsAnswered ? { scale: 0.95 } : {}}
                  onClick={!isLoading && allQuestionsAnswered ? handleNext : undefined}
                  disabled={isLoading || !allQuestionsAnswered}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>
              </AnimatePresence>
            </div>

            {/* AI Toggle Section */}
            <motion.div 
              className="mt-16 mb-24 flex items-center justify-center w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.2,
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enhanceWithAI}
                  onChange={() => setEnhanceWithAI(!enhanceWithAI)}
                  id="ai-toggle"
                />
                <motion.div 
                  className="w-11 h-6 bg-white-100 rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-100 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-100 peer-checked:bg-black"
                  whileTap={{ scale: 0.95 }}
                />
                <motion.span 
                  className="ms-3 text-sm font-medium text-gray-900 whitespace-nowrap"
                  whileHover={{ scale: 1.02 }}
                >
                  Agree to enhancing profile with AI
                </motion.span>
              </label>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireOnboarding;
