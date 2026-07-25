'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BADGE_DETAILS = {
  'First Rep': {
    description: 'You logged your first entry! Your fitness journey has officially begun.',
    iconColor: 'text-amber-400',
  },
  'Streak Starter': {
    description: 'Logged activities 3 days in a row! Consistency is the key to progress.',
    iconColor: 'text-red-500',
  },
  'Hydration Hero': {
    description: 'Logged 2000ml or more of water in a single day. Stay clean, stay hydrated!',
    iconColor: 'text-sky-400',
  },
  'Calorie Crusader': {
    description: 'Hit your daily calorie target within a precise 150 kcal margin!',
    iconColor: 'text-emerald-500',
  },
  'Step Master': {
    description: 'Walked 10,000 steps or more in one day. Outstanding physical activity!',
    iconColor: 'text-indigo-400',
  },
};

export default function ConfettiCelebration() {
  const { confettiTriggered, newBadgeUnlocked, setNewBadgeUnlocked } = useApp();
  const [badgeInfo, setBadgeInfo] = useState(null);

  useEffect(() => {
    if (confettiTriggered && newBadgeUnlocked) {
      // Trigger canvas confetti explosion
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // confettis from two corners
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // Load badge description
      setBadgeInfo(BADGE_DETAILS[newBadgeUnlocked] || {
        description: 'You unlocked a new milestone!',
        iconColor: 'text-white',
      });

      return () => clearInterval(interval);
    }
  }, [confettiTriggered, newBadgeUnlocked]);

  const handleClose = () => {
    setNewBadgeUnlocked(null);
    setBadgeInfo(null);
  };

  return (
    <AnimatePresence>
      {badgeInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Confetti Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-sm glass-panel rounded-3xl p-6 relative flex flex-col items-center text-center border-accent-red/20 shadow-2xl shadow-accent-red/10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-white/40 hover:text-white/80 transition-colors p-1"
            >
              <X size={20} />
            </button>

            {/* Glowing Icon */}
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-accent-red/10 animate-ping opacity-75" />
              <Award className={`w-10 h-10 ${badgeInfo.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="font-manrope text-2xl font-bold text-white mb-2 tracking-tight">
              Badge Unlocked!
            </h3>
            <p className="font-manrope text-lg font-bold text-accent-red-hover mb-4 uppercase tracking-wider text-xs bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              {newBadgeUnlocked}
            </p>

            {/* Description */}
            <p className="font-sans text-sm text-white/70 leading-relaxed mb-6">
              {badgeInfo.description}
            </p>

            {/* CTA */}
            <button
              onClick={handleClose}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-manrope font-semibold rounded-2xl border border-white/10 hover:border-white/20 transition-all select-none"
            >
              Collect Rewards (+50 XP)
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
