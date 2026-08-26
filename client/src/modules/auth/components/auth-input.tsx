import {
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface AuthInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export function AuthInput({
  label,
  icon,
  id,
  className = "",
  ...props
}: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-neutral-900"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
            {icon}
          </div>
        )}

        <input
          id={id}
          className={`h-12 w-full rounded-md border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] ${
            icon ? "pl-11" : "px-4"
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}