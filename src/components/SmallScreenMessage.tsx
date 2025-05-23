import { motion } from 'framer-motion';

const SmallScreenMessage = () => {
  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div 
        className="text-center"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <h1 className="text-4xl font-bold mb-6">Series</h1>
        <p className="text-lg text-gray-600 mb-8">
          For the best experience, please view on a larger screen.
        </p>
        <div className="w-16 h-16 border-4 border-t-black border-r-gray-200 border-b-gray-200 border-l-gray-200 rounded-full animate-spin mx-auto mb-8"></div>
        <p className="text-sm text-gray-500">
          We're working on making this experience better for mobile devices.
        </p>
      </motion.div>
    </div>
  );
};

export default SmallScreenMessage;
