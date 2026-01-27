import { useState, useEffect } from 'react';
import revenueCatService from '../services/revenuecat-service';

const useDailyLocks = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const access = await revenueCatService.hasEntitlement('daily_locks');
      setHasAccess(access);
      
    } catch (err) {
      console.error('Error checking daily locks:', err);
      setError(err.message);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
    
    let intervalId;
    if (__DEV__) {
      intervalId = setInterval(checkAccess, 5000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const refreshAccess = async () => {
    await checkAccess();
  };

  return { 
    hasAccess, 
    loading, 
    error,
    refreshAccess 
  };
};

export default useDailyLocks;
