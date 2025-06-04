import React from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  width?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  width = '11rem',
  icon,
  children
}) => {
  // Position styles
  const positionStyles = {
    top: {
      left: '50%',
      bottom: '100%',
      transform: 'translateX(-50%)',
      marginBottom: '0.5rem'
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '0.5rem'
    },
    bottom: {
      left: '50%',
      top: '100%',
      transform: 'translateX(-50%)',
      marginTop: '0.5rem'
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '0.5rem'
    }
  };

  return (
    <div className="relative inline-block group">
      {children || (
        <div className="w-5 h-5 rounded-full flex items-center justify-center cursor-help transition-colors hover:bg-gray-200">
          {icon || <Info className="w-3.5 h-3.5 text-gray-400" />}
        </div>
      )}
      <div 
        className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
        style={{
          zIndex: 100,
          width,
          padding: '0.6rem',
          background: 'rgba(0,0,0,0.85)',
          color: 'white',
          borderRadius: '0.4rem',
          fontSize: '0.75rem',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          whiteSpace: 'normal',
          lineHeight: '1.3',
          backdropFilter: 'blur(4px)',
          ...positionStyles[position]
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
