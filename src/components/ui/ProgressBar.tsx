import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className = "" 
}) => {
  return (
    <div className={`w-full h-2 bg-gray-200 fixed top-0 left-0 z-50 ${className}`}>
      <div 
        className="h-full bg-black transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
