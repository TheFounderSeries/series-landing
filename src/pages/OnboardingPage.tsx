// src/pages/OnboardingPage.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import VideoPlayer from '../components/VideoPlayer.tsx';
import ProfilePage from '../components/ProfilePage.tsx';
import PhoneAuthPage from '../components/PhoneAuth.tsx';
import WelcomePage from '../components/WelcomePage.tsx';

type OnboardingData = {
  // Profile data
  name: {
    first: string;
    last: string;
  };
  headline?: string;
  bio: string;
  location: string;
  university?: string;
  graduationYear?: string;
  // User groups/connections
  groups?: string[];
  // Age information
  age?: number;
  // Color information
  color?: string;
  colorIndex?: number;
  // Phone auth data
  phoneNumber: string;
  verificationCode: string;
  // Other data we might collect
  [key: string]: any;
};

const OnboardingPage = () => {
  const [searchParams] = useSearchParams();
  // Used for potential navigation to other routes
  const navigate = useNavigate();
  
  // Function to navigate to the app route if needed
  const goToApp = () => {
    navigate('/app');
  };
  const [step, setStep] = useState<'video' | 'profile' | 'phone' | 'complete' | 'loading'>('video');
  const [userData, setUserData] = useState<Partial<OnboardingData>>({});
  const [userId, setUserId] = useState<string>('');

  // Handle moving to the next step
  const goToNextStep = (newData: Partial<OnboardingData> = {}) => {
    // If we're coming from the profile page, format the name properly
    if (step === 'profile' && typeof newData.name === 'string') {
      // Convert string name to object format
      const nameParts = (newData.name as string).split(' ');
      const formattedData = {
        ...newData,
        name: {
          first: nameParts[0] || '',
          last: nameParts.slice(1).join(' ') || ''
        }
      };
      setUserData(prev => ({ ...prev, ...formattedData }));
    } else {
      setUserData(prev => ({ ...prev, ...newData }));
    }
    
    switch (step) {
      case 'video':
        setStep('profile');
        break;
      case 'profile':
        // Show loading screen first when transitioning from profile to phone
        setStep('loading');
        // Then after a short delay, show the phone auth page
        setTimeout(() => {
          setStep('phone');
        }, 500); // Short delay to show loading screen
        break;
      case 'phone':
        // Show loading screen while user is being created
        setStep('loading');
        break;
      case 'loading':
        // After loading is complete, move to welcome page
        setStep('complete');
        break;
      default:
        break;
    }
  };

  // Handle going back
  const goToPreviousStep = () => {
    switch (step) {
      case 'profile':
        setStep('video');
        break;
      case 'phone':
        setStep('profile');
        break;
      case 'complete':
        setStep('phone');
        break;
      default:
        break;
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    enter: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  };

  console.log('userData:', userData)

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

        {step === 'phone' && (
          <motion.div
            key="phone"
            initial="enter"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <PhoneAuthPage 
              userData={userData}
              onSubmit={(userId) => {
                setUserId(userId);
                // Show loading screen first
                setStep('loading');
                // Then after a short delay, show the welcome page
                setTimeout(() => {
                  setStep('complete');
                }, 2000); // 2 second delay to show loading screen
              }}
              onBack={goToPreviousStep}
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
            className="min-h-screen flex items-center justify-center bg-white"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-semibold mb-2">Creating your profile...</h2>
              <p className="text-gray-600">Just a moment while we set things up for you.</p>
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
          >
            <WelcomePage 
              userData={{
                ...userData,
                userId: userId,
                bio: userData.bio || 'I just joined Series!',
                phoneNumber: userData.phoneNumber,
                // Format name for WelcomePage component which expects a string or undefined
                name: userData.name ? `${userData.name.first} ${userData.name.last}`.trim() : undefined
              }}
              onComplete={goToApp}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;