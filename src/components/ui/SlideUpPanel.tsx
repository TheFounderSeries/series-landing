import React from 'react';
import { motion } from 'framer-motion';

interface SlideUpPanelProps {
  children: React.ReactNode;
  expanded: boolean;
  minHeight: string;
  maxHeight: string;
  className?: string;
  width?: string;
}

const SlideUpPanel: React.FC<SlideUpPanelProps> = ({
  children,
  expanded,
  minHeight,
  maxHeight,
  className = "",
  width = "432px"
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center">
      <motion.div 
        className={`bg-white p-6 rounded-t-3xl shadow-lg border border-gray-100 flex flex-col ${className}`}
        animate={{ 
          height: expanded ? maxHeight : minHeight,
          y: 0
        }}
        initial={{ height: minHeight, y: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 25,
          height: { duration: 0.3 }
        }}
        style={{ width, maxWidth: '95vw' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SlideUpPanel;
