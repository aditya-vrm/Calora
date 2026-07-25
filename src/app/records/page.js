'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import GlassCard from '@/components/UI/GlassCard';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { searchFoodDatabase, scaleNutrients } from '@/utils/mockFoodDb';
import { Search, Apple, Weight, HelpCircle, Activity, Plus, Trash2, ClipboardList, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecordsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { records, addRecord, deleteRecord, getDailyTotals } = useApp();

  const [activeTab, setActiveTab] = useState('food'); // 'food' | 'weight' | 'steps'
  const [todayStr, setTodayStr] = useState('');

  // Food log states
  const [foodSearch, setFoodSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  
  const [foodName, setFoodName] = useState('');
  const [weightGrams, setWeightGrams] = useState(100);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState('Breakfast');

  // Weight log states
  const [weightVal, setWeightVal] = useState('');

  // Steps log states
  const [stepsVal, setStepsVal] = useState('');

  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Sync Search results
  useEffect(() => {
    if (foodSearch && !selectedFood) {
      setSearchResults(searchFoodDatabase(foodSearch));
    } else {
      setSearchResults([]);
    }
  }, [foodSearch, selectedFood]);

  // Sync scaled nutrients when selected food or weight changes
  useEffect(() => {
    if (selectedFood && !isManualEntry) {
      const scaled = scaleNutrients(selectedFood, weightGrams);
      setFoodName(selectedFood.foodName);
      setCalories(scaled.calories);
      setProtein(scaled.protein);
      setCarbs(scaled.carbs);
      setFat(scaled.fat);
    }
  }, [selectedFood, weightGrams, isManualEntry]);

  // Redirect if unauthorized
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

  const totals = getDailyTotals(todayStr);

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setFoodSearch(food.foodName);
    setSearchResults([]);
  };

  const handleClearFood = () => {
    setSelectedFood(null);
    setFoodSearch('');
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const handleLogFood = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    if (!foodName || !calories) {
      setError('Please provide food name and calorie values.');
      setFormLoading(false);
      return;
    }

    const recordPayload = {
      type: 'food',
      date: todayStr,
      foodDetails: {
        foodName,
        mealType,
        weightGrams: parseFloat(weightGrams) || 0,
        calories: parseFloat(calories),
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      },
    };

    const res = await addRecord(recordPayload);
    setFormLoading(false);
    if (res.success) {
      handleClearFood();
      setIsManualEntry(false);
    } else {
      setError('Failed to log food.');
    }
  };

  const handleLogWeight = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    if (!weightVal) {
      setError('Please enter a weight.');
      setFormLoading(false);
      return;
    }

    const recordPayload = {
      type: 'weight',
      date: todayStr,
      weightVal: parseFloat(weightVal),
    };

    const res = await addRecord(recordPayload);
    setFormLoading(false);
    if (res.success) {
      setWeightVal('');
    } else {
      setError('Failed to log weight.');
    }
  };

  const handleLogSteps = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    if (!stepsVal) {
      setError('Please enter steps count.');
      setFormLoading(false);
      return;
    }

    const recordPayload = {
      type: 'steps',
      date: todayStr,
      stepsVal: parseInt(stepsVal, 10),
    };

    const res = await addRecord(recordPayload);
    setFormLoading(false);
    if (res.success) {
      setStepsVal('');
    } else {
      setError('Failed to log steps.');
    }
  };

  // Select activities for today matching the active tab
  const todayTabLogs = records.filter(
    (r) => r.date === todayStr && r.type === activeTab
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-20 select-none">
      {/* Page Title */}
      <div className="mt-2">
        <span className="font-manrope text-[10px] font-extrabold text-accent-red-hover uppercase tracking-widest flex items-center gap-1.5">
          <ClipboardList size={11} />
          Logs Portal
        </span>
        <h2 className="font-manrope text-2xl font-black text-white tracking-tight">
          Track Your Progress
        </h2>
      </div>

      {/* Top Today Status Widget */}
      <div className="bg-white/3 border border-white/5 p-4 rounded-2xl grid grid-cols-3 gap-2 text-center shadow-inner">
        <div>
          <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider">Calories</span>
          <span className="font-manrope text-sm font-extrabold text-white">
            {totals.calories} / {user.targetCalories} <span className="text-[10px] text-white/40 font-medium">kcal</span>
          </span>
        </div>
        <div>
          <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider">Steps today</span>
          <span className="font-manrope text-sm font-extrabold text-white">
            {totals.steps} / {user.targetSteps ? (user.targetSteps >= 1000 ? `${user.targetSteps / 1000}k` : user.targetSteps) : '10k'} <span className="text-[10px] text-white/40 font-medium">steps</span>
          </span>
        </div>
        <div>
          <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider">Water</span>
          <span className="font-manrope text-sm font-extrabold text-white">
            {totals.water} ml
          </span>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex bg-white/3 border border-white/5 p-1 rounded-2xl">
        {[
          { key: 'food', label: 'Food Intake', icon: Apple },
          { key: 'weight', label: 'Body Weight', icon: Weight },
          { key: 'steps', label: 'Daily Steps', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setError('');
              }}
              className={`flex-1 py-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all select-none ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Action Error Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs font-semibold text-red-500"
        >
          {error}
        </motion.div>
      )}

      {/* Tab Forms */}
      <AnimatePresence mode="wait">
        {activeTab === 'food' && (
          <motion.div
            key="food-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="border-white/5 p-6 flex flex-col gap-5">
              {/* Autocomplete Search input */}
              {!isManualEntry && (
                <div className="relative flex flex-col gap-2">
                  <Input
                    label="Search Food Database"
                    placeholder="Search chicken, rice, eggs..."
                    value={foodSearch}
                    onChange={(e) => {
                      setFoodSearch(e.target.value);
                      if (selectedFood) setSelectedFood(null);
                    }}
                    icon={Search}
                  />
                  {selectedFood && (
                    <button
                      onClick={handleClearFood}
                      className="absolute right-4 top-9.5 text-[10px] font-bold text-accent-red hover:underline focus:outline-none"
                    >
                      Clear Selection
                    </button>
                  )}
                  {searchResults.length > 0 && (
                    <div className="absolute top-16 left-0 right-0 z-30 bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto no-scrollbar">
                      {searchResults.map((food) => (
                        <div
                          key={food.foodName}
                          onClick={() => handleSelectFood(food)}
                          className="py-3 px-4 border-b border-white/5 hover:bg-white/5 cursor-pointer text-left flex justify-between items-center transition-colors"
                        >
                          <span className="font-manrope text-xs font-bold text-white">
                            {food.foodName}
                          </span>
                          <span className="font-sans text-[10px] text-white/40">
                            {food.calories} kcal/100g
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Toggle Manual / Auto Entry */}
              <button
                type="button"
                onClick={() => {
                  setIsManualEntry(!isManualEntry);
                  handleClearFood();
                }}
                className="text-[10px] font-bold self-start uppercase tracking-wider text-white/40 hover:text-white transition-colors"
              >
                {isManualEntry ? '← Use Food Database' : '+ Custom Manual Entry'}
              </button>

              <form onSubmit={handleLogFood} className="flex flex-col gap-4">
                {/* Manual entry fields */}
                {isManualEntry && (
                  <Input
                    label="Meal/Food Name"
                    placeholder="Grandmas Homemade Lasagna"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    required
                  />
                )}

                {/* Weight Input (Always shown, except when manual log doesn't need scaling) */}
                {selectedFood && (
                  <Input
                    label="Logged Weight (grams)"
                    type="number"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(Math.max(1, parseFloat(e.target.value) || ''))}
                    required
                  />
                )}

                {/* Nutrients Input Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Calories (kcal)"
                    type="number"
                    placeholder="350"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    disabled={!isManualEntry && selectedFood !== null}
                    required
                  />
                  <Input
                    label="Protein (g)"
                    type="number"
                    placeholder="25"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    disabled={!isManualEntry && selectedFood !== null}
                  />
                  <Input
                    label="Carbs (g)"
                    type="number"
                    placeholder="40"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    disabled={!isManualEntry && selectedFood !== null}
                  />
                  <Input
                    label="Fats (g)"
                    type="number"
                    placeholder="8"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    disabled={!isManualEntry && selectedFood !== null}
                  />
                </div>

                {/* Meal Type Switcher */}
                <div className="flex flex-col gap-2">
                  <span className="font-manrope text-xs font-semibold text-white/50 tracking-wider uppercase ml-1">
                    Meal Category
                  </span>
                  <div className="flex gap-2 bg-white/2 border border-white/5 p-1 rounded-2xl">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMealType(type)}
                        className={`flex-grow py-2 rounded-xl text-[10px] font-bold uppercase transition-all select-none ${
                          mealType === type
                            ? 'bg-accent-red text-white border border-accent-red/20'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={formLoading}
                  className="w-full mt-4 py-3.5 text-sm font-bold shadow-lg shadow-accent-red/10 bg-gradient-to-r from-accent-red to-accent-red-hover"
                >
                  Log Food (+10 XP)
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'weight' && (
          <motion.div
            key="weight-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="border-white/5 p-6">
              <form onSubmit={handleLogWeight} className="flex flex-col gap-4">
                <Input
                  label={`Log Body Weight (${user.weightUnit || 'kg'})`}
                  type="number"
                  step="0.1"
                  placeholder={user.weightUnit === 'kg' ? '72.5' : '159.8'}
                  value={weightVal}
                  onChange={(e) => setWeightVal(e.target.value)}
                  required
                />
                
                <p className="font-sans text-[10px] text-white/40 leading-relaxed text-left px-1">
                  Logging weight updates your metrics progression lines and synchronizes target requirements (+20 XP).
                </p>

                <Button
                  type="submit"
                  loading={formLoading}
                  className="w-full mt-4 py-3.5 text-sm font-bold shadow-lg shadow-accent-red/10 bg-gradient-to-r from-accent-red to-accent-red-hover"
                >
                  Log Weight (+20 XP)
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'steps' && (
          <motion.div
            key="steps-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="border-white/5 p-6">
              <form onSubmit={handleLogSteps} className="flex flex-col gap-4">
                <Input
                  label="Log Daily Step Count"
                  type="number"
                  placeholder="8500"
                  value={stepsVal}
                  onChange={(e) => setStepsVal(e.target.value)}
                  required
                />
                
                <p className="font-sans text-[10px] text-white/40 leading-relaxed text-left px-1">
                  Log your daily activity levels to complete challenges. Target {(user.targetSteps || 10000).toLocaleString()} steps (+15 XP).
                </p>

                <Button
                  type="submit"
                  loading={formLoading}
                  className="w-full mt-4 py-3.5 text-sm font-bold shadow-lg shadow-accent-red/10 bg-gradient-to-r from-accent-red to-accent-red-hover"
                >
                  Log Steps (+15 XP)
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today Logs list */}
      <div className="flex flex-col gap-4">
        <h3 className="font-manrope text-base font-bold text-white tracking-tight px-1 uppercase text-xs text-white/40 tracking-wider">
          Today's Logs ({activeTab.toUpperCase()})
        </h3>

        <div className="flex flex-col gap-3">
          {todayTabLogs.length > 0 ? (
            todayTabLogs.map((log) => {
              let title = '';
              let desc = '';
              let val = '';

              if (log.type === 'food') {
                title = log.foodDetails.foodName;
                val = `${log.foodDetails.calories} kcal`;
                desc = `${log.foodDetails.mealType} | P: ${log.foodDetails.protein}g | C: ${log.foodDetails.carbs}g | F: ${log.foodDetails.fat}g`;
              } else if (log.type === 'weight') {
                title = 'Body Weight Logged';
                val = `${log.weightVal} ${user.weightUnit}`;
                desc = 'Weight progression tracker';
              } else if (log.type === 'steps') {
                title = 'Activity Steps Logged';
                val = `${log.stepsVal} steps`;
                desc = 'Physical walking log';
              }

              return (
                <div
                  key={log._id}
                  className="bg-white/3 border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-all"
                >
                  <div className="text-left">
                    <h5 className="font-manrope text-xs font-bold text-white">
                      {title}
                    </h5>
                    <p className="font-sans text-[10px] text-white/40 mt-0.5">
                      {desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-manrope text-xs font-extrabold text-white">
                      {val}
                    </span>
                    <button
                      onClick={() => deleteRecord(log._id)}
                      className="text-white/40 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 bg-white/2 border border-white/5 rounded-2xl text-center">
              <span className="font-manrope text-xs font-semibold text-white/30 uppercase tracking-widest">
                No logs registered for today
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
