import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Logo from './components/Logo';
import RollingWord from './components/RollingWord';
import ProfileOnboarding from './ProfileOnboarding';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showNextPage, setShowNextPage] = useState(false);
  
  const handleButtonClick = () => {
    setIsLoading(true);
    
    // After 5 seconds, show the next page
    const timer = setTimeout(() => {
      setShowNextPage(true);
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
  const meetingOptions = [
    'meet your next cofounder',
    'find your next investor',
    'connect with your next collaborator',
    ' advisor',
    ' partner',
    ' teammate',
    ' friend'
  ];

  // Animation variants for the elements
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (showNextPage) {
    return <ProfileOnboarding />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            className="fixed inset-0 flex items-center justify-center bg-white z-50"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="flex items-center">
              <motion.span
                className="text-[12rem] font-bold leading-none inline-block relative"
                animate={{ 
                  scale: [1, 1.1],
                }}
                transition={{ 
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                S
              </motion.span>
              <motion.div
                className="w-20 h-4 bg-black/20 overflow-hidden ml-4 relative -bottom-12"
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
          </motion.div>
        ) : (
          <>
            {/* Logo in top left corner
            <div className="fixed top-8 left-8 z-50">
              <Logo className="w-12 h-12" />
            </div> */}
      
      <div className="text-center max-w-2xl mx-auto px-4">
        <motion.h1 
          className="text-7xl font-bold mb-6"
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
          <div className="text-xl sm:text-2xl font-medium h-8 flex justify-center">
            <RollingWord words={meetingOptions} />
          </div>
        </motion.div>

        <motion.p 
          className="text-base text-black/70 mb-10"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          The First AI Social Network
        </motion.p>
        
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
      
      {/* Backer icons at the bottom */}
      
      <div className="fixed bottom-4 left-0 right-0 px-8">
        <motion.p 
          className="text-sm text-gray-400 mb-8 text-center font-bold tracking-wider uppercase"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          As seen on
        </motion.p>
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
