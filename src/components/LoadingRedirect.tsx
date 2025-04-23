import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { RollingText } from './RollingText';

interface LoadingRedirectProps {
  url: string;
}

export const LoadingRedirect = ({ url }: LoadingRedirectProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = url;
    }, 2000);

    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <motion.div
        className="text-center space-y-8"
        variants={{
          enter: { x: 100, opacity: 0 },
          center: { x: 0, opacity: 1 },
          exit: { x: -100, opacity: 0 }
        }}
        initial="enter"
        animate="center"
        exit="exit"
      >
        <Logo />
        <div className="mt-16">
          <RollingText />
        </div>
      </motion.div>
    </div>
  );
};