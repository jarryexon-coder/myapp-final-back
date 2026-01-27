// src/firebase/firebase-config.js - Updated for React Native Firebase
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';

// Your Firebase configuration
// Replace these values with your actual Firebase project config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "nba-fantasy-ai.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "nba-fantasy-ai",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "nba-fantasy-ai.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase
let app;
let db;
let authInstance;
let storageInstance;
let analyticsInstance;
let messagingInstance;

try {
  app = initializeApp(firebaseConfig);
  authInstance = auth();
  db = firestore();
  storageInstance = storage();
  analyticsInstance = analytics();
  messagingInstance = messaging();
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { 
  app, 
  db, 
  authInstance as auth, 
  storageInstance as storage, 
  analyticsInstance as analytics,
  messagingInstance as messaging
};
