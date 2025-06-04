import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  text?: string;
  visible?: boolean;
  className?: string;
  position?: 'bottom' | 'center';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  children,
  text,
  visible = true,
  className = "",
  position = 'bottom'
}) => {
  const positionClasses = {
    bottom: "fixed bottom-48 left-0 right-0 flex justify-center z-30",
    center: "fixed inset-0 flex items-center justify-center z-30"
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className={positionClasses[position]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <button
            onClick={onClick}
            className={`bg-black text-white py-3 px-8 rounded-full font-medium hover:bg-black/90 transition-colors shadow-lg ${className}`}
          >
            {children || text || "Continue"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingActionButton;
