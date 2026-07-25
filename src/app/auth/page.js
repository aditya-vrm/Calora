'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/UI/GlassCard';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { Flame, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FITNESS_QUOTES = {
  login: [
    "Welcome back, protein enthusiast.",
    "One more rep... and one more password.",
    "Time to log those cheats (we won't judge).",
    "Did you hit your macros yesterday?",
  ],
  signup: [
    "Calories don't count while signing up.",
    "Let's pretend today starts the diet.",
    "Your future self is already thanking you.",
    "Step 1: Create Account. Step 2: Flex.",
  ],
};

export default function AuthPage() {
  const router = useRouter();
  const { user, login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [quote, setQuote] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Set randomized fitness quote on toggle
  useEffect(() => {
    const list = isLogin ? FITNESS_QUOTES.login : FITNESS_QUOTES.signup;
    setQuote(list[Math.floor(Math.random() * list.length)]);
    setError('');
  }, [isLogin]);

  // If user is already authenticated, redirect to onboarding or dashboard
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
      setError('Please fill in all credentials.');
      setFormLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error);
        }
      } else {
        if (!firstName || !lastName) {
          setError('First and last name are required.');
          setFormLoading(false);
          return;
        }
        const res = await register(email, password, firstName, lastName);
        if (!res.success) {
          setError(res.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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

      {/* Main Glass Auth Card */}
      <GlassCard className="w-full max-w-sm border-white/5 shadow-2xl relative z-10 p-6 md:p-8">
        {/* Animated Header */}
        <div className="text-center mb-6">
          <h2 className="font-manrope text-2xl font-extrabold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Get Started'}
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

        {/* Auth Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs font-semibold text-red-500"
          >
            {error}
          </motion.div>
        )}

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex gap-4">
              <Input
                label="First Name"
                placeholder="Chris"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                icon={User}
                required
              />
              <Input
                label="Last Name"
                placeholder="Bumstead"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="protein@calora.fit"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            name="password"
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
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6 gap-3">
          <div className="flex-grow h-[1px] bg-white/5" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-white/30">
            Or continue with
          </span>
          <div className="flex-grow h-[1px] bg-white/5" />
        </div>

        {/* OAuth Buttons Placeholder */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setError('Google OAuth placeholder. Using local auth instead.')}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-white/70"
          >
            {/* Google SVG */}
            <svg className="w-4 h-4 fill-current text-white/80" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.86-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.185 15.428 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.984 0-.74-.08-1.302-.178-1.78l-10.615.01z" />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => setError('Apple OAuth placeholder. Using local auth instead.')}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-white/70"
          >
            {/* Apple SVG */}
            <svg className="w-4 h-4 fill-current text-white/80" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.63.73-1.18 1.87-1.03 2.97 1.1.09 2.23-.57 2.98-1.41z" />
            </svg>
            Apple
          </button>
        </div>

        {/* View Switcher Toggle */}
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-semibold text-white/40 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="text-accent-red-hover hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
