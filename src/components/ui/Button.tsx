import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isFullWidth?: boolean;
}

const Button = ({ 
  children, 
  variant = 'primary', 
  isFullWidth = false,
  className = '',
  ...props 
}: ButtonProps) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantStyles = {
    primary: "bg-black text-white hover:bg-gray-800 focus:ring-black",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500"
  };
  const widthStyles = isFullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;