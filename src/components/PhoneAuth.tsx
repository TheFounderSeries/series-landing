import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

interface PhoneAuthProps {
  onSubmit: (userId: string) => Promise<void> | void;
  onBack?: () => void;
  userData?: Record<string, any>;
}

// Function to format phone number to E.164 format
const formatPhoneToE164 = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  // Add country code if not present
  return formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`;
};

// Helper function for avatar background color
const getBackgroundColor = (colorIndex?: number): string => {
  const colors = ['#FFD700', '#FF6347', '#4682B4', '#32CD32', '#9370DB'];
  const index = typeof colorIndex === 'number' ? colorIndex : Math.floor(Math.random() * colors.length);
  return colors[index % colors.length];
};

// Function to send verification code via backend API
const sendVerificationCode = async (phoneNumber: string): Promise<{success: boolean; verificationId?: string}> => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        // Make sure we're using the correct parameter name expected by the backend
        phoneNumber: phoneNumber 
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return { success: true, verificationId: data.verificationId };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return { success: false };
  }
};

const PhoneAuth: React.FC<PhoneAuthProps> = ({ onSubmit, userData }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  // Get user's name from userData for personalized greeting
  const userName = userData?.name?.first || userData?.firstName || '';

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 10) {
      let formatted = input;
      if (input.length > 3) {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
      }
      if (input.length > 6) {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)} - ${input.slice(6)}`;
      }
      setPhoneNumber(formatted);
      if (error) setError(null);
    }
  };

  const validatePhoneNumber = (): boolean => {
    // Remove all non-digits and check if we have 10 digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 6 characters
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 6) {
      setVerificationCode(input);
      if (error) setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!showVerification) {
      // Step 1: Validate and send verification code
      if (validatePhoneNumber()) {
        try {
          setIsLoading(true);
          setError(null); // Clear any previous errors
          
          // Format phone number to E.164 format
          const e164Phone = formatPhoneToE164(phoneNumber);
          
          // Send verification code to the user's phone
          const result = await sendVerificationCode(e164Phone);
          
          if (result.success && result.verificationId) {
              // Store verification ID for later use
            setVerificationId(result.verificationId);
            // Show verification code input
            setShowVerification(true);
            
            // Start the countdown for resend button
            setResendCountdown(60);
            setCanResend(false);
            
            // Set up the countdown timer
            const countdownInterval = setInterval(() => {
              setResendCountdown((prevCountdown) => {
                if (prevCountdown <= 1) {
                  clearInterval(countdownInterval);
                  setCanResend(true);
                  return 0;
                }
                return prevCountdown - 1;
              });
            }, 1000);
          } else {
            setError('Failed to send verification code. Please try again.');
          }
        } catch (err) {
          console.error('Error sending verification code:', err);
          setError('Failed to send verification code. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      // Step 2: Verify the code and proceed
      if (verificationCode.length === 6) {
        try {
          setIsLoading(true);
          setError(null); // Clear any previous errors
          
          // Format phone number to E.164 format
          const e164Phone = formatPhoneToE164(phoneNumber);
          
          // Verify the code with our backend
          const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              verificationId,
              otp: verificationCode,
              phoneNumber: e164Phone
            }),
          });

          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.detail || 'Invalid verification code');
          }
          
          // Successfully verified, now create a user with the provided data
          try {
            // Format the user data according to the backend schema
            interface UserCreateData {
              email: string;
              name: {
                first: string;
                last: string;
              };
              groups: string[];
              bio: string;
              location: string | null;
              age: number | null;
              profilePic: string | null;
              color: string | null;
              phone?: string;
            }

            // Generate a random email based on the user's name
            const firstName = userData?.firstName || (userData?.name?.first as string) || '';
            const lastName = userData?.lastName || (userData?.name?.last as string) || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const randomEmail = `${fullName.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 1000)}@series.placeholder`;
            
            const userCreateData: UserCreateData = {
              // Generate a placeholder email
              email: randomEmail,
              // Pass through name in the correct format
              name: {
                first: firstName,
                last: lastName || 'User'
              },
              // Pass through groups from userData if available, otherwise empty array
              groups: userData?.groups || [],
              // Pass through bio
              bio: userData?.bio || '',
              // Pass through location as a string
              location: userData?.location || null,
              // Pass through age, converting to number if needed
              age: userData?.age ? Number(userData?.age) : null,
              // Pass through profile picture if available
              profilePic: userData?.profilePic || null,
              // Pass through color
              color: userData?.color || getBackgroundColor(userData?.colorIndex as number),
              // Add phone number in E.164 format
              phone: e164Phone
            };

            // Create the user in the backend
            const createUserResponse = await fetch('http://localhost:8000/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userCreateData),
            });

            if (!createUserResponse.ok) {
              const errorData = await createUserResponse.json();
              throw new Error(errorData.detail || 'Failed to create user');
            }

            const createdUser = await createUserResponse.json();
            const userId = createdUser.userId || e164Phone;
          
            // Call onSubmit with the userId from the response
            await onSubmit(userId);
          } catch (createErr) {
            console.error('Error creating user:', createErr);
            setError(createErr instanceof Error ? createErr.message : 'Failed to create user. Please try again.');
            throw createErr; // Re-throw to be caught by the outer catch block
          }
        } catch (err) {
          console.error('Error verifying code:', err);
          setError(err instanceof Error ? err.message : 'Failed to verify code. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('Please enter a valid 6-digit verification code');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Function to resend verification code
  const resendVerificationCode = async () => {
    if (!canResend) return;
    
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      // Format phone number to E.164 format
      const e164Phone = formatPhoneToE164(phoneNumber);
      
      // Log the phone number for debugging
      console.log('Resending verification code to:', e164Phone);
      
      // Send verification code to the user's phone
      const result = await sendVerificationCode(e164Phone);
      
      if (result.success && result.verificationId) {
        // Update verification ID
        setVerificationId(result.verificationId);
        
        // Reset countdown
        setResendCountdown(60);
        setCanResend(false);
        
        // Start the countdown timer
        const countdownInterval = setInterval(() => {
          setResendCountdown((prevCountdown) => {
            if (prevCountdown <= 1) {
              clearInterval(countdownInterval);
              setCanResend(true);
              return 0;
            }
            return prevCountdown - 1;
          });
        }, 1000);
      } else {
        setError('Failed to resend verification code. Please try again.');
      }
    } catch (err) {
      console.error('Error resending verification code:', err);
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants for transitions
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto text-center">
        <motion.h1 
          className="text-4xl font-medium mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Just one more thing, {userName ? `${userName}` : ''}...
        </motion.h1>
        
        <AnimatePresence mode="wait">
          {!showVerification ? (
            <motion.div
              key="phone-input"
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              exit={fadeIn.exit}
              className="mb-8"
            >
              <p className="text-gray-600 mb-8">
                In order for us to introduce you to your AI friend, we need your phone number.
              </p>
              
              <div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onKeyDown={handleKeyDown}
                  placeholder="(999) 999 - 9999"
                  className={`w-full p-3 text-center text-lg border rounded-md focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'}`}
                  disabled={showVerification}
                />
                {error && (
                  <p className="text-red-500 mt-2 text-sm">{error}</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verification-input"
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              exit={fadeIn.exit}
              className="mb-8"
            >
              <p className="text-gray-600 mb-8">
                Enter the authentication code you just received via SMS.
              </p>
              
              <div>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  onKeyDown={handleKeyDown}
                  placeholder="XXXXXX"
                  className={`w-full p-3 text-center text-lg border rounded-md focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'}`}
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 mt-2 text-sm">{error}</p>
                )}
                
                {/* Resend button with countdown */}
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={resendVerificationCode}
                    disabled={!canResend || isLoading}
                    className={`text-sm ${canResend ? 'text-indigo-600 hover:text-indigo-800' : 'text-gray-400'} transition-colors`}
                  >
                    {canResend ? 'Resend code' : `Resend code in ${resendCountdown}s`}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {isLoading ? (
            <div className="flex justify-center">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.button
              onClick={handleSubmit}
              className="bg-black text-white rounded-full px-8 py-3 flex items-center justify-center mx-auto hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight size={16} />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PhoneAuth;