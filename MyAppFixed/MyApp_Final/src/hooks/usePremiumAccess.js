// File: src/hooks/usePremiumAccess.js
import { useContext } from 'react';
import { AccessContext } from '../navigation/MainNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usePremiumAccess = () => {
  const accessContext = useContext(AccessContext);
  
  // If we have the new context, use it
  if (accessContext) {
    const { hasAccess, loading, subscription } = accessContext;
    return {
      hasAccess: hasAccess('premium_access'),
      loading,
      subscription
    };
  }
  
  // Fallback to old logic
  const checkAccess = async () => {
    try {
      const subscription = await AsyncStorage.getItem('subscription');
      return subscription === 'premium';
    } catch (error) {
      return false;
    }
  };
  
  return {
    hasAccess: false, // Default to false, will be updated
    loading: false,
    subscription: 'free'
  };
};

export default usePremiumAccess;
