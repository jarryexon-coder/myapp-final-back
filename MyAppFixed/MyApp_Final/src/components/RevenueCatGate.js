// File: src/components/RevenueCatGate.js
import React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import BOTH hooks
import usePremiumAccess from '../hooks/usePremiumAccess';
import useDailyLocks from '../hooks/useDailyLocks';

const RevenueCatGate = ({ 
  children, 
  requiredEntitlement = 'premium_access', // 'premium_access' or 'daily_locks'
  featureName = 'This feature'
}) => {
  // Use the appropriate hook based on the required entitlement
  const premium = usePremiumAccess();
  const daily = useDailyLocks();
  
  const { hasAccess, loading } = requiredEntitlement === 'premium_access' ? premium : daily;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>
          Checking access...
        </Text>
      </View>
    );
  }

  if (hasAccess) {
    return children;
  }

  // User doesn't have access - show upgrade prompt
  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa', padding: 20, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Ionicons name="lock-closed" size={60} color="#007AFF" />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 20 }}>
          Premium Feature
        </Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 22 }}>
          {featureName} requires a subscription.
        </Text>
      </View>

      <TouchableOpacity 
        style={{ 
          backgroundColor: '#007AFF', 
          paddingHorizontal: 20, 
          paddingVertical: 15, 
          borderRadius: 25, 
          alignItems: 'center',
          marginTop: 20
        }}
        onPress={() => {
          // Navigate to your paywall screen
          Alert.alert('Upgrade', `Navigate to paywall for ${requiredEntitlement}`);
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          View Subscription Plans
        </Text>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', fontSize: 14, color: '#666', marginTop: 30 }}>
        Your current plan doesn't include this feature.
      </Text>
    </View>
  );
};

export default RevenueCatGate;
