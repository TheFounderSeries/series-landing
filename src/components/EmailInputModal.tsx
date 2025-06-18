import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenSize } from '../lib/useScreenSize';

interface EmailInputModalProps {
  isOpen: boolean;
  onSubmit: (email: string) => void;
  onClose: () => void;
}

const EmailInputModal: React.FC<EmailInputModalProps> = ({
  isOpen,
  onSubmit,
  onClose
}) => {
  const { isMobile } = useScreenSize();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email.endsWith('.edu')) {
      setError('Please enter a valid .edu email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    // Call the onSubmit handler with the email
    onSubmit(email);
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
            onClick={onClose}
          />
          
          <motion.div
            className={`relative bg-white/95 backdrop-blur-md rounded-3xl ${isMobile ? 'py-4' : 'py-6'} ${isMobile ? 'max-w-xs' : 'max-w-sm'} w-[90%] mx-auto shadow-xl z-10`}
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold ${isMobile ? 'mt-1 mb-4' : 'mt-2 mb-8'} font-['SF_Pro','SF_Pro',system-ui,sans-serif] leading-tight`}>
                Please enter your .edu email
              </h2>

              <div className="px-6 mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@university.edu"
                  className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobile ? 'text-base' : 'text-lg'}`}
                  disabled={isSubmitting}
                  autoFocus
                />
                {error && (
                  <p className="mt-1 text-sm text-red-500 text-left">{error}</p>
                )}
              </div>

              <hr className={`border-t border-gray-200 w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
              
              <div className={`grid grid-cols-1 gap-0 ${isMobile ? 'mt-1' : 'mt-2'}`}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !email.trim()}
                  className={`w-full ${isMobile ? 'py-1.5' : 'py-2'} text-center text-blue-500 font-semibold ${isMobile ? 'text-lg' : 'text-2xl'} font-['SF_Pro','SF_Pro',system-ui,sans-serif]`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailInputModal;
