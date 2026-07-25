'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SplashLoader from '@/components/SplashLoader';
import Button from '@/components/UI/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // If user is already logged in, redirect them to dashboard
  useEffect(() => {
    if (!loading && user) {
      // If user profile height is unset, they haven't finished onboarding
      if (!user.height || user.height === 175 && !user.firstName) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || (user && showSplash)) {
    return <SplashLoader onComplete={() => setShowSplash(false)} />;
  }

  if (showSplash) {
    return <SplashLoader onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between py-12 px-4 overflow-hidden bg-black select-none">
      {/* Premium Animated Gradient Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] rounded-full bg-radial from-accent-glow to-transparent opacity-60 blur-3xl pointer-events-none animate-pulse" />
      
      {/* Header */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-accent-red-hover drop-shadow-[0_0_8px_rgba(255,45,45,0.4)]" />
          </div>
          <span className="font-manrope text-sm font-extrabold tracking-wider text-white">
            CALORA
          </span>
        </div>
        <button
          onClick={() => router.push('/auth')}
          className="font-manrope text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          Sign In
        </button>
      </motion.header>

      {/* Main Hero */}
      <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto text-center z-10 my-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold tracking-wide uppercase mx-auto"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-ping" />
          Offline-First Shell v1.0
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-manrope text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
        >
          Track Calories.
          <br />
          <span className="bg-gradient-to-r from-accent-red to-accent-red-hover bg-clip-text text-transparent red-text-glow">
            Build Discipline.
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-sans text-sm text-white/50 leading-relaxed mb-10 max-w-[280px] mx-auto"
        >
          A highly-animated, OLED-optimized calorie and fitness tracker tailored for peak performance and visual perfection.
        </motion.p>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button
            onClick={() => router.push('/auth')}
            className="w-full py-4 text-base font-bold shadow-lg shadow-accent-red/20 group"
          >
            Start Free
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full text-center text-[10px] tracking-widest uppercase text-white/80 z-10"
      >
        Inspired by Apple Fitness & Nothing OS
      </motion.footer>
    </div>
  );
}
