'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Load user session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsOfflineMode(false);
        } else {
          // If server returns error, check local storage for local fallback user
          loadLocalUser();
        }
      } catch (error) {
        console.warn('Network error checking session, falling back to LocalStorage:', error);
        loadLocalUser();
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const loadLocalUser = () => {
    const localUser = localStorage.getItem('calora_user');
    if (localUser) {
      setUser(JSON.parse(localUser));
      setIsOfflineMode(true);
    } else {
      setUser(null);
      setIsOfflineMode(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsOfflineMode(false);
        localStorage.setItem('calora_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        const errorData = await response.json();
        
        // Attempt local login fallback if server fails
        return tryLocalLogin(email, password, errorData.error);
      }
    } catch (error) {
      console.warn('Network error logging in, attempting local storage authentication:', error);
      return tryLocalLogin(email, password, 'Network error. Attempting local connection...');
    } finally {
      setLoading(false);
    }
  };

  const tryLocalLogin = (email, password, serverError) => {
    const localUsersStr = localStorage.getItem('calora_users_db') || '[]';
    const localUsers = JSON.parse(localUsersStr);
    
    const matchedUser = localUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordMock === password
    );

    if (matchedUser) {
      const { passwordMock, ...userWithoutPassword } = matchedUser;
      setUser(userWithoutPassword);
      setIsOfflineMode(true);
      localStorage.setItem('calora_user', JSON.stringify(userWithoutPassword));
      return { success: true, message: 'Logged in (Local Mode)' };
    }

    return { 
      success: false, 
      error: serverError || 'Invalid credentials or local profile not found.' 
    };
  };

  const register = async (userPayload) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsOfflineMode(false);
        localStorage.setItem('calora_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        const errorData = await response.json();
        return tryLocalRegister(userPayload, errorData.error);
      }
    } catch (error) {
      console.warn('Network error registering, attempting local storage registration:', error);
      return tryLocalRegister(userPayload, 'Network connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const tryLocalRegister = (userPayload, serverError) => {
    const {
      email,
      password,
      fullName,
      phoneNumber,
      gender,
      height,
      weight,
      heightUnit,
      weightUnit,
      age,
      workoutFrequency,
      goal,
      targetSteps,
    } = userPayload;

    const localUsersStr = localStorage.getItem('calora_users_db') || '[]';
    const localUsers = JSON.parse(localUsersStr);

    const exists = localUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists locally.' };
    }

    const names = (fullName || '').trim().split(/\s+/);
    const firstName = names[0] || 'Protein';
    const lastName = names.slice(1).join(' ') || 'Enthusiast';

    // Lazy load fitness parameters calculation
    const { calculateFitnessParams } = require('@/utils/fitness');
    const fitnessParams = calculateFitnessParams({
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 170,
      age: parseInt(age, 10) || 25,
      gender: gender || 'male',
      workoutFrequency: workoutFrequency || '3-4',
      goal: goal || 'maintain',
    });

    const newLocalUser = {
      _id: 'local_' + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      passwordMock: password, // Simple placeholder for local login
      firstName,
      lastName,
      phoneNumber: phoneNumber || '',
      age: parseInt(age, 10) || 25,
      gender: gender || 'male',
      height: parseFloat(height) || 170,
      weight: parseFloat(weight) || 70,
      workoutFrequency: workoutFrequency || '3-4',
      goal: goal || 'maintain',
      heightUnit: heightUnit || 'cm',
      weightUnit: weightUnit || 'kg',
      xp: 0,
      streak: 0,
      badges: [],
      targetCalories: fitnessParams.targetCalories,
      targetSteps: parseInt(targetSteps, 10) || 10000,
      targetMacros: fitnessParams.macros,
      createdAt: new Date().toISOString(),
    };

    localUsers.push(newLocalUser);
    localStorage.setItem('calora_users_db', JSON.stringify(localUsers));
    
    // Set active user
    const { passwordMock, ...userWithoutPassword } = newLocalUser;
    setUser(userWithoutPassword);
    setIsOfflineMode(true);
    localStorage.setItem('calora_user', JSON.stringify(userWithoutPassword));

    return { success: true, message: 'Registered successfully (Local Mode)' };
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Server logout failed, clearing local session.');
    }
    
    setUser(null);
    setIsOfflineMode(false);
    localStorage.removeItem('calora_user');
    setLoading(false);
  };

  const updateProfile = async (profileData) => {
    try {
      if (isOfflineMode) {
        // Handle local update
        return updateLocalUser(profileData);
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('calora_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        // Fallback to local update if API fails
        console.warn('Profile update API failed, falling back to local update');
        return updateLocalUser(profileData);
      }
    } catch (error) {
      console.warn('Network error updating profile, updating locally:', error);
      return updateLocalUser(profileData);
    }
  };

  const updateLocalUser = (profileData) => {
    if (!user) return { success: false, error: 'No active user session.' };

    const updatedUser = { ...user, ...profileData };

    // Recompute fitness targets if metrics changed
    const fitnessMetricsChanged =
      profileData.weight !== undefined ||
      profileData.height !== undefined ||
      profileData.age !== undefined ||
      profileData.gender !== undefined ||
      profileData.workoutFrequency !== undefined ||
      profileData.goal !== undefined;

    if (fitnessMetricsChanged) {
      // Lazy load fitness formulas to calculate targets
      const { calculateFitnessParams } = require('@/utils/fitness');
      const fitnessParams = calculateFitnessParams({
        weight: updatedUser.weight,
        height: updatedUser.height,
        age: updatedUser.age,
        gender: updatedUser.gender,
        workoutFrequency: updatedUser.workoutFrequency,
        goal: updatedUser.goal,
      });

      updatedUser.targetCalories = fitnessParams.targetCalories;
      updatedUser.targetMacros = fitnessParams.macros;
    }

    setUser(updatedUser);
    localStorage.setItem('calora_user', JSON.stringify(updatedUser));

    // Update in local users database as well
    const localUsersStr = localStorage.getItem('calora_users_db') || '[]';
    const localUsers = JSON.parse(localUsersStr);
    const index = localUsers.findIndex((u) => u._id === user._id);
    if (index !== -1) {
      localUsers[index] = { ...localUsers[index], ...updatedUser };
      localStorage.setItem('calora_users_db', JSON.stringify(localUsers));
    }

    return { success: true };
  };

  const deleteAccount = async () => {
    try {
      if (isOfflineMode) {
        deleteLocalAccount();
        return { success: true };
      }

      const response = await fetch('/api/profile', { method: 'DELETE' });
      if (response.ok) {
        setUser(null);
        setIsOfflineMode(false);
        localStorage.removeItem('calora_user');
        return { success: true };
      } else {
        deleteLocalAccount();
        return { success: true };
      }
    } catch (e) {
      deleteLocalAccount();
      return { success: true };
    }
  };

  const deleteLocalAccount = () => {
    if (!user) return;

    // Remove from local users database
    const localUsersStr = localStorage.getItem('calora_users_db') || '[]';
    const localUsers = JSON.parse(localUsersStr);
    const filteredUsers = localUsers.filter((u) => u._id !== user._id);
    localStorage.setItem('calora_users_db', JSON.stringify(filteredUsers));

    // Clean user logs
    const localLogsStr = localStorage.getItem('calora_records') || '[]';
    const localLogs = JSON.parse(localLogsStr);
    const filteredLogs = localLogs.filter((l) => l.userId !== user._id);
    localStorage.setItem('calora_records', JSON.stringify(filteredLogs));

    setUser(null);
    setIsOfflineMode(false);
    localStorage.removeItem('calora_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOfflineMode,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
