import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSportsData } from '../hooks/useSportsData';

// Import QuickAccessMenu
import QuickAccessMenu from '../components/QuickAccessMenu';

const { width } = Dimensions.get('window');

export default function HomeScreenEnhancedV2({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [showDailyPicksModal, setShowDailyPicksModal] = useState(false);

  const { 
    data: { nba = {}, nfl = {}, nhl = {}, news = {} } = {},
    isLoading: isSportsDataLoading,
    refreshAllData,
    lastUpdated
  } = useSportsData({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshAllData]);

  // Handle Settings navigation
  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  // Fix 1: Generate unique keys for game items
  const generateGameKey = (game, index, type) => {
    const gameId = game?.id || `game-${index}`;
    const homeTeam = game?.homeTeam?.name || game?.homeTeam || 'home';
    const awayTeam = game?.awayTeam?.name || game?.awayTeam || 'away';
    return `${type}-${homeTeam}-${awayTeam}-${gameId}`.replace(/\s+/g, '-');
  };

  const renderGameItem = ({ item, index }) => {
    const isLive = item.status === 'live' || item.status === 'Live';
    
    return (
      <View style={styles.gameCard}>
        <View style={styles.gameTeams}>
          <Text style={styles.teamName}>{item.awayTeam?.name || 'Away'}</Text>
          <Text style={styles.vsText}>@</Text>
          <Text style={styles.teamName}>{item.homeTeam?.name || 'Home'}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isLive ? '#d1fae5' : '#f3f4f6' }
        ]}>
          <Text style={[
            styles.gameStatus,
            { color: isLive ? '#10b981' : '#6b7280' }
          ]}>
            {isLive ? 'LIVE' : (item.status || 'UPCOMING')}
          </Text>
        </View>
        <Text style={styles.gameTime}>{item.time || '7:30 PM'}</Text>
      </View>
    );
  };

  // Fix 2: Add backgroundColor to renderNewsItem
  const renderNewsItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => navigation.navigate('News')}
    >
      <View style={styles.newsImagePlaceholder}>
        <Ionicons name="newspaper" size={32} color="#9ca3af" />
      </View>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item?.title || 'Latest Sports News'}
        </Text>
        <Text style={styles.newsSource}>
          {item?.source || 'Sports Analytics GPT'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const safeNewsItems = Array.isArray(news?.items) ? news.items : [];
  const nbaLiveGames = Array.isArray(nba.liveGames) ? nba.liveGames : [];
  const nbaGames = Array.isArray(nba.games) ? nba.games : [];
  const nflGames = Array.isArray(nfl.games) ? nfl.games : [];
  const nhlGames = Array.isArray(nhl.games) ? nhl.games : [];
  
  // Combine all games for "Live Games" section
  const allLiveGames = [...nbaLiveGames];
  
  // Combine upcoming games from all sports
  const allUpcomingGames = [...nbaGames, ...nflGames, ...nhlGames]
    .filter(game => game.status !== 'live' && game.status !== 'Live')
    .slice(0, 5);

  if (isSportsDataLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading sports data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Fixed shadow with backgroundColor */}
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="analytics" size={32} color="#fff" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Sports Analytics GPT</Text>
              <Text style={styles.headerSubtitle}>AI-Powered Sports Insights & Predictions</Text>
            </View>
          </View>
          
          {/* Settings Button in Header */}
          <TouchableOpacity 
            style={styles.headerSettingsButton}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Floating Settings Button - Common place on homepage */}
      <TouchableOpacity 
        style={styles.floatingSettingsButton}
        onPress={handleSettingsPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#6b7280', '#4b5563']}
          style={styles.floatingButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="settings" size={20} color="#fff" />
          <Text style={styles.floatingButtonText}>Settings</Text>
        </LinearGradient>
      </TouchableOpacity>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0f172a']}
            tintColor="#0f172a"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Access Menu - Already has backgroundColor */}
        <QuickAccessMenu navigation={navigation} />

        {/* Live Games - Fixed with unique keys */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔴 Live Games</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Live')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {allLiveGames.length > 0 ? (
            <FlatList
              data={allLiveGames.slice(0, 5)}
              renderItem={renderGameItem}
              keyExtractor={(item, index) => generateGameKey(item, index, 'live')}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wifi-outline" size={32} color="#d1d5db" />
              <Text style={styles.emptyText}>No live games at the moment</Text>
            </View>
          )}
        </View>

        {/* Upcoming Games - FIXED: Using unique keys */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Upcoming Games</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Live')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {allUpcomingGames.length > 0 ? (
            <FlatList
              data={allUpcomingGames}
              renderItem={renderGameItem}
              keyExtractor={(item, index) => generateGameKey(item, index, 'upcoming')}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={32} color="#d1d5db" />
              <Text style={styles.emptyText}>No upcoming games scheduled</Text>
            </View>
          )}
        </View>

        {/* News - Already has unique keys */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📰 Latest News</Text>
            <TouchableOpacity onPress={() => navigation.navigate('News')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {safeNewsItems.length > 0 ? (
            <FlatList
              data={safeNewsItems.slice(0, 5)}
              renderItem={renderNewsItem}
              keyExtractor={(item, index) => `news-${index}-${item?.title?.substring(0, 10) || 'item'}`}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={32} color="#d1d5db" />
              <Text style={styles.emptyText}>No news available</Text>
            </View>
          )}
        </View>

        {/* Stats Summary - Fixed shadow with backgroundColor */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Live Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{allLiveGames.length}</Text>
              <Text style={styles.statLabel}>Live Games</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{allUpcomingGames.length}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{safeNewsItems.length}</Text>
              <Text style={styles.statLabel}>News Items</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Sports</Text>
            </View>
          </View>
        </View>

        {/* Premium Packages - Already has background */}
        <View style={styles.premiumSection}>
          <Text style={styles.sectionTitle}>💎 Premium Packages</Text>
          <Text style={styles.premiumSubtitle}>Unlock advanced features and insights</Text>
          
          {/* Premium Access Package */}
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={() => navigation.navigate('Premium')}
          >
            <LinearGradient
              colors={['#3b82f6', '#1e40af']}
              style={styles.premiumCardGradient}
            >
              <View style={styles.premiumCardHeader}>
                <View style={styles.premiumIconContainer}>
                  <Ionicons name="trophy" size={24} color="#fff" />
                </View>
                <Text style={styles.premiumCardTitle}>Premium Access</Text>
              </View>
              <Text style={styles.premiumCardDescription}>
                Analytics, Fantasy, News, NFL & Live Games
              </Text>
              <View style={styles.premiumCardFooter}>
                <Text style={styles.premiumCardPrice}>From $5.99/week</Text>
                <View style={styles.premiumButton}>
                  <Text style={styles.premiumButtonTextPremium}>View Details</Text>
                  <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Daily Picks Package */}
          <TouchableOpacity 
            style={styles.premiumCard}
            onPress={() => setShowDailyPicksModal(true)}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.premiumCardGradient}
            >
              <View style={styles.premiumCardHeader}>
                <View style={styles.premiumIconContainer}>
                  <Ionicons name="lock-open" size={24} color="#fff" />
                </View>
                <Text style={styles.premiumCardTitle}>Daily Picks Premium</Text>
              </View>
              <Text style={styles.premiumCardDescription}>
                Premium expert picks with proven track record
              </Text>
              <View style={styles.premiumCardFooter}>
                <Text style={styles.premiumCardPrice}>From $29.99/week</Text>
                <View style={styles.premiumButton}>
                  <Text style={styles.premiumButtonTextPicks}>View Picks</Text>
                  <Ionicons name="arrow-forward" size={16} color="#8b5cf6" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Last Updated - Fixed shadow with backgroundColor */}
        {lastUpdated && (
          <View style={styles.lastUpdatedSection}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.lastUpdatedText}>
              Last updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Daily Picks Modal - Fixed shadow with backgroundColor */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDailyPicksModal}
        onRequestClose={() => setShowDailyPicksModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Ionicons name="lock-open" size={40} color="#fff" />
                <Text style={styles.modalTitle}>Daily Picks Premium</Text>
                <Text style={styles.modalSubtitle}>Premium expert picks</Text>
              </View>
            </LinearGradient>
            
            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setShowDailyPicksModal(false)}
            >
              <Ionicons name="close-outline" size={24} color="#374151" />
            </TouchableOpacity>
            
            <ScrollView style={styles.modalFeatures}>
              <View style={styles.modalFeatureItem}>
                <View style={styles.modalFeatureIcon}>
                  <Ionicons name="trophy-outline" size={24} color="#8b5cf6" />
                </View>
                <View style={styles.modalFeatureText}>
                  <Text style={styles.modalFeatureTitle}>Expert Analysis</Text>
                  <Text style={styles.modalFeatureDescription}>Hand-picked by top analysts</Text>
                </View>
              </View>
              
              <View style={styles.modalFeatureItem}>
                <View style={styles.modalFeatureIcon}>
                  <Ionicons name="trending-up-outline" size={24} color="#10b981" />
                </View>
                <View style={styles.modalFeatureText}>
                  <Text style={styles.modalFeatureTitle}>Proven Track Record</Text>
                  <Text style={styles.modalFeatureDescription}>Consistent performance</Text>
                </View>
              </View>
              
              <View style={styles.modalFeatureItem}>
                <View style={styles.modalFeatureIcon}>
                  <Ionicons name="time-outline" size={24} color="#f59e0b" />
                </View>
                <View style={styles.modalFeatureText}>
                  <Text style={styles.modalFeatureTitle}>Daily Updates</Text>
                  <Text style={styles.modalFeatureDescription}>Fresh picks every day</Text>
                </View>
              </View>
              
              <View style={styles.modalFeatureItem}>
                <View style={styles.modalFeatureIcon}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#3b82f6" />
                </View>
                <View style={styles.modalFeatureText}>
                  <Text style={styles.modalFeatureTitle}>Money-Back Guarantee</Text>
                  <Text style={styles.modalFeatureDescription}>Profit or your money back</Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalPricing}>
              <TouchableOpacity 
                style={styles.modalPremiumButton}
                onPress={() => {
                  setShowDailyPicksModal(false);
                }}
              >
                <Text style={styles.modalPremiumButtonText}>GET DAILY LOCKS - $29.99/week</Text>
                <Text style={styles.modalPremiumButtonSubtext}>Premium expert picks</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalMonthlyButton}
                onPress={() => {
                  setShowDailyPicksModal(false);
                }}
              >
                <Text style={styles.modalMonthlyButtonText}>$99.99/month (Save 15%)</Text>
              </TouchableOpacity>
              
              <Text style={styles.modalPricingNote}>Premium picks. Cancel anytime.</Text>
              
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowDailyPicksModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#0f172a',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  headerSettingsButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  floatingSettingsButton: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 100,
    width: 110,
    height: 44,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  gameCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    width: 200,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gameTeams: {
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  vsText: {
    fontSize: 12,
    color: '#6b7280',
    marginVertical: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 5,
  },
  gameStatus: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  gameTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  newsCard: {
    width: 280,
    marginRight: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  newsImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsContent: {
    padding: 15,
    backgroundColor: '#ffffff',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
    lineHeight: 20,
  },
  newsSource: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 10,
  },
  statsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
  },
  premiumSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    marginBottom: 30,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  premiumCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: '#ffffff',
  },
  premiumCardGradient: {
    padding: 24,
  },
  premiumCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  premiumCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 20,
  },
  premiumCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumCardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  premiumButtonTextPremium: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginRight: 8,
  },
  premiumButtonTextPicks: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
    marginRight: 8,
  },
  lastUpdatedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 30,
    paddingTop: 40,
    paddingBottom: 20,
  },
  modalHeaderContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeModalButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  modalFeatures: {
    padding: 20,
    maxHeight: 300,
    backgroundColor: '#ffffff',
  },
  modalFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  modalFeatureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalFeatureText: {
    flex: 1,
  },
  modalFeatureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalFeatureDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalPricing: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#ffffff',
  },
  modalPremiumButton: {
    backgroundColor: '#8b5cf6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  modalPremiumButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalPremiumButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  modalMonthlyButton: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalMonthlyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  modalPricingNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalCloseButton: {
    padding: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
});
