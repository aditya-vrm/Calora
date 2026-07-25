'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, updateProfile, isOfflineMode } = useAuth();
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const [newBadgeUnlocked, setNewBadgeUnlocked] = useState(null);

  // Fetch records when user session is loaded
  useEffect(() => {
    if (user) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [user]);

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      if (isOfflineMode) {
        loadLocalRecords();
        return;
      }

      const response = await fetch('/api/records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
      } else {
        console.warn('Records API failed, loading local fallback records');
        loadLocalRecords();
      }
    } catch (error) {
      console.warn('Network error fetching records, loading locally:', error);
      loadLocalRecords();
    } finally {
      setLoadingRecords(false);
    }
  };

  const loadLocalRecords = () => {
    if (!user) return;
    const localRecordsStr = localStorage.getItem('calora_records') || '[]';
    const allLocalRecords = JSON.parse(localRecordsStr);
    // Filter records for the logged-in user
    const userRecords = allLocalRecords.filter((r) => r.userId === user._id);
    // Sort by createdAt descending
    userRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRecords(userRecords);
  };

  // Log a new activity record
  const addRecord = async (recordData) => {
    if (!user) return { success: false, error: 'No active session.' };

    const todayStr = new Date().toISOString().split('T')[0];
    const recordPayload = {
      ...recordData,
      date: recordData.date || todayStr,
    };

    try {
      let savedRecord = null;

      if (!isOfflineMode) {
        const response = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recordPayload),
        });

        if (response.ok) {
          const data = await response.json();
          savedRecord = data.record;
          setRecords((prev) => [savedRecord, ...prev]);
        }
      }

      // If backend failed or we are in local offline mode
      if (!savedRecord) {
        savedRecord = {
          _id: 'rec_' + Math.random().toString(36).substr(2, 9),
          userId: user._id,
          createdAt: new Date().toISOString(),
          ...recordPayload,
        };

        const localRecordsStr = localStorage.getItem('calora_records') || '[]';
        const allLocalRecords = JSON.parse(localRecordsStr);
        allLocalRecords.push(savedRecord);
        localStorage.setItem('calora_records', JSON.stringify(allLocalRecords));

        setRecords((prev) => [savedRecord, ...prev]);
      }

      // Trigger XP & Badges Calculations
      await processGamification(recordPayload.type, recordPayload.date);

      return { success: true, record: savedRecord };
    } catch (error) {
      console.warn('Network error adding record, saving locally:', error);
      // Fallback to local
      const savedRecord = {
        _id: 'rec_' + Math.random().toString(36).substr(2, 9),
        userId: user._id,
        createdAt: new Date().toISOString(),
        ...recordPayload,
      };

      const localRecordsStr = localStorage.getItem('calora_records') || '[]';
      const allLocalRecords = JSON.parse(localRecordsStr);
      allLocalRecords.push(savedRecord);
      localStorage.setItem('calora_records', JSON.stringify(allLocalRecords));

      setRecords((prev) => [savedRecord, ...prev]);

      await processGamification(recordPayload.type, recordPayload.date);
      return { success: true, record: savedRecord };
    }
  };

  // Delete a record
  const deleteRecord = async (recordId) => {
    if (!user) return { success: false, error: 'No active session.' };

    try {
      let deletedFromServer = false;

      if (!isOfflineMode && !recordId.startsWith('rec_')) {
        const response = await fetch(`/api/records?id=${recordId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          deletedFromServer = true;
        }
      }

      // Sync local records array
      setRecords((prev) => prev.filter((r) => r._id !== recordId));

      // Clear from local storage
      const localRecordsStr = localStorage.getItem('calora_records') || '[]';
      const allLocalRecords = JSON.parse(localRecordsStr);
      const filteredLocalRecords = allLocalRecords.filter((r) => r._id !== recordId);
      localStorage.setItem('calora_records', JSON.stringify(filteredLocalRecords));

      return { success: true };
    } catch (error) {
      console.warn('Network error deleting record, clearing locally:', error);
      setRecords((prev) => prev.filter((r) => r._id !== recordId));

      const localRecordsStr = localStorage.getItem('calora_records') || '[]';
      const allLocalRecords = JSON.parse(localRecordsStr);
      const filteredLocalRecords = allLocalRecords.filter((r) => r._id !== recordId);
      localStorage.setItem('calora_records', JSON.stringify(filteredLocalRecords));
      return { success: true };
    }
  };

  // Gamification Logic Engine
  const processGamification = async (recordType, dateStr) => {
    if (!user) return;

    let xpToAdd = 0;
    switch (recordType) {
      case 'food':
        xpToAdd = 10;
        break;
      case 'weight':
        xpToAdd = 20;
        break;
      case 'steps':
        xpToAdd = 15;
        break;
      case 'water':
        xpToAdd = 5;
        break;
    }

    const updatedBadges = [...(user.badges || [])];
    const newUnlockedBadges = [];

    // Rule 1: First Rep Badge
    if (!updatedBadges.includes('First Rep')) {
      updatedBadges.push('First Rep');
      newUnlockedBadges.push('First Rep');
    }

    // Load active records for calculations
    const todayRecords = records.filter((r) => r.date === dateStr);
    
    // We add the newly added item to this mock array since local state won't be updated immediately
    // to calculate thresholds accurately
    const mockTodayRecords = [...todayRecords];

    // Rule 2: Hydration Hero (Logged >= 2000ml of water today)
    if (!updatedBadges.includes('Hydration Hero')) {
      const waterTotal = mockTodayRecords
        .filter((r) => r.type === 'water')
        .reduce((sum, r) => sum + (r.waterVal || 0), 0) + (recordType === 'water' ? 250 : 0); // Include quick-adds

      if (waterTotal >= 2000) {
        updatedBadges.push('Hydration Hero');
        newUnlockedBadges.push('Hydration Hero');
      }
    }

    // Rule 3: Step Master (Logged >= 10,000 steps today)
    if (!updatedBadges.includes('Step Master')) {
      const stepsTotal = mockTodayRecords
        .filter((r) => r.type === 'steps')
        .reduce((sum, r) => sum + (r.stepsVal || 0), 0);

      if (stepsTotal >= 10000 || (recordType === 'steps' && stepsTotal >= 10000)) {
        updatedBadges.push('Step Master');
        newUnlockedBadges.push('Step Master');
      }
    }

    // Rule 4: Calorie Crusader (Consuming target calories within 150 kcal margin)
    if (!updatedBadges.includes('Calorie Crusader') && recordType === 'food') {
      const caloriesTotal = mockTodayRecords
        .filter((r) => r.type === 'food')
        .reduce((sum, r) => sum + (r.foodDetails?.calories || 0), 0);

      const margin = Math.abs(caloriesTotal - user.targetCalories);
      if (margin <= 150 && caloriesTotal > 0) {
        updatedBadges.push('Calorie Crusader');
        newUnlockedBadges.push('Calorie Crusader');
      }
    }

    // Calculate/Update streaks
    let newStreak = user.streak || 0;
    const yesterdayStr = getDaysAgoStr(1);
    
    // Check if user logged anything yesterday
    const loggedYesterday = records.some((r) => r.date === yesterdayStr);
    const loggedToday = records.some((r) => r.date === dateStr) || true; // they just logged

    if (loggedToday) {
      if (loggedYesterday && newStreak === 0) {
        newStreak = 2; // Started streak
      } else if (loggedYesterday) {
        // Increment streak only once a day
        const alreadyLoggedTodayBeforeThis = records.filter(r => r.date === dateStr).length > 0;
        if (!alreadyLoggedTodayBeforeThis) {
          newStreak += 1;
        }
      } else {
        newStreak = 1; // reset/maintain 1 day
      }
    }

    // Rule 5: Streak Starter (3-day streak reached)
    if (newStreak >= 3 && !updatedBadges.includes('Streak Starter')) {
      updatedBadges.push('Streak Starter');
      newUnlockedBadges.push('Streak Starter');
    }

    // Set triggers for UI reactions
    if (newUnlockedBadges.length > 0) {
      setNewBadgeUnlocked(newUnlockedBadges[0]);
      setConfettiTriggered(true);
      setTimeout(() => {
        setConfettiTriggered(false);
      }, 5000);
    }

    // Update user profile targets
    const updatedProfileData = {
      xp: (user.xp || 0) + xpToAdd,
      streak: newStreak,
      badges: updatedBadges,
    };

    await updateProfile(updatedProfileData);
  };

  const getDaysAgoStr = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  // Helper selectors for the UI
  const getDailyTotals = (dateStr) => {
    const dateRecords = records.filter((r) => r.date === dateStr);
    
    const foodRecords = dateRecords.filter((r) => r.type === 'food');
    const calories = Math.round(foodRecords.reduce((sum, r) => sum + (r.foodDetails?.calories || 0), 0));
    const protein = Math.round(foodRecords.reduce((sum, r) => sum + (r.foodDetails?.protein || 0), 0));
    const carbs = Math.round(foodRecords.reduce((sum, r) => sum + (r.foodDetails?.carbs || 0), 0));
    const fat = Math.round(foodRecords.reduce((sum, r) => sum + (r.foodDetails?.fat || 0), 0));
    const fiber = Math.round(foodRecords.reduce((sum, r) => sum + (r.foodDetails?.fiber || 0), 0));
    const sugar = Math.round(foodRecords.reduce((sum, r) => sum + (r.foodDetails?.sugar || 0), 0));

    const water = dateRecords
      .filter((r) => r.type === 'water')
      .reduce((sum, r) => sum + (r.waterVal || 0), 0);

    const steps = dateRecords
      .filter((r) => r.type === 'steps')
      .reduce((sum, r) => sum + (r.stepsVal || 0), 0);

    const weightRecord = dateRecords.find((r) => r.type === 'weight');
    const weight = weightRecord ? weightRecord.weightVal : null;

    return {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      water,
      steps,
      weight,
    };
  };

  return (
    <AppContext.Provider
      value={{
        records,
        loadingRecords,
        confettiTriggered,
        newBadgeUnlocked,
        setNewBadgeUnlocked,
        addRecord,
        deleteRecord,
        getDailyTotals,
        fetchRecords,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
