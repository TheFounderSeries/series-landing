import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '', ...props }) => (
  <a 
    href="https://www.linkedin.com/company/joinseries/" 
    target="_blank" 
    rel="noopener noreferrer"
  >
    <img
      className={`w-24 h-24 mx-auto transition-transform duration-200 hover:scale-105 ${className}`}
      src="/src/assets/logo.png"
      alt="Series Logo"
      {...props}
    />
  </a>
);

export { Logo };
export default Logo;
