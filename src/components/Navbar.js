'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Apple, Code2, User } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Home', path: '/dashboard', icon: Home },
  { label: 'Records', path: '/records', icon: Apple },
  { label: 'About', path: '/about', icon: Code2 },
  { label: 'Profile', path: '/profile', icon: User },
];

export default function Navbar() {
  const pathname = usePathname();

  // If path is root (/), auth (/auth), or onboarding (/onboarding), don't show navbar
  const hideNavbar =
    pathname === '/' || pathname === '/auth' || pathname === '/onboarding';

  if (hideNavbar) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md md:max-w-xl z-40">
      <nav className="glass-navbar border border-white/10 rounded-[24px] py-2 px-4 shadow-xl flex items-center justify-around relative">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative flex flex-col md:flex-row items-center gap-1.5 py-2 px-4 rounded-xl text-white/50 hover:text-white transition-all select-none group"
            >
              {/* Highlight Background Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-white/5 rounded-2xl border border-white/5"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 transition-transform group-active:scale-95 ${
                  isActive ? 'text-accent-red-hover drop-shadow-[0_0_8px_rgba(255,45,45,0.4)]' : ''
                }`}
              >
                <Icon size={20} />
              </div>

              {/* Label */}
              <span
                className={`relative z-10 font-manrope text-[10px] md:text-xs font-semibold tracking-wide hidden md:block transition-all ${
                  isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
