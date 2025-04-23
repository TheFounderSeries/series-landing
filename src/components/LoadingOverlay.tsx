import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const LoadingOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-8">
        <GraduationCap className="w-24 h-24 mx-auto mb-8 text-black/60" />
        <motion.div 
          className="w-full h-[2px] bg-black/10 relative overflow-hidden max-w-md mx-auto"
        >
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-medium text-black/70"
        >
          Let's see who's using Series at your school...
        </motion.p>
      </div>
    </motion.div>
  );
};