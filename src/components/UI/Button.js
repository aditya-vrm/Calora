'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled = false,
  loading = false,
  className = '',
}) {
  let baseStyle = 'relative overflow-hidden font-manrope font-semibold text-center rounded-2xl transition-all duration-300 py-3.5 px-6 text-sm tracking-wide focus:outline-none flex items-center justify-center gap-2 select-none';
  let variantStyle = '';

  switch (variant) {
    case 'primary':
      variantStyle = 'bg-gradient-to-r from-accent-red to-accent-red-hover text-white red-glow hover:brightness-110 active:brightness-95 border-none';
      break;
    case 'secondary':
      variantStyle = 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20';
      break;
    case 'danger':
      variantStyle = 'bg-red-600/20 border border-red-500/30 text-red-500 hover:bg-red-600/30';
      break;
    case 'ghost':
      variantStyle = 'bg-transparent text-white/70 hover:text-white hover:bg-white/5';
      break;
  }

  const disabledStyle = (disabled || loading) ? 'opacity-50 cursor-not-allowed select-none' : 'cursor-pointer';

  return (
    <motion.button
      type={type}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`${baseStyle} ${variantStyle} ${disabledStyle} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      <span className={loading ? 'opacity-0' : 'opacity-100 flex items-center gap-2'}>
        {children}
      </span>
    </motion.button>
  );
}
