// src/screens/SecretPhraseScreen.js - ENHANCED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AIPromptGenerator from '../components/AIPromptGenerator';
import { useAnalytics } from '../hooks/useAnalytics';
import { logScreenView } from '../services/firebase';

const { width } = Dimensions.get('window');

export default function SecretPhraseScreen({ navigation }) {
  const [realTimeData, setRealTimeData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [analyticsStats, setAnalyticsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDefinitions, setShowDefinitions] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [selectedSport, setSelectedSport] = useState('NBA');
  const [activeTab, setActiveTab] = useState('definitions');
  const [fadeAnim] = useState(new Animated.Value(0));
  const { logEvent } = useAnalytics();

  const [playerData, setPlayerData] = useState({
    NBA: {
      name: 'LeBron James',
      team: 'LAL',
      position: 'SF',
      points: 28.5,
      rebounds: 8.2,
      assists: 8.8,
      gamesPlayed: 45
    },
    NFL: {
      name: 'Patrick Mahomes',
      team: 'KC',
      position: 'QB',
      passingYards: 4567,
      touchdowns: 38,
      interceptions: 12,
      gamesPlayed: 16
    },
    NHL: {
      name: 'Connor McDavid',
      team: 'EDM',
      position: 'C',
      goals: 45,
      assists: 68,
      points: 113,
      gamesPlayed: 67
    },
    MLB: {
      name: 'Shohei Ohtani',
      team: 'LAD',
      position: 'DH/SP',
      battingAvg: 0.304,
      homeRuns: 44,
      rbi: 95,
      era: 3.18
    }
  });

  // Extended Secret Phrase Definitions
  const SECRET_PHRASE_DEFINITIONS = [
    // Advanced Analytics & Models
    {
      id: 'advanced_1',
      category: 'Advanced Analytics & Models',
      title: 'Predictive Clustering',
      description: 'Uses unsupervised learning to cluster similar game scenarios and predict outcomes',
      rarity: 'Legendary',
      requiresPremium: true,
      sport: 'All',
      icon: 'analytics'
    },
    {
      id: 'advanced_2',
      category: 'Advanced Analytics & Models',
      title: 'Bayesian Inference',
      description: 'Continuously updates probabilities with new information using Bayesian methods',
      rarity: 'Legendary',
      requiresPremium: true,
      sport: 'All',
      icon: 'trending-up'
    },
    {
      id: 'advanced_3',
      category: 'Advanced Analytics & Models',
      title: 'Gradient Boosted Models',
      description: 'Ensemble machine learning model that combines multiple weak predictors',
      rarity: 'Legendary',
      requiresPremium: true,
      sport: 'All',
      icon: 'bar-chart'
    },
    {
      id: 'advanced_4',
      category: 'Advanced Analytics & Models',
      title: 'Neural Network Ensemble',
      description: 'Combines multiple neural networks for higher accuracy predictions',
      rarity: 'Legendary',
      requiresPremium: true,
      sport: 'All',
      icon: 'git-network'
    },
    {
      id: 'advanced_5',
      category: 'Advanced Analytics & Models',
      title: 'Feature Importance',
      description: 'Identifies which statistics have highest predictive power for specific bets',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'All',
      icon: 'pulse'
    },
    
    // Advanced Injury Analytics
    {
      id: 'injury_1',
      category: 'Advanced Injury Analytics',
      title: 'Injury Cascades',
      description: 'Predicts secondary injury impacts (player B gets more minutes, then fatigues and gets injured)',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'All',
      icon: 'medical'
    },
    {
      id: 'injury_2',
      category: 'Advanced Injury Analytics',
      title: 'Recovery Timelines',
      description: 'Uses historical data to predict exact return dates from specific injuries',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'All',
      icon: 'calendar'
    },
    {
      id: 'injury_3',
      category: 'Advanced Injury Analytics',
      title: 'Injury Propensity',
      description: 'Identifies players at high risk for future injuries based on workload and biomechanics',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'All',
      icon: 'warning'
    },
    {
      id: 'injury_4',
      category: 'Advanced Injury Analytics',
      title: 'Load Management Value',
      description: 'Finds value in games where stars are rested for load management',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NBA, NHL',
      icon: 'body'
    },
    {
      id: 'injury_5',
      category: 'Advanced Injury Analytics',
      title: 'Concussion Protocol Edge',
      description: 'Tracks teams/players with different concussion management approaches',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NFL, NHL',
      icon: 'shield-checkmark'
    },
    
    // NHL-Specific Analytics
    {
      id: 'nhl_1',
      category: 'NHL-Specific Analytics',
      title: 'Goalie Fatigue',
      description: 'Tracks goalie workload and performance degradation with consecutive starts',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NHL',
      icon: 'ice-cream'
    },
    {
      id: 'nhl_2',
      category: 'NHL-Specific Analytics',
      title: 'Special Teams Regression',
      description: 'Identifies power play/penalty kill units due for positive/negative regression',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NHL',
      icon: 'refresh-circle'
    },
    {
      id: 'nhl_3',
      category: 'NHL-Specific Analytics',
      title: 'Shot Quality Analytics',
      description: 'Uses expected goals (xG) models to find value in puck line/total markets',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NHL',
      icon: 'target'
    },
    {
      id: 'nhl_4',
      category: 'NHL-Specific Analytics',
      title: 'Back-to-Back Travel',
      description: 'Analyzes NHL team performance with different back-to-back travel scenarios',
      rarity: 'Common',
      requiresPremium: false,
      sport: 'NHL',
      icon: 'airplane'
    },
    {
      id: 'nhl_5',
      category: 'NHL-Specific Analytics',
      title: 'Defensive Pairing Matchups',
      description: 'Tracks how specific defensive pairings perform against opponent lines',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NHL',
      icon: 'people'
    },
    {
      id: 'nhl_6',
      category: 'NHL-Specific Analytics',
      title: 'Faceoff Leverage',
      description: 'Identifies critical faceoff situations and specialists who excel in them',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NHL',
      icon: 'hand-left'
    },
    {
      id: 'nhl_7',
      category: 'NHL-Specific Analytics',
      title: 'Post-Goal Momentum',
      description: 'Tracks team performance in the 5 minutes after scoring/conceding',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NHL',
      icon: 'flash'
    },
    {
      id: 'nhl_8',
      category: 'NHL-Specific Analytics',
      title: 'Empty Net Strategies',
      description: 'Analyzes coach tendencies and success rates with empty net situations',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NHL',
      icon: 'networking'
    },
    {
      id: 'nhl_9',
      category: 'NHL-Specific Analytics',
      title: 'Line Matching',
      description: 'Identifies which coaches aggressively match lines and the betting implications',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NHL',
      icon: 'git-compare'
    },
    {
      id: 'nhl_10',
      category: 'NHL-Specific Analytics',
      title: 'Goalie Pull Timing',
      description: 'Analyzes optimal goalie pull times by team/coach and success rates',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NHL',
      icon: 'time'
    },

    // Additional Secret Phrases - Advanced Analytics
    {
      id: 'advanced_6',
      category: 'Advanced Analytics & Models',
      title: 'Monte Carlo Simulation',
      description: 'Uses random sampling to simulate thousands of game outcomes for probability analysis',
      rarity: 'Legendary',
      requiresPremium: true,
      sport: 'All',
      icon: 'calculator'
    },
    {
      id: 'advanced_7',
      category: 'Advanced Analytics & Models',
      title: 'Time Series Analysis',
      description: 'Analyzes sequential data points to identify patterns and predict future performance',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'All',
      icon: 'time'
    },
    {
      id: 'advanced_8',
      category: 'Advanced Analytics & Models',
      title: 'Cluster Analysis',
      description: 'Groups similar teams/players based on statistical profiles for matchup analysis',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'All',
      icon: 'grid'
    },
    {
      id: 'advanced_9',
      category: 'Advanced Analytics & Models',
      title: 'Regression Analysis',
      description: 'Identifies relationships between variables to predict future outcomes',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'All',
      icon: 'trending-up'
    },

    // Additional Injury Analytics
    {
      id: 'injury_6',
      category: 'Advanced Injury Analytics',
      title: 'Fatigue Index',
      description: 'Calculates player fatigue levels based on minutes played, travel, and schedule density',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NBA, NFL, NHL',
      icon: 'fitness'
    },
    {
      id: 'injury_7',
      category: 'Advanced Injury Analytics',
      title: 'Biomechanical Analysis',
      description: 'Analyzes player movement patterns to identify injury risk factors',
      rarity: 'Legendary',
      requiresPremium: true,
      sport: 'All',
      icon: 'body'
    },
    {
      id: 'injury_8',
      category: 'Advanced Injury Analytics',
      title: 'Injury History Correlation',
      description: 'Identifies patterns between past injuries and future performance',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'All',
      icon: 'clipboard'
    },

    // Game Situation Analytics
    {
      id: 'game_1',
      category: 'Game Situation Analytics',
      title: 'Momentum Tracking',
      description: 'Real-time analysis of game momentum shifts and their betting implications',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'All',
      icon: 'flash'
    },
    {
      id: 'game_2',
      category: 'Game Situation Analytics',
      title: 'Coach Decision Analysis',
      description: 'Analyzes coaching tendencies in specific game situations',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NBA, NFL, NHL',
      icon: 'person'
    },
    {
      id: 'game_3',
      category: 'Game Situation Analytics',
      title: 'Timeout Efficiency',
      description: 'Measures team performance before and after timeouts',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NBA, NFL',
      icon: 'timer'
    },

    // Player-Specific Analytics
    {
      id: 'player_1',
      category: 'Player-Specific Analytics',
      title: 'Usage Rate Analysis',
      description: 'Analyzes how much a team relies on specific players in critical situations',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NBA, NFL',
      icon: 'person'
    },
    {
      id: 'player_2',
      category: 'Player-Specific Analytics',
      title: 'Clutch Performance',
      description: 'Evaluates player performance in high-pressure, late-game situations',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'All',
      icon: 'trophy'
    },
    {
      id: 'player_3',
      category: 'Player-Specific Analytics',
      title: 'Matchup Analysis',
      description: 'Analyzes individual player performance against specific opponents',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'All',
      icon: 'git-compare'
    },

    // Market & Betting Analytics
    {
      id: 'market_1',
      category: 'Market & Betting Analytics',
      title: 'Line Movement Analysis',
      description: 'Tracks betting line movements and identifies value opportunities',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'All',
      icon: 'trending-up'
    },
    {
      id: 'market_2',
      category: 'Market & Betting Analytics',
      title: 'Public Money Tracking',
      description: 'Monitors where public money is flowing vs. sharp money',
      rarity: 'Legendary',
      requiresPremium: true,
      sport: 'All',
      icon: 'cash'
    },
    {
      id: 'market_3',
      category: 'Market & Betting Analytics',
      title: 'Odds Comparison',
      description: 'Compares odds across multiple sportsbooks to find best value',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'All',
      icon: 'swap-horizontal'
    },

    // NFL-Specific Analytics
    {
      id: 'nfl_1',
      category: 'NFL-Specific Analytics',
      title: 'Red Zone Efficiency',
      description: 'Analyzes team performance inside the 20-yard line',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NFL',
      icon: 'flag'
    },
    {
      id: 'nfl_2',
      category: 'NFL-Specific Analytics',
      title: 'Third Down Conversion',
      description: 'Tracks team efficiency on third down situations',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NFL',
      icon: 'repeat'
    },
    {
      id: 'nfl_3',
      category: 'NFL-Specific Analytics',
      title: 'Blitz Analysis',
      description: 'Analyzes quarterback performance against different blitz packages',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NFL',
      icon: 'shield'
    },

    // NBA-Specific Analytics
    {
      id: 'nba_1',
      category: 'NBA-Specific Analytics',
      title: 'Pace Analysis',
      description: 'Measures team tempo and its impact on scoring',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'NBA',
      icon: 'speedometer'
    },
    {
      id: 'nba_2',
      category: 'NBA-Specific Analytics',
      title: 'Three-Point Variance',
      description: 'Analyzes shooting variance from beyond the arc',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NBA',
      icon: 'location'
    },
    {
      id: 'nba_3',
      category: 'NBA-Specific Analytics',
      title: 'Pick and Roll Efficiency',
      description: 'Evaluates team performance in pick and roll situations',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'NBA',
      icon: 'swap-vertical'
    },

    // MLB-Specific Analytics
    {
      id: 'mlb_1',
      category: 'MLB-Specific Analytics',
      title: 'Pitch Sequencing',
      description: 'Analyzes pitcher tendencies in specific counts',
      rarity: 'Rare',
      requiresPremium: true,
      sport: 'MLB',
      icon: 'baseball'
    },
    {
      id: 'mlb_2',
      category: 'MLB-Specific Analytics',
      title: 'Bullpen Usage',
      description: 'Tracks reliever workloads and optimal usage patterns',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'MLB',
      icon: 'people'
    },
    {
      id: 'mlb_3',
      category: 'MLB-Specific Analytics',
      title: 'Batter vs. Pitcher History',
      description: 'Analyzes historical matchups between specific hitters and pitchers',
      rarity: 'Uncommon',
      requiresPremium: false,
      sport: 'MLB',
      icon: 'git-compare'
    }
  ];

  // AI Prompt Examples
  const AI_PROMPT_EXAMPLES = {
    NBA: [
      "Generate injury risk assessment for LeBron James given his minutes load",
      "Analyze Warriors vs Lakers matchup using predictive clustering",
      "Create a parlay based on player usage rates in clutch situations",
      "Predict tomorrow's NBA scores using Bayesian inference",
      "Analyze three-point shooting variance for all teams this season"
    ],
    NFL: [
      "Evaluate Patrick Mahomes performance against blitz packages",
      "Analyze red zone efficiency for all NFL teams",
      "Predict Sunday's NFL scores using neural networks",
      "Generate injury propensity report for running backs",
      "Analyze third down conversion rates by team"
    ],
    NHL: [
      "Assess goalie fatigue for teams playing back-to-back",
      "Analyze shot quality metrics for all NHL matchups",
      "Predict tonight's NHL scores using gradient boosted models",
      "Evaluate special teams regression for power play units",
      "Analyze faceoff leverage in critical game situations"
    ],
    MLB: [
      "Analyze pitch sequencing for starting pitchers tonight",
      "Evaluate bullpen usage patterns for playoff teams",
      "Predict MLB game totals using Monte Carlo simulation",
      "Generate batting analysis using biomechanical data",
      "Analyze batter vs pitcher historical matchups"
    ]
  };

  const categories = ['all', ...new Set(SECRET_PHRASE_DEFINITIONS.map(d => d.category))];
  const sports = ['NBA', 'NFL', 'NHL', 'MLB'];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const simulateConnection = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    const mockAnalyticsData = {
      todaysStats: {
        todaysEvents: 42,
        todaysUnits: 18.5,
        accuracyRate: '72.4%'
      },
      categoryDistribution: [
        { _id: 'Advanced Analytics & Models', count: 12, avgConfidence: 84.5 },
        { _id: 'Advanced Injury Analytics', count: 8, avgConfidence: 78.2 },
        { _id: 'Game Situation Analytics', count: 7, avgConfidence: 71.9 },
        { _id: 'Player-Specific Analytics', count: 6, avgConfidence: 76.4 },
        { _id: 'Market & Betting Analytics', count: 5, avgConfidence: 88.3 }
      ],
      recentEvents: [
        {
          id: 1,
          timestamp: new Date(),
          phraseCategory: 'Advanced Analytics & Models',
          phraseKey: 'Neural Network Ensemble',
          inputText: 'Predict Warriors vs Lakers outcome',
          rarity: 'legendary',
          sport: 'NBA',
          outcome: 'win',
          unitsWon: 3.5
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 3600000),
          phraseCategory: 'Advanced Injury Analytics',
          phraseKey: 'Injury Propensity',
          inputText: 'LeBron James fatigue analysis',
          rarity: 'rare',
          sport: 'NBA',
          outcome: 'pending',
          unitsWon: null
        }
      ]
    };

    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        setAnalyticsStats(mockAnalyticsData);
        setRealTimeData(mockAnalyticsData.recentEvents || []);
        setLoading(false);
      }, 1500);
    };

    fetchData();
    
    logScreenView('SecretPhraseScreen', {
      category: selectedCategory,
      tab: activeTab,
    });

    return () => {
      clearTimeout(simulateConnection);
    };
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      'Advanced Analytics & Models': '#6366F1',
      'Advanced Injury Analytics': '#EF4444',
      'NHL-Specific Analytics': '#3B82F6',
      'Game Situation Analytics': '#8B5CF6',
      'Player-Specific Analytics': '#10B981',
      'Market & Betting Analytics': '#F59E0B',
      'NFL-Specific Analytics': '#DC2626',
      'NBA-Specific Analytics': '#EA580C',
      'MLB-Specific Analytics': '#16A34A',
    };
    return colors[category] || '#6B7280';
  };

  const getSportColor = (sport) => {
    const colors = {
      'NBA': '#EA580C',
      'NFL': '#DC2626',
      'NHL': '#3B82F6',
      'MLB': '#16A34A',
    };
    return colors[sport] || '#6B7280';
  };

  const filteredDefinitions = SECRET_PHRASE_DEFINITIONS.filter(definition => {
    const matchesSearch = searchQuery === '' || 
      definition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      definition.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      definition.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      definition.sport.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      definition.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderDefinitionItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.definitionCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <TouchableOpacity 
        onPress={() => {
          if (item.requiresPremium) {
            setSelectedDefinition(item);
            setShowPremiumModal(true);
          } else {
            logEvent('secret_phrase_definition_selected', {
              definition: item.title,
              category: item.category,
              sport: item.sport,
            });
          }
        }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.definitionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.definitionHeader}>
            <View style={styles.definitionIconContainer}>
              <Ionicons name={item.icon || 'analytics'} size={24} color={getCategoryColor(item.category)} />
            </View>
            <View style={styles.definitionTitleContainer}>
              <Text style={styles.definitionTitle}>{item.title}</Text>
              <View style={styles.definitionCategoryBadge}>
                <Text style={[styles.definitionCategoryText, { color: getCategoryColor(item.category) }]}>
                  {item.category}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.definitionDescription}>{item.description}</Text>
          
          <View style={styles.definitionFooter}>
            <View style={styles.sportContainer}>
              <Ionicons 
                name={item.sport.includes('NBA') ? 'basketball' : 
                      item.sport.includes('NFL') ? 'american-football' :
                      item.sport.includes('NHL') ? 'ice-cream' :
                      item.sport.includes('MLB') ? 'baseball' : 'football'} 
                size={14} 
                color={getSportColor(item.sport.split(',')[0].trim())} 
              />
              <Text style={[styles.sportText, { color: getSportColor(item.sport.split(',')[0].trim()) }]}>
                {item.sport}
              </Text>
            </View>
            
            <View style={styles.rarityContainer}>
              <View style={[styles.rarityBadge, { 
                backgroundColor: item.rarity === 'Legendary' ? '#8B5CF6' :
                                item.rarity === 'Rare' ? '#3B82F6' :
                                item.rarity === 'Uncommon' ? '#10B981' : '#9CA3AF'
              }]}>
                <Text style={styles.rarityText}>{item.rarity}</Text>
              </View>
              
              {item.requiresPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={12} color="#F59E0B" />
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPromptExample = (prompt, index) => (
    <TouchableOpacity 
      key={index}
      style={styles.promptExampleCard}
      onPress={() => {
        logEvent('ai_prompt_example_selected', {
          prompt: prompt,
          sport: selectedSport,
        });
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="sparkles" size={16} color="#8B5CF6" />
      <Text style={styles.promptExampleText}>{prompt}</Text>
      <Ionicons name="arrow-forward-circle" size={20} color="#8B5CF6" />
    </TouchableOpacity>
  );

  const PremiumModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPremiumModal}
      onRequestClose={() => setShowPremiumModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0]
                })
              }]
            }
          ]}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1', '#4F46E5']}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.modalIconContainer}>
              <Ionicons name="diamond" size={48} color="white" />
            </View>
            <Text style={styles.modalTitle}>Premium Analytics Unlocked</Text>
            <Text style={styles.modalSubtitle}>Access Advanced Predictive Models</Text>
          </LinearGradient>
          
          <View style={styles.modalBody}>
            {selectedDefinition && (
              <>
                <View style={styles.modalFeatureHeader}>
                  <View style={[styles.modalFeatureIcon, { backgroundColor: getCategoryColor(selectedDefinition.category) }]}>
                    <Ionicons name={selectedDefinition.icon} size={24} color="white" />
                  </View>
                  <View style={styles.modalFeatureTitleContainer}>
                    <Text style={styles.modalFeatureTitle}>{selectedDefinition.title}</Text>
                    <Text style={styles.modalFeatureCategory}>{selectedDefinition.category}</Text>
                  </View>
                </View>
                
                <Text style={styles.modalFeatureDescription}>{selectedDefinition.description}</Text>
                
                <View style={styles.premiumStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>92%</Text>
                    <Text style={styles.statLabel}>Accuracy Rate</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>3.5x</Text>
                    <Text style={styles.statLabel}>ROI Improvement</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>24/7</Text>
                    <Text style={styles.statLabel}>Real-time Updates</Text>
                  </View>
                </View>
              </>
            )}
            
            <View style={styles.pricingSection}>
              <TouchableOpacity 
                style={styles.premiumPlan}
                onPress={() => {
                  logEvent('premium_upgrade_selected', {
                    plan: 'monthly',
                    feature: selectedDefinition?.title,
                  });
                  setShowPremiumModal(false);
                }}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>Monthly Plan</Text>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>POPULAR</Text>
                  </View>
                </View>
                <Text style={styles.planPrice}>$29.99<Text style={styles.planPeriod}>/month</Text></Text>
                <Text style={styles.planDescription}>Full access to all premium analytics</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.premiumPlan}
                onPress={() => {
                  logEvent('premium_upgrade_selected', {
                    plan: 'yearly',
                    feature: selectedDefinition?.title,
                  });
                  setShowPremiumModal(false);
                }}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>Annual Plan</Text>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>SAVE 40%</Text>
                  </View>
                </View>
                <Text style={styles.planPrice}>$239.99<Text style={styles.planPeriod}>/year</Text></Text>
                <Text style={styles.planDescription}>Best value - All premium features</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowPremiumModal(false)}
            >
              <Text style={styles.cancelButtonText}>Continue with Free Version</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading Advanced Analytics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={['#1e1b4b', '#312e81', '#4f46e5']}
          style={styles.heroHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.heroTitle}>Secret Phrase Analytics</Text>
                <View style={styles.connectionRow}>
                  <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
                  <Text style={styles.connectionText}>
                    {isConnected ? 'AI Models Active • Live Data' : 'Connection Offline'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.premiumButton}
                onPress={() => setShowPremiumModal(true)}
              >
                <Ionicons name="diamond" size={20} color="#F59E0B" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.heroSubtitle}>
              Advanced AI-powered analytics and predictive models for professional sports betting insights
            </Text>
            
            <View style={styles.statsContainer}>
              {analyticsStats && (
                <>
                  <View style={styles.statCard}>
                    <Ionicons name="flash" size={24} color="#F59E0B" />
                    <Text style={styles.statValueLarge}>{analyticsStats.todaysStats?.todaysEvents || 0}</Text>
                    <Text style={styles.statLabel}>Today's Events</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="trending-up" size={24} color="#10B981" />
                    <Text style={styles.statValueLarge}>+{analyticsStats.todaysStats?.todaysUnits || 0}u</Text>
                    <Text style={styles.statLabel}>Units Gained</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="stats-chart" size={24} color="#8B5CF6" />
                    <Text style={styles.statValueLarge}>{analyticsStats.todaysStats?.accuracyRate || '72.4%'}</Text>
                    <Text style={styles.statLabel}>Accuracy Rate</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Main Navigation Tabs */}
        <View style={styles.mainTabs}>
          <TouchableOpacity 
            style={[styles.mainTab, activeTab === 'definitions' && styles.activeMainTab]}
            onPress={() => setActiveTab('definitions')}
          >
            <Ionicons 
              name="book" 
              size={20} 
              color={activeTab === 'definitions' ? '#6366F1' : '#6B7280'} 
            />
            <Text style={[styles.mainTabText, activeTab === 'definitions' && styles.activeMainTabText]}>
              Definitions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mainTab, activeTab === 'generator' && styles.activeMainTab]}
            onPress={() => setActiveTab('generator')}
          >
            <Ionicons 
              name="sparkles" 
              size={20} 
              color={activeTab === 'generator' ? '#6366F1' : '#6B7280'} 
            />
            <Text style={[styles.mainTabText, activeTab === 'generator' && styles.activeMainTabText]}>
              AI Generator
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mainTab, activeTab === 'activity' && styles.activeMainTab]}
            onPress={() => setActiveTab('activity')}
          >
            <Ionicons 
              name="time" 
              size={20} 
              color={activeTab === 'activity' ? '#6366F1' : '#6B7280'} 
            />
            <Text style={[styles.mainTabText, activeTab === 'activity' && styles.activeMainTabText]}>
              Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Definitions Tab Content */}
        {activeTab === 'definitions' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8B5CF6" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search analytics definitions..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat && styles.categoryButtonActive,
                    cat !== 'all' && { borderColor: getCategoryColor(cat) }
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === cat && styles.categoryButtonTextActive,
                    cat !== 'all' && selectedCategory === cat && { color: getCategoryColor(cat) }
                  ]}>
                    {cat === 'all' ? 'All Categories' : cat.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Definitions Grid */}
            <View style={styles.definitionsGrid}>
              <Text style={styles.sectionTitle}>
                {filteredDefinitions.length} Advanced Analytics Models
              </Text>
              
              <FlatList
                data={filteredDefinitions}
                renderItem={renderDefinitionItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                numColumns={1}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No definitions match your search</Text>
                  </View>
                }
              />
            </View>
          </Animated.View>
        )}

        {/* AI Generator Tab Content */}
        {activeTab === 'generator' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.generatorContainer}>
              <View style={styles.generatorHeader}>
                <Ionicons name="sparkles" size={28} color="#8B5CF6" />
                <Text style={styles.generatorTitle}>AI Analytics Generator</Text>
              </View>
              
              <Text style={styles.generatorSubtitle}>
                Generate advanced analytics insights using AI-powered models. Select a sport and enter your query.
              </Text>

              {/* Sport Selection */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.sportSelection}
                contentContainerStyle={styles.sportSelectionContent}
              >
                {sports.map(sport => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.sportButton,
                      selectedSport === sport && { backgroundColor: getSportColor(sport) }
                    ]}
                    onPress={() => setSelectedSport(sport)}
                  >
                    <Ionicons 
                      name={sport === 'NBA' ? 'basketball' : 
                            sport === 'NFL' ? 'american-football' :
                            sport === 'NHL' ? 'ice-cream' : 'baseball'} 
                      size={20} 
                      color={selectedSport === sport ? 'white' : getSportColor(sport)} 
                    />
                    <Text style={[
                      styles.sportButtonText,
                      selectedSport === sport && styles.sportButtonTextActive
                    ]}>
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* AI Prompt Generator */}
              <View style={styles.promptGeneratorContainer}>
                <AIPromptGenerator 
                  playerData={playerData[selectedSport]}
                  sport={selectedSport}
                  style={styles.promptGenerator}
                />
              </View>

              {/* Example Prompts */}
              <View style={styles.examplesContainer}>
                <View style={styles.examplesHeader}>
                  <Ionicons name="bulb" size={20} color="#F59E0B" />
                  <Text style={styles.examplesTitle}>Example AI Prompts</Text>
                </View>
                
                <Text style={styles.examplesSubtitle}>
                  Try these prompts to generate advanced analytics:
                </Text>
                
                <View style={styles.examplesGrid}>
                  {AI_PROMPT_EXAMPLES[selectedSport]?.slice(0, 4).map((prompt, index) => (
                    renderPromptExample(prompt, index)
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Activity Tab Content */}
        {activeTab === 'activity' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={styles.activityContainer}>
              <View style={styles.activityHeader}>
                <Ionicons name="time" size={28} color="#10B981" />
                <Text style={styles.activityTitle}>Recent Analytics Activity</Text>
              </View>
              
              <Text style={styles.activitySubtitle}>
                Track your recent secret phrase usage and analytics insights.
              </Text>
              
              <FlatList
                data={realTimeData}
                renderItem={({ item }) => (
                  <View style={styles.activityCard}>
                    <View style={styles.activityCardHeader}>
                      <View style={[styles.activityCategoryBadge, { backgroundColor: getCategoryColor(item.phraseCategory) }]}>
                        <Text style={styles.activityCategoryText}>{item.phraseCategory}</Text>
                      </View>
                      <Text style={styles.activityTime}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    
                    <Text style={styles.activityPhrase}>{item.phraseKey}</Text>
                    
                    <View style={styles.activityCardFooter}>
                      <View style={styles.activitySport}>
                        <Ionicons 
                          name={item.sport === 'NBA' ? 'basketball' : 
                                item.sport === 'NFL' ? 'american-football' :
                                item.sport === 'NHL' ? 'ice-cream' : 'baseball'} 
                          size={14} 
                          color={getSportColor(item.sport)} 
                        />
                        <Text style={[styles.activitySportText, { color: getSportColor(item.sport) }]}>
                          {item.sport}
                        </Text>
                      </View>
                      
                      <View style={[
                        styles.activityOutcome,
                        { backgroundColor: item.outcome === 'win' ? '#10B981' : item.outcome === 'loss' ? '#EF4444' : '#F59E0B' }
                      ]}>
                        <Text style={styles.activityOutcomeText}>
                          {item.outcome?.toUpperCase() || 'PENDING'}
                          {item.unitsWon && item.outcome === 'win' && ` +${item.unitsWon}u`}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No recent activity recorded</Text>
                  </View>
                }
              />
            </View>
          </Animated.View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={24} color="#6366F1" />
          <View style={styles.footerContent}>
            <Text style={styles.footerTitle}>Enterprise-Grade Analytics</Text>
            <Text style={styles.footerText}>
              Powered by proprietary AI models, real-time data feeds, and advanced statistical analysis.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <PremiumModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Hero Header
  heroHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  premiumButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 15,
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValueLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  // Main Tabs
  mainTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 15,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  activeMainTab: {
    backgroundColor: '#EEF2FF',
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  activeMainTabText: {
    color: '#6366F1',
  },
  
  // Tab Content
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
    fontFamily: 'System',
  },
  
  // Category Filter
  categoryScroll: {
    marginBottom: 20,
  },
  categoryScrollContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryButtonTextActive: {
    color: '#6366F1',
  },
  
  // Definitions
  definitionsGrid: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  definitionCard: {
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  definitionGradient: {
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  definitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  definitionIconContainer: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 12,
    marginRight: 15,
  },
  definitionTitleContainer: {
    flex: 1,
  },
  definitionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  definitionCategoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  definitionCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  definitionDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 15,
  },
  definitionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
  },
  rarityText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  premiumText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '700',
    marginLeft: 4,
  },
  
  // AI Generator
  generatorContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  generatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  generatorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 10,
  },
  generatorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  sportSelection: {
    marginBottom: 20,
  },
  sportSelectionContent: {
    paddingRight: 20,
  },
  sportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 8,
  },
  sportButtonTextActive: {
    color: 'white',
  },
  promptGeneratorContainer: {
    marginBottom: 25,
  },
  promptGenerator: {
    flex: 1,
  },
  examplesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  examplesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 10,
  },
  examplesSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 15,
    lineHeight: 18,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  promptExampleCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  promptExampleText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginHorizontal: 12,
    lineHeight: 18,
  },
  
  // Activity
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 10,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activityCategoryText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activityPhrase: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  activityCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activitySport: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activitySportText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  activityOutcome: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activityOutcomeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  
  // Empty States
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  footerContent: {
    flex: 1,
    marginLeft: 15,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  modalHeader: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  modalBody: {
    padding: 30,
  },
  modalFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalFeatureIcon: {
    padding: 12,
    borderRadius: 12,
    marginRight: 15,
  },
  modalFeatureTitleContainer: {
    flex: 1,
  },
  modalFeatureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalFeatureCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalFeatureDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 25,
  },
  premiumStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  pricingSection: {
    marginBottom: 20,
  },
  premiumPlan: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  planBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 5,
  },
  planPeriod: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: 'normal',
  },
  planDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});
