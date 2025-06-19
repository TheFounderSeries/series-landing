import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenSize } from '../lib/useScreenSize';

interface ReferralModalProps {
  isOpen: boolean;
  onSubmit: (phoneNumber: string) => void;
  onCancel: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onSubmit,
  onCancel
}) => {
  const { isMobile } = useScreenSize();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 10) {
      let formatted = input;
      if (input.length > 3) {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
      }
      if (input.length > 6) {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6)}`;
      }
      setPhoneNumber(formatted);
      setError(null);
    }
  };

  // Validate phone number
  const validatePhoneNumber = (): boolean => {
    // Remove all non-digits and check if we have 10 digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

  const handleSubmit = () => {
    if (!phoneNumber.trim()) {
      onCancel(); // If no phone number, just cancel
      return;
    }

    if (!validatePhoneNumber()) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Format the phone number with +1 area code for submission
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const formattedWithAreaCode = `+1${digitsOnly}`;
    
    onSubmit(formattedWithAreaCode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            transition={{ duration: 0.3 }}
          />
          
          <motion.div
            className={`relative bg-white/95 backdrop-blur-md rounded-3xl ${isMobile ? 'py-4' : 'py-6'} ${isMobile ? 'max-w-xs' : 'max-w-sm'} w-[90%] mx-auto shadow-xl z-10`}
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center px-4">
              <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold ${isMobile ? 'mt-1 mb-4' : 'mt-2 mb-6'} font-['SF_Pro','SF_Pro',system-ui,sans-serif] leading-tight`}>
                Were you referred by someone?
              </h2>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Enter referrer's phone number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1 text-left">{error}</p>
                )}
              </div>

              <hr className={`border-t border-gray-200 w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
              
              <div className={`grid grid-cols-2 gap-0 ${isMobile ? 'mt-1' : 'mt-2'}`}>
                <button
                  onClick={onCancel}
                  className={`w-full ${isMobile ? 'py-1.5' : 'py-2'} text-center text-blue-500 font-semibold ${isMobile ? 'text-lg' : 'text-2xl'} font-['SF_Pro','SF_Pro',system-ui,sans-serif] border-r border-gray-200`}
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  className={`w-full ${isMobile ? 'py-1.5' : 'py-2'} text-center text-blue-500 font-semibold ${isMobile ? 'text-lg' : 'text-2xl'} font-['SF_Pro','SF_Pro',system-ui,sans-serif]`}
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReferralModal;
