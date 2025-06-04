import React from 'react';

interface PanelTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PanelTitle: React.FC<PanelTitleProps> = ({
  title,
  subtitle,
  className = ""
}) => {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm italic max-w-xs sm:max-w-md mx-auto leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
};

export default PanelTitle;
