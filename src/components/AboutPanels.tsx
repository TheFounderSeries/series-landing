import { motion, AnimatePresence } from 'framer-motion';
import { VideoEmbed } from './VideoEmbed';

interface AboutPanelsProps {
  onBack: () => void;
}

export const AboutPanels = ({ onBack }: AboutPanelsProps) => {
  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={onBack}
          className="button-secondary bg-white/10 text-white border-white/20 hover:bg-white/20"
        >
          Back to Series
        </button>
      </div>
      
      <div className="relative w-full h-full">
        <AnimatePresence>
          <motion.div
            key="video-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut"
            }}
            className="w-full h-full"
          >
            <VideoEmbed />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}