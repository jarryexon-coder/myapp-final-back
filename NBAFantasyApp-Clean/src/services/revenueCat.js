// src/services/revenueCat.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = () => {
  try {
    return (
      Platform.OS === 'web' || 
      __DEV__ || 
      Constants?.appOwnership === 'expo' ||
      Constants?.expoGoConfig ||
      !Constants?.expoConfig?.ios?.bundleIdentifier
    );
  } catch (error) {
    return true;
  }
};

export const initializeRevenueCat = async () => {
  if (isExpoGo()) {
    console.log('🎭 Expo Go detected: Skipping RevenueCat initialization');
    return null;
  }

  try {
    const RevenueCat = await import('react-native-purchases');
    
    // 🚀 USE YOUR ACTUAL KEY HERE
    if (Platform.OS === 'ios') {
      RevenueCat.default.configure({ 
        apiKey: "test_FmMHkCAemjiaMpSQrjVzfipnEHx",
        appUserID: null
      });
    } else {
      // For Android
      RevenueCat.default.configure({ 
        apiKey: "goog_YOUR_GOOGLE_KEY_HERE",
        appUserID: null
      });
    }
    
    console.log('💰 RevenueCat initialized successfully');
    return RevenueCat.default;
  } catch (error) {
    console.log('⚠️ RevenueCat initialization error:', error.message);
    return null;
  }
};

// Create a mock RevenueCat for Expo Go
const createMockPurchases = () => ({
  configure: () => console.log('🎭 Mock RevenueCat: configure called'),
  getOfferings: () => Promise.resolve({ all: {}, current: null }),
  getCustomerInfo: () => Promise.resolve({ 
    entitlements: { active: {}, all: {} } 
  }),
  purchasePackage: () => Promise.reject(new Error('Mock purchase - not available in Expo Go')),
  purchaseProduct: () => Promise.reject(new Error('Mock purchase - not available in Expo Go')),
  restorePurchases: () => Promise.resolve({ 
    entitlements: { active: {}, all: {} } 
  }),
  setAttributes: () => {},
  setLogLevel: () => {},
  LOG_LEVEL: { INFO: 'INFO' },
});

// Export either real or mock Purchases
let Purchases;

if (isExpoGo()) {
  Purchases = createMockPurchases();
  console.log('🏷️ Using mock Purchases for Expo Go');
} else {
  try {
    Purchases = require('react-native-purchases').default;
  } catch (error) {
    console.log('⚠️ RevenueCat not available, using mock');
    Purchases = createMockPurchases();
  }
}

export default Purchases;
