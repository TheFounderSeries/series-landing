import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const universities = [
  "Harvard University",
  "Stanford University",
  "MIT",
  "Yale University",
  "Princeton University",
  "Columbia University",
  "UC Berkeley",
  "UCLA",
  "University of Pennsylvania",
  "Northwestern University",
  "Duke University",
  "Johns Hopkins University",
  "Caltech",
  "Dartmouth College",
  "Brown University",
  "Cornell University",
  "Rice University",
  "Vanderbilt University",
  "University of Chicago",
  "University of Michigan",
  "Carnegie Mellon University",
  "Georgetown University",
  "USC",
  "NYU",
  "University of Virginia",
  "UC San Diego",
  "University of North Carolina",
  "Boston College",
  "University of Illinois",
  "Georgia Tech",
  "University of Texas at Austin",
  "University of Wisconsin",
  "University of Washington",
  "Boston University",
  "Tufts University",
  "UC Davis",
  "UC Santa Barbara",
  "University of Florida",
  "University of Maryland",
  "Purdue University",
  "University of Georgia",
  "Ohio State University",
  "Penn State University",
  "Rutgers University",
  "University of Pittsburgh",
  "Syracuse University",
  "University of Miami",
  "Arizona State University",
  "Michigan State University",
  "Texas A&M University"
];

export const RollingText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % universities.length);
        setIsVisible(true);
      }, 300);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden py-6">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
        className="text-xl font-medium text-center mx-auto max-w-4xl px-4"
        style={{ fontWeight: 'bold' }}
      >
        Want to meet students at {universities[currentIndex]}?
      </motion.p>
    </div>
  );
};