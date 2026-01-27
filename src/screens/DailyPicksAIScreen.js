// src/screens/DailyPicksAIScreen.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DailyPicksScreen from './DailyPicksScreen-enhanced';
import AIPredictionsScreen from './AIPredictionsScreen';

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

export default function DailyPicksAIScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="sparkles" size={28} color="#fff" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Picks & AI Intelligence</Text>
            <Text style={styles.headerSubtitle}>Expert picks with AI predictions</Text>
          </View>
        </View>
        
        <View style={styles.headerStats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>87%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>AI Accuracy</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>+24.5%</Text>
            <Text style={styles.statLabel}>ROI</Text>
          </View>
        </View>
      </View>

      {/* Top Tab Navigator */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#ef4444',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: '#0f172a',
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#ef4444',
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'none',
          },
          tabBarContentContainerStyle: {
            height: 50,
          },
        }}
        sceneContainerStyle={{
          backgroundColor: '#f8fafc',
        }}
      >
        <Tab.Screen 
          name="DailyPicks" 
          component={DailyPicksScreen} 
          options={{ 
            title: '🎯 Daily Picks',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                name={focused ? "trophy" : "trophy-outline"} 
                size={20} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="AIPredictions" 
          component={AIPredictionsScreen} 
          options={{ 
            title: '🤖 AI Predictions',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                name={focused ? "sparkles" : "sparkles-outline"} 
                size={20} 
                color={color} 
              />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
