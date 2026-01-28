// App.js - Main application component with Firebase initialization
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import Firebase initialization
import { checkFirebaseStatus } from './src/firebase/firebase-config-simple';

// Import screens
import SimpleHomeScreen from 'src/screens/SimpleHomeScreen.js';
import FantasyScreen-enhanced from 'src/screens/FantasyScreen-enhanced.js';
import MatchAnalyticsScreen from 'src/screens/MatchAnalyticsScreen.js';
import SettingsScreen from 'src/screens/SettingsScreen.js';

const Tab = createBottomTabNavigator();

export default function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Initialize Firebase on app start
    const initFirebase = async () => {
      try {
        const status = checkFirebaseStatus();
        console.log('🔥 Firebase Status:', status);
        
        if (status.appInitialized) {
          console.log('✅ Firebase initialized successfully');
          setFirebaseReady(true);
        } else {
          console.warn('⚠️ Firebase not fully initialized - using fallback');
          setFirebaseReady(true); // Still render app with fallback
        }
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        setFirebaseReady(true); // Render app anyway
      }
    };

    initFirebase();
  }, []);

  // Show loading screen while initializing
  if (!firebaseReady) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {/* Simple loading screen */}
        <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <p>Initializing NBA Fantasy App...</p>
        </div>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={$home_name} 
            options={{ title: 'NBA Fantasy' }}
          />
          <Tab.Screen 
            name="Fantasy" 
            component={$fantasy_name} 
            options={{ title: 'Fantasy Hub' }}
          />
          <Tab.Screen 
            name="Analytics" 
            component={$analytics_name} 
            options={{ title: 'Advanced Analytics' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={$settings_name} 
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
