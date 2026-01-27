import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedProgress from 'react-native-animated-progress';
import analytics from '@react-native-firebase/analytics';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const PlayerProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // FIXED: Extract ALL parameters with proper defaults
  const {
    playerId = '1',
    playerName = 'Player Name',
    playerTeam = 'Unknown Team',
    playerPosition = 'N/A',
    playerNumber = 0,
    playerAge = 25,
    playerHeight = "6'0\"",
    playerWeight = '200 lbs',
    playerStats = {},
    playerSalary = '$0',
    playerContract = 'N/A',
    playerFantasyPoints = 0,
    playerHighlights = [],
    playerTrend = 'stable',
    sport = 'NBA',
    playerEfficiency = 0,
    playerValueScore = 0,
  } = route.params || {};

  useEffect(() => {
    // Set the screen title to player's name
    navigation.setOptions({
      title: playerName,
    });

    // Log screen view analytics
    logScreenView();
  }, [playerName, navigation]);

  const logScreenView = async () => {
    try {
      await analytics().logEvent('player_profile_view', {
        player_id: playerId,
        player_name: playerName,
        team: playerTeam,
        position: playerPosition,
        sport: sport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
  };

  const getTeamColor = (team) => {
    const teamColors = {
      'Lakers': ['#552583', '#FDB927'],
      'Warriors': ['#1D428A', '#FFC72C'],
      'Bucks': ['#00471B', '#EEE1C6'],
      'Nuggets': ['#0E2240', '#FEC524'],
      'Chiefs': ['#E31837', '#FFB81C'],
      'Default': ['#1e40af', '#3b82f6'],
    };
    
    for (const [key, colors] of Object.entries(teamColors)) {
      if (team.toLowerCase().includes(key.toLowerCase())) {
        return colors;
      }
    }
    
    return teamColors.Default;
  };

  const handleTabPress = async (tab) => {
    setActiveTab(tab);
    
    try {
      await analytics().logEvent('player_profile_tab_switch', {
        player_id: playerId,
        player_name: playerName,
        from_tab: activeTab,
        to_tab: tab,
      });
    } catch (error) {
      console.log('Analytics error:', error);
    }
  };

  const handleSharePlayer = async () => {
    try {
      const shareMessage = `Check out ${playerName}'s profile on Sports App!`;
      
      const result = await Share.share({
        message: shareMessage,
        title: `${playerName} - ${playerTeam}`,
      });
      
      if (result.action === Share.sharedAction) {
        await analytics().logEvent('player_profile_share', {
          player_id: playerId,
          player_name: playerName,
          share_platform: result.activityType || 'unknown',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share player profile');
      console.log('Share error:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      // Toggle favorite logic here
      const isFavorited = true; // This should come from state/context
      
      await analytics().logEvent('player_favorite_toggle', {
        player_id: playerId,
        player_name: playerName,
        action: isFavorited ? 'remove_favorite' : 'add_favorite',
      });
      
      Alert.alert(
        isFavorited ? 'Removed from Favorites' : 'Added to Favorites',
        `${playerName} has been ${isFavorited ? 'removed from' : 'added to'} your favorites.`
      );
    } catch (error) {
      console.log('Favorite error:', error);
    }
  };

  const handleNotificationToggle = async () => {
    try {
      // Toggle notification logic here
      const notificationsEnabled = true; // This should come from state/context
      
      await analytics().logEvent('player_notification_toggle', {
        player_id: playerId,
        player_name: playerName,
        enabled: !notificationsEnabled,
      });
      
      Alert.alert(
        notificationsEnabled ? 'Notifications Disabled' : 'Notifications Enabled',
        `${notificationsEnabled ? 'You will no longer receive' : 'You will now receive'} notifications for ${playerName}.`
      );
    } catch (error) {
      console.log('Notification error:', error);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={getTeamColor(playerTeam)}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.playerImagePlaceholder}>
          <Text style={styles.playerImageText}>
            {playerPosition.includes('QB') ? '🏈' : 
             playerPosition.includes('PG') || playerPosition.includes('SG') ? '🏀' : '👤'}
          </Text>
          {playerNumber > 0 && (
            <Text style={styles.playerNumber}>#{playerNumber}</Text>
          )}
        </View>
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{playerName}</Text>
          <Text style={styles.playerTeam}>{playerTeam}</Text>
          <View style={styles.positionRow}>
            <Text style={styles.playerPosition}>{playerPosition}</Text>
            <Text style={styles.playerSeparator}>•</Text>
            <Text style={styles.playerAge}>{playerAge} years</Text>
          </View>
          <Text style={styles.playerPhysical}>
            {playerHeight} • {playerWeight}
          </Text>
        </View>
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleFavoriteToggle}
        >
          <Ionicons name="star-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleNotificationToggle}
        >
          <Ionicons name="notifications-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleSharePlayer}
        >
          <Ionicons name="share-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Player Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Team</Text>
            <Text style={styles.infoValue}>{playerTeam}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Position</Text>
            <Text style={styles.infoValue}>{playerPosition}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Number</Text>
            <Text style={styles.infoValue}>#{playerNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{playerAge}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>{playerHeight}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{playerWeight}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contract Details</Text>
        <View style={styles.contractInfo}>
          <View style={styles.contractItem}>
            <Ionicons name="cash-outline" size={20} color="#10b981" />
            <View style={styles.contractDetails}>
              <Text style={styles.contractLabel}>Annual Salary</Text>
              <Text style={styles.contractValue}>{playerSalary}</Text>
            </View>
          </View>
          <View style={styles.contractItem}>
            <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
            <View style={styles.contractDetails}>
              <Text style={styles.contractLabel}>Contract Length</Text>
              <Text style={styles.contractValue}>{playerContract}</Text>
            </View>
          </View>
        </View>
      </View>

      {playerHighlights && playerHighlights.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Highlights</Text>
          {playerHighlights.slice(0, 3).map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderStats = () => {
    const stats = playerStats || {};
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Season Statistics</Text>
          
          {sport === 'NBA' ? (
            <View style={styles.statsGrid}>
              <StatItem label="Points" value={stats.points || 0} unit="PPG" />
              <StatItem label="Rebounds" value={stats.rebounds || 0} unit="RPG" />
              <StatItem label="Assists" value={stats.assists || 0} unit="APG" />
              <StatItem label="Steals" value={stats.steals || 0} unit="SPG" />
              <StatItem label="Blocks" value={stats.blocks || 0} unit="BPG" />
              <StatItem label="FG%" value={stats.fgPercentage || 0} unit="%" />
              <StatItem label="3P%" value={stats.threePercentage || 0} unit="%" />
              <StatItem label="Games" value={stats.games || 0} unit="GP" />
            </View>
          ) : sport === 'NFL' ? (
            <View style={styles.statsGrid}>
              <StatItem label="Yards" value={stats.yards || 0} unit="YDS" />
              <StatItem label="Touchdowns" value={stats.touchdowns || 0} unit="TD" />
              <StatItem label="Interceptions" value={stats.interceptions || 0} unit="INT" />
              <StatItem label="Rating" value={stats.rating || 0} unit="RTG" />
              <StatItem label="Completion" value={stats.completion || 0} unit="%" />
              <StatItem label="Games" value={stats.games || 0} unit="GP" />
            </View>
          ) : (
            <View style={styles.noStats}>
              <Text>No statistics available for {sport}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const StatItem = ({ label, value, unit }) => (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
  );

  const renderPerformance = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance Metrics</Text>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Fantasy Value</Text>
          <View style={styles.progressContainer}>
            <AnimatedProgress
              progress={playerFantasyPoints / 60}
              height={8}
              backgroundColor="#e5e7eb"
              progressColor="#8b5cf6"
              animated={true}
              duration={1000}
              borderRadius={4}
            />
          </View>
          <Text style={styles.metricValue}>{playerFantasyPoints}/60</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Player Efficiency</Text>
          <View style={styles.progressContainer}>
            <AnimatedProgress
              progress={playerEfficiency / 50}
              height={8}
              backgroundColor="#e5e7eb"
              progressColor="#10b981"
              animated={true}
              duration={1000}
              borderRadius={4}
            />
          </View>
          <Text style={styles.metricValue}>{playerEfficiency.toFixed(1)}</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Value Score</Text>
          <View style={styles.progressContainer}>
            <AnimatedProgress
              progress={playerValueScore / 100}
              height={8}
              backgroundColor="#e5e7eb"
              progressColor="#f59e0b"
              animated={true}
              duration={1000}
              borderRadius={4}
            />
          </View>
          <Text style={styles.metricValue}>{playerValueScore}/100</Text>
        </View>
        
        <View style={styles.trendIndicator}>
          <Ionicons 
            name={playerTrend === 'up' ? 'trending-up' : playerTrend === 'down' ? 'trending-down' : 'remove'} 
            size={24} 
            color={playerTrend === 'up' ? '#10b981' : playerTrend === 'down' ? '#ef4444' : '#6b7280'} 
          />
          <Text style={styles.trendText}>
            {playerTrend === 'up' ? 'Positive Trend' : 
             playerTrend === 'down' ? 'Declining Performance' : 'Stable Performance'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {['overview', 'stats', 'performance'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => handleTabPress(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'stats': return renderStats();
      case 'performance': return renderPerformance();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading player profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView>
        {renderTabs()}
        {renderTabContent()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Player data is updated daily. Statistics are sourced from official league data.
          </Text>
        </View>
      </ScrollView>
    </View>
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
    color: '#6b7280',
    fontSize: 16,
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
  },
  playerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
  },
  playerImageText: {
    fontSize: 40,
  },
  playerNumber: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  playerTeam: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  playerPosition: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  playerSeparator: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 8,
  },
  playerAge: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  playerPhysical: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  headerButton: {
    padding: 10,
    marginLeft: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: -15,
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  contractInfo: {
    marginTop: 10,
  },
  contractItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contractDetails: {
    marginLeft: 15,
    flex: 1,
  },
  contractLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  contractValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statUnit: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  noStats: {
    padding: 30,
    alignItems: 'center',
  },
  metricItem: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#1f2937',
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

export default PlayerProfileScreen;
