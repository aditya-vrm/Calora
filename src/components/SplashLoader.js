'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STARTUP_QUOTES = [
  "Building tomorrow's body...",
  "Discipline beats motivation, every time.",
  "Sweat is just fat crying.",
  "One meal, one workout, one day at a time.",
  "Earn your shower.",
  "Great things take time. Stay consistent.",
];

export default function SplashLoader({ onComplete }) {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Select random quote
    const randomQuote = STARTUP_QUOTES[Math.floor(Math.random() * STARTUP_QUOTES.length)];
    setQuote(randomQuote);

    // Call onComplete after 2.2 seconds (standard reveal window)
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 select-none">
      {/* Central Flame Logo with pulse glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-28 h-28 mb-6 flex items-center justify-center"
      >
        {/* Glow behind */}
        <div className="absolute inset-2 bg-accent-red/20 rounded-full blur-xl animate-pulse" />
        
        {/* Inline SVG of Calora flame logo */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#0F0F0F" strokeWidth="6" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#E50914" strokeWidth="2.5" strokeDasharray="180 90" strokeLinecap="round" />
          <path d="M50 28 C56 36, 61 41, 61 49 C61 56, 55 61, 50 61 C45 61, 39 56, 39 49 C39 42, 44 36, 50 28 Z" fill="url(#flameGrad)" />
          <path d="M50 36 C53 41, 56 44, 56 49 C56 53, 53 56, 50 56 C47 56, 44 53, 44 49 C44 44, 47 41, 50 36 Z" fill="#FFFFFF" opacity="0.9" />
          <defs>
            <linearGradient id="flameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E50914" />
              <stop offset="100%" stopColor="#FF2D2D" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* App Title */}
      <motion.h1
        initial={{ letterSpacing: '0.2em', opacity: 0 }}
        animate={{ letterSpacing: '0.08em', opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="font-manrope text-3xl font-extrabold text-white tracking-wider mb-2"
      >
        CALORA
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="font-manrope text-[9px] font-semibold uppercase tracking-widest text-white mb-10"
      >
        OLED Fitness Shell
      </motion.p>

      {/* Quotes Container */}
      <div className="w-full max-w-[240px] flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={quote}
            initial={{ y: 5, opacity: 0, filter: 'blur(2px)' }}
            animate={{ y: 0, opacity: 0.7, filter: 'blur(0px)' }}
            exit={{ y: -5, opacity: 0, filter: 'blur(2px)' }}
            transition={{ duration: 0.4 }}
            className="font-sans text-xs font-medium text-white/60 italic text-center min-h-[32px] px-2 leading-relaxed"
          >
            {quote}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
