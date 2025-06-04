import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'continue';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  iconPosition = 'left',
  disabled,
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'transition-colors flex items-center justify-center';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-black/80 rounded-full font-medium',
    secondary: 'bg-gray-100 text-black hover:bg-gray-200 rounded-full font-medium',
    outline: 'border border-gray-300 text-black hover:bg-gray-50 rounded-full font-medium',
    text: 'text-black hover:bg-gray-100 rounded-full font-medium',
    continue: 'bg-black text-white hover:bg-black/90 rounded-full font-medium'
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'text-xs py-1.5 px-4 min-w-[80px]',
    md: 'text-sm py-2.5 px-8 min-w-[120px]',
    lg: 'text-base py-3 px-10 min-w-[150px]'
  };
  
  // Disabled styles
  const disabledStyles = disabled || isLoading ? 
    'opacity-70 cursor-not-allowed bg-gray-200 text-gray-500 hover:bg-gray-200' : '';
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  // Continue button specific styles
  const continueButtonStyles = variant === 'continue' ? { width: 120, height: 48 } : {};
  
  // Loading animation
  const loadingContent = isLoading && (
    <motion.div
      key="loading"
      className="fixed inset-0 flex items-center justify-center bg-white z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center">
        <motion.span
          className="text-[10rem] font-bold leading-none inline-block relative"
        >
          S
        </motion.span>
        <motion.div
          className="w-20 h-4 overflow-hidden ml-4 relative -bottom-12"
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: 1,
            transformOrigin: 'left center',
          }}
          transition={{ 
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity, 
            repeatType: "loop"
          }}
        >
          <motion.div 
            className="h-full bg-black absolute top-0 left-0"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ 
              duration: 3,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
  
  // Continue button with right arrow icon
  if (variant === 'continue') {
    return (
      <AnimatePresence mode="wait">
        {isLoading ? (
          loadingContent
        ) : (
          <button
            disabled={disabled || isLoading}
            className={`bg-black hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors ${className}`}
            style={{ 
              width: 120, 
              height: 48,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              fontFamily: 'SF Pro, system-ui, sans-serif',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            {...props}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="white" />
            </svg>
          </button>
        )}
      </AnimatePresence>
    );
  }
  
  // Standard button
  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`}
      style={{
        fontFamily: 'SF Pro, system-ui, sans-serif',
        boxShadow: variant !== 'text' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
        ...continueButtonStyles
      }}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
