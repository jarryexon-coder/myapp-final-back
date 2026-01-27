// src/services/firebase-service.js - Updated for React Native Firebase
import analytics from '@react-native-firebase/analytics';
import { logEvent as firebaseLogEvent, setUserProperties, setUserId } from '@react-native-firebase/analytics';

class FirebaseService {
  constructor() {
    this.initialized = false;
    this.analyticsInstance = null;
  }

  initialize = () => {
    if (this.initialized) {
      return;
    }

    try {
      // React Native Firebase analytics is already initialized
      this.analyticsInstance = analytics();
      this.initialized = true;
      console.log('✅ Firebase Analytics initialized');
    } catch (error) {
      console.error('Firebase Analytics initialization error:', error);
    }
  };

  // Screen tracking
  trackScreenView = (screenName, screenClass = '') => {
    if (!this.analyticsInstance) return;
    
    firebaseLogEvent(this.analyticsInstance, 'screen_view', {
      firebase_screen: screenName,
      firebase_screen_class: screenClass,
      timestamp: Date.now(),
    });
  };

  // Button click tracking
  trackButtonClick = (buttonName, location = '', params = {}) => {
    if (!this.analyticsInstance) return;
    
    firebaseLogEvent(this.analyticsInstance, 'button_click', {
      button_name: buttonName,
      location,
      ...params,
      timestamp: Date.now(),
    });
  };

  // Log custom events
  logEvent = (eventName, params = {}) => {
    if (!this.analyticsInstance) return;
    
    firebaseLogEvent(this.analyticsInstance, eventName, {
      ...params,
      timestamp: Date.now(),
    });
  };

  // Set user properties
  setUserProperty = (propertyName, propertyValue) => {
    if (!this.analyticsInstance) return;
    
    setUserProperties(this.analyticsInstance, {
      [propertyName]: propertyValue,
    });
  };

  // Set user ID
  setUserId = (userId) => {
    if (!this.analyticsInstance) return;
    
    setUserId(this.analyticsInstance, userId);
  };

  // Get analytics instance
  getAnalytics = () => {
    return this.analyticsInstance;
  };
}

// Create a singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
