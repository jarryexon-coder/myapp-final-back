// src/navigation/SimpleTabNavigator.js
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import MainNavigator for stack navigation
import MainNavigator, { AuthContext } from './MainNavigator';

// Import individual screens for tab navigation
import HomeScreen from '../screens/HomeScreen-enhanced-v2';
import LiveGamesScreen from '../screens/LiveGamesScreen-enhanced';
import NFLScreen from '../screens/NFLScreen-enhanced';
import ParlayBuilderScreen from '../screens/ParlayBuilder/ParlayBuilderScreen';
import DailyPicksScreen from '../screens/DailyPicksScreen-enhanced';
import PredictionsScreen from '../screens/ParlayBuilder/PredictionsScreen';
import SportsNewsHubScreen from '../screens/SportsNewsHub-enhanced';
import FantasyScreen from '../screens/FantasyScreen-enhanced';
import AnalyticsScreen from '../screens/AnalyticsScreen-enhanced';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Button Component
function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={styles.customButton}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

// Component to handle navigation to different screens
function TabScreenWrapper({ component: Component, screenName, ...props }) {
  const navigation = useNavigation();
  return <Component {...props} navigation={navigation} />;
}

export default function SimpleTabNavigator() {
  const navigation = useNavigation();
  const { isPremium } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'HomeTab': iconName = focused ? 'home' : 'home-outline'; break;
            case 'LiveTab': iconName = focused ? 'play-circle' : 'play-circle-outline'; break;
            case 'SportsHubTab': iconName = focused ? 'newspaper' : 'newspaper-outline'; break;
            case 'NFLTab': iconName = focused ? 'american-football' : 'american-football-outline'; break;
            case 'FantasyTab': iconName = focused ? 'trophy' : 'trophy-outline'; break;
            case 'SearchTab': iconName = focused ? 'search' : 'search-outline'; break;
            case 'PicksTab': iconName = focused ? 'trophy' : 'trophy-outline'; break;
            case 'ParlayTab': iconName = focused ? 'cash' : 'cash-outline'; break;
            case 'AnalyticsTab': iconName = focused ? 'stats-chart' : 'stats-chart-outline'; break;
            case 'PredictionsTab': iconName = focused ? 'analytics' : 'analytics-outline'; break;
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
      initialRouteName="HomeTab"
    >
      {/* Tab 1: Home */}
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ 
          tabBarLabel: 'Home',
        }} 
      />
      
      {/* Tab 2: Live Games */}
      <Tab.Screen 
        name="LiveTab" 
        component={LiveGamesScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('LiveGames');
          }
        }}
        options={{ 
          tabBarLabel: 'Live',
        }} 
      />
      
      {/* Tab 3: Sports Hub */}
      <Tab.Screen 
        name="SportsHubTab" 
        component={SportsNewsHubScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('SportsNewsHub');
          }
        }}
        options={{ 
          tabBarLabel: 'News',
        }} 
      />
      
      {/* Tab 4: Custom Search Button */}
      <Tab.Screen 
        name="SearchTab" 
        component={View} // Dummy component
        options={{ 
          tabBarLabel: 'Search',
          tabBarButton: (props) => (
            <CustomTabBarButton
              {...props}
              onPress={() => navigation.navigate('Search')}
            >
              <Ionicons name="search" size={24} color="#007AFF" />
              <Text style={styles.searchButtonText}>Search</Text>
            </CustomTabBarButton>
          ),
        }} 
      />
      
      {/* Conditional Premium Tabs */}
      {isPremium ? (
        <>
          {/* Tab 5: NFL */}
          <Tab.Screen 
            name="NFLTab" 
            component={NFLScreen}
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                navigation.navigate('NFL');
              }
            }}
            options={{ 
              tabBarLabel: 'NFL',
            }} 
          />
          
          {/* Tab 6: Daily Picks */}
          <Tab.Screen 
            name="PicksTab" 
            component={DailyPicksScreen}
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                navigation.navigate('DailyPicks');
              }
            }}
            options={{ 
              tabBarLabel: 'Picks',
            }} 
          />
          
          {/* Tab 7: Analytics */}
          <Tab.Screen 
            name="AnalyticsTab" 
            component={AnalyticsScreen}
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                navigation.navigate('Analytics');
              }
            }}
            options={{ 
              tabBarLabel: 'Analytics',
            }} 
          />
        </>
      ) : (
        // Show limited tabs for non-premium users
        <>
          <Tab.Screen 
            name="UpgradeTab" 
            component={View}
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                navigation.navigate('PremiumAccess');
              }
            }}
            options={{ 
              tabBarLabel: 'Upgrade',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="star-outline" size={size} color={color} />
              ),
            }} 
          />
        </>
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  customButton: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#007AFF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});
