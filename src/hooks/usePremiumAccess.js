import { useState, useEffect } from 'react';
import revenueCatService from '../services/revenuecat-service';

const usePremiumAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use a simpler check without try/catch nesting
      const access = await revenueCatService.hasEntitlement('premium_access');
      setHasAccess(access);
      
    } catch (err) {
      console.error('Error checking premium access:', err);
      setError(err.message);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkAccess();
    
    // Set up a simple interval to check for updates in development
    let intervalId;
    if (__DEV__) {
      intervalId = setInterval(checkAccess, 5000); // Check every 5 seconds
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

export default usePremiumAccess;
