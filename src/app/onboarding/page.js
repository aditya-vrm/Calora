'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/UI/GlassCard';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { calculateFitnessParams, getBMICategory, cmToFeetIn, feetInToCm, kgToLbs, lbsToKg } from '@/utils/fitness';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, Dumbbell, Award, ArrowLeft, ArrowRight, Check, Flame } from 'lucide-react';

const STEPS_COUNT = 4;

export default function OnboardingWizard() {
  const router = useRouter();
  const { user, register, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Body Metrics
  const [gender, setGender] = useState('male');
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' | 'ft'
  const [heightVal, setHeightVal] = useState(170); // raw height (cm or total inches)
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' | 'lbs'
  const [weightVal, setWeightVal] = useState(70); // raw weight (kg or lbs)

  // Step 3: Fitness Metrics
  const [age, setAge] = useState(25);
  const [workoutFrequency, setWorkoutFrequency] = useState('3-4'); // '0' | '1-2' | '3-4' | '5-6' | '7'
  const [selectedGoal, setSelectedGoal] = useState('maintain'); // 'lose' | 'maintain' | 'gain'

  // Step 4: Calculations Preview
  const [preview, setPreview] = useState(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !isSaving) {
      router.push('/dashboard');
    }
  }, [user, router, isSaving]);

  // Height Slider limits
  const heightMin = heightUnit === 'cm' ? 100 : 39; // 3ft 3in
  const heightMax = heightUnit === 'cm' ? 220 : 87; // 7ft 3in
  
  // Weight Slider limits
  const weightMin = weightUnit === 'kg' ? 30 : 66;
  const weightMax = weightUnit === 'kg' ? 180 : 400;

  // Handle Height Unit Change
  const handleHeightUnitChange = (newUnit) => {
    if (newUnit === heightUnit) return;
    setHeightUnit(newUnit);

    if (newUnit === 'ft') {
      // Convert cm to total inches
      const inches = Math.round(heightVal / 2.54);
      setHeightVal(inches);
    } else {
      // Convert total inches to cm
      const cm = Math.round(heightVal * 2.54);
      setHeightVal(cm);
    }
  };

  // Handle Weight Unit Change
  const handleWeightUnitChange = (newUnit) => {
    if (newUnit === weightUnit) return;
    setWeightUnit(newUnit);

    if (newUnit === 'lbs') {
      setWeightVal(kgToLbs(weightVal));
    } else {
      setWeightVal(lbsToKg(weightVal));
    }
  };

  // Perform Calculations when step 4 is reached
  useEffect(() => {
    if (step === 4) {
      const actualWeightKg = weightUnit === 'lbs' ? lbsToKg(weightVal) : weightVal;
      const actualHeightCm = heightUnit === 'ft' ? Math.round(heightVal * 2.54) : heightVal;

      const params = calculateFitnessParams({
        weight: actualWeightKg,
        height: actualHeightCm,
        age: parseInt(age, 10),
        gender,
        workoutFrequency,
        goal: selectedGoal,
      });

      setPreview(params);
    }
  }, [step, age, gender, heightVal, heightUnit, weightVal, weightUnit, workoutFrequency, selectedGoal]);

  const handleNext = () => {
    setError('');
    
    // Step 1 Validations
    if (step === 1) {
      if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !password || !confirmPassword) {
        setError('Please fill in all basic details.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleFinishingUp = async () => {
    setError('');
    setIsSaving(true);

    const actualWeightKg = weightUnit === 'lbs' ? lbsToKg(weightVal) : weightVal;
    const actualHeightCm = heightUnit === 'ft' ? Math.round(heightVal * 2.54) : heightVal;

    const signupPayload = {
      email,
      password,
      fullName,
      phoneNumber,
      gender,
      height: actualHeightCm,
      weight: actualWeightKg,
      heightUnit,
      weightUnit,
      age: parseInt(age, 10),
      workoutFrequency,
      goal: selectedGoal,
    };

    const res = await register(signupPayload);
    setIsSaving(false);
    
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Failed to complete registration.');
    }
  };

  // Formatting helpers
  const formatHeightDisplay = () => {
    if (heightUnit === 'cm') {
      return `${heightVal} cm`;
    } else {
      const feet = Math.floor(heightVal / 12);
      const inches = Math.round(heightVal % 12);
      return `${feet}'${inches}"`;
    }
  };

  const formatWeightDisplay = () => {
    return `${parseFloat(weightVal).toFixed(1)} ${weightUnit}`;
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 bg-black select-none overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[-30%] left-[-20%] w-[140%] h-[50%] bg-radial from-accent-glow to-transparent opacity-40 blur-3xl pointer-events-none" />

      {/* Floating Logo */}
      <div className="flex items-center gap-2 mb-6 z-10">
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Flame className="w-4 h-4 text-accent-red-hover drop-shadow-[0_0_8px_rgba(255,45,45,0.4)]" />
        </div>
        <span className="font-manrope text-sm font-extrabold tracking-wider text-white">
          CALORA
        </span>
      </div>

      {/* Wizard Card */}
      <GlassCard className="w-full max-w-sm border-white/5 shadow-2xl relative z-10 p-6 md:p-8 flex flex-col gap-6">
        
        {/* Top Progress bar */}
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex-grow h-[3px] bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className="h-full bg-accent-red"
              style={{ width: `${(step / STEPS_COUNT) * 100}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
          <span className="font-manrope text-[10px] font-extrabold text-white/40 tracking-wider">
            STEP {step} OF {STEPS_COUNT}
          </span>
        </div>

        {/* Display errors */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs font-semibold text-red-500"
          >
            {error}
          </motion.div>
        )}

        {/* Wizard Step Content */}
        <div className="min-h-[340px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Basic Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="text-left mb-2">
                  <h3 className="font-manrope text-xl font-bold text-white leading-tight">
                    Create Your Account
                  </h3>
                  <p className="font-sans text-xs text-white/40 mt-1">
                    Please provide your basic credentials.
                  </p>
                </div>

                <Input
                  label="Full Name"
                  placeholder="Arnold Schwarzenegger"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={User}
                  required
                />
                
                <Input
                  label="E-mail Address"
                  type="email"
                  placeholder="arnold@calora.fit"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  required
                />

                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 019-2831"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  icon={Phone}
                  required
                />

                <div className="flex gap-4">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={Lock}
                    required
                  />
                  <Input
                    label="Confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => router.push('/auth')}
                    className="text-xs font-semibold text-white/40 hover:text-white transition-colors"
                  >
                    Already have an account?{' '}
                    <span className="text-accent-red-hover hover:underline">
                      Sign In
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Body Metrics (Gender buttons & Sliders) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="text-left mb-2">
                  <h3 className="font-manrope text-xl font-bold text-white leading-tight">
                    Body Metrics
                  </h3>
                  <p className="font-sans text-xs text-white/40 mt-1">
                    We use these values to construct your profile.
                  </p>
                </div>

                {/* Gender selector */}
                <div className="flex flex-col gap-2.5">
                  <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase ml-1">
                    Gender
                  </span>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`flex-1 py-4 rounded-2xl border font-manrope font-bold text-sm tracking-wide uppercase transition-all select-none ${
                        gender === 'male'
                          ? 'bg-white/10 text-white border-white/20 shadow-lg'
                          : 'bg-white/3 border-white/5 text-white/40 hover:text-white/60'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`flex-1 py-4 rounded-2xl border font-manrope font-bold text-sm tracking-wide uppercase transition-all select-none ${
                        gender === 'female'
                          ? 'bg-white/10 text-white border-white/20 shadow-lg'
                          : 'bg-white/3 border-white/5 text-white/40 hover:text-white/60'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Height Slider */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase">
                      Height: <span className="text-white font-manrope font-bold normal-case text-sm ml-1">{formatHeightDisplay()}</span>
                    </span>
                    {/* Scale Toggles */}
                    <div className="flex bg-white/3 rounded-full p-0.5 border border-white/5">
                      <button
                        type="button"
                        onClick={() => handleHeightUnitChange('cm')}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                          heightUnit === 'cm' ? 'bg-accent-red text-white' : 'text-white/45'
                        }`}
                      >
                        CM
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHeightUnitChange('ft')}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                          heightUnit === 'ft' ? 'bg-accent-red text-white' : 'text-white/45'
                        }`}
                      >
                        FT
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={heightMin}
                    max={heightMax}
                    value={heightVal}
                    onChange={(e) => setHeightVal(parseInt(e.target.value, 10))}
                    className="w-full accent-accent-red cursor-pointer bg-white/10 rounded-lg appearance-none h-1.5"
                  />
                </div>

                {/* Weight Slider */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase">
                      Weight: <span className="text-white font-manrope font-bold normal-case text-sm ml-1">{formatWeightDisplay()}</span>
                    </span>
                    {/* Scale Toggles */}
                    <div className="flex bg-white/3 rounded-full p-0.5 border border-white/5">
                      <button
                        type="button"
                        onClick={() => handleWeightUnitChange('kg')}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                          weightUnit === 'kg' ? 'bg-accent-red text-white' : 'text-white/45'
                        }`}
                      >
                        KG
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWeightUnitChange('lbs')}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                          weightUnit === 'lbs' ? 'bg-accent-red text-white' : 'text-white/45'
                        }`}
                      >
                        LBS
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={weightMin}
                    max={weightMax}
                    step="0.5"
                    value={weightVal}
                    onChange={(e) => setWeightVal(parseFloat(e.target.value))}
                    className="w-full accent-accent-red cursor-pointer bg-white/10 rounded-lg appearance-none h-1.5"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Age & Workout frequency */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-5"
              >
                <div className="text-left mb-2">
                  <h3 className="font-manrope text-xl font-bold text-white leading-tight">
                    Activity & Age
                  </h3>
                  <p className="font-sans text-xs text-white/40 mt-1">
                    How many days do you train in a week?
                  </p>
                </div>

                {/* Age Range Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase">
                      Age
                    </span>
                    <span className="font-manrope text-sm font-extrabold text-white">
                      {age} years old
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                    className="w-full accent-accent-red cursor-pointer bg-white/10 rounded-lg appearance-none h-1.5"
                  />
                </div>

                {/* Workout Session Frequency Options */}
                <div className="flex flex-col gap-2">
                  <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase ml-1">
                    Workout Training Frequency
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                    {[
                      { key: '0', title: '0 Days (Sedentary)', desc: 'No active workouts' },
                      { key: '1-2', title: '1-2 Days (Light Training)', desc: 'Light cardio or yoga' },
                      { key: '3-4', title: '3-4 Days (Moderate Training)', desc: 'Structured gym lift program' },
                      { key: '5-6', title: '5-6 Days (Active Training)', desc: 'Intense weights / athletic work' },
                      { key: '7', title: '7 Days (Extremely Active)', desc: 'Daily heavy labor or double workouts' },
                    ].map((item) => (
                      <div
                        key={item.key}
                        onClick={() => setWorkoutFrequency(item.key)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          workoutFrequency === item.key
                            ? 'bg-accent-red/10 border-accent-red'
                            : 'bg-white/3 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div>
                          <h4 className="font-manrope text-xs font-bold text-white mb-0.5">
                            {item.title}
                          </h4>
                          <p className="font-sans text-[9px] text-white/40">
                            {item.desc}
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          workoutFrequency === item.key
                            ? 'bg-accent-red border-accent-red text-white'
                            : 'border-white/10'
                        }`}>
                          {workoutFrequency === item.key && <Check size={10} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Calculations Preview & Goal selection */}
            {step === 4 && preview && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="text-center">
                  <h3 className="font-manrope text-xl font-bold text-white mb-1">
                    Your Calorie Calculations
                  </h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                    Select your goal to finish up
                  </p>
                </div>

                {/* BMI indicator */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="text-left">
                    <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider">Calculated BMI</span>
                    <span className="font-manrope text-sm font-extrabold text-white mt-0.5 block">{preview.bmi}</span>
                  </div>
                  <span
                    className="font-manrope text-[10px] font-extrabold px-3 py-1 rounded-full border"
                    style={{
                      color: getBMICategory(preview.bmi).color,
                      borderColor: `${getBMICategory(preview.bmi).color}33`,
                      backgroundColor: `${getBMICategory(preview.bmi).color}11`,
                    }}
                  >
                    {getBMICategory(preview.bmi).category}
                  </span>
                </div>

                {/* Calorie Cards with Interactive Toggles to select goal */}
                <div className="flex flex-col gap-2.5">
                  {[
                    { key: 'maintain', label: 'Maintenance Calories', val: preview.maintenance, desc: 'Maintain body weight composition' },
                    { key: 'lose', label: 'Weight Loss Calories', val: preview.maintenance - 500, desc: '-500 kcal fat loss target' },
                    { key: 'gain', label: 'Weight Gain Calories', val: preview.maintenance + 500, desc: '+500 kcal muscle bulk target' },
                  ].map((card) => (
                    <div
                      key={card.key}
                      onClick={() => setSelectedGoal(card.key)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        selectedGoal === card.key
                          ? 'bg-accent-red/10 border-accent-red shadow-lg shadow-accent-red/5'
                          : 'bg-white/3 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <span className={`font-manrope text-[9px] font-bold uppercase tracking-wider ${
                          selectedGoal === card.key ? 'text-accent-red-hover' : 'text-white/40'
                        }`}>
                          {card.label}
                        </span>
                        <h4 className="font-manrope text-base font-black text-white mt-0.5">
                          {card.val} <span className="text-xs font-semibold text-white/50">kcal/day</span>
                        </h4>
                        <p className="font-sans text-[9px] text-white/40 mt-0.5">
                          {card.desc}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        selectedGoal === card.key
                          ? 'bg-accent-red border-accent-red text-white'
                          : 'border-white/10'
                      }`}>
                        {selectedGoal === card.key && <Check size={12} />}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex gap-4 border-t border-white/5 pt-6 mt-2">
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={isSaving}
              className="flex-1 py-3"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          )}

          {step < STEPS_COUNT ? (
            <Button
              onClick={handleNext}
              className="flex-grow py-3"
            >
              Next
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleFinishingUp}
              loading={isSaving}
              className="flex-grow py-3 shadow-lg shadow-accent-red/20 bg-gradient-to-r from-accent-red to-accent-red-hover"
            >
              Finishing up
              <Check size={16} />
            </Button>
          )}
        </div>

      </GlassCard>
    </div>
  );
}
