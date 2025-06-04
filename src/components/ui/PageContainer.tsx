import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`min-h-screen bg-white p-4 flex flex-col items-center justify-center ${className}`}>
      <div className="w-full max-w-2xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
