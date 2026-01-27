import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen-enhanced-v2';
import LiveGamesScreen from '../screens/LiveGamesScreen-enhanced';
import PlayerStatsScreen from '../screens/PlayerStatsScreen-enhanced';
import NflAnalyticsScreen from '../screens/NFLScreen-enhanced';
import ParlayBuilderScreen from '../screens/ParlayBuilder/ParlayBuilderScreen';
import DailyPicksAIScreen from '../screens/DailyPicksAIScreen';
import SportsNewsHubScreen from '../screens/SportsNewsHub-enhanced';

const Tab = createBottomTabNavigator();

export default function SimpleTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Live': iconName = focused ? 'play-circle' : 'play-circle-outline'; break;
            case 'PlayerStats': iconName = focused ? 'stats-chart' : 'stats-chart-outline'; break;
            case 'NFL': iconName = focused ? 'american-football' : 'american-football-outline'; break;
            case 'Parlay': iconName = focused ? 'cash' : 'cash-outline'; break;
            case 'PicksAI': iconName = focused ? 'trophy' : 'trophy-outline'; break;
            case 'News': iconName = focused ? 'newspaper' : 'newspaper-outline'; break;
            default: iconName = focused ? 'help-circle' : 'help-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopWidth: 1,
          borderTopColor: '#334155',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 4, fontWeight: '500' },
        headerShown: false,
      })}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Live" component={LiveGamesScreen} options={{ tabBarLabel: 'Live Games' }} />
      <Tab.Screen name="PlayerStats" component={PlayerStatsScreen} options={{ tabBarLabel: 'Player Stats' }} />
      <Tab.Screen name="NFL" component={NflAnalyticsScreen} options={{ tabBarLabel: 'NFL' }} />
      <Tab.Screen name="Parlay" component={ParlayBuilderScreen} options={{ tabBarLabel: 'Parlay' }} />
      <Tab.Screen 
        name="PicksAI" 
        component={DailyPicksAIScreen} 
        options={{ 
          tabBarLabel: 'Picks & AI',
          tabBarBadge: 'NEW',
          tabBarBadgeStyle: {
            backgroundColor: '#8b5cf6',
            fontSize: 10,
            marginLeft: 2,
          }
        }} 
      />
      <Tab.Screen name="News" component={SportsNewsHubScreen} options={{ tabBarLabel: 'News Hub' }} />
    </Tab.Navigator>
  );
}
