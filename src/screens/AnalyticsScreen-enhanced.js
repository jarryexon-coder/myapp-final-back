import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedProgress from 'react-native-animated-progress';
import analytics from '@react-native-firebase/analytics';
import { useSportsData } from "../hooks/useSportsData";
import ErrorBoundary from '../components/ErrorBoundary';
import { safeSlice } from '../utils/arrayHelpers';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('NBA');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [dateRange, setDateRange] = useState('Season');
  const [showPredictions, setShowPredictions] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareTeam1, setCompareTeam1] = useState(null);
  const [compareTeam2, setCompareTeam2] = useState(null);
  
  // Use sports data hook with auto-refresh
  const { 
    data: { nba, nfl, nhl, news },
    isLoading: isSportsDataLoading,
    refreshAllData: refreshSportsData
  } = useSportsData({
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Transform sports data from hook to match component structure
  const [sportsData, setSportsData] = useState({
    NBA: {
      overview: {
        totalGames: 1230,
        avgPoints: 112.4,
        homeWinRate: '58.2%',
        avgMargin: 11.8,
        overUnder: '54% Over',
        keyTrend: 'Points up +3.2% from last season',
      },
      teams: {
        bestOffense: 'Milwaukee Bucks (118.3 PPG)',
        bestDefense: 'Cleveland Cavaliers (106.9 PPG)',
        mostImproved: 'Oklahoma City Thunder (+12 wins)',
        surpriseTeam: 'Orlando Magic',
      },
      players: {
        scoringLeader: 'Luka Dončić (34.6 PPG)',
        efficiencyLeader: 'Nikola Jokić (32.8 PER)',
        clutchPlayer: 'Stephen Curry (58% FG in clutch)',
        risingStar: 'Anthony Edwards',
      },
      trends: [
        { name: '3-Point Attempts', value: 35.2, change: '+4.8%', direction: 'up' },
        { name: 'Free Throw Rate', value: 0.218, change: '-2.1%', direction: 'down' },
        { name: 'Pace', value: 99.3, change: '+1.2%', direction: 'up' },
        { name: 'Turnovers', value: 13.8, change: '-0.8%', direction: 'down' },
      ],
      predictions: [
        { game: 'Lakers vs Warriors', prediction: 'Warriors -4.5', confidence: 72 },
        { game: 'Celtics vs Heat', prediction: 'Over 215.5', confidence: 68 },
        { game: 'Nuggets vs Suns', prediction: 'Nuggets ML', confidence: 81 },
      ],
      advancedStats: {
        pace: 99.3,
        offRating: 114.2,
        defRating: 111.8,
        netRating: 2.4,
        trueShooting: 58.1,
        assistRatio: 62.3,
      },
    },
    NFL: {
      overview: {
        totalGames: 272,
        avgPoints: 43.8,
        homeWinRate: '55.1%',
        avgMargin: 10.2,
        overUnder: '48% Over',
        keyTrend: 'Passing yards up +7.1%',
      },
      teams: {
        bestOffense: 'Miami Dolphins (29.9 PPG)',
        bestDefense: 'Baltimore Ravens (16.1 PPG)',
        mostImproved: 'Houston Texans (+7 wins)',
        surpriseTeam: 'Detroit Lions',
      },
      players: {
        passingLeader: 'Dak Prescott (4,516 yards)',
        rushingLeader: 'Christian McCaffrey (1,459 yards)',
        receivingLeader: 'Tyreek Hill (1,799 yards)',
        defensivePlayer: 'Myles Garrett (14 sacks)',
      },
      trends: [
        { name: 'Pass Attempts', value: 34.8, change: '+3.2%', direction: 'up' },
        { name: 'Run Rate', value: 42.1, change: '-1.8%', direction: 'down' },
        { name: 'Red Zone Efficiency', value: '55.2%', change: '+2.4%', direction: 'up' },
        { name: 'Turnovers', value: 1.9, change: '-0.3%', direction: 'down' },
      ],
      predictions: [
        { game: 'Chiefs vs Bills', prediction: 'Bills +2.5', confidence: 65 },
        { game: '49ers vs Cowboys', prediction: 'Under 48.5', confidence: 71 },
        { game: 'Eagles vs Seahawks', prediction: 'Eagles -3', confidence: 69 },
      ],
      advancedStats: {
        yardsPerPlay: 5.4,
        thirdDownPct: 40.2,
        redZonePct: 55.8,
        turnoverMargin: 0.3,
        timeOfPossession: 30.2,
        explosivePlayRate: 12.8,
      },
    },
    NHL: {
      overview: {
        totalGames: 1312,
        avgGoals: 6.1,
        homeWinRate: '53.8%',
        avgMargin: 2.4,
        overUnder: '52% Over',
        keyTrend: 'Power play success up +2.8%',
      },
      teams: {
        bestOffense: 'Colorado Avalanche (3.68 GPG)',
        bestDefense: 'Boston Bruins (2.12 GAA)',
        mostImproved: 'New Jersey Devils (+22 points)',
        surpriseTeam: 'Seattle Kraken',
      },
      players: {
        scoringLeader: 'Connor McDavid (153 points)',
        goalLeader: 'Auston Matthews (69 goals)',
        assistLeader: 'Leon Draisaitl (86 assists)',
        goalieLeader: 'Linus Ullmark (.938 SV%)',
      },
      trends: [
        { name: 'Power Play %', value: '22.7%', change: '+2.8%', direction: 'up' },
        { name: 'Penalty Kill %', value: '82.1%', change: '+1.2%', direction: 'up' },
        { name: 'Shots per Game', value: 31.4, change: '+0.8%', direction: 'up' },
        { name: 'Hits per Game', value: 21.8, change: '-1.1%', direction: 'down' },
      ],
      predictions: [
        { game: 'Maple Leafs vs Canadiens', prediction: 'Maple Leafs -1.5', confidence: 75 },
        { game: 'Bruins vs Rangers', prediction: 'Over 6.0', confidence: 63 },
        { game: 'Oilers vs Golden Knights', prediction: 'Oilers ML', confidence: 70 },
      ],
      advancedStats: {
        corsiForPct: 52.1,
        fenwickForPct: 51.8,
        pdo: 100.2,
        expectedGoals: 3.12,
        highDangerChances: 11.4,
        savePercentage: 0.912,
      },
    },
  });

  // Log screen view on mount
  useEffect(() => {
    const logScreenView = async () => {
      try {
        await analytics().logEvent('analytics_screen_view', {
          screen_name: 'AnalyticsScreen',
          selected_sport: selectedSport,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.log('Analytics error:', error);
      }
    };
    
    logScreenView();
  }, []);

  // Update sports data when hook data changes
  useEffect(() => {
    if (nba || nfl || nhl) {
      // Transform and update sports data with real data from hook
      setSportsData(prev => {
        const updated = { ...prev };
        
        if (nba) {
          updated.NBA = {
            ...updated.NBA,
            overview: {
              ...updated.NBA.overview,
              // Use real data from nba.games if available
              totalGames: nba.games ? safeSlice(nba.games, 0, 20).length * 82 : updated.NBA.overview.totalGames,
              avgPoints: nba.stats?.avgPoints || updated.NBA.overview.avgPoints,
            },
            players: {
              scoringLeader: nba.players?.[0]?.name + ' (' + (nba.players?.[0]?.points || '34.6') + ' PPG)' || updated.NBA.players.scoringLeader,
              efficiencyLeader: nba.players?.[1]?.name + ' (' + (nba.players?.[1]?.efficiency || '32.8') + ' PER)' || updated.NBA.players.efficiencyLeader,
              clutchPlayer: updated.NBA.players.clutchPlayer,
              risingStar: updated.NBA.players.risingStar,
            }
          };
        }
        
        if (nfl) {
          updated.NFL = {
            ...updated.NFL,
            overview: {
              ...updated.NFL.overview,
              totalGames: nfl.games ? safeSlice(nfl.games, 0, 10).length * 17 : updated.NFL.overview.totalGames,
            }
          };
        }
        
        if (nhl) {
          updated.NHL = {
            ...updated.NHL,
            overview: {
              ...updated.NHL.overview,
              totalGames: nhl.games ? safeSlice(nhl.games, 0, 15).length * 82 : updated.NHL.overview.totalGames,
            }
          };
        }
        
        return updated;
      });
      setLoading(false);
      setRefreshing(false);
    }
  }, [nba, nfl, nhl]);

  const sports = ['NBA', 'NFL', 'NHL', 'MLB', 'MLS'];
  const metrics = ['overview', 'trends', 'teams', 'players', 'predictions', 'advanced'];
  const teams = [
    'All Teams', 'Golden State Warriors', 'Los Angeles Lakers', 'Boston Celtics', 
    'Miami Heat', 'Denver Nuggets', 'Milwaukee Bucks', 'Philadelphia 76ers'
  ];
  const dateRanges = ['Today', 'Week', 'Month', 'Season', 'Last Season'];

  // Sample data for trends (replacing charts)
  const pointsTrendData = [
    { month: 'Oct', value: 108.2 },
    { month: 'Nov', value: 110.5 },
    { month: 'Dec', value: 112.4 },
    { month: 'Jan', value: 113.8 },
    { month: 'Feb', value: 112.1 },
    { month: 'Mar', value: 111.9 },
  ];

  const teamComparisonData = [
    { category: 'Offense', value: 85 },
    { category: 'Defense', value: 72 },
    { category: 'Rebounding', value: 88 },
    { category: 'Assists', value: 79 },
    { category: 'Shooting', value: 82 },
  ];

  const loadData = async () => {
    try {
      console.log(`📈 Loading ${selectedSport} analytics...`);
      setLoading(true);
      
      // Log sport selection analytics
      try {
        await analytics().logEvent('analytics_sport_selected', {
          sport: selectedSport,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.log('Analytics error:', error);
      }
      
      // Use safeSlice to prevent errors with undefined data
      const topPlayers = safeSlice(nba?.players, 0, 5);
      const recentGames = safeSlice(nba?.games, 0, 10);
      
      console.log(`✅ Loaded analytics for ${selectedSport}`);
      
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.log('Error loading analytics:', error.message);
      
      // Log error analytics
      try {
        await analytics().logEvent('analytics_load_error', {
          sport: selectedSport,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      } catch (analyticsError) {
        console.log('Analytics error logging:', analyticsError);
      }
      
      // Set default data to prevent slice errors
      if (!sportsData[selectedSport]) {
        setSportsData(prev => ({
          ...prev,
          [selectedSport]: {
            overview: { totalGames: 0, avgPoints: 0, homeWinRate: '0%', avgMargin: 0, overUnder: '0% Over', keyTrend: 'No data available' },
            teams: { bestOffense: 'N/A', bestDefense: 'N/A', mostImproved: 'N/A', surpriseTeam: 'N/A' },
            players: { scoringLeader: 'N/A', efficiencyLeader: 'N/A', clutchPlayer: 'N/A', risingStar: 'N/A' },
            trends: [],
            predictions: [],
            advancedStats: { pace: 0, offRating: 0, defRating: 0, netRating: 0, trueShooting: 0, assistRatio: 0 },
          }
        }));
      }
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Log refresh analytics
    try {
      await analytics().logEvent('analytics_refresh', {
        sport: selectedSport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
    
    // Refresh using the hook
    await refreshSportsData();
    
    // Use safeSlice for any data operations
    const currentData = sportsData[selectedSport];
    const trendData = safeSlice(currentData?.trends, 0, 5);
    
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const handleRefresh = async () => {
    try {
      await analytics().logEvent('analytics_manual_refresh', {
        sport: selectedSport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
    
    refreshSportsData();
  };

  const handleSportSelect = async (sport) => {
    const previousSport = selectedSport;
    setSelectedSport(sport);
    setSelectedMetric('overview');
    
    // Log sport change analytics
    try {
      await analytics().logEvent('analytics_sport_changed', {
        previous_sport: previousSport,
        new_sport: sport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
  };

  const handleMetricSelect = async (metric) => {
    setSelectedMetric(metric);
    
    // Log metric tab analytics
    try {
      await analytics().logEvent('analytics_metric_selected', {
        sport: selectedSport,
        metric: metric,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
  };

  const handleFilterOpen = async () => {
    setShowFilters(true);
    
    // Log filter open analytics
    try {
      await analytics().logEvent('analytics_filters_opened', {
        sport: selectedSport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
  };

  const handlePredictionsOpen = async () => {
    setShowPredictions(true);
    
    // Log predictions open analytics
    try {
      await analytics().logEvent('analytics_predictions_opened', {
        sport: selectedSport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#0f766e', '#14b8a6']}
      style={styles.header}
    >
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.title}>Sports Analytics Pro</Text>
          <Text style={styles.subtitle}>Advanced metrics & performance insights</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleFilterOpen}
          >
            <Ionicons name="filter" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handlePredictionsOpen}
          >
            <Ionicons name="trending-up" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sportsScroll}
      >
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.sportButton,
              selectedSport === sport && styles.activeSportButton
            ]}
            onPress={() => handleSportSelect(sport)}
          >
            <Text style={[
              styles.sportText,
              selectedSport === sport && styles.activeSportText
            ]}>
              {sport}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );

  const renderMetricTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.metricsScroll}
    >
      {metrics.map((metric) => (
        <TouchableOpacity
          key={metric}
          style={[
            styles.metricTab,
            selectedMetric === metric && styles.activeMetricTab
          ]}
          onPress={() => handleMetricSelect(metric)}
        >
          <Text style={[
            styles.metricText,
            selectedMetric === metric && styles.activeMetricText
          ]}>
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDataVisualization = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 Data Visualization</Text>
      
      {/* Points Trend (Chart Replacement) */}
      <View style={styles.trendContainer}>
        <Text style={styles.trendTitle}>Points Per Game Trend</Text>
        <View style={styles.trendBarsContainer}>
          {pointsTrendData.map((item, index) => (
            <View key={index} style={styles.trendBarColumn}>
              <View style={styles.trendBarBackground}>
                <View 
                  style={[
                    styles.trendBarFill,
                    { height: `${(item.value / 120) * 100}%`, backgroundColor: '#14b8a6' }
                  ]}
                />
              </View>
              <Text style={styles.trendMonthText}>{item.month}</Text>
              <Text style={styles.trendValueText}>{item.value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.trendLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#14b8a6' }]} />
            <Text style={styles.legendText}>Points Per Game</Text>
          </View>
        </View>
      </View>
      
      {/* Team Comparison (Chart Replacement) */}
      <View style={styles.comparisonContainer}>
        <Text style={styles.trendTitle}>Team Comparison</Text>
        <View style={styles.comparisonBarsContainer}>
          {teamComparisonData.map((item, index) => (
            <View key={index} style={styles.comparisonRow}>
              <Text style={styles.comparisonCategory}>{item.category}</Text>
              <View style={styles.comparisonBarBackground}>
                <View 
                  style={[
                    styles.comparisonBarFill,
                    { width: `${item.value}%`, backgroundColor: '#3b82f6' }
                  ]}
                />
              </View>
              <Text style={styles.comparisonValue}>{item.value}%</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="speedometer" size={24} color="#3b82f6" />
          <Text style={styles.metricValue}>
            {sportsData[selectedSport]?.advancedStats?.pace || 0}
          </Text>
          <Text style={styles.metricLabel}>Pace</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={styles.metricValue}>
            {sportsData[selectedSport]?.advancedStats?.offRating || 0}
          </Text>
          <Text style={styles.metricLabel}>Off Rating</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="shield" size={24} color="#ef4444" />
          <Text style={styles.metricValue}>
            {sportsData[selectedSport]?.advancedStats?.defRating || 0}
          </Text>
          <Text style={styles.metricLabel}>Def Rating</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="pulse" size={24} color="#8b5cf6" />
          <Text style={styles.metricValue}>
            {sportsData[selectedSport]?.advancedStats?.netRating || 0}
          </Text>
          <Text style={styles.metricLabel}>Net Rating</Text>
        </View>
      </View>
    </View>
  );

  const renderComparisonTools = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔄 Comparison Tools</Text>
        <TouchableOpacity 
          style={styles.compareToggle}
          onPress={() => {
            setCompareMode(!compareMode);
            
            // Log compare mode toggle analytics
            analytics().logEvent('analytics_compare_toggle', {
              enabled: !compareMode,
              sport: selectedSport,
            }).catch(console.error);
          }}
        >
          <Ionicons 
            name={compareMode ? "toggle" : "toggle-outline"} 
            size={24} 
            color={compareMode ? "#14b8a6" : "#6b7280"} 
          />
          <Text style={[
            styles.compareToggleText,
            compareMode && styles.compareToggleTextActive
          ]}>
            Compare
          </Text>
        </TouchableOpacity>
      </View>
      
      {compareMode ? (
        <View style={styles.comparisonInterface}>
          <View style={styles.teamSelectors}>
            <TouchableOpacity 
              style={styles.teamSelector}
              onPress={() => {
                setCompareTeam1(compareTeam1 ? null : 'Lakers');
                
                // Log team selection analytics
                if (!compareTeam1) {
                  analytics().logEvent('analytics_team_selected', {
                    team: 'Lakers',
                    position: 'team1',
                    sport: selectedSport,
                  }).catch(console.error);
                }
              }}
            >
              <Text style={styles.teamSelectorText}>
                {compareTeam1 || 'Select Team 1'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <Text style={styles.vsText}>VS</Text>
            
            <TouchableOpacity 
              style={styles.teamSelector}
              onPress={() => {
                setCompareTeam2(compareTeam2 ? null : 'Warriors');
                
                // Log team selection analytics
                if (!compareTeam2) {
                  analytics().logEvent('analytics_team_selected', {
                    team: 'Warriors',
                    position: 'team2',
                    sport: selectedSport,
                  }).catch(console.error);
                }
              }}
            >
              <Text style={styles.teamSelectorText}>
                {compareTeam2 || 'Select Team 2'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {compareTeam1 && compareTeam2 && (
            <View style={styles.comparisonResults}>
              <View style={styles.comparisonMetric}>
                <Text style={styles.comparisonMetricLabel}>Offensive Rating</Text>
                <View style={styles.comparisonBarContainer}>
                  <View style={[styles.comparisonBar, { width: '75%' }]}>
                    <Text style={styles.comparisonBarText}>115.2</Text>
                  </View>
                  <View style={[styles.comparisonBar, { width: '68%', backgroundColor: '#3b82f6' }]}>
                    <Text style={styles.comparisonBarText}>108.7</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.comparisonMetric}>
                <Text style={styles.comparisonMetricLabel}>Defensive Rating</Text>
                <View style={styles.comparisonBarContainer}>
                  <View style={[styles.comparisonBar, { width: '62%', backgroundColor: '#ef4444' }]}>
                    <Text style={styles.comparisonBarText}>111.4</Text>
                  </View>
                  <View style={[styles.comparisonBar, { width: '58%', backgroundColor: '#dc2626' }]}>
                    <Text style={styles.comparisonBarText}>107.9</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.comparisonMetric}>
                <Text style={styles.comparisonMetricLabel}>Net Rating</Text>
                <View style={styles.comparisonBarContainer}>
                  <View style={[styles.comparisonBar, { width: '45%' }]}>
                    <Text style={styles.comparisonBarText}>+3.8</Text>
                  </View>
                  <View style={[styles.comparisonBar, { width: '52%', backgroundColor: '#3b82f6' }]}>
                    <Text style={styles.comparisonBarText}>+0.8</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.quickComparison}>
          <Text style={styles.quickComparisonTitle}>Quick Comparisons</Text>
          <View style={styles.quickComparisonGrid}>
            {['LAL vs BOS', 'GSW vs PHX', 'MIA vs NYK', 'DEN vs MIN'].map((matchup, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickComparisonCard}
                onPress={() => {
                  // Log quick comparison analytics
                  analytics().logEvent('analytics_quick_comparison', {
                    matchup: matchup,
                    sport: selectedSport,
                  }).catch(console.error);
                }}
              >
                <Text style={styles.quickComparisonText}>{matchup}</Text>
                <Ionicons name="analytics" size={16} color="#14b8a6" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderPredictiveAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔮 Predictive Analytics</Text>
      
      <View style={styles.predictiveCard}>
        <LinearGradient
          colors={['#1e293b', '#334155']}
          style={styles.predictiveContent}
        >
          <View style={styles.predictiveHeader}>
            <Ionicons name="analytics" size={24} color="#60a5fa" />
            <Text style={styles.predictiveTitle}>AI-Powered Predictions</Text>
          </View>
          
          <View style={styles.predictionModels}>
            <View style={styles.predictionModel}>
              <Text style={styles.modelName}>Neural Network v4</Text>
              <Text style={styles.modelAccuracy}>78.3% Accuracy</Text>
            </View>
            <View style={styles.predictionModel}>
              <Text style={styles.modelName}>Ensemble Model</Text>
              <Text style={styles.modelAccuracy}>82.1% Accuracy</Text>
            </View>
            <View style={styles.predictionModel}>
              <Text style={styles.modelName}>Time Series</Text>
              <Text style={styles.modelAccuracy}>74.8% Accuracy</Text>
            </View>
          </View>
          
          <View style={styles.predictiveInsights}>
            <Text style={styles.insightsTitle}>Key Insights:</Text>
            <View style={styles.insightItem}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={styles.insightText}>Home teams show 8.2% advantage this season</Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={styles.insightText}>Rest advantage correlates with +5.7 point margin</Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={styles.insightText}>Teams coming off 3+ day breaks win 61.4% of games</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
      
      <TouchableOpacity 
        style={styles.simulateButton}
        onPress={handlePredictionsOpen}
      >
        <Ionicons name="play-circle" size={20} color="#14b8a6" />
        <Text style={styles.simulateButtonText}>Run Game Simulation</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFiltersModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilters}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Analytics Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Time Period</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {dateRanges.map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.filterChip,
                      dateRange === range && styles.filterChipActive
                    ]}
                    onPress={() => setDateRange(range)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      dateRange === range && styles.filterChipTextActive
                    ]}>
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Team Selection</Text>
              <View style={styles.teamDropdown}>
                <Text style={styles.dropdownLabel}>Select Team:</Text>
                <TouchableOpacity style={styles.dropdownButton}>
                  <Text style={styles.dropdownText}>{selectedTeam}</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Data Types</Text>
              <View style={styles.dataTypeOptions}>
                <View style={styles.dataTypeOption}>
                  <Switch
                    value={true}
                    onValueChange={() => {}}
                    trackColor={{ false: '#e5e7eb', true: '#14b8a6' }}
                  />
                  <Text style={styles.dataTypeText}>Basic Stats</Text>
                </View>
                <View style={styles.dataTypeOption}>
                  <Switch
                    value={true}
                    onValueChange={() => {}}
                    trackColor={{ false: '#e5e7eb', true: '#14b8a6' }}
                  />
                  <Text style={styles.dataTypeText}>Advanced Metrics</Text>
                </View>
                <View style={styles.dataTypeOption}>
                  <Switch
                    value={false}
                    onValueChange={() => {}}
                    trackColor={{ false: '#e5e7eb', true: '#14b8a6' }}
                  />
                  <Text style={styles.dataTypeText}>Player Tracking</Text>
                </View>
                <View style={styles.dataTypeOption}>
                  <Switch
                    value={true}
                    onValueChange={() => {}}
                    trackColor={{ false: '#e5e7eb', true: '#14b8a6' }}
                  />
                  <Text style={styles.dataTypeText}>Predictive Models</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Visualization Options</Text>
              <View style={styles.vizOptions}>
                <TouchableOpacity style={styles.vizOption}>
                  <Ionicons name="bar-chart" size={24} color="#3b82f6" />
                  <Text style={styles.vizOptionText}>Bar Charts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vizOption}>
                  <Ionicons name="trending-up" size={24} color="#10b981" />
                  <Text style={styles.vizOptionText}>Line Graphs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vizOption}>
                  <Ionicons name="pie-chart" size={24} color="#f59e0b" />
                  <Text style={styles.vizOptionText}>Pie Charts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vizOption}>
                  <Ionicons name="grid" size={24} color="#8b5cf6" />
                  <Text style={styles.vizOptionText}>Heat Maps</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalButtonSecondary}
              onPress={() => {
                setSelectedTeam('All Teams');
                setDateRange('Season');
                setShowFilters(false);
                
                // Log filter reset analytics
                analytics().logEvent('analytics_filters_reset', {
                  sport: selectedSport,
                }).catch(console.error);
              }}
            >
              <Text style={styles.modalButtonSecondaryText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setShowFilters(false);
                
                // Log filter apply analytics
                analytics().logEvent('analytics_filters_applied', {
                  sport: selectedSport,
                  team: selectedTeam,
                  date_range: dateRange,
                }).catch(console.error);
              }}
            >
              <Text style={styles.modalButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPredictionsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPredictions}
      onRequestClose={() => setShowPredictions(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#0f766e', '#14b8a6']}
            style={styles.predictionsModalHeader}
          >
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowPredictions(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.predictionsModalTitle}>Game Simulations</Text>
            <Text style={styles.predictionsModalSubtitle}>AI-powered outcome predictions</Text>
          </LinearGradient>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.simulationInput}>
              <Text style={styles.simulationLabel}>Select Teams:</Text>
              <View style={styles.simulationTeams}>
                <TouchableOpacity style={styles.teamInput}>
                  <Text style={styles.teamInputText}>Home Team</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
                <Text style={styles.vsTextSmall}>VS</Text>
                <TouchableOpacity style={styles.teamInput}>
                  <Text style={styles.teamInputText}>Away Team</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.simulationResults}>
              <Text style={styles.resultsTitle}>Prediction Results</Text>
              
              <View style={styles.winProbability}>
                <Text style={styles.probabilityLabel}>Win Probability</Text>
                <View style={styles.probabilityBars}>
                  <View style={styles.probabilityBarContainer}>
                    <AnimatedProgress
                      progress={0.65}
                      height={20}
                      backgroundColor="#e5e7eb"
                      progressColor="#14b8a6"
                      animated={true}
                      borderRadius={10}
                      style={{ width: '100%' }}
                    />
                    <Text style={styles.probabilityText}>65%</Text>
                  </View>
                  <View style={styles.probabilityBarContainer}>
                    <AnimatedProgress
                      progress={0.35}
                      height={20}
                      backgroundColor="#e5e7eb"
                      progressColor="#3b82f6"
                      animated={true}
                      borderRadius={10}
                      style={{ width: '100%' }}
                    />
                    <Text style={styles.probabilityText}>35%</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.scorePrediction}>
                <Text style={styles.scoreLabel}>Predicted Score</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.score}>112</Text>
                  <Text style={styles.scoreDivider}>-</Text>
                  <Text style={styles.score}>105</Text>
                </View>
                <Text style={styles.scoreMargin}>Projected Margin: +7</Text>
              </View>
              
              <View style={styles.keyFactors}>
                <Text style={styles.factorsTitle}>Key Factors:</Text>
                {[
                  'Home court advantage (+4.2 points)',
                  'Rest advantage: 2 days vs 0 days',
                  'Defensive efficiency gap: 3.8 rating',
                  'Recent form: 8-2 vs 5-5'
                ].map((factor, index) => (
                  <View key={index} style={styles.factorItem}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text style={styles.factorText}>{factor}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setShowPredictions(false);
                
                // Log simulation run analytics
                analytics().logEvent('analytics_simulation_run', {
                  sport: selectedSport,
                  timestamp: new Date().toISOString(),
                }).catch(console.error);
              }}
            >
              <Ionicons name="play-circle" size={20} color="white" />
              <Text style={styles.modalButtonText}>Run New Simulation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRefreshIndicator = () => (
    <View style={styles.refreshIndicator}>
      <Ionicons name="time" size={14} color="#6b7280" />
      <Text style={styles.refreshText}>
        Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <TouchableOpacity onPress={onRefresh}>
        <Ionicons name="refresh" size={16} color="#14b8a6" style={styles.refreshIcon} />
      </TouchableOpacity>
    </View>
  );

  // ADDED: Render Fantasy Sports button
  const renderFantasyButton = () => (
    <TouchableOpacity 
      onPress={() => {
        navigation.navigate('Fantasy');
        
        // Log fantasy navigation analytics
        analytics().logEvent('analytics_fantasy_navigate', {
          from_sport: selectedSport,
          timestamp: new Date().toISOString(),
        }).catch(console.error);
      }}
      style={styles.fantasyButton}
    >
      <Ionicons name="stats-chart" size={24} color="#8b5cf6" />
      <Text style={styles.fantasyButtonText}>Fantasy Sports</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch(selectedMetric) {
      case 'overview':
        return (
          <>
            {renderDataVisualization()}
            {renderPredictiveAnalytics()}
            {/* ADDED: Fantasy Sports button after predictive analytics */}
            {renderFantasyButton()}
          </>
        );
      case 'trends':
        return (
          <>
            {renderDataVisualization()}
            {/* ADDED: Fantasy Sports button after trends */}
            {renderFantasyButton()}
          </>
        );
      case 'teams':
        return (
          <>
            {renderComparisonTools()}
            {/* ADDED: Fantasy Sports button after comparison tools */}
            {renderFantasyButton()}
          </>
        );
      case 'advanced':
        return (
          <>
            {renderPredictiveAnalytics()}
            {/* ADDED: Fantasy Sports button after predictive analytics */}
            {renderFantasyButton()}
          </>
        );
      default:
        return (
          <>
            {renderDataVisualization()}
            {/* ADDED: Fantasy Sports button after data visualization */}
            {renderFantasyButton()}
          </>
        );
    }
  };

  if (loading || isSportsDataLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text style={styles.loadingText}>Loading Sports Analytics...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary 
      fallback={
        <View style={styles.errorContainer}>
          <Text>Analytics data unavailable</Text>
        </View>
      }
    >
      <View style={styles.container}>
        {renderHeader()}
        {renderRefreshIndicator()}
        
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#14b8a6']}
              tintColor="#14b8a6"
            />
          }
        >
          {renderMetricTabs()}
          {renderContent()}
          {renderComparisonTools()}
          
          {/* ADDED: Alternative Fantasy Sports button placement before footer */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Fantasy')}
            style={[styles.fantasyButton, { marginHorizontal: 15, marginTop: 10 }]}
          >
            <Ionicons name="stats-chart" size={24} color="#8b5cf6" />
            <Text style={styles.fantasyButtonText}>Fantasy Sports Dashboard</Text>
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Analytics powered by machine learning models trained on 10+ years of data.
              Data updates every 15 minutes.
            </Text>
          </View>
        </ScrollView>
        
        {renderFiltersModal()}
        {renderPredictionsModal()}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    padding: 20,
  },
  header: {
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  sportsScroll: {
    marginTop: 10,
  },
  sportButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeSportButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sportText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeSportText: {
    color: 'white',
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  refreshText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  refreshIcon: {
    marginLeft: 10,
  },
  metricsScroll: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  metricTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeMetricTab: {
    backgroundColor: '#14b8a6',
  },
  metricText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeMetricText: {
    color: 'white',
  },
  section: {
    margin: 15,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  // New styles for trend visualization
  trendContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  trendBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: 10,
  },
  trendBarColumn: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarBackground: {
    height: 100,
    width: 25,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  trendMonthText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 5,
  },
  trendValueText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Comparison visualization
  comparisonContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comparisonBarsContainer: {
    marginTop: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  comparisonCategory: {
    fontSize: 12,
    color: '#6b7280',
    width: 80,
  },
  comparisonBarBackground: {
    flex: 1,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  comparisonBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  comparisonValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    width: 40,
    textAlign: 'right',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginVertical: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  compareToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareToggleText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  compareToggleTextActive: {
    color: '#14b8a6',
    fontWeight: '500',
  },
  comparisonInterface: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  teamSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  teamSelectorText: {
    fontSize: 14,
    color: '#1f2937',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    marginHorizontal: 10,
  },
  comparisonResults: {
    marginTop: 10,
  },
  comparisonMetric: {
    marginBottom: 15,
  },
  comparisonMetricLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  comparisonBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  comparisonBar: {
    height: '100%',
    backgroundColor: '#14b8a6',
    borderRadius: 6,
    marginRight: 5,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  comparisonBarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quickComparison: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickComparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  quickComparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickComparisonCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  quickComparisonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  predictiveCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  predictiveContent: {
    padding: 25,
  },
  predictiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  predictiveTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  predictionModels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  predictionModel: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  modelName: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  modelAccuracy: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  predictiveInsights: {
    marginTop: 10,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#14b8a6',
  },
  simulateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14b8a6',
    marginLeft: 8,
  },
  // ADDED: Fantasy Sports button styles from File 1
  fantasyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  fantasyButtonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    maxHeight: 400,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#14b8a6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: 'white',
  },
  teamDropdown: {
    marginTop: 10,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1f2937',
  },
  dataTypeOptions: {
    marginTop: 10,
  },
  dataTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataTypeText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 12,
  },
  vizOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  vizOption: {
    alignItems: 'center',
    padding: 10,
  },
  vizOptionText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#14b8a6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  modalButtonSecondaryText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  predictionsModalHeader: {
    padding: 25,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  predictionsModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  predictionsModalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  simulationInput: {
    padding: 20,
  },
  simulationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  simulationTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  teamInputText: {
    fontSize: 14,
    color: '#1f2937',
  },
  vsTextSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
    marginHorizontal: 10,
  },
  simulationResults: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  winProbability: {
    marginBottom: 20,
  },
  probabilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  probabilityBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  probabilityBarContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  probabilityBar: {
    height: 20,
    backgroundColor: '#14b8a6',
    borderRadius: 10,
    marginBottom: 6,
  },
  probabilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  scorePrediction: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scoreDivider: {
    fontSize: 36,
    color: '#6b7280',
    marginHorizontal: 20,
  },
  scoreMargin: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  keyFactors: {
    marginTop: 20,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AnalyticsScreen;
