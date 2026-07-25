'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/UI/GlassCard';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { Flame, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGIN_QUOTES = [
  "Welcome back, protein enthusiast.",
  "One more rep... and one more password.",
  "Time to log those cheats (we won't judge).",
  "Did you hit your macros yesterday?",
];

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading } = useAuth();
  const [quote, setQuote] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setQuote(LOGIN_QUOTES[Math.floor(Math.random() * LOGIN_QUOTES.length)]);
    setError('');
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (!user.height || user.height === 175 && !user.firstName) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    if (!email || !password) {
      setError('Please enter your email and password.');
      setFormLoading(false);
      return;
    }

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error);
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-black select-none overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[-25%] left-[-25%] w-[150%] h-[50%] rounded-full bg-radial from-accent-glow to-transparent opacity-50 blur-3xl pointer-events-none" />

      {/* Floating Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        onClick={() => router.push('/')}
        className="flex items-center gap-2 mb-8 cursor-pointer z-10"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Flame className="w-4 h-4 text-accent-red-hover drop-shadow-[0_0_8px_rgba(255,45,45,0.4)]" />
        </div>
        <span className="font-manrope text-sm font-extrabold tracking-wider text-white">
          CALORA
        </span>
      </motion.div>

      {/* Login Card */}
      <GlassCard className="w-full max-w-sm border-white/5 shadow-2xl relative z-10 p-6 md:p-8">
        <div className="text-center mb-6">
          <h2 className="font-manrope text-2xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 0.5, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="text-xs text-white/50 font-sans mt-2 italic min-h-[16px]"
            >
              {quote}
            </motion.p>
          </AnimatePresence>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs font-semibold text-red-500"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="protein@calora.fit"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            loading={formLoading || loading}
            className="w-full mt-2 py-3.5 text-sm font-bold shadow-lg shadow-accent-red/10"
          >
            Sign In
          </Button>
        </form>

        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            className="text-xs font-semibold text-white/40 hover:text-white transition-colors"
          >
            Don't have an account?{' '}
            <span className="text-accent-red-hover hover:underline">
              Sign Up
            </span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
