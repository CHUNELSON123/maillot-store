"use client";

import { InputHTMLAttributes, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

interface AuthPasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function AuthPasswordInput({
  label,
  id,
  className = "",
  ...props
}: AuthPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-neutral-900"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
        />

        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className={`h-12 w-full rounded-md border border-neutral-300 bg-white pl-11 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] ${className}`}
          {...props}
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword((current) => !current)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-900"
          aria-label={
            showPassword ? "Hide password" : "Show password"
          }
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}