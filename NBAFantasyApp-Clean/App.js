// App.js - Main application component
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

// Import Firebase initialization
import { checkFirebaseStatus } from './src/firebase/firebase-config-simple';

// Import your grouped tab navigator
import GroupedTabNavigator from './src/navigation/GroupedTabNavigator';

export default function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Initialize Firebase on app start
    const initFirebase = () => {
      try {
        const status = checkFirebaseStatus();
        console.log('Firebase Status:', status);
        
        if (status.appInitialized) {
          console.log('✅ Firebase initialized successfully');
          setFirebaseReady(true);
        } else {
          console.warn('⚠️ Firebase not fully initialized - using fallback');
          setFirebaseReady(true);
        }
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setFirebaseReady(true);
      }
    };

    initFirebase();
  }, []);

  if (!firebaseReady) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
          <p style={{ color: 'white' }}>Loading NBA Fantasy App...</p>
        </div>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <GroupedTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
