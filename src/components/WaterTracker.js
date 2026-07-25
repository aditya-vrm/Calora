'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CupSoda, Plus, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WaterTracker({ currentWater = 0, targetWater = 2000 }) {
  const { addRecord } = useApp();
  const [isAdding, setIsAdding] = useState(false);

  const fillPercentage = Math.min(100, Math.round((currentWater / targetWater) * 100));

  const handleAddWater = async () => {
    setIsAdding(true);
    await addRecord({
      type: 'water',
      waterVal: 250, // Standard cup size
    });
    setIsAdding(false);
  };

  return (
    <div className="flex items-center gap-6 p-1">
      {/* Visual Cup Container */}
      <div className="relative w-20 h-28 border-2 border-white/10 rounded-b-2xl rounded-t-lg bg-white/2 overflow-hidden flex flex-col justify-end">
        {/* Animated Fluid Liquid Waves */}
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-accent-red relative overflow-hidden"
          style={{ height: `${fillPercentage}%` }}
          initial={{ height: 0 }}
          animate={{ height: `${fillPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {fillPercentage > 0 && (
            <>
              {/* Back wave */}
              <div className="liquid-wave-behind" />
              {/* Front wave */}
              <div className="liquid-wave" />
            </>
          )}
        </motion.div>
        
        {/* Floating Percentage Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <span className="font-manrope text-sm font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {fillPercentage}%
          </span>
        </div>
      </div>

      {/* Info & CTA Column */}
      <div className="flex-1 flex flex-col justify-center text-left">
        <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1 mb-1">
          <Droplet size={10} className="text-accent-red" />
          Water Intake
        </span>
        <h4 className="font-manrope text-base font-bold text-white mb-0.5">
          {currentWater} ml <span className="text-white/40 text-xs font-semibold">/ {targetWater} ml</span>
        </h4>
        <p className="font-sans text-[10px] text-white/40 leading-relaxed mb-3">
          Drink water to maintain metabolic rates and muscle hydration (+5 XP per cup).
        </p>

        {/* Quick Add Button */}
        <motion.button
          onClick={handleAddWater}
          disabled={isAdding}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center justify-center gap-1.5 self-start py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl font-manrope text-[11px] font-semibold text-white transition-all select-none disabled:opacity-50"
        >
          <Plus size={12} className={isAdding ? 'animate-spin' : ''} />
          Add 250ml
        </motion.button>
      </div>
    </div>
  );
}
