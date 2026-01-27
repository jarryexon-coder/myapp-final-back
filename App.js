// App.js - Integrated and Complete
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, LogBox, Platform } from 'react-native';

// Initialize Firebase - import the config file
import './src/firebase/firebase-config';

// Initialize Firebase Service
import firebaseService from './src/services/firebase-service';
firebaseService.initialize();

// Suppress warnings
LogBox.ignoreLogs([
  'ProgressBar: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.',
  'This method is deprecated (as well as all React Native Firebase namespaced API)',
]);

// Import main tab navigator (7 tabs)
import SimpleTabNavigator from './src/navigation/SimpleTabNavigator';

// Import screens NOT in tabs
import NHLScreen from './src/screens/NHLScreen-enhanced';
import FantasyScreen from './src/screens/FantasyScreen-enhanced-v2';
import GameDetailsScreen from './src/screens/GameDetailsScreen';
import BettingScreen from './src/screens/BettingScreen-enhanced';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen-enhanced';
import PremiumAccessPaywall from './src/screens/PremiumAccessPaywall';
import PlayerProfileScreen from './src/screens/PlayerProfileScreen-enhanced';
import EditorUpdatesScreen from './src/screens/EditorUpdatesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Track app launch
    firebaseService.logEvent('app_launch', {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <NavigationContainer
        onReady={() => {
          // Track navigation ready
          firebaseService.logEvent('navigation_ready');
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
          initialRouteName="MainTabs"
        >
          {/* Main Tab Navigator with 7 tabs (Picks & AI combined) */}
          <Stack.Screen 
            name="MainTabs" 
            component={SimpleTabNavigator} 
            options={{ headerShown: false }}
          />
          
          {/* NHL Screen - Accessible from Home button only */}
          <Stack.Screen 
            name="NHL" 
            component={NHLScreen}
            options={{ 
              title: 'NHL Games',
              headerShown: true
            }}
          />
          
          {/* Other button-accessible screens */}
          <Stack.Screen 
            name="PlayerProfile" 
            component={PlayerProfileScreen}
            options={{ 
              title: 'Player Profile',
              headerShown: true
            }}
          />
          
          <Stack.Screen 
            name="Fantasy" 
            component={FantasyScreen}
            options={{ 
              title: 'Fantasy Sports',
              headerShown: true
            }}
          />
          
          {/* Editor Updates Screen */}
          <Stack.Screen 
            name="EditorUpdates" 
            component={EditorUpdatesScreen} 
            options={{ 
              headerShown: false,
              gestureEnabled: true,
              cardStyle: { backgroundColor: '#f8fafc' }
            }}
          />
          
          {/* Optional screens */}
          <Stack.Screen 
            name="GameDetails" 
            component={GameDetailsScreen}
            options={{ title: 'Game Details' }}
          />
          
          <Stack.Screen 
            name="Betting" 
            component={BettingScreen}
            options={{ title: 'Sports Betting' }}
          />
          
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
          
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              title: 'Login',
              presentation: 'modal'
            }}
          />
          
          <Stack.Screen 
            name="Premium" 
            component={PremiumAccessPaywall}
            options={{ 
              title: 'Premium Access',
              presentation: 'modal'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
