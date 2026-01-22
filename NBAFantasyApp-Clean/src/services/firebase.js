// src/services/firebase.js
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// CORRECT: Simple, reliable environment detection
const isExpoGo = Constants.appOwnership === 'expo';
const isDevelopmentBuild = Constants.appOwnership === 'standalone' && __DEV__;

console.log(`[Firebase Service] Environment: Expo Go=${isExpoGo}, Dev Build=${isDevelopmentBuild}`);

let firebaseAnalytics = null;

// Always use mock for now to prevent crashes
console.log('🎭 Using mock Firebase Analytics (fallback)');

// Create a simple mock analytics object
firebaseAnalytics = {
  logEvent: async (eventName, params = {}) => {
    console.log(`[Mock Analytics] Event: ${eventName}`, params);
    return Promise.resolve();
  },
  setCurrentScreen: async (screenName, screenClass = null) => {
    console.log(`[Mock Analytics] Screen: ${screenName}`, screenClass);
    return Promise.resolve();
  }
};

// Export logging functions
export const logAnalyticsEvent = (eventName, params = {}) => {
  try {
    console.log(`📊 Analytics Event: ${eventName}`, params);
    return firebaseAnalytics.logEvent(eventName, params);
  } catch (error) {
    console.log(`[Analytics Error] ${eventName}:`, error);
    return Promise.resolve();
  }
};

export const logScreenView = (screenName, screenClass = null) => {
  try {
    console.log(`📱 Screen View: ${screenName}`);
    return firebaseAnalytics.setCurrentScreen(screenName, screenClass);
  } catch (error) {
    console.log(`[Screen View Error] ${screenName}:`, error);
    return Promise.resolve();
  }
};
