'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/UI/GlassCard';
import { Code2, Mail, Globe, Sparkles, Terminal, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const SKILLS = [
  'Next.js (App Router)',
  'React (v19)',
  'Tailwind CSS v4',
  'Framer Motion',
  'MongoDB & Mongoose',
  'REST API Design',
  'Progressive Web Apps',
  'Offline Cache Systems',
  'UI/UX Prototyping',
];

const TIMELINE_EVENTS = [
  {
    year: '2026',
    title: 'Calora Launched',
    desc: 'Engineered a highly animated, responsive OLED-first fitness shell with Next.js and PWA service workers.',
  },
  {
    year: '2025',
    title: 'Design Systems Architect',
    desc: 'Crafted premium component libraries and fluid UI patterns for performance-driven enterprise applications.',
  },
  {
    year: '2023',
    title: 'PWA & Offline Specialist',
    desc: 'Configured robust offline databases and synchronization channels using local fallbacks and Service Workers.',
  },
  {
    year: '2021',
    title: 'Full Stack Engineer',
    desc: 'Bootstrapped multi-tier web apps using JavaScript ecosystems, Express servers, and database layer integrations.',
  },
];

export default function AboutPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('developer@calora.fit');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-20 select-none">
      {/* Header */}
      <div className="mt-2">
        <span className="font-manrope text-[10px] font-extrabold text-accent-red-hover uppercase tracking-widest flex items-center gap-1.5">
          <Terminal size={11} />
          Terminal Shell
        </span>
        <h2 className="font-manrope text-2xl font-black text-white tracking-tight">
          Developer Profile
        </h2>
      </div>

      {/* Grid Layout (Nothing OS Inspired) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <GlassCard className="md:col-span-1 border-white/5 flex flex-col items-center text-center justify-center p-6 py-8">
          {/* Avatar Placeholder with Pulsing Red Gradient */}
          <div className="relative w-24 h-24 rounded-full bg-[#0F0F0F] border border-white/10 flex items-center justify-center mb-5 overflow-hidden">
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-accent-red to-accent-red-hover opacity-80" />
            <span className="font-manrope text-2xl font-black text-white relative z-10">AV</span>
            <div className="absolute inset-0 bg-radial from-accent-red/20 to-transparent animate-pulse" />
          </div>

          <h3 className="font-manrope text-lg font-black text-white tracking-tight mb-1">
            Aditya Verma
          </h3>
          <p className="font-manrope text-[10px] text-accent-red-hover font-bold uppercase tracking-wider mb-4">
            Senior UI/UX & Web Engineer
          </p>

          <p className="font-sans text-xs text-white/50 leading-relaxed max-w-[180px]">
            Building highly animated, minimal interfaces and premium app experiences.
          </p>
        </GlassCard>

        {/* Bio & Skills Cloud */}
        <GlassCard className="md:col-span-2 border-white/5 flex flex-col justify-between p-6">
          <div>
            <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 block">
              Biography & Mission
            </span>
            <p className="font-sans text-sm text-white/80 leading-relaxed mb-6">
              Hi, I'm Aditya. I specialize in crafting high-end Progressive Web Apps. I combine meticulous product design with optimized engineering to build applications that feel fluid, intentional, and satisfying to use. Calora is a testbed for premium styling, blurs, and offline compatibility.
            </p>
          </div>

          <div>
            <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 block">
              Skill set
            </span>
            <div className="flex gap-2 flex-wrap">
              {SKILLS.map((skill) => (
                <div
                  key={skill}
                  className="px-2.5 py-1 rounded-xl bg-white/3 border border-white/5 text-[10px] font-bold font-manrope text-white/70 hover:text-white hover:border-white/10 transition-all cursor-default"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

      </div>

      {/* Tech Stack Details */}
      <GlassCard className="border-white/5 p-6">
        <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 block flex items-center gap-1.5">
          <Code2 size={11} className="text-accent-red" />
          Calora Application Tech Stack
        </span>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
            <span className="block text-[8px] text-white/45 uppercase font-bold mb-1">Architecture</span>
            <span className="font-manrope text-xs font-bold text-white">Next.js 16 App Router</span>
          </div>
          <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
            <span className="block text-[8px] text-white/45 uppercase font-bold mb-1">Styling Shell</span>
            <span className="font-manrope text-xs font-bold text-white">Tailwind CSS v4 (Glassmorphic)</span>
          </div>
          <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
            <span className="block text-[8px] text-white/45 uppercase font-bold mb-1">Animations</span>
            <span className="font-manrope text-xs font-bold text-white">Framer Motion (Springs)</span>
          </div>
          <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
            <span className="block text-[8px] text-white/45 uppercase font-bold mb-1">Database</span>
            <span className="font-manrope text-xs font-bold text-white">MongoDB & Mongoose</span>
          </div>
        </div>
      </GlassCard>

      {/* Milestone Timeline */}
      <GlassCard className="border-white/5 p-6">
        <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-5 block flex items-center gap-1.5">
          <Calendar size={11} className="text-accent-red" />
          Development Timeline
        </span>

        <div className="flex flex-col gap-6 relative pl-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
          {TIMELINE_EVENTS.map((event) => (
            <div key={event.year} className="flex gap-4 relative">
              {/* Ring indicator */}
              <div className="absolute left-[-11px] top-1.5 w-2 h-2 rounded-full bg-accent-red border border-black z-10 shadow-[0_0_8px_#E50914]" />
              
              <div className="text-left flex-grow">
                <span className="font-manrope text-xs font-black text-accent-red-hover">
                  {event.year}
                </span>
                <h4 className="font-manrope text-xs font-bold text-white mt-0.5">
                  {event.title}
                </h4>
                <p className="font-sans text-[11px] text-white/45 mt-0.5 leading-relaxed">
                  {event.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Contact Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* GitHub */}
        <a
          href="https://github.com/aditya-vrm"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/3 border border-white/5 hover:border-white/10 rounded-2xl p-4 text-center transition-all flex flex-col items-center gap-2"
        >
          <svg className="w-5 h-5 text-white/60 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          <span className="font-manrope text-[10px] font-bold text-white uppercase tracking-wider">GitHub</span>
        </a>

        {/* LinkedIn */}
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/3 border border-white/5 hover:border-white/10 rounded-2xl p-4 text-center transition-all flex flex-col items-center gap-2"
        >
          <svg className="w-5 h-5 text-sky-400 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          <span className="font-manrope text-[10px] font-bold text-white uppercase tracking-wider">LinkedIn</span>
        </a>

        {/* Email */}
        <button
          onClick={handleCopyEmail}
          className="bg-white/3 border border-white/5 hover:border-white/10 rounded-2xl p-4 text-center transition-all flex flex-col items-center gap-2 focus:outline-none"
        >
          <Mail size={18} className="text-accent-red" />
          <span className="font-manrope text-[10px] font-bold text-white uppercase tracking-wider">
            {copiedEmail ? 'Copied!' : 'Copy Email'}
          </span>
        </button>

        {/* Portfolio */}
        <a
          href="https://github.com/aditya-vrm/Calora"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/3 border border-white/5 hover:border-white/10 rounded-2xl p-4 text-center transition-all flex flex-col items-center gap-2"
        >
          <Globe size={18} className="text-emerald-500" />
          <span className="font-manrope text-[10px] font-bold text-white uppercase tracking-wider">Source Repo</span>
        </a>
      </div>
    </div>
  );
}
