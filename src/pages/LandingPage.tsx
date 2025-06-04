import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RollingWord from '../components/RollingWord';
import { useScreenSize } from '../lib/useScreenSize';

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useScreenSize();
  const navigate = useNavigate();
  
  const handleButtonClick = () => {
    setIsLoading(true);
    
    // After 3 seconds, navigate to the video player instead of directly to profile onboarding
    const timer = setTimeout(() => {
      navigate('/join');
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // 0.2s between each child
        delayChildren: 0.4, // Initial delay before animation starts
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.9 }
    },
  };
  
  const slideVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };
  // List of potential serendipitous meetings
  const meetingOptions = ["meet your next cofounder", "hire your first developer", "pitch your future investor", "discover your dream job", "create your Friday night", "meet your AI friend"];

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
            <motion.div 
              className={`text-center ${isMobile ? 'px-6' : 'max-w-2xl px-4'} mx-auto`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.h1 
                className={`${isMobile ? 'text-5xl' : 'text-7xl'} font-bold mb-4`}
                variants={itemVariants}
              >
                Series
              </motion.h1>
              
              <motion.div 
                className="text-center mb-16"
                variants={itemVariants}
              >
                <div className={`${isMobile ? 'text-lg' : 'text-2xl'} text-gray-600 font-medium h-8 flex justify-center`}>
                  <RollingWord words={meetingOptions} />
                </div>
              </motion.div>

              {!isMobile && (
                <motion.p 
                  className="text-xl font-medium text-black/40 mb-8"
                  variants={itemVariants}
                >
                  The First AI Social Network
                </motion.p>
              )}
              
              <motion.button
                className="bg-black text-white rounded-full px-1 py-4 w-40 mb-10 inline-flex items-center justify-center hover:bg-black/80 transition-colors"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleButtonClick}
              >
                <span className="mr-3 text-xl font-medium">Join us</span> <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
            
            {/* Backer icons at the bottom for desktop */}
            {!isMobile && (
              <motion.div 
                className="fixed bottom-9 left-0 right-0 px-8"
                initial={{opacity: 0, y: 20}}
                animate={{
                  opacity:1,
                  y:0,
                  transition: { delay: 2.2, duration: 0.6}
                }}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-center text-gray-200 text-lg font-medium">
                    AS SEEN ON:
                  </span>
                  <a href="https://www.forbes.com/sites/davidprosser/2025/04/04/how-two-yale-juniors-just-raised-31-million-for-their-social-network/" target="_blank" rel="noopener noreferrer" className="transition-all hover:brightness-100">
                    <img src="/images/9 3.png" alt="Backer 1" className="h-12 w-auto opacity-50 hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="https://www.nbcnews.com/video/-series-co-founders-talk-about-what-it-took-to-get-the-social-network-off-the-ground-240629317572" className="transition-all hover:brightness-100">
                    <img src="/images/10 4.png" alt="Backer 2" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="https://www.entrepreneur.com/starting-a-business/yale-students-raised-3m-in-14-days-for-anti-facebook/489578" target="_blank" rel="noopener noreferrer" className="transition-all hover:brightness-100">
                    <img src="/images/9 1.png" alt="Backer 3" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="https://www.instagram.com/complex/p/DIQBHDpOWzm/?api=stake%E3%80%90GB77.CC%E3%80%91.aviu&hl=af&img_index=2" target="_blank" rel="noopener noreferrer" className="transition-all hover:brightness-100">
                    <img src="/images/10 1.png" alt="Backer 4" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="https://www.businessinsider.com/pitch-deck-series-gen-z-professional-network-ai-texting-2025-4" target="_blank" rel="noopener noreferrer" className="transition-all hover:brightness-100">
                    <img src="/images/9 2.png" alt="Backer 5" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="https://www.fox61.com/video/news/local/morning-show/yale-students-launch-series-social-network/520-07415f62-0362-460a-b229-9a8bb6f1f3f6" target="_blank" rel="noopener noreferrer" className="transition-all hover:brightness-100">
                    <img src="/images/11 1.png" alt="Backer 6" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="https://finance.yahoo.com/news/yale-nathaneo-johnson-sean-hargrow-182342002.html" target="_blank" rel="noopener noreferrer" className="transition-all hover:brightness-100">
                    <img src="/images/image 2372.png" alt="Backer 7" className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
