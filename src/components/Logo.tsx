import { motion } from 'framer-motion';

export const Logo = ({ className = "", onClick }: { className?: string; onClick?: () => void }) => {
  const handleClick = () => {
    const newWindow = window.open('https://www.linkedin.com/company/joinseries/', '_blank');
    if (newWindow) {
      newWindow.focus();
    } else {
      window.location.href = 'https://www.linkedin.com/company/joinseries/';
    }
  };

  return (
    <motion.div
      className={`flex items-center justify-center relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <button 
        onClick={onClick || handleClick}
        className="relative block focus:outline-none group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span 
          className="text-[12rem] font-bold leading-none inline-block transition-transform duration-200"
          whileHover={{ scale: 1.02 }}
        >
          S
        </motion.span>
        <motion.div
          className="w-16 h-3.5 bg-black absolute bottom-4 -right-16 origin-left group-hover:opacity-80"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ 
            duration: 5, 
            ease: "linear",
            scale: { duration: 0.2 }
          }}
          whileHover={{ scale: 1.05 }}
        />
      </button>
    </motion.div>
  );
};
