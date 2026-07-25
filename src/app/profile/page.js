'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import GlassCard from '@/components/UI/GlassCard';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { calculateBMI, cmToFeetIn, feetInToCm, kgToLbs, lbsToKg } from '@/utils/fitness';
import { Settings, User, Scale, Activity, Award, LogOut, Trash2, Download, Shield, Bell, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile, logout, deleteAccount, isOfflineMode } = useAuth();
  const { records } = useApp();

  // Edit states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  
  // Height & Weight edit fields (bound to active units)
  const [heightUnit, setHeightUnit] = useState('cm');
  const [heightCm, setHeightCm] = useState(170);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);

  const [weightUnit, setWeightUnit] = useState('kg');
  const [weightVal, setWeightVal] = useState(70);

  const [workoutFrequency, setWorkoutFrequency] = useState('3-4');
  const [goal, setGoal] = useState('maintain');

  // Setting preferences states
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync states on mount
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setAge(user.age || 25);
      setHeightUnit(user.heightUnit || 'cm');
      setWeightUnit(user.weightUnit || 'kg');
      
      const h = user.height || 170;
      setHeightCm(h);
      const ftIn = cmToFeetIn(h);
      setHeightFt(ftIn.feet);
      setHeightIn(ftIn.inches);

      const w = user.weight || 70;
      if (user.weightUnit === 'lbs') {
        setWeightVal(kgToLbs(w));
      } else {
        setWeightVal(w);
      }

      setWorkoutFrequency(user.workoutFrequency || '3-4');
      setGoal(user.goal || 'maintain');
    }
  }, [user]);

  // Height sync for ft changes
  useEffect(() => {
    if (heightUnit === 'ft') {
      setHeightCm(feetInToCm(heightFt, heightIn));
    }
  }, [heightFt, heightIn, heightUnit]);

  // Redirect if unauthorized
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 rounded-full border-t-2 border-accent-red animate-spin" />
      </div>
    );
  }

  const handleHeightUnitChange = (newUnit) => {
    if (newUnit === heightUnit) return;
    setHeightUnit(newUnit);
    if (newUnit === 'ft') {
      const ftIn = cmToFeetIn(heightCm);
      setHeightFt(ftIn.feet);
      setHeightIn(ftIn.inches);
    } else {
      setHeightCm(feetInToCm(heightFt, heightIn));
    }
  };

  const handleWeightUnitChange = (newUnit) => {
    if (newUnit === weightUnit) return;
    setWeightUnit(newUnit);
    if (newUnit === 'lbs') {
      setWeightVal(kgToLbs(weightVal));
    } else {
      setWeightVal(lbsToKg(weightVal));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!firstName || !lastName || !age || !weightVal) {
      setError('Please fill in all profile fields.');
      setSaving(false);
      return;
    }

    const actualWeightKg = weightUnit === 'lbs' ? lbsToKg(weightVal) : weightVal;

    const payload = {
      firstName,
      lastName,
      age: parseInt(age, 10),
      height: heightCm,
      weight: actualWeightKg,
      heightUnit,
      weightUnit,
      workoutFrequency,
      goal,
    };

    const res = await updateProfile(payload);
    setSaving(false);
    if (res.success) {
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error || 'Failed to update profile.');
    }
  };

  // Export Data as JSON
  const handleExportData = () => {
    const dataToExport = {
      profile: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        age: user.age,
        height: `${user.height} cm`,
        weight: `${user.weight} kg`,
        xp: user.xp,
        streak: user.streak,
        badges: user.badges,
      },
      records: records,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `calora_export_${user.firstName.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you absolutely sure you want to delete your Calora account? This action is permanent and clears all logged progress.'
    );
    if (confirmDelete) {
      await deleteAccount();
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // BMI calculation for status card
  const displayBmi = calculateBMI(user.weight, user.height);

  return (
    <div className="flex flex-col gap-6 w-full pb-20 select-none">
      {/* Header */}
      <div className="mt-2 flex justify-between items-center">
        <div>
          <span className="font-manrope text-[10px] font-extrabold text-accent-red-hover uppercase tracking-widest flex items-center gap-1.5">
            <Settings size={11} />
            Control Center
          </span>
          <h2 className="font-manrope text-2xl font-black text-white tracking-tight">
            Settings & Account
          </h2>
        </div>
        
        {/* Offline indicator */}
        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase border ${
          isOfflineMode 
            ? 'bg-amber-400/5 text-amber-400 border-amber-400/20' 
            : 'bg-emerald-400/5 text-emerald-400 border-emerald-400/20'
        }`}>
          {isOfflineMode ? 'Sandbox Mode' : 'Cloud Connected'}
        </span>
      </div>

      {/* Notifications / Success alerts */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs font-semibold text-emerald-500"
        >
          {success}
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs font-semibold text-red-500"
        >
          {error}
        </motion.div>
      )}

      {/* Profile Overview Card */}
      <GlassCard className="border-white/5 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-manrope text-lg font-black text-white">
            {firstName[0]}
            {lastName[0]}
          </div>
          <div className="text-left">
            <h3 className="font-manrope text-base font-bold text-white leading-tight">
              {firstName} {lastName}
            </h3>
            <p className="font-sans text-[10px] text-white/40 mt-1 uppercase tracking-wider font-semibold">
              Joined Calora: {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Dynamic target highlights */}
        <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 mt-2 text-center text-xs font-semibold">
          <div>
            <span className="block text-[8px] text-white/40 uppercase font-bold mb-0.5">BMI Score</span>
            <span className="text-white font-manrope">{displayBmi}</span>
          </div>
          <div>
            <span className="block text-[8px] text-white/40 uppercase font-bold mb-0.5">Calorie Target</span>
            <span className="text-white font-manrope">{user.targetCalories} kcal</span>
          </div>
          <div>
            <span className="block text-[8px] text-white/40 uppercase font-bold mb-0.5">Rank XP</span>
            <span className="text-white font-manrope">{user.xp || 0} XP</span>
          </div>
        </div>
      </GlassCard>

      {/* Edit Profile Form */}
      <GlassCard className="border-white/5 p-6">
        <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 block flex items-center gap-1.5">
          <User size={11} className="text-accent-red" />
          Edit Fitness Metrics
        </span>

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(Math.max(1, parseInt(e.target.value, 10) || ''))}
            required
          />

          {/* Height input with units */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase">
                Height
              </span>
              <div className="flex bg-white/3 rounded-full p-0.5 border border-white/5">
                <button
                  type="button"
                  onClick={() => handleHeightUnitChange('cm')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    heightUnit === 'cm' ? 'bg-accent-red text-white' : 'text-white/40'
                  }`}
                >
                  CM
                </button>
                <button
                  type="button"
                  onClick={() => handleHeightUnitChange('ft')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    heightUnit === 'ft' ? 'bg-accent-red text-white' : 'text-white/40'
                  }`}
                >
                  FT
                </button>
              </div>
            </div>

            {heightUnit === 'cm' ? (
              <Input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Math.max(1, parseInt(e.target.value, 10) || ''))}
                required
              />
            ) : (
              <div className="flex gap-4">
                <Input
                  label="Feet"
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(Math.max(0, parseInt(e.target.value, 10) || ''))}
                />
                <Input
                  label="Inches"
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(Math.max(0, Math.min(11, parseInt(e.target.value, 10) || '')))}
                />
              </div>
            )}
          </div>

          {/* Weight input with units */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase">
                Current Weight
              </span>
              <div className="flex bg-white/3 rounded-full p-0.5 border border-white/5">
                <button
                  type="button"
                  onClick={() => handleWeightUnitChange('kg')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    weightUnit === 'kg' ? 'bg-accent-red text-white' : 'text-white/40'
                  }`}
                >
                  KG
                </button>
                <button
                  type="button"
                  onClick={() => handleWeightUnitChange('lbs')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    weightUnit === 'lbs' ? 'bg-accent-red text-white' : 'text-white/40'
                  }`}
                >
                  LBS
                </button>
              </div>
            </div>

            <Input
              type="number"
              value={weightVal}
              onChange={(e) => setWeightVal(Math.max(1, parseFloat(e.target.value) || ''))}
              required
            />
          </div>

          {/* Workout frequency select */}
          <div className="flex flex-col gap-2">
            <label className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase ml-1">
              Workout Frequency
            </label>
            <select
              value={workoutFrequency}
              onChange={(e) => setWorkoutFrequency(e.target.value)}
              className="w-full py-3.5 px-4 glass-input text-sm font-sans tracking-wide"
            >
              <option value="0" className="bg-black">0 Days (Sedentary)</option>
              <option value="1-2" className="bg-black">1-2 Days (Lightly Active)</option>
              <option value="3-4" className="bg-black">3-4 Days (Moderately Active)</option>
              <option value="5-6" className="bg-black">5-6 Days (Very Active)</option>
              <option value="7" className="bg-black">7 Days (Extremely Active)</option>
            </select>
          </div>

          {/* Goal selection */}
          <div className="flex flex-col gap-2">
            <label className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase ml-1">
              Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full py-3.5 px-4 glass-input text-sm font-sans tracking-wide"
            >
              <option value="lose" className="bg-black">Lose Fat</option>
              <option value="maintain" className="bg-black">Maintain Weight</option>
              <option value="lean-bulk" className="bg-black">Lean Bulk</option>
              <option value="gain" className="bg-black">Muscle Gain / Bulk</option>
            </select>
          </div>

          <Button
            type="submit"
            loading={saving}
            className="w-full mt-4 py-3.5 text-sm font-bold shadow-lg shadow-accent-red/10 bg-gradient-to-r from-accent-red to-accent-red-hover"
          >
            Update Profile Targets
          </Button>
        </form>
      </GlassCard>

      {/* Settings Options Card */}
      <GlassCard className="border-white/5 p-6 flex flex-col gap-4">
        <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
          <Settings size={11} className="text-accent-red" />
          App Preferences
        </span>

        {/* Notifications toggle toggle */}
        <div className="flex justify-between items-center py-2 border-b border-white/5">
          <div className="text-left">
            <h5 className="font-manrope text-xs font-bold text-white flex items-center gap-1.5">
              <Bell size={13} className="text-white/60" />
              Daily Reminders
            </h5>
            <p className="font-sans text-[10px] text-white/40 mt-0.5">
              Receive water intake and logging notifications.
            </p>
          </div>
          <button
            onClick={() => setAllowNotifications(!allowNotifications)}
            className={`w-10 h-6 rounded-full p-1 transition-all ${
              allowNotifications ? 'bg-accent-red' : 'bg-white/10'
            } flex items-center`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
              allowNotifications ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Privacy options toggle toggle */}
        <div className="flex justify-between items-center py-2 border-b border-white/5">
          <div className="text-left">
            <h5 className="font-manrope text-xs font-bold text-white flex items-center gap-1.5">
              <Shield size={13} className="text-white/60" />
              Private Profile
            </h5>
            <p className="font-sans text-[10px] text-white/40 mt-0.5">
              Keep calorie counts and weight targets private.
            </p>
          </div>
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-10 h-6 rounded-full p-1 transition-all ${
              isPrivate ? 'bg-accent-red' : 'bg-white/10'
            } flex items-center`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
              isPrivate ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Export Data CTA */}
        <div className="flex justify-between items-center py-2">
          <div className="text-left">
            <h5 className="font-manrope text-xs font-bold text-white flex items-center gap-1.5">
              <Download size={13} className="text-white/60" />
              Export Personal Logs
            </h5>
            <p className="font-sans text-[10px] text-white/40 mt-0.5">
              Download a complete JSON database of your fitness logs.
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all focus:outline-none"
          >
            <Download size={14} />
          </button>
        </div>
      </GlassCard>

      {/* Account Deletion and Logout Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          variant="secondary"
          onClick={handleLogout}
          className="w-full py-4 text-xs uppercase tracking-wider font-bold border border-white/10 hover:border-white/20"
        >
          <LogOut size={14} className="text-white/60" />
          Logout Session
        </Button>

        <button
          onClick={handleDeleteAccount}
          className="w-full py-4 rounded-2xl bg-red-950/15 border border-red-500/10 hover:bg-red-950/30 hover:border-red-500/20 text-red-500 font-manrope text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 select-none focus:outline-none"
        >
          <Trash2 size={14} />
          Delete Calora Account
        </button>
      </div>
    </div>
  );
}
