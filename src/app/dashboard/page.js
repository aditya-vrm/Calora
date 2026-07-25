'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import GlassCard from '@/components/UI/GlassCard';
import WaterTracker from '@/components/WaterTracker';
import WeightTrendChart from '@/components/WeightTrendChart';
import ConfettiCelebration from '@/components/UI/Confetti';
import { Flame, Trophy, FlameKindling, Activity, Navigation, Weight, Heart, Plus, Sparkles, LogOut, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const MOTIVATIONAL_QUOTES = [
  "Consistency is the magic ingredient. Keep going!",
  "Make today's workout tomorrow's warm-up.",
  "Your body is a reflection of your habits, not your wishes.",
  "Strength does not come from what you can do. It comes from overcoming the things you once thought you couldn't.",
  "Great things are built one rep, one macro, one day at a time.",
  "You don't have to be extreme, just consistent."
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { records, getDailyTotals, deleteRecord } = useApp();
  const [todayStr, setTodayStr] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  // Redirect to Welcome/Auth if no active session
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || !todayStr) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 rounded-full border-t-2 border-accent-red animate-spin" />
      </div>
    );
  }

  // Get daily records and totals
  const totals = getDailyTotals(todayStr);
  const targetCalories = user.targetCalories || 2000;
  const consumedCalories = totals.calories || 0;
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  
  // Calculate Macros Progress
  const targetMacros = user.targetMacros || { protein: 120, carbs: 200, fat: 65 };
  
  // Level & XP
  const userXp = user.xp || 0;
  const userLevel = Math.floor(userXp / 100) + 1;
  const levelXpProgress = userXp % 100;

  // Filter weight logs for chart
  const weightLogs = records.filter((r) => r.type === 'weight');

  // Filter recent 4 activities
  const recentActivities = records.slice(0, 4);

  // SVG Ring values
  const ringRadius = 40;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const progressPercent = Math.min(100, (consumedCalories / targetCalories) * 100);
  const strokeDashoffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  return (
    <div className="flex flex-col gap-6 w-full pb-20 select-none">
      {/* Confetti celebration mount */}
      <ConfettiCelebration />

      {/* Header Profile Section */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="font-manrope text-[10px] font-extrabold text-accent-red-hover uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={11} className="animate-spin-slow" />
            OLED Core Active
          </span>
          <h2 className="font-manrope text-2xl font-black text-white tracking-tight">
            Hi, {user.firstName || 'Enthusiast'}
          </h2>
        </div>
        
        {/* Streak and Level chips */}
        <div className="flex items-center gap-3">
          {/* Level badge */}
          <div className="bg-white/3 border border-white/5 rounded-2xl py-1.5 px-3 flex items-center gap-1.5 shadow-md">
            <Trophy size={14} className="text-amber-400" />
            <span className="font-manrope text-xs font-bold text-white">
              LVL {userLevel}
            </span>
          </div>

          {/* Streak badge */}
          <div className="bg-white/3 border border-white/5 rounded-2xl py-1.5 px-3 flex items-center gap-1.5 shadow-md">
            <FlameKindling size={14} className="text-red-500" />
            <span className="font-manrope text-xs font-bold text-white">
              {user.streak || 0} Days
            </span>
          </div>
        </div>
      </div>

      {/* Top Gamification Progress Line */}
      <div className="w-full bg-white/3 border border-white/5 p-4 rounded-2xl flex flex-col gap-2 shadow-inner">
        <div className="flex justify-between items-center text-xs font-semibold font-manrope">
          <span className="text-white/40 uppercase tracking-wider">Level {userLevel} Journey</span>
          <span className="text-white">{levelXpProgress} / 100 XP</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-red to-accent-red-hover"
            style={{ width: `${levelXpProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${levelXpProgress}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Calorie circular progress ring card */}
        <GlassCard className="flex flex-col items-center text-center justify-between py-6 md:col-span-1 border-white/5">
          <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
            Today's Calories
          </span>

          {/* SVG Progress Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={ringRadius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="7"
              />
              <motion.circle
                cx="72"
                cy="72"
                r={ringRadius}
                fill="none"
                stroke="#E50914"
                strokeWidth="7"
                strokeDasharray={ringCircumference}
                initial={{ strokeDashoffset: ringCircumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(229,9,20,0.3)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-manrope text-2xl font-black text-white">
                {consumedCalories}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/45 font-bold">
                KCAL logged
              </span>
            </div>
          </div>

          <div className="flex justify-between w-full border-t border-white/5 pt-4 mt-4 text-left">
            <div>
              <span className="block text-[9px] text-white/40 uppercase font-semibold">Remaining</span>
              <span className="font-manrope text-sm font-bold text-white">{remainingCalories} kcal</span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] text-white/40 uppercase font-semibold">Target</span>
              <span className="font-manrope text-sm font-bold text-white/70">{targetCalories} kcal</span>
            </div>
          </div>
        </GlassCard>

        {/* Macronutrients splits card */}
        <GlassCard className="flex flex-col justify-between py-6 md:col-span-1 border-white/5">
          <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
            Macronutrients splits
          </span>

          <div className="flex flex-col gap-5 flex-grow justify-center">
            {/* Protein */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-semibold font-manrope">
                <span className="text-white/60">Protein</span>
                <span className="text-white">{totals.protein || 0}g <span className="text-white/40 font-medium">/ {targetMacros.protein}g</span></span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent-red-hover"
                  style={{ width: `${Math.min(100, ((totals.protein || 0) / targetMacros.protein) * 100)}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((totals.protein || 0) / targetMacros.protein) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-semibold font-manrope">
                <span className="text-white/60">Carbs</span>
                <span className="text-white">{totals.carbs || 0}g <span className="text-white/40 font-medium">/ {targetMacros.carbs}g</span></span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-orange-500"
                  style={{ width: `${Math.min(100, ((totals.carbs || 0) / targetMacros.carbs) * 100)}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((totals.carbs || 0) / targetMacros.carbs) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {/* Fats */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-semibold font-manrope">
                <span className="text-white/60">Fats</span>
                <span className="text-white">{totals.fat || 0}g <span className="text-white/40 font-medium">/ {targetMacros.fat}g</span></span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-400"
                  style={{ width: `${Math.min(100, ((totals.fat || 0) / targetMacros.fat) * 100)}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((totals.fat || 0) / targetMacros.fat) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-white/30 text-center uppercase font-semibold mt-4 pt-3 border-t border-white/5">
            Macros based on {user.goal || 'maintain'} target
          </div>
        </GlassCard>

        {/* Steps and BMI mini cards */}
        <div className="flex flex-col gap-6 md:col-span-1">
          {/* Steps Progress Card */}
          <GlassCard className="flex-1 flex flex-col justify-between p-5 border-white/5">
            <div className="flex justify-between items-start">
              <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Daily Steps
              </span>
              <Navigation size={14} className="text-sky-400 transform rotate-45" />
            </div>
            <div>
              <h4 className="font-manrope text-xl font-black text-white mt-3">
                {totals.steps || 0} <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Steps</span>
              </h4>
              <p className="font-sans text-[10px] text-white/40 leading-relaxed mb-2.5">
                Goal: 10,000 steps (+15 XP on completion).
              </p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-sky-400"
                  style={{ width: `${Math.min(100, ((totals.steps || 0) / 10000) * 100)}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((totals.steps || 0) / 10000) * 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Quick Logs Link Card */}
          <GlassCard
            onClick={() => router.push('/records')}
            className="flex-1 flex flex-col justify-between p-5 border-white/5 hover:border-accent-red/20"
          >
            <div className="flex justify-between items-start">
              <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Log Activity
              </span>
              <Plus size={14} className="text-accent-red" />
            </div>
            <div className="flex items-center justify-between mt-3">
              <div>
                <h4 className="font-manrope text-sm font-bold text-white mb-0.5">
                  Record Food / Weight
                </h4>
                <p className="font-sans text-[10px] text-white/40">
                  Update your logs for today.
                </p>
              </div>
              <ArrowRight size={16} className="text-white/30" />
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Water Tracker Card */}
      <GlassCard className="border-white/5">
        <WaterTracker currentWater={totals.water || 0} targetWater={2000} />
      </GlassCard>

      {/* Weight History Line Chart */}
      <GlassCard className="border-white/5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
              <Weight size={10} className="text-red-500" />
              Weight Progression
            </span>
            <h4 className="font-manrope text-base font-bold text-white">
              Trend Analytics
            </h4>
          </div>
          <span className="font-manrope text-xs font-semibold text-white/45 bg-white/3 border border-white/5 py-1 px-2.5 rounded-xl uppercase">
            {user.weightUnit || 'kg'} Unit
          </span>
        </div>
        <WeightTrendChart weightLogs={weightLogs} weightUnit={user.weightUnit} />
      </GlassCard>

      {/* Grid: Quotes and Unlocked Badges Shelf */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quote Card */}
        <GlassCard className="border-white/5 flex flex-col justify-between py-6">
          <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-1">
            <BookOpen size={10} className="text-accent-red-hover" />
            Daily Mindset
          </span>
          <p className="font-sans text-sm text-white/70 italic leading-relaxed py-2 flex-grow">
            "{quote}"
          </p>
          <div className="text-[10px] text-white/30 uppercase font-semibold mt-4">
            Philosophy of discipline
          </div>
        </GlassCard>

        {/* Badges card */}
        <GlassCard className="border-white/5 flex flex-col justify-between py-6">
          <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Trophy size={10} className="text-amber-400" />
            Achievements Badges
          </span>

          <div className="flex gap-4 flex-wrap py-2 flex-grow items-center">
            {user.badges && user.badges.length > 0 ? (
              user.badges.map((badge) => {
                let colorClass = 'text-white border-white/10';
                if (badge === 'First Rep') colorClass = 'text-amber-400 border-amber-400/20 bg-amber-400/5';
                if (badge === 'Streak Starter') colorClass = 'text-red-500 border-red-500/20 bg-red-500/5';
                if (badge === 'Hydration Hero') colorClass = 'text-sky-400 border-sky-400/20 bg-sky-400/5';
                if (badge === 'Calorie Crusader') colorClass = 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
                if (badge === 'Step Master') colorClass = 'text-indigo-400 border-indigo-400/20 bg-indigo-400/5';

                return (
                  <div
                    key={badge}
                    className={`px-3 py-1.5 rounded-2xl border text-xs font-bold font-manrope flex items-center gap-1.5 shadow-sm ${colorClass}`}
                  >
                    <Trophy size={12} />
                    {badge}
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider py-4">
                No Badges Earned. Log your first meal!
              </span>
            )}
          </div>

          <div className="text-[10px] text-white/30 uppercase font-semibold mt-4">
            Earn badge trophies via daily challenges
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity Section */}
      <div className="flex flex-col gap-4 mt-2">
        <h3 className="font-manrope text-lg font-black text-white tracking-tight px-1">
          Recent Activity
        </h3>
        
        <div className="flex flex-col gap-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((log) => {
              let title = '';
              let value = '';
              let desc = '';

              const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC',
              });

              if (log.type === 'food') {
                title = log.foodDetails.foodName;
                value = `${log.foodDetails.calories} kcal`;
                desc = `${log.foodDetails.mealType} | P: ${log.foodDetails.protein}g | C: ${log.foodDetails.carbs}g | F: ${log.foodDetails.fat}g`;
              } else if (log.type === 'weight') {
                title = 'Weight Logged';
                value = `${log.weightVal} ${user.weightUnit}`;
                desc = `Updated body weight tracker`;
              } else if (log.type === 'steps') {
                title = 'Steps Count';
                value = `${log.stepsVal} steps`;
                desc = `Updated physical progress`;
              } else if (log.type === 'water') {
                title = 'Water Hydration';
                value = `+${log.waterVal} ml`;
                desc = `Logged water intake`;
              }

              return (
                <div
                  key={log._id}
                  className="bg-white/3 border border-white/5 p-4 rounded-2xl flex justify-between items-center transition-all hover:bg-white/5"
                >
                  <div className="text-left">
                    <h5 className="font-manrope text-sm font-bold text-white">
                      {title}
                    </h5>
                    <p className="font-sans text-[10px] text-white/40 mt-0.5">
                      {formattedDate} • {desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-manrope text-sm font-extrabold text-white">
                      {value}
                    </span>
                    <button
                      onClick={() => deleteRecord(log._id)}
                      className="text-[10px] font-bold text-red-500/60 hover:text-red-500 transition-colors bg-red-500/5 hover:bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/10 select-none"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 bg-white/2 border border-white/5 rounded-2xl text-center">
              <span className="font-manrope text-xs font-semibold text-white/30 uppercase tracking-widest">
                No recent activity logged
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
