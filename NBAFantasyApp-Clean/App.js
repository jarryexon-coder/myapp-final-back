import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ErrorUtils, Text, View, StyleSheet, LogBox, TouchableOpacity } from 'react-native';
import RootWrapper from './src/components/RootWrapper'; // ADDED IMPORT

// Suppress specific warnings if needed
LogBox.ignoreLogs([
  'Require cycle:',
  'Setting a timer',
  // Add any other warnings you want to suppress
]);

// ENHANCED GLOBAL ERROR HANDLER
if (ErrorUtils && ErrorUtils.getGlobalHandler) {
  const originalErrorHandler = ErrorUtils.getGlobalHandler();
  
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('🔥🔥🔥 GLOBAL ERROR CAUGHT 🔥🔥🔥');
    console.error('🔥 Message:', error.message);
    console.error('🔥 Is Fatal:', isFatal);
    console.error('🔥 Stack trace:');
    console.error(error.stack);
    
    // Enhanced detection for "src" errors
    if (error.message.includes("src") || error.message.includes(".src") || error.message.includes("'src'")) {
      console.error('🔍 DETECTED: This error involves ".src" property access');
      console.error('🔍 Possible causes:');
      console.error('  1. Dynamic require() or import() of a module');
      console.error('  2. Screen name array with .js extension');
      console.error('  3. Module expecting .src property');
      
      // Try to get more context from the stack trace
      const stackLines = error.stack.split('\n');
      console.error('🔍 Relevant stack lines:');
      stackLines.forEach((line, index) => {
        if (line.includes('.js') || line.includes('require') || line.includes('import')) {
          console.error(`  [${index}] ${line.trim()}`);
        }
      });
    }
    
    // Also log to async storage for persistence
    try {
      // You can store errors in AsyncStorage here
      console.log('📝 Error would be logged to storage');
    } catch (storageError) {
      console.error('Failed to save error:', storageError);
    }
    
    // Call original handler
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨🚨🚨 ErrorBoundary Caught Error 🚨🚨🚨');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ App Crashed</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error occurred'}
          </Text>
          
          {this.state.error?.message?.includes('src') && (
            <View style={styles.specialHint}>
              <Text style={styles.hintTitle}>🔍 "src" Property Error Detected</Text>
              <Text style={styles.hintText}>
                This usually means a screen name array has .js extensions or a module 
                is trying to access a .src property that doesn't exist.
              </Text>
              <Text style={styles.hintText}>
                Check files like SubscriptionScreen.js for arrays with .js extensions.
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => {
              // You could implement a restart logic here
              console.log('Restart requested');
            }}
          >
            <Text style={styles.restartButtonText}>Restart App</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  specialHint: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 10,
  },
  hintText: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 5,
  },
  restartButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <RootWrapper /> {/* REPLACED GroupedTabNavigator with RootWrapper */}
        </NavigationContainer>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
