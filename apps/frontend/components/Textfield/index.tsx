import { ChangeEvent, InputHTMLAttributes } from "react";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export default function TextField({
  placeholder,
  className = '',
  disabled,
  value,
  onChange,
  type,
  ...props
}: TextFieldProps) {
  return (
    <input
      className={`
        rounded-md border-[3px] border-[#e4e7eb] p-5 outline-none 
        text-lg text-grey-800 font-semibold
        ${className}
      `}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={onChange}
      type={type}
      {...props}
    />
  );
}
