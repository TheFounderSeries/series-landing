import { motion } from 'framer-motion';

interface WelcomePageProps {
  name?: string;
  bio?: string;
}

const WelcomePage = ({ bio = 'I just joined Series!' }: WelcomePageProps) => {
  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <motion.div 
        className="text-center"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <h1 className="text-6xl font-bold mb-6">Welcome to Series.</h1>
        <p className="text-xl text-gray-600 mb-12">Your profile is ready!</p>
        
        <div className="flex flex-col space-y-4 items-center">
          <a 
            href={`imessage://mia@a.imsg.co?body=Hey,%20I%20just%20joined%20Series!%0A%0AMy%20bio%20is:%20${encodeURIComponent(bio)}`}
            target="_blank"
            className="bg-black text-white text-lg py-3 px-8 rounded-full font-medium hover:bg-black/80 transition-colors w-64 text-center"
          >
            Open iMessage
          </a>
          
          <button 
            className="text-gray-500 py-3 px-8 text-lg rounded-full border border-gray-300 font-medium hover:bg-gray-50 transition-colors w-64"
          >
            Confused?
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
