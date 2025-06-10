// src/pages/OnboardingPage.tsx
import { useState, useEffect } from 'react';
import { useScreenSize } from '../lib/useScreenSize.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePostHog } from 'posthog-js/react';
import VideoPlayer from '../components/VideoPlayer.tsx';
import ProfilePage from '../components/ProfilePage.tsx';
// import PhoneAuthPage from '../components/PhoneAuth.tsx';
import ConnectionsGraph from './ConnectionsGraph.tsx';
import UniversityModal from '../components/UniversityModal.tsx';

type OnboardingData = {
  // Profile data
  name: {
    first: string;
    last: string;
  };
  bio: string;
  location: string;
  // User groups/connections
  groups?: string[];
  // Age information
  age?: number;
  // Color information
  color?: string;
  colorIndex?: number;
  // Phone auth data
  phone: string;
  profilePic: string;
  // User connections data
  connections?: Array<{ position: string; location: string }>;
  // Other data we might collect
  [key: string]: any;
};

// Component to handle iMessage redirection
interface RedirectToIMessageProps {
  userData: Partial<OnboardingData>;
}

const RedirectToIMessage = ({ userData }: RedirectToIMessageProps) => {
  // State for university modal
  const [showModal, setShowModal] = useState(true);
  const [isUniversityStudent, setIsUniversityStudent] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Format the name for the message
  const name = userData.name ? `${userData.name.first} ${userData.name.last}`.trim() : 'User';
  const phoneNumber = userData.phone || '';
  
  // Create message text including the selected connections
  const getMessageText = () => {
    let message = `Hey, I'm ${name} and I just joined Series from Eunice's post!\n\nWho are you?`;
    
    // // Add connections information if available
    // if (connections.length > 0) {
    //   message += '\n\nI know people who are:';
    //   connections.forEach(connection => {
    //     if (typeof connection === 'object' && connection.position) {
    //       const location = connection.location ? ` from ${connection.location}` : '';
    //       message += `\n- ${connection.position}${location}`;
    //     }
    //   });
    // }
    
    return encodeURIComponent(message);
  };
  
  // Handle university modal responses
  const handleYesClick = () => {
    setIsUniversityStudent(true);
    setShowModal(false);
    setIsRedirecting(true);
  };
  
  const handleNoClick = () => {
    setIsUniversityStudent(false);
    setShowModal(false);
    setIsRedirecting(true);
  };
  
  // Get the appropriate deeplink based on university status
  const getDeeplink = () => {
    // If user is not a university student, use the default number
    if (isUniversityStudent === false) {
      return `imessage://+18557141806?body=${getMessageText()}`;
    }
    
    // If we have a sender name from the API, use that first for university students
    if (userData.current_sender_name) {
      return `imessage://${userData.current_sender_name}?body=${getMessageText()}`;
    }
    
    // If we have a phone number but no sender name, use the phone number
    if (phoneNumber) {
      return `imessage://${phoneNumber}?body=${getMessageText()}`;
    }
    
    // Fallback to default number
    return `imessage://+18557141806?body=${getMessageText()}`;
  };
  
  // Redirect to iMessage after university modal is closed
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        window.location.href = getDeeplink();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isRedirecting]);
  
  return (
    <div>
      {/* University Modal */}
      <UniversityModal 
        isOpen={showModal}
        onYesClick={handleYesClick}
        onNoClick={handleNoClick}
      />
      
      {/* Redirect animation */}
      {isRedirecting && (
        <div className="animate-pulse">
          <div className="w-14 sm:w-16 h-14 sm:h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Redirecting to iMessage...</p>
        </div>
      )}
    </div>
  );
};

const OnboardingPage = () => {
  // Used for mobile detection and navigation
  const { isMobile } = useScreenSize();
  const navigate = useNavigate();
  const location = useLocation();
  const posthog = usePostHog();
  
  const [step, setStep] = useState<'video' | 'profile' | 'video2' | 'connections' | 'complete' | 'loading'>('video');
  const [userData, setUserData] = useState<Partial<OnboardingData>>({});
  
  // Extract referrerId from location state if available and store in user data for MongoDB metadata
  useEffect(() => {
    if (location.state && 'referrerId' in location.state) {
      const { referrerId } = location.state as { referrerId: string };
      if (referrerId) {
        // Store referrerId in user data to be included in MongoDB metadata
        setUserData(prevData => ({
          ...prevData,
          metadata: {
            ...(prevData.metadata || {}),
            referredBy: referrerId
          }
        }));
        
        // Track that referral ID was passed to onboarding
        posthog.capture('eunice_referral_passed_to_onboarding', {
          referrer_id: referrerId
        });
      }
    }
  }, [location.state, posthog]);
  
  // Function to navigate to the next step
  const goToNextStep = (data?: any) => {
    // Update user data if provided
    if (data) {
      setUserData({ ...userData, ...data });
    }
    
    // Track step completion
    posthog.capture('eunice_onboarding_step_completed', {
      current_step: step,
      has_data: !!data
    });
    
    // Determine next step based on current step
    if (step === 'video') {
      setStep('profile');
      posthog.capture('eunice_onboarding_step_started', { step: 'profile' });
    } else if (step === 'profile') {
      setStep('video2');
      posthog.capture('eunice_onboarding_step_started', { step: 'video2' });
    } else if (step === 'video2') {
      setStep('connections');
      posthog.capture('eunice_onboarding_step_started', { step: 'connections' });
    } else if (step === 'connections') {
      setStep('complete');
      posthog.capture('eunice_onboarding_step_started', { step: 'complete' });
    }
  };

  // Handle going back
  const goToPreviousStep = () => {
    switch (step) {
      case 'profile':
        setStep('video');
        break;
      case 'video2':
        setStep('profile');
        break;
      case 'connections':
        setStep('video2');
        break;
      case 'complete':
        // If user navigates back from complete, go to connections
        setStep('connections');
        break;
      default:
        // If all else fails, navigate to home
        navigate('/eunice');
        break;
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    enter: { opacity: 0, x: window.innerWidth <= 768 ? 50 : 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: window.innerWidth <= 768 ? -50 : -100 }
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {step === 'video' && (
          <motion.div
            key="video"
            initial="enter"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <VideoPlayer 
              onComplete={() => goToNextStep()} 
            />
          </motion.div>
        )}

        {step === 'profile' && (
          <motion.div
            key="profile"
            initial="enter"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <ProfilePage 
              initialData={{
                ...userData,
                // Convert name object to string for ProfilePage
                name: userData.name ? `${userData.name.first} ${userData.name.last}`.trim() : undefined
              }}
              onSubmit={(data) => goToNextStep(data)}
              onBack={goToPreviousStep}
            />
          </motion.div>
        )}

        {step === 'video2' && (
          <motion.div
            key="video2"
            initial="enter"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <VideoPlayer 
              onComplete={() => goToNextStep()} 
              src={isMobile ? '/drake.mov' : '/drake_web.mov'}
            />
          </motion.div>
        )}

        {step === 'connections' && (
          <motion.div
            key="connections"
            initial="enter"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <ConnectionsGraph 
              userData={userData}
              onSubmit={(data) => goToNextStep(data)}
            />
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div
            key="loading"
            initial="enter"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center bg-white px-4"
          >
            <div className="w-full max-w-lg text-center">
              <div className="w-14 sm:w-16 h-14 sm:h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 tracking-tight">Creating your profile...</h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">Just a moment while we set things up for you.</p>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete"
            initial="enter"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center bg-white px-4"
          >
            <div className="w-full max-w-lg text-center">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 tracking-tight">You're all set!</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-xs mx-auto leading-relaxed mb-6">
                Opening iMessage to share your Series profile...
              </p>
              <RedirectToIMessage userData={userData} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;