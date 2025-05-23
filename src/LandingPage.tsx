import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RollingWord from './components/RollingWord';
import { useScreenSize } from './lib/useScreenSize';

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useScreenSize();
  const navigate = useNavigate();
  
  const handleButtonClick = () => {
    setIsLoading(true);
    
    // After 3 seconds, navigate to the profile onboarding page
    const timer = setTimeout(() => {
      navigate('/join/1');
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  };
  
  const slideVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };
  // List of potential serendipitous meetings
  const meetingOptions = ["meet your next cofounder", "hire your first developer", "pitch your future investor", "discover your dream job", "create your Friday night", "meet your AI friend"];

  // Animation variants for the elements
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Render different layouts based on screen size
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.a
            href="https://www.linkedin.com/company/joinseries/"
            target="_blank"
            rel="noopener noreferrer"
            key="loading"
            className="fixed inset-0 flex items-center justify-center bg-white z-50"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="flex items-center">
              <motion.span
                className={`${isMobile ? 'text-[8rem]' : 'text-[10rem]'} font-bold leading-none inline-block relative`}
              >
                S
              </motion.span>
              <motion.div
                className={`${isMobile ? 'w-16 h-3' : 'w-20 h-4'} overflow-hidden ml-4 relative -bottom-12`}
                initial={{ scaleX: 0 }}
                animate={{ 
                  scaleX: 1,
                  transformOrigin: 'left center',
                }}
                transition={{ 
                  duration: 3,
                  ease: "easeInOut"
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
          </motion.a>
        ) : (
          <>
            {/* Backer logos at top for mobile */}
            {isMobile && (
              <div className="fixed top-8 left-0 right-0 px-4 z-10">
                <div className="flex justify-center space-x-6">
                  <img src="/images/9 3.png" alt="Backer 1" className="h-8 w-auto opacity-70" />
                  <img src="/images/10 4.png" alt="Backer 2" className="h-8 w-auto opacity-70" />
                  <img src="/images/9 1.png" alt="Backer 3" className="h-8 w-auto opacity-70" />
                </div>
              </div>
            )}
            
            {/* Main content */}
            <div className={`text-center ${isMobile ? 'px-6' : 'max-w-2xl px-4'} mx-auto`}>
              <motion.h1 
                className={`${isMobile ? 'text-5xl' : 'text-7xl'} font-bold mb-6`}
                initial="initial"
                animate="animate"
                variants={fadeInUp}
              >
                Series
              </motion.h1>
              
              <motion.div 
                className="text-center mb-8"
                initial="initial"
                animate="animate"
                variants={fadeInUp}
              >
                <div className={`${isMobile ? 'text-xl' : 'text-xl sm:text-2xl'} font-medium h-8 flex justify-center`}>
                  <RollingWord words={meetingOptions} />
                </div>
              </motion.div>

              {!isMobile && (
                <motion.p 
                  className="text-base text-black/70 mb-10"
                  initial="initial"
                  animate="animate"
                  variants={fadeInUp}
                >
                  The First AI Social Network
                </motion.p>
              )}
              
              <motion.button
                className="bg-black text-white rounded-full p-3 w-20 mb-10 inline-flex items-center justify-center hover:bg-black/80 transition-colors"
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleButtonClick}
              >
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </div>
            
            {/* Backer icons at the bottom for desktop */}
            {!isMobile && (
              <div className="fixed bottom-4 left-0 right-0 px-8">
                <div className="flex justify-between items-center w-full">
                  <img src="/images/9 3.png" alt="Backer 1" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  <img src="/images/10 4.png" alt="Backer 2" className="h-14 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  <img src="/images/9 1.png" alt="Backer 3" className="h-16 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  <img src="/images/keyboard_arrow_down.png" alt="Divider" className="h-8 w-auto opacity-50" />
                  <img src="/images/10 1.png" alt="Backer 4" className="h-14 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  <img src="/images/keyboard_arrow_down.png" alt="Divider" className="h-8 w-auto opacity-50" />
                  <img src="/images/9 2.png" alt="Backer 5" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  <img src="/images/11 1.png" alt="Backer 6" className="h-16 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  <img src="/images/10 3.png" alt="Backer 7" className="h-14 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
