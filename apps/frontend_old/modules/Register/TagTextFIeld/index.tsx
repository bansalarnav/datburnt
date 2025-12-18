import type { ChangeEvent, InputHTMLAttributes } from "react";

interface TagTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  num: number;
}

export default function TagTextField({
  placeholder,
  className = "",
  disabled,
  value,
  onChange,
  type,
  num,
  ...props
}: TagTextFieldProps) {
  return (
    <div className="border-[3px] border-[#e4e7eb] flex w-[85%] rounded-md">
      <input
        className={`
          rounded-none rounded-tl-md rounded-bl-md w-[70%] border-none 
          p-5 outline-none text-lg text-grey-800 font-semibold
          ${className}
        `}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        type={type}
        {...props}
      />
      <div className="bg-[#F1F1F1] w-[30%] border-l-[3px] border-[#e4e7eb] flex justify-center items-center">
        <h2 className="text-xl rounded-tr-md rounded-tl-md">#{num}</h2>
      </div>
    </div>
  );
}
