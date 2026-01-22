import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Platform,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppNavigation } from '../navigation/NavigationHelper';
import { useSearch } from '../providers/SearchProvider';  
import SearchBar from '../components/SearchBar';
import { useSportsData } from '../hooks/useSportsData';
import { useAnalytics } from '../hooks/useAnalytics';
import ErrorBoundary from '../components/ErrorBoundary';
import { logAnalyticsEvent, logScreenView } from '../services/firebase';

const { width } = Dimensions.get('window');

// Parlay-Specific Analytics Box
const ParlayAnalyticsBox = () => {
  const [showAnalyticsBox, setShowAnalyticsBox] = useState(false);
  const [parlayStats, setParlayStats] = useState({
    winRate: '68.4%',
    avgLegs: '2.7',
    avgOdds: '+425',
    bestParlay: '+1250',
    multiSport: '42%'
  });

  return (
    <>
      {!showAnalyticsBox ? (
        <TouchableOpacity 
          style={[parlayAnalyticsStyles.floatingButton, {backgroundColor: '#f59e0b'}]}
          onPress={() => {
            setShowAnalyticsBox(true);
            logAnalyticsEvent('parlay_analytics_opened');
          }}
        >
          <LinearGradient
            colors={['#f59e0b', '#d97706']}
            style={parlayAnalyticsStyles.floatingButtonGradient}
          >
            <Ionicons name="stats-chart" size={20} color="white" />
            <Text style={parlayAnalyticsStyles.floatingButtonText}>Parlay Stats</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={[parlayAnalyticsStyles.container, {backgroundColor: '#1e293b'}]}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={parlayAnalyticsStyles.gradient}
          >
            <View style={parlayAnalyticsStyles.header}>
              <View style={parlayAnalyticsStyles.headerLeft}>
                <Ionicons name="git-merge" size={24} color="#f59e0b" />
                <Text style={parlayAnalyticsStyles.title}>Parlay Performance</Text>
              </View>
              <TouchableOpacity 
                style={parlayAnalyticsStyles.iconButton}
                onPress={() => setShowAnalyticsBox(false)}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={parlayAnalyticsStyles.statsGrid}>
              <View style={parlayAnalyticsStyles.statItem}>
                <View style={[parlayAnalyticsStyles.statIcon, {backgroundColor: '#10b98120'}]}>
                  <Ionicons name="trophy" size={20} color="#10b981" />
                </View>
                <Text style={parlayAnalyticsStyles.statValue}>{parlayStats.winRate}</Text>
                <Text style={parlayAnalyticsStyles.statLabel}>Win Rate</Text>
              </View>
              
              <View style={parlayAnalyticsStyles.statItem}>
                <View style={[parlayAnalyticsStyles.statIcon, {backgroundColor: '#3b82f620'}]}>
                  <Ionicons name="layers" size={20} color="#3b82f6" />
                </View>
                <Text style={parlayAnalyticsStyles.statValue}>{parlayStats.avgLegs}</Text>
                <Text style={parlayAnalyticsStyles.statLabel}>Avg Legs</Text>
              </View>
              
              <View style={parlayAnalyticsStyles.statItem}>
                <View style={[parlayAnalyticsStyles.statIcon, {backgroundColor: '#8b5cf620'}]}>
                  <Ionicons name="cash" size={20} color="#8b5cf6" />
                </View>
                <Text style={parlayAnalyticsStyles.statValue}>{parlayStats.avgOdds}</Text>
                <Text style={parlayAnalyticsStyles.statLabel}>Avg Odds</Text>
              </View>
              
              <View style={parlayAnalyticsStyles.statItem}>
                <View style={[parlayAnalyticsStyles.statIcon, {backgroundColor: '#f59e0b20'}]}>
                  <Ionicons name="trending-up" size={20} color="#f59e0b" />
                </View>
                <Text style={parlayAnalyticsStyles.statValue}>{parlayStats.bestParlay}</Text>
                <Text style={parlayAnalyticsStyles.statLabel}>Best Parlay</Text>
              </View>
            </View>

            <View style={parlayAnalyticsStyles.multiSportInfo}>
              <View style={parlayAnalyticsStyles.multiSportHeader}>
                <Ionicons name="basketball" size={16} color="#ef4444" />
                <Ionicons name="american-football" size={16} color="#3b82f6" style={{marginLeft: -5}} />
                <Text style={parlayAnalyticsStyles.multiSportTitle}>Multi-Sport Parlays</Text>
              </View>
              <Text style={parlayAnalyticsStyles.multiSportValue}>{parlayStats.multiSport}</Text>
              <Text style={parlayAnalyticsStyles.multiSportLabel}>of all winning parlays</Text>
            </View>

            <View style={parlayAnalyticsStyles.tips}>
              <Text style={parlayAnalyticsStyles.tipsTitle}>Parlay Tips</Text>
              <View style={parlayAnalyticsStyles.tipItem}>
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text style={parlayAnalyticsStyles.tipText}>2-3 legs have highest success rate</Text>
              </View>
              <View style={parlayAnalyticsStyles.tipItem}>
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text style={parlayAnalyticsStyles.tipText}>Combine sports for better value</Text>
              </View>
              <View style={parlayAnalyticsStyles.tipItem}>
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text style={parlayAnalyticsStyles.tipText}>Balance high-probability with value picks</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}
    </>
  );
};

const parlayAnalyticsStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: width * 0.9,
    maxWidth: 400,
    height: 400,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  iconButton: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  multiSportInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  multiSportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  multiSportTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  multiSportValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    backgroundColor: 'transparent',
  },
  multiSportLabel: {
    fontSize: 12,
    color: '#94a3b8',
    backgroundColor: 'transparent',
  },
  tips: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  tipsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  tipText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    backgroundColor: 'transparent',
  },
});

// Parlay Builder Metrics Component
const ParlayMetricsCard = ({ stats }) => {
  return (
    <View style={[parlayMetricsStyles.container, {backgroundColor: '#1e293b'}]}>
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={parlayMetricsStyles.gradient}
      >
        <View style={parlayMetricsStyles.header}>
          <Ionicons name="git-merge" size={24} color="#f59e0b" />
          <Text style={parlayMetricsStyles.title}>Parlay Builder Insights</Text>
        </View>
        
        {/* Optimal Legs Analysis */}
        <View style={parlayMetricsStyles.legsAnalysis}>
          <View style={parlayMetricsStyles.legsHeader}>
            <Text style={parlayMetricsStyles.legsLabel}>Optimal Legs Analysis</Text>
            <View style={parlayMetricsStyles.legsOptimal}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={parlayMetricsStyles.legsOptimalText}>2-3 Legs Recommended</Text>
            </View>
          </View>
          
          <View style={parlayMetricsStyles.legsChart}>
            {[1, 2, 3, 4, 5].map((legs, index) => (
              <View key={legs} style={parlayMetricsStyles.legBar}>
                <View 
                  style={[
                    parlayMetricsStyles.legBarFill,
                    { 
                      height: `${stats.legsSuccess[legs - 1]}%`,
                      backgroundColor: legs <= 3 ? '#f59e0b' : '#ef4444'
                    }
                  ]}
                />
                <Text style={parlayMetricsStyles.legLabel}>{legs}</Text>
                <Text style={parlayMetricsStyles.legValue}>{stats.legsSuccess[legs - 1]}%</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={parlayMetricsStyles.multiSportSection}>
          <View style={parlayMetricsStyles.multiSportHeader}>
            <View style={parlayMetricsStyles.sportIcons}>
              <Ionicons name="basketball" size={20} color="#ef4444" />
              <Ionicons name="american-football" size={20} color="#3b82f6" style={{marginLeft: -8}} />
              <Ionicons name="ice-cream" size={20} color="#1e40af" style={{marginLeft: -8}} />
            </View>
            <Text style={parlayMetricsStyles.multiSportTitle}>Multi-Sport Advantage</Text>
          </View>
          <Text style={parlayMetricsStyles.multiSportValue}>
            +{stats.multiSportEdge}% better value
          </Text>
          <Text style={parlayMetricsStyles.multiSportText}>
            Combining sports reduces correlation risk and improves value
          </Text>
        </View>
        
        <View style={parlayMetricsStyles.footer}>
          <Ionicons name="information-circle" size={14} color="#64748b" />
          <Text style={parlayMetricsStyles.footerText}>
            Optimal parlays: 2-3 legs, mixed sports, high-probability picks
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const parlayMetricsStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
    backgroundColor: 'transparent',
  },
  legsAnalysis: {
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  legsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  legsLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  legsOptimal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  legsOptimalText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
    backgroundColor: 'transparent',
  },
  legsChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  legBar: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  legBarFill: {
    width: 25,
    borderRadius: 6,
    marginBottom: 8,
  },
  legLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  legValue: {
    fontSize: 10,
    color: '#cbd5e1',
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  multiSportSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  multiSportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  sportIcons: {
    flexDirection: 'row',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  multiSportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    backgroundColor: 'transparent',
  },
  multiSportValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  multiSportText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
});

// Gradient Wrapper Component
const GradientWrapper = ({ colors, style, children, gradientStyle }) => {
  const firstColor = colors?.[0] || '#f59e0b';
  return (
    <View style={[style, { backgroundColor: firstColor }]}>
      <LinearGradient
        colors={colors}
        style={gradientStyle || StyleSheet.absoluteFillObject}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

// Main Component
export default function ParlayBuilderScreen() {
  const { logEvent, logNavigation, logSecretPhrase } = useAnalytics();
  const navigation = useAppNavigation();
  const { searchHistory, addToSearchHistory } = useSearch();
  const [selectedPicks, setSelectedPicks] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parlayConfidence, setParlayConfidence] = useState(0);
  const [parlayOdds, setParlayOdds] = useState('+100');
  const [expectedPayout, setExpectedPayout] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [parlayLegs, setParlayLegs] = useState(3);
  const [autoBalanceEnabled, setAutoBalanceEnabled] = useState(true);

  // Parlay-specific prompts
  const parlayPrompts = [
    "Build 3-leg NBA parlay with high probability",
    "Generate mixed sports parlay (NBA + NFL)",
    "Create 2-leg moneyline parlay for tonight",
    "Build value parlay with +500 odds target",
    "Generate correlated parlay for primetime games",
    "Create 3-leg player props parlay",
    "Build underdog parlay with good value",
    "Generate same-game parlay for featured matchup",
    "Create over/under parlay across multiple sports",
    "Build balanced parlay with 70%+ win probability"
  ];

  // Sports for filtering
  const sports = [
    { id: 'All', name: 'All Sports', icon: 'earth', gradient: ['#f59e0b', '#d97706'] },
    { id: 'NBA', name: 'NBA', icon: 'basketball', gradient: ['#ef4444', '#dc2626'] },
    { id: 'NFL', name: 'NFL', icon: 'american-football', gradient: ['#3b82f6', '#1d4ed8'] },
    { id: 'NHL', name: 'NHL', icon: 'ice-cream', gradient: ['#1e40af', '#1e3a8a'] },
    { id: 'MLB', name: 'MLB', icon: 'baseball', gradient: ['#10b981', '#059669'] },
  ];

  // Calculate parlay odds and payout
  const calculateParlay = useCallback((picks) => {
    if (!picks || picks.length === 0) {
      setParlayConfidence(0);
      setParlayOdds('+100');
      setExpectedPayout(0);
      return;
    }

    // Calculate combined probability
    let combinedProbability = 1;
    picks.forEach(pick => {
      const probability = (pick.confidence || 75) / 100;
      combinedProbability *= probability;
    });

    // Calculate parlay odds (simplified)
    const decimalOdds = 1 / combinedProbability;
    const americanOdds = decimalOdds >= 2 ? 
      `+${Math.round((decimalOdds - 1) * 100)}` : 
      `-${Math.round(100 / (decimalOdds - 1))}`;

    // Calculate expected payout (assuming $100 bet)
    const payout = Math.round((decimalOdds - 1) * 100);

    setParlayConfidence(Math.round(combinedProbability * 100));
    setParlayOdds(americanOdds);
    setExpectedPayout(payout);

    logEvent('parlay_calculated', {
      legs: picks.length,
      confidence: Math.round(combinedProbability * 100),
      odds: americanOdds,
      expected_payout: payout,
      sports_included: [...new Set(picks.map(p => p.sport))].join(',')
    });
  }, [logEvent]);

  // Generate parlay picks
  const generateParlayPicks = async (prompt) => {
    if (selectedPicks.length >= 3) {
      Alert.alert('Parlay Limit', 'Maximum 3 legs per parlay. Remove some picks or create a new parlay.');
      return;
    }

    setGenerating(true);
    setShowGeneratingModal(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate parlay-specific picks
      const newPicks = generateParlaySpecificPicks(prompt);
      const availableSlots = 3 - selectedPicks.length;
      const picksToAdd = newPicks.slice(0, availableSlots);

      const updatedPicks = [...selectedPicks, ...picksToAdd];
      setSelectedPicks(updatedPicks);
      calculateParlay(updatedPicks);

      logEvent('parlay_picks_generated', {
        prompt,
        picks_added: picksToAdd.length,
        total_picks: updatedPicks.length
      });

      setTimeout(() => {
        setShowGeneratingModal(false);
        setGenerating(false);
      }, 1500);

    } catch (error) {
      console.error('Error generating parlay picks:', error);
      setShowGeneratingModal(false);
      setGenerating(false);
      Alert.alert('Error', 'Failed to generate parlay picks');
    }
  };

  // Generate parlay-specific picks
  const generateParlaySpecificPicks = (prompt) => {
    const picks = [];
    const sportsList = ['NBA', 'NFL', 'NHL', 'MLB'];
    const categories = ['High Probability', 'Value Bet', 'Contrarian Play'];

    for (let i = 0; i < 3; i++) {
      const sport = sportsList[Math.floor(Math.random() * sportsList.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      picks.push({
        id: `parlay-${Date.now()}-${i}`,
        type: 'parlay_leg',
        name: `Parlay Leg ${i + 1}`,
        sport: sport,
        category: category,
        pick: getRandomPickForSport(sport),
        confidence: 70 + Math.floor(Math.random() * 25),
        odds: ['-150', '-110', '+120', '+180'][Math.floor(Math.random() * 4)],
        edge: `+${(5 + Math.random() * 15).toFixed(1)}%`,
        analysis: `Strong parlay candidate: ${category.toLowerCase()} with good value`,
        timestamp: 'Just now',
        probability: `${70 + Math.floor(Math.random() * 25)}%`,
        units: (1 + Math.random() * 2).toFixed(1),
        generatedFrom: prompt
      });
    }

    return picks;
  };

  const getRandomPickForSport = (sport) => {
    const picks = {
      NBA: ['Over 28.5 Points', 'Over 7.5 Rebounds', 'Over 8.5 Assists', 'Moneyline Winner', 'Team Total Over'],
      NFL: ['Over 250.5 Passing Yards', 'Over 1.5 Touchdowns', 'Moneyline Winner', 'Team Total Over', 'Anytime TD'],
      NHL: ['Over 3.5 Shots on Goal', 'Anytime Goal Scorer', 'Moneyline Winner', 'Total Goals Over', 'Power Play Goal'],
      MLB: ['Over 1.5 Hits', 'Over 0.5 RBIs', 'Moneyline Winner', 'Total Runs Over', 'Team Total Over']
    };
    return picks[sport]?.[Math.floor(Math.random() * picks[sport].length)] || 'Player Prop';
  };

  // Add pick to parlay
  const addToParlay = (player) => {
    if (selectedPicks.length >= 3) {
      Alert.alert('Parlay Limit', 'Maximum 3 legs per parlay. Remove some picks to add new ones.');
      return;
    }

    const newPick = {
      id: `pick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'parlay_leg',
      name: player.name || 'Unknown Player',
      sport: player.sport || 'NBA',
      category: player.category || 'Standard',
      pick: `${player.position || 'Stat'} ${player.line || 'Line'}`,
      confidence: player.confidence || 75,
      odds: ['-150', '-110', '+120'][Math.floor(Math.random() * 3)],
      edge: player.edge || '+3.5%',
      analysis: player.aiPrediction || 'Strong parlay candidate',
      timestamp: 'Just added',
      probability: `${player.confidence || 75}%`,
      units: '1.5'
    };

    const updatedPicks = [...selectedPicks, newPick];
    setSelectedPicks(updatedPicks);
    calculateParlay(updatedPicks);

    logEvent('parlay_pick_added', {
      player_name: player.name,
      sport: player.sport,
      total_legs: updatedPicks.length
    });
  };

  // Remove pick from parlay
  const removeFromParlay = (id) => {
    const updatedPicks = selectedPicks.filter(pick => pick.id !== id);
    setSelectedPicks(updatedPicks);
    calculateParlay(updatedPicks);

    logEvent('parlay_pick_removed', {
      remaining_legs: updatedPicks.length
    });
  };

  // Clear entire parlay
  const clearParlay = () => {
    if (selectedPicks.length === 0) return;
    
    Alert.alert(
      'Clear Parlay',
      'Are you sure you want to clear all picks from your parlay?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setSelectedPicks([]);
            calculateParlay([]);
            logEvent('parlay_cleared');
          }
        }
      ]
    );
  };

  // Optimize parlay (auto-balance picks)
  const optimizeParlay = () => {
    if (selectedPicks.length < 2) {
      Alert.alert('Need More Picks', 'Add at least 2 picks to optimize your parlay.');
      return;
    }

    // Sort by confidence and take top 3
    const optimizedPicks = [...selectedPicks]
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 3);

    // Ensure sports diversity if auto-balance is enabled
    if (autoBalanceEnabled && optimizedPicks.length > 1) {
      const sportsSet = new Set(optimizedPicks.map(p => p.sport));
      if (sportsSet.size < 2) {
        // Try to add a different sport
        const availableSports = sports.filter(s => s.id !== 'All');
        const differentSport = availableSports.find(s => !sportsSet.has(s.id));
        if (differentSport && selectedPicks.length > 3) {
          const differentSportPick = selectedPicks.find(p => p.sport === differentSport.id);
          if (differentSportPick) {
            optimizedPicks.pop();
            optimizedPicks.push(differentSportPick);
          }
        }
      }
    }

    setSelectedPicks(optimizedPicks);
    calculateParlay(optimizedPicks);

    logEvent('parlay_optimized', {
      original_legs: selectedPicks.length,
      optimized_legs: optimizedPicks.length,
      sports_diversity: new Set(optimizedPicks.map(p => p.sport)).size
    });
  };

  // Load mock data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock players data
      const mockPlayers = [
        { id: '1', name: 'Stephen Curry', team: 'GSW', sport: 'NBA', position: 'Points', line: 'Over 31.5', confidence: 88, edge: '+4.7%', category: 'High Probability' },
        { id: '2', name: 'Patrick Mahomes', team: 'KC', sport: 'NFL', position: 'Passing Yards', line: 'Over 285.5', confidence: 82, edge: '+5.2%', category: 'Value Bet' },
        { id: '3', name: 'Connor McDavid', team: 'EDM', sport: 'NHL', position: 'Points', line: 'Over 1.5', confidence: 79, edge: '+6.8%', category: 'Contrarian Play' },
        { id: '4', name: 'Shohei Ohtani', team: 'LAA', sport: 'MLB', position: 'Total Bases', line: 'Over 1.5', confidence: 75, edge: '+7.1%', category: 'High Probability' },
        { id: '5', name: 'Nikola Jokic', team: 'DEN', sport: 'NBA', position: 'Assists', line: 'Over 9.5', confidence: 85, edge: '+3.9%', category: 'High Probability' },
        { id: '6', name: 'Josh Allen', team: 'BUF', sport: 'NFL', position: 'Passing TDs', line: 'Over 1.5', confidence: 68, edge: '+9.5%', category: 'Value Bet' },
      ];

      setAvailablePlayers(mockPlayers);
      setFilteredPlayers(mockPlayers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    logScreenView('ParlayBuilderScreen');
    logAnalyticsEvent('parlay_builder_screen_view');
    loadData();
  }, [loadData]);

  useEffect(() => {
    calculateParlay(selectedPicks);
  }, [selectedPicks, calculateParlay]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    logEvent('parlay_builder_refresh');
  }, [loadData, logEvent]);

  // Render parlay leg item
  const renderParlayLeg = ({ item, index }) => {
    const getSportIcon = (sport) => {
      switch(sport) {
        case 'NBA': return 'basketball';
        case 'NFL': return 'american-football';
        case 'NHL': return 'ice-cream';
        case 'MLB': return 'baseball';
        default: return 'football';
      }
    };

    const getSportColor = (sport) => {
      switch(sport) {
        case 'NBA': return '#ef4444';
        case 'NFL': return '#3b82f6';
        case 'NHL': return '#1e40af';
        case 'MLB': return '#10b981';
        default: return '#6b7280';
      }
    };

    return (
      <View style={styles.parlayLegCard}>
        <View style={styles.legHeader}>
          <View style={styles.legNumber}>
            <Text style={styles.legNumberText}>Leg {index + 1}</Text>
          </View>
          <View style={[styles.sportBadge, { backgroundColor: `${getSportColor(item.sport)}20` }]}>
            <Ionicons name={getSportIcon(item.sport)} size={14} color={getSportColor(item.sport)} />
            <Text style={[styles.sportText, { color: getSportColor(item.sport) }]}>{item.sport}</Text>
          </View>
          <TouchableOpacity onPress={() => removeFromParlay(item.id)}>
            <Ionicons name="close-circle" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <Text style={styles.legName}>{item.name}</Text>
        <Text style={styles.legPick}>{item.pick}</Text>

        <View style={styles.legMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill,
                  { 
                    width: `${item.confidence}%`,
                    backgroundColor: item.confidence >= 80 ? '#10b981' : 
                                   item.confidence >= 70 ? '#f59e0b' : '#ef4444'
                  }
                ]}
              />
            </View>
            <Text style={styles.metricValue}>{item.confidence}%</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Odds</Text>
            <Text style={[styles.metricValue, styles.oddsText]}>{item.odds}</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Edge</Text>
            <View style={styles.edgeBadge}>
              <Ionicons name="trending-up" size={12} color="#10b981" />
              <Text style={styles.edgeText}>{item.edge}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.legAnalysis}>{item.analysis}</Text>
      </View>
    );
  };

  // Render player item
  const renderPlayerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => addToParlay(item)}
    >
      <View style={styles.playerHeader}>
        <View>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.playerTeam}>{item.team} • {item.sport}</Text>
        </View>
        <View style={[styles.playerCategory, 
          item.category === 'High Probability' ? { backgroundColor: '#10b98120' } :
          item.category === 'Value Bet' ? { backgroundColor: '#3b82f620' } :
          { backgroundColor: '#f59e0b20' }
        ]}>
          <Text style={[
            styles.categoryText,
            item.category === 'High Probability' ? { color: '#10b981' } :
            item.category === 'Value Bet' ? { color: '#3b82f6' } :
            { color: '#f59e0b' }
          ]}>
            {item.category}
          </Text>
        </View>
      </View>

      <Text style={styles.playerPick}>{item.position} {item.line}</Text>

      <View style={styles.playerFooter}>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceBadgeText}>{item.confidence}%</Text>
        </View>
        <View style={styles.edgeBadgeSmall}>
          <Ionicons name="trending-up" size={10} color="#10b981" />
          <Text style={styles.edgeTextSmall}>{item.edge} edge</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addToParlay(item)}
        >
          <Ionicons name="add-circle" size={16} color="#f59e0b" />
          <Text style={styles.addButtonText}>Add to Parlay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render generating modal
  const renderGeneratingModal = () => (
    <Modal transparent visible={showGeneratingModal} animationType="fade">
      <View style={styles.generatingModal}>
        <View style={styles.generatingContent}>
          {generating ? (
            <>
              <ActivityIndicator size="large" color="#f59e0b" />
              <Text style={styles.generatingTitle}>Building Your Parlay...</Text>
              <Text style={styles.generatingText}>
                Finding optimal 2-3 leg combination with high probability
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={60} color="#10b981" />
              <Text style={styles.generatingTitle}>Parlay Built!</Text>
              <Text style={styles.generatingText}>
                {selectedPicks.length}-leg parlay ready for analysis
              </Text>
              <TouchableOpacity
                style={styles.generatingButton}
                onPress={() => setShowGeneratingModal(false)}
              >
                <Text style={styles.generatingButtonText}>View Parlay</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading Parlay Builder...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary fallback={
      <View style={styles.errorContainer}>
        <Text>Parlay builder data unavailable</Text>
      </View>
    }>
      <View style={styles.container}>
        {/* Header with Orange Theme */}
        <View style={[styles.header, {backgroundColor: '#f59e0b'}]}>
          <LinearGradient
            colors={['#f59e0b', '#d97706']}
            style={[StyleSheet.absoluteFillObject, styles.headerOverlay]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerSearchButton}
                onPress={() => setSearchModalVisible(true)}
              >
                <Ionicons name="search-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerMain}>
              <View style={styles.headerIcon}>
                <Ionicons name="git-merge" size={32} color="white" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Parlay Builder</Text>
                <Text style={styles.headerSubtitle}>Build high-probability parlays (max 3 legs)</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Legs Selector */}
        <View style={styles.legsSelector}>
          <Text style={styles.legsLabel}>Parlay Legs:</Text>
          {[2, 3, 4, 5].map(legs => (
            <TouchableOpacity
              key={legs}
              style={[
                styles.legButton,
                parlayLegs === legs && styles.legButtonActive
              ]}
              onPress={() => setParlayLegs(legs)}
            >
              {parlayLegs === legs ? (
                <GradientWrapper
                  colors={['#f59e0b', '#d97706']}
                  style={styles.legButtonGradient}
                  gradientStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8}}
                >
                  <Text style={styles.legButtonTextActive}>{legs}</Text>
                </GradientWrapper>
              ) : (
                <Text style={styles.legButtonText}>{legs}</Text>
              )}
            </TouchableOpacity>
          ))}
          <View style={styles.autoBalanceToggle}>
            <Text style={styles.autoBalanceText}>Auto-Balance</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                autoBalanceEnabled && styles.toggleButtonActive
              ]}
              onPress={() => setAutoBalanceEnabled(!autoBalanceEnabled)}
            >
              <View style={[
                styles.toggleCircle,
                autoBalanceEnabled && styles.toggleCircleActive
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f59e0b']}
              tintColor="#f59e0b"
            />
          }
        >
          {/* Parlay Metrics Card */}
          <ParlayMetricsCard 
            stats={{
              legsSuccess: [72, 68, 65, 58, 42],
              multiSportEdge: '18.5'
            }} 
          />

          {/* Current Parlay Section */}
          <View style={styles.parlaySection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>🎯 Your Parlay ({selectedPicks.length}/3 legs)</Text>
                <Text style={styles.sectionSubtitle}>Build up to 3 legs for optimal success</Text>
              </View>
              {selectedPicks.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearParlay}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedPicks.length === 0 ? (
              <View style={styles.emptyParlay}>
                <Ionicons name="git-merge" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No picks in your parlay</Text>
                <Text style={styles.emptySubtext}>Add picks below or generate a parlay</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={selectedPicks}
                  renderItem={renderParlayLeg}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.parlayList}
                />

                {/* Parlay Summary */}
                <View style={styles.parlaySummary}>
                  <Text style={styles.summaryTitle}>Parlay Summary</Text>
                  
                  <View style={styles.summaryStats}>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{parlayConfidence}%</Text>
                      <Text style={styles.statLabel}>Win Probability</Text>
                    </View>
                    
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{parlayOdds}</Text>
                      <Text style={styles.statLabel}>Parlay Odds</Text>
                    </View>
                    
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>${expectedPayout}</Text>
                      <Text style={styles.statLabel}>Payout on $100</Text>
                    </View>
                  </View>

                  <View style={styles.parlayActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.optimizeButton]}
                      onPress={optimizeParlay}
                    >
                      <Ionicons name="sync" size={16} color="white" />
                      <Text style={styles.optimizeButtonText}>Optimize Parlay</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.analyzeButton]}
                      onPress={() => {
                        logEvent('parlay_analyzed', {
                          legs: selectedPicks.length,
                          confidence: parlayConfidence,
                          odds: parlayOdds
                        });
                        Alert.alert('Parlay Analysis', 
                          `${selectedPicks.length}-leg parlay:\n\n` +
                          `Win Probability: ${parlayConfidence}%\n` +
                          `Parlay Odds: ${parlayOdds}\n` +
                          `Expected Payout: $${expectedPayout} on $100\n\n` +
                          `${parlayConfidence >= 60 ? '✅ Good value parlay' : '⚠️ Consider optimizing'}`);
                      }}
                    >
                      <Ionicons name="analytics" size={16} color="white" />
                      <Text style={styles.analyzeButtonText}>Analyze</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Generate Parlay Section */}
          <View style={styles.generateSection}>
            <View style={styles.generateHeader}>
              <GradientWrapper
                colors={['#f59e0b', '#d97706']}
                style={styles.generateTitleGradient}
                gradientStyle={{paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, alignItems: 'center'}}
              >
                <Text style={styles.generateTitle}>⚡ Generate Smart Parlays</Text>
              </GradientWrapper>
              <Text style={styles.generateSubtitle}>AI builds optimal 2-3 leg parlays</Text>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.promptsScroll}
            >
              {parlayPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptChip}
                  onPress={() => generateParlayPicks(prompt)}
                  disabled={generating || selectedPicks.length >= 3}
                >
                  <GradientWrapper
                    colors={['#f59e0b', '#d97706']}
                    style={[styles.promptChipGradient, (generating || selectedPicks.length >= 3) && styles.promptChipDisabled]}
                    gradientStyle={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20}}
                  >
                    <Ionicons name="flash" size={14} color="#fff" />
                    <Text style={styles.promptChipText}>{prompt}</Text>
                  </GradientWrapper>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sport Selector */}
          <View style={styles.sportSelector}>
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.sportButton,
                  selectedSport === sport.id && styles.sportButtonActive,
                ]}
                onPress={() => {
                  setSelectedSport(sport.id);
                  const filtered = sport.id === 'All' 
                    ? availablePlayers 
                    : availablePlayers.filter(p => p.sport === sport.id);
                  setFilteredPlayers(filtered);
                }}
              >
                {selectedSport === sport.id ? (
                  <GradientWrapper
                    colors={sport.gradient}
                    style={styles.sportButtonGradient}
                    gradientStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 15}}
                  >
                    <Ionicons name={sport.icon} size={18} color="#fff" />
                    <Text style={styles.sportButtonTextActive}>{sport.name}</Text>
                  </GradientWrapper>
                ) : (
                  <>
                    <Ionicons name={sport.icon} size={18} color="#6b7280" />
                    <Text style={styles.sportButtonText}>{sport.name}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Available Picks */}
          <View style={styles.picksSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📊 Available Picks</Text>
              <Text style={styles.sectionSubtitle}>Add to your parlay (max 3 legs)</Text>
            </View>

            {filteredPlayers.length > 0 ? (
              <FlatList
                data={filteredPlayers}
                renderItem={renderPlayerItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.picksList}
              />
            ) : (
              <View style={styles.emptyPicks}>
                <Ionicons name="search-outline" size={40} color="#d1d5db" />
                <Text style={styles.emptyText}>No picks found</Text>
                <Text style={styles.emptySubtext}>Try selecting a different sport</Text>
              </View>
            )}
          </View>

          {/* Parlay Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Parlay Building Tips</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>Limit parlays to 2-3 legs for best success rate</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>Combine different sports to reduce correlation risk</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>Mix high-probability picks with value bets</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>Target parlays with +200 to +500 odds for optimal value</Text>
            </View>
          </View>
        </ScrollView>

        {/* Search Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={searchModalVisible}
          onRequestClose={() => setSearchModalVisible(false)}
        >
          <View style={styles.searchModal}>
            <View style={styles.searchHeader}>
              <TouchableOpacity 
                onPress={() => setSearchModalVisible(false)}
                style={styles.modalBackButton}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Search Picks</Text>
            </View>

            <SearchBar
              placeholder="Search players or picks..."
              onSearch={(query) => {
                setSearchQuery(query);
                const filtered = availablePlayers.filter(p => 
                  p.name.toLowerCase().includes(query.toLowerCase()) ||
                  p.team.toLowerCase().includes(query.toLowerCase()) ||
                  p.sport.toLowerCase().includes(query.toLowerCase())
                );
                setFilteredPlayers(filtered);
              }}
              searchHistory={searchHistory}
              style={styles.modalSearchBar}
            />
            
            <FlatList
              data={filteredPlayers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.searchResult}
                  onPress={() => {
                    addToParlay(item);
                    setSearchModalVisible(false);
                  }}
                >
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultInfo}>
                      {item.team} • {item.sport} • {item.category}
                    </Text>
                    <View style={styles.searchResultStats}>
                      <Text style={styles.searchResultStat}>{item.confidence}% confidence</Text>
                      <Text style={styles.searchResultStat}>{item.edge} edge</Text>
                    </View>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#f59e0b" />
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>

        {renderGeneratingModal()}
        <ParlayAnalyticsBox />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  
  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerOverlay: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerSearchButton: {
    padding: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIcon: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    padding: 15,
    borderRadius: 25,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
    fontWeight: '500',
  },

  // Legs Selector
  legsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#1e293b',
    marginBottom: 15,
  },
  legsLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
    marginRight: 15,
  },
  legButton: {
    marginHorizontal: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  legButtonActive: {
    borderRadius: 8,
  },
  legButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legButtonText: {
    fontSize: 14,
    color: '#94a3b8',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  legButtonTextActive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  autoBalanceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  autoBalanceText: {
    fontSize: 12,
    color: '#cbd5e1',
    marginRight: 8,
  },
  toggleButton: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#334155',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#f59e0b',
  },
  toggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },

  // Parlay Section
  parlaySection: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 5,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyParlay: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 5,
    textAlign: 'center',
  },

  // Parlay Leg Card
  parlayLegCard: {
    backgroundColor: '#0f172a',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 250,
    borderWidth: 1,
    borderColor: '#334155',
  },
  legHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  legNumber: {
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  legNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sportText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  legName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 5,
  },
  legPick: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
  },
  legMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    marginHorizontal: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  oddsText: {
    color: '#10b981',
  },
  edgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  edgeText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 2,
  },
  legAnalysis: {
    fontSize: 12,
    color: '#cbd5e1',
    fontStyle: 'italic',
  },
  parlayList: {
    paddingBottom: 10,
  },

  // Parlay Summary
  parlaySummary: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  parlayActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  optimizeButton: {
    backgroundColor: '#3b82f6',
  },
  analyzeButton: {
    backgroundColor: '#10b981',
  },
  optimizeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Generate Section
  generateSection: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  generateHeader: {
    marginBottom: 20,
  },
  generateTitleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  generateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  generateSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
    textAlign: 'center',
  },
  promptsScroll: {
    marginVertical: 15,
  },
  promptChip: {
    marginRight: 15,
    borderRadius: 20,
  },
  promptChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  promptChipDisabled: {
    opacity: 0.6,
  },
  promptChipText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },

  // Sport Selector
  sportSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 10,
  },
  sportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  sportButtonActive: {
    backgroundColor: 'transparent',
  },
  sportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  sportButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginLeft: 6,
  },
  sportButtonTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 6,
  },

  // Picks Section
  picksSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  emptyPicks: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1e293b',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#334155',
  },

  // Player Card
  playerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 200,
    borderWidth: 1,
    borderColor: '#334155',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  playerTeam: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  playerCategory: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  playerPick: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
  },
  playerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceBadge: {
    backgroundColor: '#3b82f620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceBadgeText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  edgeBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  edgeTextSmall: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
  },
  picksList: {
    paddingBottom: 10,
  },

  // Tips Section
  tipsSection: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#cbd5e1',
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  },

  // Generating Modal
  generatingModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  generatingContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  generatingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    textAlign: 'center',
  },
  generatingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  generatingButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  generatingButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Search Modal
  searchModal: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalBackButton: {
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalSearchBar: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  searchResultInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  searchResultStats: {
    flexDirection: 'row',
  },
  searchResultStat: {
    fontSize: 12,
    color: '#10b981',
    marginRight: 12,
  },
});
