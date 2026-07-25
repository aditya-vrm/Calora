'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  animate = true,
  hoverable = false,
  onClick,
  delay = 0,
}) {
  const cardClasses = `glass-panel rounded-3xl p-6 overflow-hidden ${
    onClick ? 'cursor-pointer' : ''
  } ${className}`;

  if (!animate) {
    return (
      <div className={cardClasses} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay,
        ease: [0.16, 1, 0.3, 1], // Custom premium ease-out
      }}
      whileHover={
        hoverable || onClick
          ? {
              y: -4,
              borderColor: 'rgba(255, 45, 45, 0.2)',
              boxShadow: '0 12px 40px 0 rgba(229, 9, 20, 0.1)',
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cardClasses}
    >
      {children}
    </motion.div>
  );
}
