import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
// REMOVED: import * as Progress from 'react-native-progress';
import ProgressBar from 'react-native-animated-progress';
import CircularProgress from '../components/CircularProgress';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSportsData } from '../hooks/useSportsData';

const screenWidth = Dimensions.get('window').width;

// Simple Bar Chart Component
const SimpleBarChart = ({ data, labels, title, color = '#8b5cf6', height = 200 }) => {
  const maxValue = Math.max(...data);
  
  return (
    <View style={[styles.simpleChartContainer, { height }]}>
      <Text style={styles.simpleChartTitle}>{title}</Text>
      <View style={styles.simpleChartBars}>
        {data.map((value, index) => (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar,
                  { 
                    height: `${(value / maxValue) * 80}%`,
                    backgroundColor: color
                  }
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{labels[index]}</Text>
            <Text style={styles.barValue}>{value.toFixed(1)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export function AIPredictionsScreen() {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [accuracy, setAccuracy] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState('points');
  const [refreshing, setRefreshing] = useState(false);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationData, setSimulationData] = useState(null);

  const { data: sportsData } = useSportsData();

  // Enhanced AI predictions with confidence intervals
  const [aiModels, setAiModels] = useState([
    {
      id: 1,
      name: 'Deep Learning v4',
      accuracy: 87.3,
      predictions: 1245,
      lastUpdated: '2 hours ago',
      features: ['Neural Networks', 'LSTM', 'Attention Mechanism'],
      confidence: 92,
    },
    {
      id: 2,
      name: 'Ensemble Model',
      accuracy: 85.8,
      predictions: 892,
      lastUpdated: '4 hours ago',
      features: ['Random Forest', 'XGBoost', 'Gradient Boosting'],
      confidence: 89,
    },
    {
      id: 3,
      name: 'Time Series Prophet',
      accuracy: 83.2,
      predictions: 567,
      lastUpdated: '6 hours ago',
      features: ['Seasonality', 'Trend Analysis', 'Holiday Effects'],
      confidence: 85,
    },
  ]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      
      // Generate enhanced AI predictions with confidence intervals
      const samplePredictions = [
        {
          id: 1,
          player: 'Stephen Curry',
          team: 'GSW',
          actual: 32.4,
          predicted: 31.8,
          accuracy: 94.2,
          confidence: 'high',
          confidenceInterval: [30.2, 33.4],
          metrics: {
            points: { actual: 32.4, predicted: 31.8, confidence: 0.92 },
            rebounds: { actual: 5.2, predicted: 5.1, confidence: 0.85 },
            assists: { actual: 6.8, predicted: 6.5, confidence: 0.88 },
            three_pointers: { actual: 6.1, predicted: 5.9, confidence: 0.95 }
          },
          aiInsights: [
            'Hot streak: Last 5 games avg 34.2 points',
            'Defensive matchup: Weak perimeter defense',
            'Usage rate: Projected at 32.4%',
            'Historical performance: 28.5 avg vs this opponent'
          ]
        },
        {
          id: 2,
          player: 'Luka Dončić',
          team: 'DAL',
          actual: 34.1,
          predicted: 33.2,
          accuracy: 91.5,
          confidence: 'high',
          confidenceInterval: [31.5, 35.8],
          metrics: {
            points: { actual: 34.1, predicted: 33.2, confidence: 0.89 },
            rebounds: { actual: 8.9, predicted: 8.5, confidence: 0.82 },
            assists: { actual: 9.3, predicted: 9.0, confidence: 0.86 },
            three_pointers: { actual: 4.2, predicted: 4.0, confidence: 0.78 }
          },
          aiInsights: [
            'Triple-double probability: 68%',
            'Home game advantage: +3.2 points avg',
            'Rest days: 2 days (optimal)',
            'Opponent defense rank: 24th in league'
          ]
        },
        {
          id: 3,
          player: 'Giannis Antetokounmpo',
          team: 'MIL',
          actual: 30.8,
          predicted: 31.5,
          accuracy: 88.7,
          confidence: 'medium',
          confidenceInterval: [28.5, 32.9],
          metrics: {
            points: { actual: 30.8, predicted: 31.5, confidence: 0.85 },
            rebounds: { actual: 11.4, predicted: 11.8, confidence: 0.79 },
            assists: { actual: 6.1, predicted: 6.3, confidence: 0.81 },
            free_throws: { actual: 68.9, predicted: 69.5, confidence: 0.72 }
          },
          aiInsights: [
            'Paint dominance: 72% of points in paint',
            'Free throw attempts: Projected 12.5',
            'Defensive matchup: Favorable (opponent lacks size)',
            'Recent form: Averaging 32/12/6 in last 10'
          ]
        },
      ];
      
      const avgAccuracy = samplePredictions.reduce((sum, p) => sum + p.accuracy, 0) / samplePredictions.length;
      
      setPredictions(samplePredictions);
      setAccuracy(avgAccuracy);
      
    } catch (error) {
      console.error('Error fetching AI predictions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPredictions();
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const prepareAccuracyChartData = () => {
    return {
      labels: predictions.map(p => p.player.split(' ')[1]),
      data: predictions.map(p => p.accuracy)
    };
  };

  const prepareModelAccuracyData = () => {
    return {
      labels: aiModels.map(m => m.name.split(' ')[0]),
      data: aiModels.map(m => m.accuracy)
    };
  };

  const runMonteCarloSimulation = () => {
    const simulationResults = [];
    for (let i = 0; i < 1000; i++) {
      const simulatedScore = 25 + Math.random() * 20; // Random score between 25-45
      simulationResults.push(simulatedScore);
    }
    
    // Calculate statistics
    const mean = simulationResults.reduce((a, b) => a + b, 0) / simulationResults.length;
    const variance = simulationResults.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / simulationResults.length;
    const stdDev = Math.sqrt(variance);
    
    setSimulationData({
      results: simulationResults.slice(0, 50), // Show first 50 for chart
      mean,
      stdDev,
      confidence95: [mean - 1.96 * stdDev, mean + 1.96 * stdDev],
      probabilityOver30: (simulationResults.filter(s => s > 30).length / simulationResults.length) * 100
    });
    setShowSimulation(true);
  };

  const renderPredictionItem = (prediction) => (
    <TouchableOpacity 
      key={prediction.id} 
      style={styles.predictionCard}
      onPress={() => Alert.alert('AI Insights', prediction.aiInsights.join('\n\n'))}
    >
      <LinearGradient
        colors={['#1e293b', '#334155']}
        style={styles.predictionHeader}
      >
        <View style={styles.playerHeader}>
          <View>
            <Text style={styles.playerName}>{prediction.player}</Text>
            <Text style={styles.teamText}>{prediction.team}</Text>
          </View>
          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyLabel}>Accuracy</Text>
            <Text style={styles.accuracyValue}>{prediction.accuracy.toFixed(1)}%</Text>
          </View>
        </View>
        
        <View style={styles.confidenceInterval}>
          <Text style={styles.intervalLabel}>95% Confidence Interval:</Text>
          <Text style={styles.intervalValue}>
            [{prediction.confidenceInterval[0].toFixed(1)} - {prediction.confidenceInterval[1].toFixed(1)}]
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.comparisonRow}>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Predicted</Text>
          <Text style={styles.comparisonValue}>{prediction.predicted}</Text>
          <ProgressBar
            progress={(prediction.metrics[selectedMetric]?.confidence || 0.85) * 100}
            height={4}
            backgroundColor="#3b82f6"
            style={{ width: 80 }}
          />
        </View>
        <View style={styles.comparisonArrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Actual</Text>
          <Text style={styles.comparisonValue}>{prediction.actual}</Text>
          <Text style={styles.actualDeviation}>
            {((prediction.actual - prediction.predicted) > 0 ? '+' : '')}
            {(prediction.actual - prediction.predicted).toFixed(1)}
          </Text>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(prediction.confidence) }]}>
          <Text style={styles.confidenceText}>
            {prediction.confidence.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {Object.entries(prediction.metrics).map(([metric, values]) => (
          <TouchableOpacity 
            key={metric} 
            style={[
              styles.metricItem,
              selectedMetric === metric && styles.selectedMetricItem
            ]}
            onPress={() => setSelectedMetric(metric)}
          >
            <Text style={styles.metricLabel}>
              {metric.replace('_', ' ').toUpperCase()}
            </Text>
            <View style={styles.metricValues}>
              <Text style={styles.metricPredicted}>{values.predicted}</Text>
              <Text style={styles.metricArrow}>→</Text>
              <Text style={styles.metricActual}>{values.actual}</Text>
            </View>
            <ProgressBar
              progress={values.confidence * 100}
              height={4}
              backgroundColor={selectedMetric === metric ? '#10b981' : '#d1d5db'}
              style={{ width: 60 }}
            />
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.insightsButton}
        onPress={() => Alert.alert('AI Insights', prediction.aiInsights.join('\n\n'))}
      >
        <Ionicons name="sparkles" size={16} color="#8b5cf6" />
        <Text style={styles.insightsButtonText}>View AI Insights</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderModelDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModelDetails}
      onRequestClose={() => setShowModelDetails(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#8b5cf6', '#7c3aed']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>AI Model Details</Text>
            <TouchableOpacity onPress={() => setShowModelDetails(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.modelInfo}>
              <Text style={styles.modelSectionTitle}>Model Architecture</Text>
              <View style={styles.architectureDiagram}>
                <View style={styles.layer}>
                  <Text style={styles.layerText}>Input Layer</Text>
                  <Text style={styles.layerDesc}>50+ features</Text>
                </View>
                <View style={styles.arrow}>↓</View>
                <View style={styles.layer}>
                  <Text style={styles.layerText}>Hidden Layers</Text>
                  <Text style={styles.layerDesc}>256 LSTM units</Text>
                </View>
                <View style={styles.arrow}>↓</View>
                <View style={styles.layer}>
                  <Text style={styles.layerText}>Output Layer</Text>
                  <Text style={styles.layerDesc}>Predictions + Confidence</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.modelInfo}>
              <Text style={styles.modelSectionTitle}>Training Data</Text>
              <View style={styles.dataStats}>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>50,000+</Text>
                  <Text style={styles.dataStatLabel}>Historical Games</Text>
                </View>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>200+</Text>
                  <Text style={styles.dataStatLabel}>Player Features</Text>
                </View>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>87.3%</Text>
                  <Text style={styles.dataStatLabel}>Test Accuracy</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.modelInfo}>
              <Text style={styles.modelSectionTitle}>Feature Importance</Text>
              <View style={styles.featureList}>
                {[
                  { feature: 'Recent Form (Last 10 games)', importance: 32 },
                  { feature: 'Matchup History', importance: 28 },
                  { feature: 'Home/Away Splits', importance: 18 },
                  { feature: 'Rest Days', importance: 12 },
                  { feature: 'Injury Reports', importance: 10 },
                ].map((item, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureName}>{item.feature}</Text>
                    <View style={styles.featureBar}>
                      <View 
                        style={[
                          styles.featureFill,
                          { width: `${item.importance}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.featureImportance}>{item.importance}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSimulationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSimulation}
      onRequestClose={() => setShowSimulation(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#0f766e', '#14b8a6']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Monte Carlo Simulation</Text>
            <TouchableOpacity onPress={() => setShowSimulation(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.modalBody}>
            {simulationData && (
              <>
                <View style={styles.simulationResults}>
                  <Text style={styles.simulationTitle}>Simulation Results</Text>
                  <View style={styles.simulationStats}>
                    <View style={styles.simStat}>
                      <Text style={styles.simStatValue}>{simulationData.mean.toFixed(1)}</Text>
                      <Text style={styles.simStatLabel}>Mean Score</Text>
                    </View>
                    <View style={styles.simStat}>
                      <Text style={styles.simStatValue}>{simulationData.stdDev.toFixed(1)}</Text>
                      <Text style={styles.simStatLabel}>Std Deviation</Text>
                    </View>
                    <View style={styles.simStat}>
                      <Text style={styles.simStatValue}>{simulationData.probabilityOver30.toFixed(1)}%</Text>
                      <Text style={styles.simStatLabel}>P(Score > 30)</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.confidenceInterval}>
                  <Text style={styles.ciTitle}>95% Confidence Interval</Text>
                  <View style={styles.ciRange}>
                    <Text style={styles.ciValue}>
                      [{simulationData.confidence95[0].toFixed(1)} - {simulationData.confidence95[1].toFixed(1)}]
                    </Text>
                  </View>
                </View>
                
                <View style={styles.probabilityDistribution}>
                  <Text style={styles.distributionTitle}>Probability Distribution</Text>
                  <Text style={styles.distributionSubtitle}>
                    68% of scores fall within {Math.round(simulationData.mean - simulationData.stdDev)}-
                    {Math.round(simulationData.mean + simulationData.stdDev)} points
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowSimulation(false)}
            >
              <Text style={styles.modalButtonText}>Close Simulation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Analyzing player patterns...</Text>
        <Text style={styles.loadingSubtext}>Running AI models</Text>
      </View>
    );
  }

  const accuracyData = prepareAccuracyChartData();
  const modelData = prepareModelAccuracyData();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#8b5cf6"
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={32} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>🤖 AI Predictions Pro</Text>
            <Text style={styles.subtitle}>Machine learning powered insights with confidence intervals</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{accuracy.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Avg Accuracy</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Confidence</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>AI Models</Text>
          </View>
        </View>
      </LinearGradient>

      {/* AI Models Overview */}
      <View style={styles.modelsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🧠 AI Models</Text>
          <TouchableOpacity onPress={() => setShowModelDetails(true)}>
            <Text style={styles.seeAll}>Details →</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {aiModels.map((model) => (
            <View key={model.id} style={styles.modelCard}>
              <View style={styles.modelHeader}>
                <Text style={styles.modelName}>{model.name}</Text>
                <CircularProgress
                  size={60}
                  progress={model.accuracy / 100}
                  color="#8b5cf6"
                  text={`${model.accuracy}%`}
                  showText={true}  // ADDED
                />
              </View>
              <View style={styles.modelStats}>
                <View style={styles.modelStat}>
                  <Ionicons name="pulse" size={14} color="#10b981" />
                  <Text style={styles.modelStatText}>{model.predictions} predictions</Text>
                </View>
                <View style={styles.modelStat}>
                  <Ionicons name="time" size={14} color="#f59e0b" />
                  <Text style={styles.modelStatText}>{model.lastUpdated}</Text>
                </View>
              </View>
              <Text style={styles.modelFeatures}>
                Features: {model.features.join(', ')}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Accuracy Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Prediction Accuracy by Player</Text>
          <TouchableOpacity onPress={runMonteCarloSimulation}>
            <Text style={styles.simulateButton}>Run Simulation</Text>
          </TouchableOpacity>
        </View>
        {accuracyData.data.length > 0 && (
          <SimpleBarChart
            data={accuracyData.data}
            labels={accuracyData.labels}
            title="Player Accuracy (%)"
            color="#8b5cf6"
            height={220}
          />
        )}
      </View>

      {/* Model Comparison Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Model Accuracy Comparison</Text>
        {modelData.data.length > 0 && (
          <SimpleBarChart
            data={modelData.data}
            labels={modelData.labels}
            title="Model Accuracy (%)"
            color="#10b981"
            height={180}
          />
        )}
      </View>

      {/* Recent Predictions */}
      <View style={styles.predictionsList}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Recent Predictions</Text>
          <Text style={styles.sectionSubtitle}>With confidence intervals</Text>
        </View>
        {predictions.map(renderPredictionItem)}
      </View>

      {/* Advanced Analytics Section */}
      <View style={styles.advancedAnalytics}>
        <Text style={styles.sectionTitle}>🔬 Advanced Analytics</Text>
        <View style={styles.analyticsGrid}>
          <TouchableOpacity 
            style={styles.analyticsCard}
            onPress={runMonteCarloSimulation}
          >
            <Ionicons name="calculator" size={24} color="#8b5cf6" />
            <Text style={styles.analyticsCardTitle}>Monte Carlo Simulation</Text>
            <Text style={styles.analyticsCardDesc}>
              Run probability simulations with 95% confidence intervals
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.analyticsCard}
            onPress={() => setShowModelDetails(true)}
          >
            <Ionicons name="git-network" size={24} color="#10b981" />
            <Text style={styles.analyticsCardTitle}>Model Architecture</Text>
            <Text style={styles.analyticsCardDesc}>
              View neural network structure and feature importance
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.performanceMetrics}>
        <Text style={styles.sectionTitle}>📈 Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>95%</Text>
            <Text style={styles.metricLabel}>Confidence Level</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>±2.3</Text>
            <Text style={styles.metricLabel}>Avg Margin of Error</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>87.3%</Text>
            <Text style={styles.metricLabel}>Model Accuracy</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>0.92</Text>
            <Text style={styles.metricLabel}>R² Score</Text>
          </View>
        </View>
      </View>

      {renderModelDetailsModal()}
      {renderSimulationModal()}
    </ScrollView>
  );
};

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
    fontSize: 16,
    color: '#64748b',
  },
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#94a3b8',
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
  modelsSection: {
    margin: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  seeAll: {
    color: '#8b5cf6',
    fontWeight: '500',
    fontSize: 14,
  },
  modelCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  modelAccuracyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  modelStats: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  modelStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  modelStatText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  modelFeatures: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  chartCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  simpleChartContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
  },
  simpleChartTitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
  },
  simpleChartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: '80%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 25,
  },
  bar: {
    width: 25,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: '600',
    marginTop: 2,
  },
  simulateButton: {
    color: '#8b5cf6',
    fontWeight: '600',
    fontSize: 14,
  },
  predictionsList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  predictionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  predictionHeader: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  teamText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  accuracyContainer: {
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  accuracyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  confidenceInterval: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 6,
  },
  intervalLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginRight: 5,
  },
  intervalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  actualDeviation: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  comparisonArrow: {
    paddingHorizontal: 10,
  },
  arrowText: {
    fontSize: 20,
    color: '#64748b',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
  },
  selectedMetricItem: {
    backgroundColor: '#e0e7ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValues: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricPredicted: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  metricArrow: {
    fontSize: 12,
    color: '#94a3b8',
  },
  metricActual: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  insightsButtonText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
    marginLeft: 6,
  },
  advancedAnalytics: {
    margin: 20,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 10,
    textAlign: 'center',
  },
  analyticsCardDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
  performanceMetrics: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
  // Modal Styles
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    backgroundColor: '#8b5cf6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modelInfo: {
    marginBottom: 25,
  },
  modelSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  architectureDiagram: {
    alignItems: 'center',
  },
  layer: {
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 5,
  },
  layerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  layerDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
  },
  arrow: {
    fontSize: 20,
    color: '#6b7280',
    marginVertical: 5,
  },
  dataStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataStat: {
    alignItems: 'center',
    flex: 1,
  },
  dataStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  dataStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
  featureList: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureName: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  featureBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  featureFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  featureImportance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    width: 40,
    textAlign: 'right',
  },
  simulationResults: {
    marginBottom: 20,
  },
  simulationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  simulationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simStat: {
    alignItems: 'center',
    flex: 1,
  },
  simStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  simStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
  },
  confidenceInterval: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  ciTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 10,
  },
  ciRange: {
    alignItems: 'center',
  },
  ciValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  probabilityDistribution: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  distributionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default AIPredictionsScreen;
