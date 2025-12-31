// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, LogBox } from 'react-native';

// Import contexts
import { AuthProvider } from './src/navigation/MainNavigator';
import { SearchProvider } from './src/contexts/SearchContext';

// Import Firebase config
import './src/firebase/firebase-config-simple';

// Import SimpleTabNavigator (which will now use MainNavigator)
import SimpleTabNavigator from './src/navigation/SimpleTabNavigator';

export default function App() {
  useEffect(() => {
    LogBox.ignoreLogs([
      'Encountered two children with the same key',
      'ProgressBar: Support for defaultProps will be removed',
      'Firebase Analytics is not supported in this environment',
      'Cookies are not available',
      'IndexedDB unavailable or restricted',
      'auth/already-initialized',
      '@firebase/analytics:',
    ]);
    LogBox.ignoreAllLogs();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <AuthProvider>
        <SearchProvider>
          <NavigationContainer>
            <SimpleTabNavigator />
          </NavigationContainer>
        </SearchProvider>
      </AuthProvider>
    </>
  );
}
