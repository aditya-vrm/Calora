'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/UI/GlassCard';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { calculateFitnessParams, getBMICategory, cmToFeetIn, feetInToCm, kgToLbs, lbsToKg } from '@/utils/fitness';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Dumbbell, Award, ArrowLeft, ArrowRight, Check } from 'lucide-react';

const STEPS_COUNT = 6;

export default function OnboardingWizard() {
  const router = useRouter();
  const { user, updateProfile, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  
  // Units & Metrics
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' | 'ft'
  const [heightCm, setHeightCm] = useState(170);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);

  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' | 'lbs'
  const [weightVal, setWeightVal] = useState(70); // raw weight based on unit

  const [workoutFrequency, setWorkoutFrequency] = useState('3-4'); // '0' | '1-2' | '3-4' | '5-6' | 'Everyday'
  const [goal, setGoal] = useState('maintain'); // 'lose' | 'maintain' | 'lean-bulk' | 'gain'

  // Calculations Preview
  const [preview, setPreview] = useState(null);

  // Sync details if user is already partially logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.firstName) setFirstName(user.firstName);
      if (user.lastName) setLastName(user.lastName);
      if (user.age) setAge(user.age);
      if (user.gender) setGender(user.gender);
      if (user.heightUnit) setHeightUnit(user.heightUnit);
      if (user.weightUnit) setWeightUnit(user.weightUnit);
      
      // Load initial height
      const h = user.height || 170;
      setHeightCm(h);
      const ftIn = cmToFeetIn(h);
      setHeightFt(ftIn.feet);
      setHeightIn(ftIn.inches);

      // Load initial weight
      const w = user.weight || 70;
      if (user.weightUnit === 'lbs') {
        setWeightVal(kgToLbs(w));
      } else {
        setWeightVal(w);
      }

      if (user.workoutFrequency) setWorkoutFrequency(user.workoutFrequency);
      if (user.goal) setGoal(user.goal);
    }
  }, [user, loading]);

  // Sync raw height state when feet/inches inputs change
  useEffect(() => {
    if (heightUnit === 'ft') {
      const cm = feetInToCm(heightFt, heightIn);
      setHeightCm(cm);
    }
  }, [heightFt, heightIn, heightUnit]);

  // Handle Height Unit Change
  const handleHeightUnitChange = (newUnit) => {
    if (newUnit === heightUnit) return;
    setHeightUnit(newUnit);

    if (newUnit === 'ft') {
      const ftIn = cmToFeetIn(heightCm);
      setHeightFt(ftIn.feet);
      setHeightIn(ftIn.inches);
    } else {
      const cm = feetInToCm(heightFt, heightIn);
      setHeightCm(cm);
    }
  };

  // Handle Weight Unit Change (live conversion!)
  const handleWeightUnitChange = (newUnit) => {
    if (newUnit === weightUnit) return;
    setWeightUnit(newUnit);
    
    if (newUnit === 'lbs') {
      setWeightVal(kgToLbs(weightVal));
    } else {
      setWeightVal(lbsToKg(weightVal));
    }
  };

  // Perform Calculations Preview when entering step 6
  useEffect(() => {
    if (step === 6) {
      // Resolve weight in kg for calculations
      const actualWeightKg = weightUnit === 'lbs' ? lbsToKg(weightVal) : weightVal;
      const actualHeightCm = heightCm;

      const params = calculateFitnessParams({
        weight: actualWeightKg,
        height: actualHeightCm,
        age: parseInt(age, 10),
        gender,
        workoutFrequency,
        goal,
      });

      setPreview(params);
    }
  }, [step, age, gender, heightCm, weightVal, weightUnit, workoutFrequency, goal]);

  const handleNext = () => {
    if (step < STEPS_COUNT) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const actualWeightKg = weightUnit === 'lbs' ? lbsToKg(weightVal) : weightVal;
    
    const profilePayload = {
      firstName,
      lastName,
      age: parseInt(age, 10),
      gender,
      height: heightCm,
      weight: actualWeightKg,
      heightUnit,
      weightUnit,
      workoutFrequency,
      goal,
    };

    const res = await updateProfile(profilePayload);
    setIsSaving(false);
    if (res.success) {
      router.push('/dashboard');
    }
  };

  // Render Helpers
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-5"
          >
            <h3 className="font-manrope text-xl font-bold text-white mb-2">
              Tell us about yourself
            </h3>
            <div className="flex gap-4">
              <Input
                label="First Name"
                placeholder="Arnold"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                icon={User}
              />
              <Input
                label="Last Name"
                placeholder="Schwarzenegger"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Input
              label="Age"
              type="number"
              placeholder="25"
              value={age}
              onChange={(e) => setAge(Math.max(1, parseInt(e.target.value, 10) || ''))}
              icon={Calendar}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <h3 className="font-manrope text-xl font-bold text-white mb-2">
              Select Gender & Height
            </h3>
            
            {/* Gender Switcher */}
            <div className="flex flex-col gap-2">
              <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase ml-1">
                Gender
              </span>
              <div className="flex gap-3 bg-white/3 border border-white/5 p-1 rounded-2xl">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all select-none ${
                      gender === g ? 'bg-white/10 text-white border border-white/10' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Height Selector with Interactive Toggle */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase">
                  Height
                </span>
                {/* Units Toggle */}
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
                  placeholder="175"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(1, parseInt(e.target.value, 10) || ''))}
                  suffix="cm"
                />
              ) : (
                <div className="flex gap-4">
                  <Input
                    label="Feet"
                    type="number"
                    placeholder="5"
                    value={heightFt}
                    onChange={(e) => setHeightFt(Math.max(0, parseInt(e.target.value, 10) || ''))}
                  />
                  <Input
                    label="Inches"
                    type="number"
                    placeholder="7"
                    value={heightIn}
                    onChange={(e) => setHeightIn(Math.max(0, Math.min(11, parseInt(e.target.value, 10) || '')))}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <h3 className="font-manrope text-xl font-bold text-white mb-2">
              What is your weight?
            </h3>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase">
                  Current Weight
                </span>
                {/* Weight Units Toggle */}
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
                placeholder={weightUnit === 'kg' ? '70' : '150'}
                value={weightVal}
                onChange={(e) => setWeightVal(Math.max(1, parseFloat(e.target.value) || ''))}
                suffix={weightUnit.toUpperCase()}
              />
              
              <div className="text-center text-[10px] text-white/30 uppercase font-semibold mt-2">
                Live Conversion: {weightUnit === 'kg' 
                  ? `${kgToLbs(weightVal)} lbs` 
                  : `${lbsToKg(weightVal)} kg`
                }
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-4"
          >
            <h3 className="font-manrope text-xl font-bold text-white mb-1">
              Workout Frequency
            </h3>
            <p className="text-xs text-white/45 mb-2 leading-relaxed">
              How many days do you train in a typical week?
            </p>

            <div className="grid grid-cols-1 gap-3 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
              {[
                { key: '0', label: '0 Days (Sedentary)', desc: 'Desk job, little to no exercise' },
                { key: '1-2', label: '1–2 Days (Lightly Active)', desc: 'Light cardio or training' },
                { key: '3-4', label: '3–4 Days (Moderately Active)', desc: 'Structured lifting or workouts' },
                { key: '5-6', label: '5–6 Days (Very Active)', desc: 'Intense training, physically active' },
                { key: 'Everyday', label: '7 Days (Extremely Active)', desc: 'Daily heavy training or manual labor' },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => setWorkoutFrequency(item.key)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    workoutFrequency === item.key
                      ? 'bg-accent-red/10 border-accent-red'
                      : 'bg-white/3 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div>
                    <h4 className="font-manrope text-sm font-bold text-white mb-0.5">
                      {item.label}
                    </h4>
                    <p className="font-sans text-[11px] text-white/40">
                      {item.desc}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    workoutFrequency === item.key
                      ? 'bg-accent-red border-accent-red text-white'
                      : 'border-white/10'
                  }`}>
                    {workoutFrequency === item.key && <Check size={12} />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-4"
          >
            <h3 className="font-manrope text-xl font-bold text-white mb-1">
              Select your Goal
            </h3>
            <p className="text-xs text-white/45 mb-2 leading-relaxed">
              We will set your calories and macros targets based on this.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {[
                { key: 'lose', label: 'Lose Fat', desc: 'Shed body fat while retaining muscle (-500 kcal deficit)' },
                { key: 'maintain', label: 'Maintain Weight', desc: 'Maintain current body composition (0 kcal)' },
                { key: 'lean-bulk', label: 'Lean Bulk', desc: 'Slow, controlled muscle growth with minimal fat (+300 kcal)' },
                { key: 'gain', label: 'Muscle Gain / Bulk', desc: 'Accelerated strength and mass builder (+500 kcal)' },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => setGoal(item.key)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    goal === item.key
                      ? 'bg-accent-red/10 border-accent-red'
                      : 'bg-white/3 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div>
                    <h4 className="font-manrope text-sm font-bold text-white mb-0.5">
                      {item.label}
                    </h4>
                    <p className="font-sans text-[11px] text-white/40">
                      {item.desc}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    goal === item.key
                      ? 'bg-accent-red border-accent-red text-white'
                      : 'border-white/10'
                  }`}>
                    {goal === item.key && <Check size={12} />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 6:
        if (!preview) return null;
        const bmiCategory = getBMICategory(preview.bmi);
        
        // Circular progress SVG for BMI
        const circumference = 2 * Math.PI * 34; // r=34
        // Map BMI 10 to 40 on stroke
        const minBmi = 10;
        const maxBmi = 40;
        const bmiPercent = Math.max(0, Math.min(100, ((preview.bmi - minBmi) / (maxBmi - minBmi)) * 100));
        const strokeDashoffset = circumference - (bmiPercent / 100) * circumference;

        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="text-center">
              <h3 className="font-manrope text-xl font-bold text-white mb-1">
                Your Fitness Profile
              </h3>
              <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                BMI & Daily Calories
              </p>
            </div>

            {/* Calculations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* BMI circular ring progress */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Ring track */}
                    <circle cx="56" cy="56" r="34" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    {/* Progress */}
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="34"
                      fill="none"
                      stroke={bmiCategory.color}
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1, delay: 0.2 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-manrope text-xl font-extrabold text-white">
                      {preview.bmi}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-white/45 font-bold">
                      BMI
                    </span>
                  </div>
                </div>
                <span
                  className="font-manrope text-xs font-bold mt-3 px-3 py-1 rounded-full border border-white/5 text-white/80"
                  style={{ color: bmiCategory.color, borderColor: `${bmiCategory.color}22`, backgroundColor: `${bmiCategory.color}08` }}
                >
                  {bmiCategory.category}
                </span>
                <p className="font-sans text-[10px] text-white/40 leading-relaxed text-center px-4 mt-2">
                  {bmiCategory.suggestion}
                </p>
              </div>

              {/* Calories & Macros Cards */}
              <div className="flex flex-col gap-3">
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <span className="font-manrope text-[10px] font-bold text-white/40 uppercase tracking-wide">
                      Maintenance
                    </span>
                    <h4 className="font-manrope text-sm font-bold text-white">
                      {preview.maintenance} kcal/day
                    </h4>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-[10px] text-white/70 font-semibold uppercase">
                    BMR: {preview.bmr}
                  </div>
                </div>

                <div className="bg-accent-red/10 border border-accent-red/20 rounded-2xl p-4 flex justify-between items-center shadow-lg shadow-accent-red/5">
                  <div>
                    <span className="font-manrope text-[10px] font-bold text-accent-red-hover uppercase tracking-wide">
                      Target Intake
                    </span>
                    <h4 className="font-manrope text-lg font-black text-white red-text-glow">
                      {preview.targetCalories} kcal
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-white/40 uppercase font-semibold">
                      Goal Macros
                    </span>
                    <span className="text-[10px] text-white/60 font-semibold tracking-wide">
                      P: {preview.macros.protein}g | C: {preview.macros.carbs}g | F: {preview.macros.fat}g
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-white/2 border border-white/5 rounded-2xl text-[10px] text-white/40 leading-relaxed text-center italic">
              Disclaimer: Calorie metrics and BMI scores are general estimations and should be treated as fitness guidelines, not medical advice.
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 bg-black select-none overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[-30%] left-[-20%] w-[140%] h-[50%] bg-radial from-accent-glow to-transparent opacity-40 blur-3xl pointer-events-none" />

      {/* Onboarding Wizard Card */}
      <GlassCard className="w-full max-w-sm border-white/5 shadow-2xl relative z-10 p-6 md:p-8 flex flex-col gap-6">
        {/* top Progress bar */}
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex-grow h-[3px] bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className="h-full bg-accent-red"
              style={{ width: `${(step / STEPS_COUNT) * 100}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
          <span className="font-manrope text-[10px] font-extrabold text-white/40 tracking-wider">
            {step} OF {STEPS_COUNT}
          </span>
        </div>

        {/* Wizard Main Content */}
        <div className="min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Wizard Navigation Footer */}
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
              disabled={
                step === 1 && !firstName
              }
              className="flex-grow py-3"
            >
              Next
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              loading={isSaving}
              className="flex-grow py-3 shadow-lg shadow-accent-red/20 bg-gradient-to-r from-accent-red to-accent-red-hover"
            >
              Complete
              <Check size={16} />
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
