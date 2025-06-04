import React from 'react';

interface HelpTextProps {
  children: React.ReactNode;
  className?: string;
  italic?: boolean;
  centered?: boolean;
}

const HelpText: React.FC<HelpTextProps> = ({
  children,
  className = "",
  italic = true,
  centered = true
}) => {
  return (
    <p className={`text-gray-400 text-sm ${italic ? 'italic' : ''} ${centered ? 'text-center' : ''} ${className}`}>
      {children}
    </p>
  );
};

export default HelpText;
