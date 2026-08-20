'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  type = 'text',
  placeholder,
  name,
  value,
  onChange,
  error,
  required = false,
  className = '',
  icon: Icon,
  rightElement,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase ml-1">
          {label} {required && <span className="text-accent-red">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-white/40 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full py-3.5 ${
            Icon ? 'pl-12' : 'px-4'
          } ${
            isPassword || rightElement ? 'pr-12' : 'pr-4'
          } glass-input text-sm font-sans tracking-wide ${
            error ? 'border-red-500/50 focus:border-red-500/80 focus:shadow-red-500/10' : ''
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-white/40 hover:text-white/80 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {rightElement && !isPassword && (
          <div className="absolute right-4 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium ml-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
