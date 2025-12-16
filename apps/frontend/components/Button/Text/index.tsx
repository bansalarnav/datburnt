import { ButtonHTMLAttributes, ReactNode } from 'react';

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  click?: () => void;
  loading?: boolean;
}

export default function TextButton({
  children,
  className = '',
  click,
  loading,
  ...props
}: TextButtonProps) {
  return (
    <button
      className={`
        transition-all duration-200 min-w-[100px] px-7 py-3.5 rounded-lg 
        bg-transparent text-primary border-none font-semibold text-base 
        cursor-pointer items-center select-none
        hover:text-primary-dark
        focus:outline-none
        disabled:text-primary-light disabled:cursor-not-allowed
        ${className}
      `}
      disabled={loading}
      onClick={click}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
