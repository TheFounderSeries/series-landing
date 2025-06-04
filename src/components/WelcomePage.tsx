import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UniversityModal from './UniversityModal';

interface WelcomePageProps {
  userData?: {
    userId?: string;
    bio?: string;
    phoneNumber?: string;
    [key: string]: any;
  };
  onComplete?: () => void;
}

const WelcomePage = ({ userData, onComplete }: WelcomePageProps = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from either props or location state
  const userId = userData?.userId || (location.state as { userId?: string })?.userId || '';
  const bio = userData?.bio || (location.state as { bio?: string })?.bio || 'I just joined Series!';
  const phoneNumber = userData?.phoneNumber || '';
  const [sender, setSender] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isUniversityStudent, setIsUniversityStudent] = useState<boolean | null>(null);
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [showWelcomeContent, setShowWelcomeContent] = useState(false);
  const [showMessageBubble, setShowMessageBubble] = useState(false);
  
  // Animation sequence
  useEffect(() => {
    // Step 1: Show initial "You're all set" screen for 1 second
    const initialScreenTimer = setTimeout(() => {
      setShowInitialScreen(false);
      setShowModal(true); // Show university modal after initial screen
    }, 1000);
    
    return () => clearTimeout(initialScreenTimer);
  }, []);
  
  // Show welcome content after modal is closed
  useEffect(() => {
    if (isUniversityStudent !== null) {
      setShowWelcomeContent(true);
      
      // Show message bubble after 2-3 seconds
      const messageBubbleTimer = setTimeout(() => {
        setShowMessageBubble(true);
      }, 2500);
      
      return () => clearTimeout(messageBubbleTimer);
    }
  }, [isUniversityStudent]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        console.warn('WARNING: userId is empty or undefined!');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`https://series-api-202642739529.us-central1.run.app/api/users/${userId}`);
        
        if (!response.ok) {
          console.error(`User API error: ${response.status}`);
          setIsLoading(false);
          return;
        }
        
        const userData = await response.json();
        
        if (userData.current_sender_name) {
          setSender(userData.current_sender_name);
        } else if (phoneNumber) {
          // If no sender name but we have a phone number, use that
          setSender(phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If we can't fetch user data but have a phone number, use that as sender
        if (phoneNumber) {
          setSender(phoneNumber);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  // Handle university modal responses
  const handleYesClick = () => {
    setIsUniversityStudent(true);
    setShowModal(false);
    // Standard deeplink for .edu users
  };
  
  const handleNoClick = () => {
    setIsUniversityStudent(false);
    setShowModal(false);
    // Different deeplink for non-.edu users
  };
  
  // Handle confused button click
  const handleConfusedClick = () => {
    navigate('/confused');
  };
  
  // Get the appropriate deeplink based on university status
  const getDeeplink = () => {
    // If user is not a university student, use the default number
    if (isUniversityStudent === false) {
      return `imessage://+18557141806?body=Hey,%20I%20just%20joined%20Series!%0A%0AMy%20bio%20is:%20${encodeURIComponent(bio)}`;
    }
    
    // If we have a sender (either from API or from phoneNumber prop), use that
    if (sender) {
      return `imessage://${sender}?body=Hey,%20I%20just%20joined%20Series!%0A%0AMy%20bio%20is:%20${encodeURIComponent(bio)}`;
    }
    
    // Fallback to using the user's phone number if available
    if (phoneNumber) {
      return `imessage://${phoneNumber}?body=Hey,%20I%20just%20joined%20Series!%0A%0AMy%20bio%20is:%20${encodeURIComponent(bio)}`;
    }
    
    // Last resort fallback
    return `imessage://+18557141806?body=Hey,%20I%20just%20joined%20Series!%0A%0AMy%20bio%20is:%20${encodeURIComponent(bio)}`;
  };

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const messageBubbleVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* University Modal */}
      <UniversityModal 
        isOpen={showModal}
        onYesClick={handleYesClick}
        onNoClick={handleNoClick}
      />
      
      {/* Initial "You're all set" screen */}
      <AnimatePresence>
        {showInitialScreen && (
          <motion.div 
            className="text-center absolute inset-0 flex items-center justify-center bg-white z-20"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <h1 className="text-6xl font-bold">You're all set.</h1>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Welcome content that appears after modal is closed */}
      <AnimatePresence>
        {showWelcomeContent && (
          <motion.div 
            className="text-center z-10"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <h1 className="text-6xl font-bold mb-6">You're all set.</h1>
            <p className="text-xl text-gray-600 mb-12">Welcome to the first AI social network.</p>
            
            <div className="flex flex-col space-y-4 items-center">
              {isLoading ? (
                <div className="bg-gray-200 text-gray-500 text-lg py-3 px-8 rounded-full font-medium w-64 text-center flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                <a 
                  href={getDeeplink()}
                  className="bg-black text-white text-lg py-3 px-8 rounded-full font-medium hover:bg-black/80 transition-colors w-64 text-center inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = getDeeplink();
                  }}
                >
                  Meet your AI Friend
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* iMessage-style bubble in bottom right */}
      <AnimatePresence>
        {showMessageBubble && (
          <motion.div 
            className="fixed bottom-8 right-8 max-w-xs bg-white rounded-2xl p-4 shadow-xl z-30 border border-gray-200"
            initial="initial"
            animate="animate"
            variants={messageBubbleVariants}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center overflow-hidden text-white font-bold">
                S
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">I'm Vera, one of the AI friends in the Series Network.</p>
                <p className="text-sm text-gray-600 mt-1">Confused about how networking works here? Why use an iMessage?</p>
                <p className="text-xs text-gray-500 mt-1">Click below or email admin@series.so for help.</p>
                <div className="mt-3 flex justify-end space-x-3">
                  <button 
                    onClick={handleConfusedClick}
                    className="text-blue-500 font-semibold text-sm hover:underline"
                  >
                    Confused?
                  </button>
                </div>
                
                {/* Go to App button */}
                <div className="flex justify-center mt-6">
                  <button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                    onClick={() => {
                      // Call the onComplete function if provided, otherwise navigate directly
                      if (onComplete) {
                        onComplete();
                      } else {
                        navigate('/app');
                      }
                    }}
                  >
                    Go to App
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomePage;
