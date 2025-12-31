import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Import just a few screens
import HomeScreen from '../screens/HomeScreen';
import ParlayBuilderScreen from '../screens/ParlayBuilder/ParlayBuilderScreen';
import PlayerProfileScreen from '../screens/PlayerProfileScreen';

const Tab = createBottomTabNavigator();

export default function TestNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon = '❓';
          if (route.name === 'Home') icon = '🏠';
          if (route.name === 'Parlay') icon = '🎯';
          if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: size, color }}>{icon}</Text>;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Parlay" component={ParlayBuilderScreen} />
      <Tab.Screen name="Profile" component={PlayerProfileScreen} />
    </Tab.Navigator>
  );
}
