import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UniversityModal from './components/UniversityModal';

const WelcomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bio = 'I just joined Series!', userId = '' } = location.state as { bio: string; userId: string } || {};
  const [sender, setSender] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isUniversityStudent, setIsUniversityStudent] = useState<boolean | null>(null);
  
  // Show the university modal when the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

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
        console.log('User data retrieved:', userData);
        
        if (userData.current_sender_name) {
          setSender(userData.current_sender_name);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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
  
  // Get the appropriate deeplink based on university status
  const getDeeplink = () => {
    if (isUniversityStudent === false) {
      return `imessage://+18557141806?body=Hey,%20I'm%20$%20and%20I%20just%20joined%20Series!%0A%0AMy%20bio%20is:%20${encodeURIComponent(bio)}`;
    }
    return `imessage://${sender || "No sender available"}?body=Hey,%20I'm%20$%20and%20I%20just%20joined%20Series!%0A%0AMy%20bio%20is:%20${encodeURIComponent(bio)}`;
  };

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <>
      <UniversityModal 
        isOpen={showModal}
        onYesClick={handleYesClick}
        onNoClick={handleNoClick}
      />
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <motion.div 
        className="text-center"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <h1 className="text-6xl font-bold mb-6">Welcome to Series.</h1>
        <p className="text-xl text-gray-600 mb-12">Your profile is ready!</p>
        
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
              target="_blank"
              className="bg-black text-white text-lg py-3 px-8 rounded-full font-medium hover:bg-black/80 transition-colors w-64 text-center"
            >
              Open iMessage
            </a>
          )}
          
          <button 
            className="text-gray-500 py-3 px-8 text-lg rounded-full border border-gray-300 font-medium hover:bg-gray-50 transition-colors w-64"
            onClick={() => navigate('/join/faq')}
          >
            Confused?
          </button>
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default WelcomePage;
