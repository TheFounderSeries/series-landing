import { motion } from 'framer-motion'; 
import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';

interface EduCheckProps {
  onNext: (hasEdu: boolean) => void;
}

export const EduCheck = ({ onNext }: EduCheckProps) => {
  const [showLoading, setShowLoading] = useState(false);
  const redirectTimeout = useRef<number | null>(null);

  const handleRedirect = () => {
    setShowLoading(true);
    redirectTimeout.current = window.setTimeout(() => {
      const newWindow = window.open('https://join.series.so', '_blank');
      if (newWindow) {
        newWindow.focus();
      } else {
        window.location.href = 'https://join.series.so';
      }
      setShowLoading(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        window.clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[500px]">
      {showLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-50 flex items-center justify-center"
        >
          <Logo />
        </motion.div>
      )}
      <motion.p
        className="text-lg text-black/60 mb-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        One last thing 🔒
      </motion.p>

      <motion.h2
        className="text-4xl font-bold tracking-tight text-center mb-12 flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        .edu?
      </motion.h2>
      
      <div className="grid grid-cols-2 gap-6 h-[400px]">
        <motion.button
          className="relative h-full rounded-2xl bg-black text-white group overflow-hidden"
          onClick={() => onNext(true)}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[2rem] opacity-70 group-hover:opacity-100 transition-opacity">👍</span>
          </div>
        </motion.button>

        <motion.button
          className="h-full rounded-2xl bg-gradient-to-br from-black/5 to-black/0 border-2 border-black/20 hover:border-black/40 transition-colors group cursor-pointer"
          onClick={handleRedirect}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="h-full flex flex-col items-center justify-center p-6">
            <p className="text-7xl opacity-70 group-hover:opacity-100 transition-opacity">
              <span className="text-[2rem]">👎</span>
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};