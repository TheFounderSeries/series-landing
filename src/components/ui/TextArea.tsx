import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  tooltip?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  isMobile?: boolean;
  characterLimit?: number;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  tooltip,
  icon,
  fullWidth = true,
  isMobile = false,
  characterLimit,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(props.value?.toString().length || 0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharacterCount(e.target.value.length);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div 
      className={`w-full bg-white rounded-xl flex flex-col items-start px-4 gap-1 ${fullWidth ? 'w-full' : ''}`}
      style={{
        fontFamily: 'SF Pro, system-ui, sans-serif'
      }}
    >
      {label && (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <span style={{ color: '#111', fontWeight: 600, fontSize: 16 }}>{label}</span>
            {tooltip && (
              <div className="relative inline-block group">
                <div className="w-5 h-5 rounded-full flex items-center justify-center cursor-help transition-colors hover:bg-gray-200">
                  {icon || <Info className="w-3.5 h-3.5 text-gray-400" />}
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
          {characterLimit && (
            <span className="text-xs text-gray-500">
              {characterCount}/{characterLimit}
            </span>
          )}
        </div>
      )}
      <div className="relative flex-grow w-full">
        <textarea
          className={`${isMobile ? 'series-shadow series-placeholder' : ''} w-full p-2 mb-2 rounded-lg border resize-none placeholder:italic ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} ${className}`}
          style={{
            width: '100%',
            borderRadius: 8,
            fontFamily: 'SF Pro, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: 13,
            padding: 10,
            outline: 'none',
            color: '#222',
            backgroundColor: error ? '#FEF2F2' : 'white',
            borderColor: error ? '#ef4444' : isFocused ? '#999' : '#ccc',
            borderWidth: error ? '2px' : isFocused ? '0.5px' : '1px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            lineHeight: '1.5',
            minHeight: '80px'
          }}
          onChange={handleChange}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          maxLength={characterLimit}
          {...props}
        />
        {error && (
          <p className="absolute text-[0.5rem] text-red-600 mt-[-6px]">{error}</p>
        )}
      </div>
    </div>
  );
};

export default TextArea;
