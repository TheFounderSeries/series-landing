import React from 'react';
import Button from './Button';

interface ConnectionInputProps {
  positionValue: string;
  locationValue: string;
  onPositionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPositionFocus: () => void;
  onLocationFocus: () => void;
  onPositionBlur: () => void;
  onLocationBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onAddConnection: () => void;
  className?: string;
}

const ConnectionInput: React.FC<ConnectionInputProps> = ({
  positionValue,
  locationValue,
  onPositionChange,
  onLocationChange,
  onPositionFocus,
  onLocationFocus,
  onPositionBlur,
  onLocationBlur,
  onKeyDown,
  onAddConnection,
  className = ""
}) => {
  const hasInput = positionValue && locationValue;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full mb-4">
        <div className="w-full sm:w-[calc(50%-16px)]">
          <input 
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm placeholder:text-gray-400"
            placeholder="e.g. software engineers"
            value={positionValue}
            onChange={onPositionChange}
            onFocus={onPositionFocus}
            onBlur={onPositionBlur}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="flex-shrink-0 text-2xl sm:text-3xl flex items-center justify-center font-semibold px-1 tracking-tight text-gray-700 my-1 sm:my-0">from</div>
        <div className="w-full sm:w-[calc(50%-16px)]">
          <input 
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm placeholder:text-gray-400"
            placeholder="New York"
            value={locationValue}
            onChange={onLocationChange}
            onFocus={onLocationFocus}
            onBlur={onLocationBlur}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
      
      <div className="flex justify-center w-full">
        <Button
          variant="primary"
          size="md"
          onClick={onAddConnection}
          disabled={!hasInput}
          className="w-full sm:w-auto mt-2 sm:mt-1 text-sm sm:text-base font-medium"
        >
          Add Connection
        </Button>
      </div>
    </div>
  );
};

export default ConnectionInput;
