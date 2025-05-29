import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenSize } from '../lib/useScreenSize';

interface UniversityModalProps {
  isOpen: boolean;
  onYesClick: () => void;
  onNoClick: () => void;
}

const UniversityModal: React.FC<UniversityModalProps> = ({
  isOpen,
  onYesClick,
  onNoClick
}) => {
  const { isMobile } = useScreenSize();
  // Animation variants matching the Apple-style modals in ProfileOnboarding

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
            <div className="text-center">
              <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold ${isMobile ? 'mt-1 mb-4' : 'mt-2 mb-8'} font-['SF_Pro','SF_Pro',system-ui,sans-serif] leading-tight`}>
                Are you currently enrolled<br />in a University?
              </h2>

              <hr className={`border-t border-gray-200 w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
              
              <div className={`grid grid-cols-2 gap-0 ${isMobile ? 'mt-1' : 'mt-2'}`}>
                <button
                  onClick={onNoClick}
                  className={`w-full ${isMobile ? 'py-1.5' : 'py-2'} text-center text-blue-500 font-semibold ${isMobile ? 'text-lg' : 'text-2xl'} font-['SF_Pro','SF_Pro',system-ui,sans-serif] border-r border-gray-200`}
                >
                  No
                </button>
                <button
                  onClick={onYesClick}
                  className={`w-full ${isMobile ? 'py-1.5' : 'py-2'} text-center text-blue-500 font-semibold ${isMobile ? 'text-lg' : 'text-2xl'} font-['SF_Pro','SF_Pro',system-ui,sans-serif]`}
                >
                  Yes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UniversityModal;
