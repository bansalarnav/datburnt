import Loader from '../Loader';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  click?: () => void;
  loading?: boolean;
}

export default function PrimaryButton({
  children,
  className = '',
  click,
  loading,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      onClick={click}
      className={`
        transition-all duration-200 rounded-[10px] min-w-[150px] min-h-[48px] 
        bg-primary px-8 py-4 shadow-[0px_8px_0px_#cc2a2a] 
        text-white border-none font-semibold text-base 
        cursor-pointer select-none items-center
        hover:bg-primary-light
        focus:outline-none
        disabled:bg-primary-light disabled:cursor-not-allowed
        active:shadow-none active:translate-y-2
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? <Loader /> : children}
    </button>
  );
}
