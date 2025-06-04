import React from 'react';
import { Info } from 'lucide-react';

interface FormSectionProps {
  title?: string;
  subtitle?: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  tooltip,
  children,
  className = '',
  noPadding = false
}) => {
  return (
    <div
      className={`w-full bg-white rounded-xl flex flex-col items-start ${noPadding ? '' : 'px-4 py-3'} gap-2 ${className}`}
      style={{
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        fontFamily: 'SF Pro, system-ui, sans-serif'
      }}
    >
      {title && (
        <div className="flex items-center gap-1 w-full">
          <span style={{ color: '#111', fontWeight: 600, fontSize: 16 }}>{title}</span>
          {tooltip && (
            <div className="relative inline-block group">
              <div className="w-5 h-5 rounded-full flex items-center justify-center cursor-help transition-colors hover:bg-gray-200">
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div 
                className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                style={{
                  zIndex: 100,
                  width: '11rem',
                  padding: '0.6rem',
                  background: 'rgba(0,0,0,0.85)',
                  color: 'white',
                  borderRadius: '0.4rem',
                  fontSize: '0.75rem',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  left: '50%',
                  bottom: '100%',
                  transform: 'translateX(-50%)',
                  marginBottom: '0.5rem',
                  whiteSpace: 'normal',
                  lineHeight: '1.3',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {tooltip}
              </div>
            </div>
          )}
        </div>
      )}
      {subtitle && (
        <p className="text-gray-500 text-sm mt-[-4px] mb-1">{subtitle}</p>
      )}
      {children}
    </div>
  );
};

export default FormSection;
