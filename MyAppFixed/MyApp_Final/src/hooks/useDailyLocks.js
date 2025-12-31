// File: src/hooks/useDailyLocks.js
import { useContext } from 'react';
import { AccessContext } from '../navigation/MainNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useDailyLocks = () => {
  const accessContext = useContext(AccessContext);
  
  // If we have the new context, use it
  if (accessContext) {
    const { hasAccess, loading, dailyUnlocks, useDailyUnlock } = accessContext;
    return {
      hasAccess: hasAccess('daily_locks'),
      loading,
      dailyUnlocks,
      useDailyUnlock
    };
  }
  
  // Fallback to old logic
  const checkAccess = async () => {
    try {
      const unlocks = parseInt(await AsyncStorage.getItem('dailyUnlocks') || '0');
      return unlocks > 0;
    } catch (error) {
      return false;
    }
  };
  
  return {
    hasAccess: false, // Default to false, will be updated
    loading: false,
    dailyUnlocks: 0,
    useDailyUnlock: () => false
  };
};

export default useDailyLocks;
