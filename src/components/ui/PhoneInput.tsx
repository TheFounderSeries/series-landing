import React from 'react';
import { Info } from 'lucide-react';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  tooltipText?: string;
  label?: string;
  isMobile?: boolean;
}

// Phone number formatting is handled in the handleChange function

// Function to format phone number to E.164 format
export const formatPhoneToE164 = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  // Add country code if not present
  return formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`;
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  tooltipText = "Your phone number is needed to text with your AI friend on iMessage. It's stored securely and never displayed on your profile.",
  label = "Phone",
  className = '',
  isMobile = false,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 10) {
      let formatted = input;
      if (input.length > 3) {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
      }
      if (input.length > 6) {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)} - ${input.slice(6)}`;
      }
      onChange(formatted);
    }
  };

  return (
    <div
      className="w-full bg-white rounded-xl flex flex-col items-start px-4 gap-1"
      style={{
        fontFamily: 'SF Pro, system-ui, sans-serif'
      }}
    >
      <div className="flex items-center gap-1">
        <span style={{ color: '#111', fontWeight: 600, fontSize: 16 }}>{label}</span> 
        {/* Info icon with tooltip */}
        <div className="relative inline-block group">
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center cursor-help transition-colors hover:bg-gray-200"
          >
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
            {tooltipText}
          </div>
        </div>
      </div>

      <div className="flex items-center w-full">
        <div className="relative flex-grow mr-2">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="(999) 999 - 9999"
            className={`${isMobile ? 'series-shadow series-placeholder' : ''} w-full p-2 mb-2 rounded-lg border resize-none placeholder:italic ${className}`}
            style={{
              fontFamily: 'SF Pro, system-ui, sans-serif',
              fontSize: 13,
              outline: 'none',
              color: '#222',
              backgroundColor: error ? '#FEF2F2' : 'white',
              borderColor: error ? '#ef4444' : '#ccc',
              borderWidth: error ? '2px' : '1px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              height: '36px',
              lineHeight: '1.5'
            }}
            onFocus={e => {
              if (!error) {
                e.target.style.borderWidth = '0.5px';
              }
            }}
            onBlur={e => {
              if (!error) {
                e.target.style.borderWidth = '1px';
              }
            }}
            {...props}
          />
          {error && (
            <p className="absolute text-[0.5rem] text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneInput;
