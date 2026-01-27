// src/screens/DailyPicksScreen-enhanced.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// REMOVED: import * as Progress from 'react-native-progress';
import apiService from '../services/api-service';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSportsData } from "../hooks/useSportsData";

const { width } = Dimensions.get('window');

// Safe slice function to handle undefined/null data
const safeSlice = (data, start = 0, end) => {
  if (!data) return [];
  if (Array.isArray(data)) return data.slice(start, end);
  if (typeof data === 'object' && data !== null) {
    const arr = Object.values(data);
    return arr.slice(start, end);
  }
  return [];
};

// Updated Main Screen Component to accept hideHeader prop
const DailyPicksScreen = ({ hideHeader = false }) => {
  const [picks, setPicks] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPickForComparison, setSelectedPickForComparison] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(null);
  const [oddsUpdates, setOddsUpdates] = useState({});
  const oddsAnimation = new Animated.Value(1);

  // Use sports data hook
  const { 
    data: { nba, nfl, news },
    isLoading: isSportsDataLoading,
    refreshAllData: refreshSportsData
  } = useSportsData({
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Simple data for confidence trends (no chart needed)
  const confidenceTrendData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 78 },
    { day: 'Wed', value: 82 },
    { day: 'Thu', value: 74 },
    { day: 'Fri', value: 88 },
    { day: 'Sat', value: 84 },
    { day: 'Sun', value: 90 },
  ];

  const loadData = async () => {
    try {
      console.log('🎯 Loading enhanced Daily Picks...');
      
      // Use sports data from hook
      const nbaGames = nba?.games || [];
      const nbaPlayers = nba?.players || [];
      const newsItems = news?.items || [];
      
      // Get picks data - use safeSlice for safety
      const picksResponse = await apiService.getDailyPicks();
      const predictionsResponse = await apiService.getAiPredictions();
      
      const picksData = safeSlice(picksResponse?.data || picksResponse?.picks, 0);
      const predictionsData = safeSlice(predictionsResponse?.data || predictionsResponse?.predictions, 0);
      
      // Enhanced picks with real-time odds simulation
      let enhancedPicks;
      
      if (picksData.length > 0) {
        enhancedPicks = picksData.map((pick, index) => ({
          id: pick.id || `pick-${index + 1}-${Date.now()}`, // FIXED: More unique ID
          sport: pick.sport || 'NBA',
          type: pick.type || 'Player Prop',
          player: pick.player || pick.team || `Player ${index + 1}`,
          pick: pick.pick || 'Over 25.5 Points',
          confidence: pick.confidence || Math.floor(Math.random() * 30) + 60,
          odds: pick.odds || (Math.random() > 0.5 ? '-150' : '+110'),
          oddsHistory: pick.oddsHistory || ['-145', '-148', '-150', '-152'],
          reasoning: pick.reasoning || 'Based on recent performance and matchup analysis.',
          expert: pick.expert || 'Analytics Team',
          expertAccuracy: pick.expertAccuracy || Math.floor(Math.random() * 30) + 70,
          expertTrend: pick.expertTrend || (Math.random() > 0.5 ? 'up' : 'down'),
          timestamp: pick.timestamp || 'Recently updated',
          factors: pick.factors || ['Strong recent form', 'Favorable matchup', 'High usage rate'],
          edge: pick.edge || (Math.random() * 5 + 1).toFixed(1),
        }));
      } else {
        // Fallback picks using NBA data from hook
        const topPlayers = safeSlice(nbaPlayers, 0, 3);
        enhancedPicks = [
          {
            id: 'pick-1-fallback', // FIXED: Unique ID
            sport: 'NBA',
            type: 'Player Prop',
            player: topPlayers[0]?.name || 'Stephen Curry',
            pick: 'Over 28.5 Points',
            confidence: 84,
            odds: '-150',
            oddsHistory: ['-145', '-148', '-150', '-152'],
            reasoning: 'High usage rate in recent games, favorable matchup against weak perimeter defense.',
            expert: 'Mike Johnson',
            expertAccuracy: 78,
            expertTrend: 'up',
            timestamp: '2 hours ago',
            factors: ['Defensive rating: 112.3', 'Usage rate: 32.4%', 'Last 5 games: 31.2 PPG'],
            edge: 3.2,
          },
          {
            id: 'pick-2-fallback', // FIXED: Unique ID
            sport: 'NBA',
            type: 'Moneyline',
            team: 'Denver Nuggets',
            pick: 'Win',
            confidence: 72,
            odds: '+110',
            oddsHistory: ['+105', '+108', '+110', '+115'],
            reasoning: 'Home court advantage and Jokic dominance in paint.',
            expert: 'Sarah Chen',
            expertAccuracy: 82,
            expertTrend: 'stable',
            timestamp: '4 hours ago',
            factors: ['Home record: 24-8', 'Jokic PER: 32.1', 'Opponent injury report: 2 starters out'],
            edge: 1.8,
          },
          {
            id: 'pick-3-fallback', // FIXED: Unique ID
            sport: 'NBA',
            type: 'Spread',
            team: 'Miami Heat',
            pick: '+4.5',
            confidence: 68,
            odds: '+105',
            oddsHistory: ['+100', '+102', '+105', '+108'],
            reasoning: 'Strong defensive team, likely to keep game close.',
            expert: 'David Lee',
            expertAccuracy: 71,
            expertTrend: 'down',
            timestamp: '6 hours ago',
            factors: ['Defensive efficiency: 108.7', 'ATS record: 32-20', 'Clutch performance: +5.2 net rating'],
            edge: 2.4,
          },
        ];
      }

      let enhancedPredictions;
      
      if (predictionsData.length > 0) {
        enhancedPredictions = predictionsData.map((prediction, index) => ({
          id: prediction.id || `prediction-${index + 1}-${Date.now()}`, // FIXED: More unique ID
          sport: prediction.sport || 'NBA',
          game: prediction.game || `${nbaGames[0]?.awayTeam || 'Team A'} @ ${nbaGames[0]?.homeTeam || 'Team B'}`,
          prediction: prediction.prediction || 'Over 228.5',
          confidence: prediction.confidence || Math.floor(Math.random() * 30) + 70,
          edge: prediction.edge || (Math.random() * 6 + 2).toFixed(1),
          model: prediction.model || 'Neural Network v4',
          modelVersion: prediction.modelVersion || '4.2.1',
          trainingData: prediction.trainingData || 'Last 5 seasons, 12,000+ games',
          factors: prediction.factors || [
            { name: 'Defensive efficiency', weight: 0.35, value: '112.4 vs 108.7' },
            { name: 'Home/away splits', weight: 0.25, value: 'Road team record: 15-18' },
            { name: 'Player injuries', weight: 0.20, value: '1 starter questionable' },
            { name: 'Rest advantage', weight: 0.10, value: '2 days vs 0 days rest' },
            { name: 'Recent form', weight: 0.10, value: 'Last 10: 7-3' },
          ],
          historicalAccuracy: prediction.historicalAccuracy || 78.3,
          timestamp: prediction.timestamp || 'Updated recently',
        }));
      } else {
        // Fallback predictions
        enhancedPredictions = [
          {
            id: 'prediction-1-fallback', // FIXED: Unique ID
            sport: 'NBA',
            game: 'LAL @ BOS',
            prediction: 'Lakers ML',
            confidence: 74,
            edge: 3.2,
            model: 'Neural Network v4',
            modelVersion: '4.2.1',
            trainingData: 'Last 5 seasons, 12,000+ games',
            factors: [
              { name: 'Defensive efficiency', weight: 0.35, value: '112.4 vs 108.7' },
              { name: 'Home/away splits', weight: 0.25, value: 'Lakers road: 15-18' },
              { name: 'Player injuries', weight: 0.20, value: 'Boston: 1 starter questionable' },
              { name: 'Rest advantage', weight: 0.10, value: 'Lakers: 2 days, Boston: 0' },
              { name: 'Recent form', weight: 0.10, value: 'LAL: 7-3, BOS: 6-4' },
            ],
            historicalAccuracy: 78.3,
            timestamp: 'Updated 1 hour ago',
          },
          {
            id: 'prediction-2-fallback', // FIXED: Unique ID
            sport: 'NBA',
            game: 'GSW @ PHX',
            prediction: 'Over 228.5',
            confidence: 81,
            edge: 5.7,
            model: 'Ensemble Learning',
            modelVersion: '3.8.2',
            trainingData: '10+ statistical models combined',
            factors: [
              { name: 'Pace of play', weight: 0.30, value: 'Both top 5 in pace' },
              { name: 'Three-point volume', weight: 0.25, value: 'Combined 78 attempts/game' },
              { name: 'Recent totals', weight: 0.20, value: 'Last 5: 235.2 avg' },
              { name: 'Defensive ratings', weight: 0.15, value: 'Both bottom 10 defensively' },
              { name: 'Key injuries', weight: 0.10, value: 'No significant defenders out' },
            ],
            historicalAccuracy: 82.1,
            timestamp: 'Updated 2 hours ago',
          },
        ];
      }

      setPicks(safeSlice(enhancedPicks, 0, 10));
      setAiPredictions(safeSlice(enhancedPredictions, 0, 5));
      
      // Initialize odds updates using safeSlice
      const initialOdds = {};
      safeSlice(enhancedPicks, 0, 10).forEach(pick => {
        initialOdds[pick.id] = {
          current: pick.odds,
          history: safeSlice(pick.oddsHistory, 0, 4),
          trend: 'stable',
        };
      });
      setOddsUpdates(initialOdds);
      
    } catch (error) {
      console.log('Error loading daily picks:', error.message);
      
      // Set fallback data
      const fallbackPicks = safeSlice(picks, 0, 3);
      const fallbackPredictions = safeSlice(aiPredictions, 0, 2);
      
      setPicks(fallbackPicks.length > 0 ? fallbackPicks : []);
      setAiPredictions(fallbackPredictions.length > 0 ? fallbackPredictions : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Simulate real-time odds updates
    const oddsInterval = setInterval(() => {
      setOddsUpdates(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(pickId => {
          const currentOdds = updated[pickId].current;
          const [sign, number] = currentOdds.split(/(?=[+-])/);
          const num = parseInt(number);
          const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const newNum = Math.max(100, Math.min(1000, num + change));
          const newOdds = sign + newNum;
          
          updated[pickId] = {
            current: newOdds,
            history: safeSlice([newOdds, ...updated[pickId].history], 0, 4),
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
          };
        });
        return updated;
      });
      
      // Animate odds update
      Animated.sequence([
        Animated.timing(oddsAnimation, {
          toValue: 1.2,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(oddsAnimation, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(oddsInterval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh both sports data and picks
    await refreshSportsData();
    await loadData();
    setRefreshing(false);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 70) return '#3b82f6';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 70) return 'Medium Confidence';
    if (confidence >= 60) return 'Low Confidence';
    return 'Risky Pick';
  };

  // Custom Progress Bar component to replace react-native-progress
  const CustomProgressBar = ({ progress, width, height = 10, color = '#3b82f6', unfilledColor = '#e5e7eb' }) => {
    return (
      <View style={[styles.customProgressBar, { width, height, backgroundColor: unfilledColor }]}>
        <View 
          style={[
            styles.customProgressBarFill, 
            { 
              width: `${progress * 100}%`, 
              height: '100%', 
              backgroundColor: color 
            }
          ]} 
        />
      </View>
    );
  };

  // FIXED: Added unique keys to all mapping functions
  const renderExpertPick = (pick) => {
    const oddsData = oddsUpdates[pick.id] || { current: pick.odds, history: [], trend: 'stable' };
    
    return (
      <View key={`expert-pick-${pick.id}`} style={styles.expertPickCard}>
        {comparisonMode && (
          <TouchableOpacity
            style={[
              styles.comparisonCheckbox,
              selectedPickForComparison?.id === pick.id && styles.comparisonCheckboxSelected
            ]}
            onPress={() => setSelectedPickForComparison(
              selectedPickForComparison?.id === pick.id ? null : pick
            )}
          >
            <Ionicons 
              name={selectedPickForComparison?.id === pick.id ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={selectedPickForComparison?.id === pick.id ? "#3b82f6" : "#9ca3af"} 
            />
          </TouchableOpacity>
        )}
        
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.pickHeader}
        >
          <View style={styles.pickHeaderContent}>
            <View style={styles.pickBadge}>
              <Text style={styles.pickBadgeText}>{pick.sport}</Text>
            </View>
            <View style={styles.pickType}>
              <Ionicons name="flash-outline" size={14} color="#fff" />
              <Text style={styles.pickTypeText}>{pick.type}</Text>
            </View>
          </View>
          
          <View style={styles.pickMain}>
            <View>
              <Text style={styles.playerName}>{pick.player || pick.team}</Text>
              <Text style={styles.pickText}>{pick.pick}</Text>
            </View>
            <Animated.View 
              style={[
                styles.oddsContainer,
                { transform: [{ scale: oddsAnimation }] }
              ]}
            >
              <Text style={styles.oddsText}>{oddsData.current}</Text>
              {oddsData.trend !== 'stable' && (
                <Ionicons 
                  name={oddsData.trend === 'up' ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color="#fff" 
                  style={styles.oddsTrendIcon}
                />
              )}
            </Animated.View>
          </View>
          
          {/* Odds History Mini Chart */}
          {safeSlice(oddsData.history).length > 1 && (
            <View style={styles.oddsHistory}>
              <Text style={styles.oddsHistoryLabel}>Odds Movement:</Text>
              <View style={styles.oddsHistoryChart}>
                {safeSlice(oddsData.history, 0, 4).map((odds, index) => (
                  <View key={`odds-${pick.id}-${index}`} style={styles.oddsHistoryPoint}>
                    <Text style={styles.oddsHistoryText}>{odds}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </LinearGradient>
        
        <View style={styles.pickBody}>
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceHeader}>
              <Text style={styles.confidenceLabel}>Confidence Analysis</Text>
              <View style={[
                styles.confidenceTag,
                { backgroundColor: getConfidenceColor(pick.confidence) + '20' }
              ]}>
                <Text style={[styles.confidenceTagText, { color: getConfidenceColor(pick.confidence) }]}>
                  {getConfidenceLabel(pick.confidence)}
                </Text>
              </View>
            </View>
            
            <View style={styles.confidenceBarContainer}>
              <CustomProgressBar 
                progress={pick.confidence / 100} 
                width={width - 100}
                height={10}
                color={getConfidenceColor(pick.confidence)}
                unfilledColor="#e5e7eb"
              />
              <View style={styles.confidenceScale}>
                <Text style={styles.confidenceScaleText}>Low</Text>
                <Text style={styles.confidenceScaleText}>Medium</Text>
                <Text style={styles.confidenceScaleText}>High</Text>
              </View>
            </View>
            
            <View style={styles.confidenceMetrics}>
              <View style={styles.confidenceMetric}>
                <Ionicons name="trending-up" size={14} color="#10b981" />
                <Text style={styles.confidenceMetricText}>Edge: +{pick.edge || 0}%</Text>
              </View>
              <View style={styles.confidenceMetric}>
                <Ionicons name="stats-chart" size={14} color="#3b82f6" />
                <Text style={styles.confidenceMetricText}>Value: Good</Text>
              </View>
              <View style={styles.confidenceMetric}>
                <Ionicons name="time" size={14} color="#f59e0b" />
                <Text style={styles.confidenceMetricText}>Freshness: High</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.reasoningText}>{pick.reasoning}</Text>
          
          {pick.factors && (
            <View style={styles.factorsContainer}>
              <Text style={styles.factorsTitle}>Key Factors:</Text>
              {safeSlice(pick.factors, 0, 5).map((factor, index) => (
                <View key={`factor-${pick.id}-${index}`} style={styles.factorItem}>
                  <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" />
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.expertInfo}>
            <View style={styles.expertAvatar}>
              <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                style={styles.expertAvatarGradient}
              >
                <Text style={styles.expertInitial}>{pick.expert?.charAt(0) || '?'}</Text>
              </LinearGradient>
            </View>
            <View style={styles.expertDetails}>
              <Text style={styles.expertName}>{pick.expert}</Text>
              <View style={styles.expertStats}>
                <Ionicons 
                  name={pick.expertTrend === 'up' ? 'trending-up' : 
                        pick.expertTrend === 'down' ? 'trending-down' : 'remove'} 
                  size={12} 
                  color={pick.expertTrend === 'up' ? '#10b981' : 
                         pick.expertTrend === 'down' ? '#ef4444' : '#6b7280'} 
                />
                <Text style={styles.expertAccuracy}>{pick.expertAccuracy}% accuracy</Text>
              </View>
            </View>
            <Text style={styles.timestamp}>{pick.timestamp}</Text>
          </View>
        </View>
      </View>
    );
  };

  // FIXED: Added unique key
  const renderAiPrediction = (prediction) => (
    <TouchableOpacity 
      key={`ai-prediction-${prediction.id}`} 
      style={styles.aiPredictionCard}
      onPress={() => setShowAiDetails(prediction)}
    >
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
        style={styles.aiHeader}
      >
        <View style={styles.aiHeaderContent}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.aiBadgeText}>AI PREDICTION</Text>
          </View>
          <Text style={styles.gameText}>{prediction.game}</Text>
        </View>
        
        <View style={styles.predictionMain}>
          <Text style={styles.predictionText}>{prediction.prediction}</Text>
          <View style={styles.edgeContainer}>
            <Ionicons name="trending-up" size={16} color="#fff" />
            <Text style={styles.edgeText}>+{prediction.edge}% edge</Text>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.predictionBody}>
        <View style={styles.aiConfidence}>
          <View style={styles.aiConfidenceBar}>
            <View 
              style={[
                styles.aiConfidenceFill, 
                { width: `${prediction.confidence}%` }
              ]} 
            />
          </View>
          <Text style={styles.aiConfidenceText}>AI Confidence: {prediction.confidence}%</Text>
        </View>
        
        <View style={styles.modelInfo}>
          <Ionicons name="hardware-chip-outline" size={16} color="#7c3aed" />
          <Text style={styles.modelText}>{prediction.model}</Text>
          <TouchableOpacity onPress={() => setShowAiDetails(prediction)}>
            <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.factorsContainer}>
          <Text style={styles.factorsTitle}>Top Factors:</Text>
          {safeSlice(prediction.factors, 0, 3).map((factor, index) => (
            <View key={`ai-factor-${prediction.id}-${index}`} style={styles.factorItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" />
              <Text style={styles.factorText}>{typeof factor === 'object' ? factor.name : factor}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.aiFooter}>
          <Text style={styles.timestamp}>{prediction.timestamp}</Text>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => setShowAiDetails(prediction)}
          >
            <Text style={styles.detailsButtonText}>View Model Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderComparisonView = () => {
    if (!selectedPickForComparison) {
      return (
        <View style={styles.comparisonPlaceholder}>
          <Ionicons name="git-compare" size={48} color="#9ca3af" />
          <Text style={styles.comparisonPlaceholderText}>
            Select a pick to compare with others
          </Text>
          <Text style={styles.comparisonPlaceholderSubtext}>
            Tap on multiple picks to analyze them side-by-side
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonTitle}>Pick Comparison</Text>
          <TouchableOpacity onPress={() => setComparisonMode(false)}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonPickName}>
            {selectedPickForComparison.player || selectedPickForComparison.team}
          </Text>
          <Text style={styles.comparisonPick}>{selectedPickForComparison.pick}</Text>
          
          <View style={styles.comparisonMetrics}>
            <View style={styles.comparisonMetric}>
              <Text style={styles.comparisonMetricLabel}>Confidence</Text>
              <Text style={[
                styles.comparisonMetricValue,
                { color: getConfidenceColor(selectedPickForComparison.confidence) }
              ]}>
                {selectedPickForComparison.confidence}%
              </Text>
            </View>
            <View style={styles.comparisonMetric}>
              <Text style={styles.comparisonMetricLabel}>Edge</Text>
              <Text style={styles.comparisonMetricValue}>
                +{selectedPickForComparison.edge || 0}%
              </Text>
            </View>
            <View style={styles.comparisonMetric}>
              <Text style={styles.comparisonMetricLabel}>Expert Acc.</Text>
              <Text style={styles.comparisonMetricValue}>
                {selectedPickForComparison.expertAccuracy}%
              </Text>
            </View>
          </View>
          
          {/* Confidence Trend (Chart Replacement) */}
          <View style={styles.confidenceTrendContainer}>
            <Text style={styles.trendTitle}>Confidence Trend (Last 7 Days)</Text>
            <View style={styles.trendBarsContainer}>
              {safeSlice(confidenceTrendData, 0, 7).map((day, index) => (
                <View key={`trend-${index}`} style={styles.trendBarColumn}>
                  <View style={styles.trendBarBackground}>
                    <View 
                      style={[
                        styles.trendBarFill,
                        { height: `${day.value}%`, backgroundColor: getConfidenceColor(day.value) }
                      ]}
                    />
                  </View>
                  <Text style={styles.trendDayText}>{day.day}</Text>
                  <Text style={styles.trendValueText}>{day.value}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderAiDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={!!showAiDetails}
      onRequestClose={() => setShowAiDetails(null)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {showAiDetails && (
            <>
              <LinearGradient
                colors={['#7c3aed', '#8b5cf6']}
                style={styles.modalHeader}
              >
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowAiDetails(null)}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>AI Model Analysis</Text>
                <Text style={styles.modalSubtitle}>{showAiDetails.game}</Text>
              </LinearGradient>
              
              <ScrollView style={styles.modalBody}>
                <View style={styles.modelDetails}>
                  <Text style={styles.detailSectionTitle}>Model Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Model Name:</Text>
                    <Text style={styles.detailValue}>{showAiDetails.model}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Version:</Text>
                    <Text style={styles.detailValue}>{showAiDetails.modelVersion}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Training Data:</Text>
                    <Text style={styles.detailValue}>{showAiDetails.trainingData}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Historical Accuracy:</Text>
                    <Text style={[styles.detailValue, { color: '#10b981' }]}>
                      {showAiDetails.historicalAccuracy}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modelDetails}>
                  <Text style={styles.detailSectionTitle}>Prediction Factors</Text>
                  {safeSlice(showAiDetails.factors).map((factor, index) => (
                    <View key={`modal-factor-${showAiDetails.id}-${index}`} style={styles.factorDetail}>
                      <View style={styles.factorHeader}>
                        <Text style={styles.factorName}>{factor.name}</Text>
                        <Text style={styles.factorWeight}>{Math.round(factor.weight * 100)}% weight</Text>
                      </View>
                      <Text style={styles.factorValue}>{factor.value}</Text>
                      <View style={styles.factorBar}>
                        <View 
                          style={[
                            styles.factorBarFill,
                            { width: `${factor.weight * 100}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  ))}
                </View>
                
                <View style={styles.modelDetails}>
                  <Text style={styles.detailSectionTitle}>Confidence Breakdown</Text>
                  <View style={styles.confidenceBreakdown}>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Statistical Models:</Text>
                      <Text style={styles.breakdownValue}>85%</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Recent Form:</Text>
                      <Text style={styles.breakdownValue}>78%</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Matchup Analysis:</Text>
                      <Text style={styles.breakdownValue}>92%</Text>
                    </View>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>Historical Data:</Text>
                      <Text style={styles.breakdownValue}>81%</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowAiDetails(null)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading || isSportsDataLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Daily Picks...</Text>
      </View>
    );
  }

  // MODIFIED: Conditional header rendering based on hideHeader prop
  const renderHeader = () => {
    if (hideHeader) return null;
    
    return (
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={32} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Daily Picks Pro</Text>
            <Text style={styles.subtitle}>AI-powered predictions & expert analysis</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>87%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>+24.5%</Text>
            <Text style={styles.statLabel}>ROI</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <ErrorBoundary 
      fallback={
        <View style={styles.errorContainer}>
          <Text>Daily picks data unavailable</Text>
        </View>
      }
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header - Now conditionally rendered */}
          {renderHeader()}

          {/* Comparison Mode Toggle */}
          <View style={styles.comparisonModeToggle}>
            <Text style={styles.comparisonModeLabel}>
              {comparisonMode ? 'Comparison Mode' : 'Quick Analysis'}
            </Text>
            <TouchableOpacity 
              style={[
                styles.comparisonToggle,
                comparisonMode && styles.comparisonToggleActive
              ]}
              onPress={() => setComparisonMode(!comparisonMode)}
            >
              <Ionicons 
                name="git-compare" 
                size={20} 
                color={comparisonMode ? '#fff' : '#6b7280'} 
              />
              <Text style={[
                styles.comparisonToggleText,
                comparisonMode && styles.comparisonToggleTextActive
              ]}>
                {comparisonMode ? 'Exit Compare' : 'Compare Picks'}
              </Text>
            </TouchableOpacity>
          </View>

          {comparisonMode ? renderComparisonView() : (
            <>
              {/* Filter Buttons */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
              >
                <TouchableOpacity 
                  style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
                  onPress={() => setSelectedFilter('all')}
                >
                  <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
                    All Picks
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterButton, selectedFilter === 'nba' && styles.filterButtonActive]}
                  onPress={() => setSelectedFilter('nba')}
                >
                  <Text style={[styles.filterText, selectedFilter === 'nba' && styles.filterTextActive]}>
                    NBA
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterButton, selectedFilter === 'ai' && styles.filterButtonActive]}
                  onPress={() => setSelectedFilter('ai')}
                >
                  <Text style={[styles.filterText, selectedFilter === 'ai' && styles.filterTextActive]}>
                    AI Predictions
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterButton, selectedFilter === 'expert' && styles.filterButtonActive]}
                  onPress={() => setSelectedFilter('expert')}
                >
                  <Text style={[styles.filterText, selectedFilter === 'expert' && styles.filterTextActive]}>
                    Expert Picks
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterButton, selectedFilter === 'props' && styles.filterButtonActive]}
                  onPress={() => setSelectedFilter('props')}
                >
                  <Text style={[styles.filterText, selectedFilter === 'props' && styles.filterTextActive]}>
                    Player Props
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* AI Predictions Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="sparkles" size={20} color="#8b5cf6" />
                    <Text style={styles.sectionTitle}>AI Predictions</Text>
                    <View style={styles.aiAccuracyBadge}>
                      <Text style={styles.aiAccuracyText}>82% Accuracy</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.seeAll}>View All →</Text>
                  </TouchableOpacity>
                </View>
                
                {safeSlice(aiPredictions).length > 0 ? (
                  safeSlice(aiPredictions, 0, 5).map(prediction => renderAiPrediction(prediction))
                ) : (
                  <Text style={styles.emptyText}>No AI predictions available</Text>
                )}
              </View>

              {/* Expert Picks Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="trophy-outline" size={20} color="#f59e0b" />
                    <Text style={styles.sectionTitle}>Expert Picks</Text>
                    <View style={styles.expertStatsBadge}>
                      <Ionicons name="trending-up" size={12} color="#10b981" />
                      <Text style={styles.expertStatsText}>78% Win Rate</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.seeAll}>View All →</Text>
                  </TouchableOpacity>
                </View>
                
                {safeSlice(picks).length > 0 ? (
                  safeSlice(picks, 0, 10).map(pick => renderExpertPick(pick))
                ) : (
                  <Text style={styles.emptyText}>No expert picks available</Text>
                )}
              </View>

              {/* Real-time Updates Banner */}
              <View style={styles.realTimeBanner}>
                <Ionicons name="sync-circle" size={24} color="#10b981" />
                <View style={styles.realTimeText}>
                  <Text style={styles.realTimeTitle}>Real-time Odds Updates Active</Text>
                  <Text style={styles.realTimeSubtitle}>Odds update every 10 seconds</Text>
                </View>
                <View style={styles.realTimeIndicator}>
                  <View style={styles.pulseDot} />
                </View>
              </View>
            </>
          )}
        </ScrollView>
        
        {renderAiDetailsModal()}
      </SafeAreaView>
    </ErrorBoundary>
  );
};

// Tab Screen Wrapper Component (as requested in File 1)
export const DailyPicksTabScreen = () => {
  return (
    <DailyPicksScreen hideHeader={true} />
  );
};

// Keep the original default export
export default DailyPicksScreen;

// Styles remain exactly the same with one addition
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 20,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 15,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  seeAll: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  expertPickCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickHeader: {
    padding: 20,
  },
  pickHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pickBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pickType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pickTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  pickMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  pickText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  oddsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  oddsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  pickBody: {
    padding: 20,
  },
  confidenceContainer: {
    marginBottom: 15,
  },
  confidenceTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  reasoningText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 15,
  },
  factorsContainer: {
    marginBottom: 15,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  factorText: {
    fontSize: 13,
    color: '#4b5563',
    marginLeft: 6,
  },
  expertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
  },
  expertDetails: {
    flex: 1,
  },
  expertName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  expertStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  expertAccuracy: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
  aiPredictionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiHeader: {
    padding: 20,
  },
  aiHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  gameText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  predictionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  edgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  edgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  predictionBody: {
    padding: 20,
  },
  aiConfidence: {
    marginBottom: 15,
  },
  aiConfidenceBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  aiConfidenceFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  aiConfidenceText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  modelText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 8,
  },
  aiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  // New styles for trend visualization
  confidenceTrendContainer: {
    marginTop: 20,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
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
    height: 120,
  },
  trendBarColumn: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarBackground: {
    height: 80,
    width: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  trendDayText: {
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
  // Existing comparison styles
  comparisonModeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  comparisonModeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  comparisonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  comparisonToggleActive: {
    backgroundColor: '#3b82f6',
  },
  comparisonToggleText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  comparisonToggleTextActive: {
    color: 'white',
  },
  comparisonCheckbox: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  comparisonCheckboxSelected: {
    backgroundColor: '#f1f5f9',
  },
  comparisonPlaceholder: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  comparisonPlaceholderSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  comparisonContainer: {
    padding: 15,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comparisonPickName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  comparisonPick: {
    fontSize: 18,
    color: '#4b5563',
    marginTop: 4,
  },
  comparisonMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  comparisonMetric: {
    alignItems: 'center',
  },
  comparisonMetricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  comparisonMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  // Enhanced confidence indicators
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  confidenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  confidenceBarContainer: {
    marginBottom: 10,
  },
  confidenceScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  confidenceScaleText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  confidenceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confidenceMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceMetricText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  // Odds history
  oddsHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  oddsHistoryLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 8,
  },
  oddsHistoryChart: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  oddsHistoryPoint: {
    alignItems: 'center',
  },
  oddsHistoryText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
  },
  oddsTrendIcon: {
    marginLeft: 4,
  },
  // Custom Progress Bar styles
  customProgressBar: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  customProgressBarFill: {
    borderRadius: 5,
  },
  // AI details modal
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
    padding: 20,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  modalBody: {
    maxHeight: 400,
  },
  modelDetails: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  factorDetail: {
    marginBottom: 15,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  factorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  factorWeight: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  factorValue: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  factorBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  confidenceBreakdown: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Real-time banner
  realTimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  realTimeText: {
    flex: 1,
    marginLeft: 12,
  },
  realTimeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },
  realTimeSubtitle: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  realTimeIndicator: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  pulseDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    top: 6,
    left: 6,
  },
  // Enhanced expert info
  expertAvatar: {
    marginRight: 12,
  },
  expertAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expertInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // AI accuracy badge
  aiAccuracyBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  aiAccuracyText: {
    fontSize: 11,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  // Expert stats badge
  expertStatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  expertStatsText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
  },
  // AI details button
  detailsButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
});
