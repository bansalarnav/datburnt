import { useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

function ButtonLoader() {
  return (
    <div className="inline-flex">
      <span className="w-2 h-2 rounded-full bg-white animate-[flashing_1.4s_infinite_linear] mx-1 inline-block"></span>
      <span className="w-2 h-2 rounded-full bg-white animate-[flashing_1.4s_infinite_linear] mx-1 inline-block [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 rounded-full bg-white animate-[flashing_1.4s_infinite_linear] mx-1 inline-block [animation-delay:0.4s]"></span>
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  loading,
  ...props
}: PrimaryButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading && !props.disabled) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 200);
    }
    // Call the original onClick if it exists
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`
        transition-all duration-200 rounded-[10px] min-w-[150px] min-h-[48px] 
        bg-app-primary px-8 py-4 shadow-[0px_8px_0px_#cc2a2a] 
        text-white border-none font-semibold text-base 
        cursor-pointer select-none items-center
        [-webkit-tap-highlight-color:transparent]
        hover:bg-app-primary-light
        focus:outline-none
        disabled:bg-app-primary-light disabled:cursor-not-allowed disabled:opacity-50
        disabled:shadow-none disabled:translate-y-2
        disabled:hover:bg-app-primary-light
        ${isPressed && !loading && !props.disabled ? "shadow-none translate-y-2" : ""}
        ${className}
      `}
      style={{ WebkitTapHighlightColor: "transparent" }}
      disabled={loading || props.disabled}
    >
      {loading ? <ButtonLoader /> : children}
    </button>
  );
}
