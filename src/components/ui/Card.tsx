import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  fullWidth?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  className = "",
  fullWidth = true
}) => {
  return (
    <div
      className={`bg-white rounded-xl flex flex-col items-start px-4 py-3 gap-1 ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        fontFamily: 'SF Pro, system-ui, sans-serif'
      }}
    >
      {title && (
        <span style={{ color: '#111', fontWeight: 600, fontSize: 16 }}>{title}</span>
      )}
      {children}
    </div>
  );
};

export default Card;
