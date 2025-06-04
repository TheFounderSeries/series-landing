import React from 'react';

interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'column';
}

const InputGroup: React.FC<InputGroupProps> = ({
  children,
  className = "",
  direction = 'row'
}) => {
  return (
    <div className={`flex ${direction === 'row' ? 'flex-col sm:flex-row' : 'flex-col'} items-center gap-2 w-full ${className}`}>
      {children}
    </div>
  );
};

export default InputGroup;
