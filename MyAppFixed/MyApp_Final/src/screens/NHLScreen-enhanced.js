// src/screens/NHLScreen-enhanced.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSportsData } from '../hooks/useSportsData';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../contexts/SearchContext';

const { width } = Dimensions.get('window');

// Analytics helper function
const logAnalyticsEvent = async (eventName, eventParams = {}) => {
  try {
    // Always create the event data
    const eventData = {
      event: eventName,
      params: eventParams,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    };

    // Only log to console in development mode
    if (__DEV__) {
      console.log(`📊 Analytics Event: ${eventName}`, eventParams);
    }

    // Only use Firebase analytics on web in production mode
    if (Platform.OS === 'web' && !__DEV__ && typeof window !== 'undefined') {
      try {
        const firebaseApp = await import('firebase/app');
        const firebaseAnalytics = await import('firebase/analytics');
        
        let app;
        if (firebaseApp.getApps().length === 0) {
          const firebaseConfig = {
            apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCi7YQ-vawFT3sIr1i8yuhhx-1vSplAneA",
            authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "nba-fantasy-ai.firebaseapp.com",
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "nba-fantasy-ai",
            storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "nba-fantasy-ai.appspot.com",
            messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "718718403866",
            appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:718718403866:web:e26e10994d62799a048379",
            measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BLTPX9LJ7K"
          };
          
          app = firebaseApp.initializeApp(firebaseConfig);
        } else {
          app = firebaseApp.getApp();
        }
        
        const analytics = firebaseAnalytics.getAnalytics(app);
        if (analytics) {
          await firebaseAnalytics.logEvent(analytics, eventName, eventParams);
        }
      } catch (firebaseError) {
        console.warn('Firebase analytics error:', firebaseError.message);
      }
    }
    
    try {
      const existingEvents = JSON.parse(await AsyncStorage.getItem('analytics_events') || '[]');
      existingEvents.push(eventData);
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }
      await AsyncStorage.setItem('analytics_events', JSON.stringify(existingEvents));
    } catch (storageError) {
      console.warn('Could not save analytics event locally:', storageError.message);
    }
  } catch (error) {
    console.warn('Analytics event failed:', error.message);
  }
};

const NHLScreen = () => {
  const [selectedTab, setSelectedTab] = useState('games');
  const [refreshing, setRefreshing] = useState(false);
  const { searchHistory, addToSearchHistory } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);
  const [filteredStandings, setFilteredStandings] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);

  // Use sports data hook
  const { 
    data: { nhl },
    isLoading: isSportsDataLoading,
    refreshAllData
  } = useSportsData({
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Extract data from hook
  const games = nhl?.games || [];
  const standings = nhl?.standings || [];
  const players = nhl?.players || [];

  // Calculate analytics from actual data
  const [analytics, setAnalytics] = useState({
    totalGoals: 0,
    avgGoals: 0,
    powerPlay: '22%',
    penaltyKill: '85%',
  });

  useEffect(() => {
    if (games.length > 0) {
      const totalGoals = games.reduce((sum, game) => {
        const awayScore = game.awayScore || 0;
        const homeScore = game.homeScore || 0;
        return sum + awayScore + homeScore;
      }, 0);
      
      const avgGoals = games.length > 0 ? (totalGoals / games.length).toFixed(1) : 0;
      
      setAnalytics({
        totalGoals,
        avgGoals,
        powerPlay: '22%',
        penaltyKill: '85%',
      });

      // Initialize filtered data
      setFilteredGames(games);
      setFilteredStandings(standings);
      setFilteredPlayers(players);
    }
  }, [games, standings, players]);

  // Log screen load
  useEffect(() => {
    const logScreenView = async () => {
      await logAnalyticsEvent('nhl_screen_view', {
        tab: selectedTab,
        platform: Platform.OS,
        games_count: games.length,
        players_count: players.length,
      });
    };
    logScreenView();
  }, []);

  // Handle search functionality
  const handleNHLSearch = useCallback((query) => {
    setSearchQuery(query);
    addToSearchHistory(query);
    
    if (!query.trim()) {
      setFilteredGames(games);
      setFilteredStandings(standings);
      setFilteredPlayers(players);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Filter based on selected tab
    if (selectedTab === 'games') {
      const filtered = games.filter(game =>
        (game.awayTeam?.name || game.away || '').toLowerCase().includes(lowerQuery) ||
        (game.homeTeam?.name || game.home || '').toLowerCase().includes(lowerQuery) ||
        (game.status || '').toLowerCase().includes(lowerQuery)
      );
      setFilteredGames(filtered);
    } else if (selectedTab === 'standings') {
      const filtered = standings.filter(team =>
        (team.name || team.team || '').toLowerCase().includes(lowerQuery)
      );
      setFilteredStandings(filtered);
    } else if (selectedTab === 'players') {
      const filtered = players.filter(player =>
        (player.name || '').toLowerCase().includes(lowerQuery) ||
        (player.team || '').toLowerCase().includes(lowerQuery) ||
        (player.position || '').toLowerCase().includes(lowerQuery)
      );
      setFilteredPlayers(filtered);
    }
  }, [games, standings, players, selectedTab, addToSearchHistory]);

  // Update filtered data when tab changes
  useEffect(() => {
    if (searchQuery.trim()) {
      // Re-filter when tab changes with existing query
      const lowerQuery = searchQuery.toLowerCase();
      
      if (selectedTab === 'games') {
        const filtered = games.filter(game =>
          (game.awayTeam?.name || game.away || '').toLowerCase().includes(lowerQuery) ||
          (game.homeTeam?.name || game.home || '').toLowerCase().includes(lowerQuery) ||
          (game.status || '').toLowerCase().includes(lowerQuery)
        );
        setFilteredGames(filtered);
      } else if (selectedTab === 'standings') {
        const filtered = standings.filter(team =>
          (team.name || team.team || '').toLowerCase().includes(lowerQuery)
        );
        setFilteredStandings(filtered);
      } else if (selectedTab === 'players') {
        const filtered = players.filter(player =>
          (player.name || '').toLowerCase().includes(lowerQuery) ||
          (player.team || '').toLowerCase().includes(lowerQuery) ||
          (player.position || '').toLowerCase().includes(lowerQuery)
        );
        setFilteredPlayers(filtered);
      }
    } else {
      // Reset to all data if no query
      setFilteredGames(games);
      setFilteredStandings(standings);
      setFilteredPlayers(players);
    }
  }, [selectedTab, searchQuery, games, standings, players]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAllData();
    
    await logAnalyticsEvent('nhl_data_refresh', {
      tab: selectedTab,
      search_query: searchQuery,
    });
    
    setRefreshing(false);
  };

  // Handle tab change with analytics
  const handleTabChange = async (tab) => {
    const previousTab = selectedTab;
    setSelectedTab(tab);
    
    await logAnalyticsEvent('nhl_tab_change', {
      from_tab: previousTab,
      to_tab: tab,
    });
  };

  // Define tabs for the header
  const tabs = ['games', 'standings', 'players'];

  const renderHeader = () => (
    <LinearGradient
      colors={['#0ea5e9', '#0369a1']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.title}>NHL Analytics Center</Text>
        <Text style={styles.subtitle}>Ice-cold stats & real-time tracking</Text>
      </View>
      
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab
            ]}
            onPress={() => handleTabChange(tab)}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <View style={styles.searchSection}>
      <SearchBar
        placeholder={`Search ${selectedTab}...`}
        onSearch={handleNHLSearch}
        searchHistory={searchHistory}
        style={styles.homeSearchBar}
      />
      
      {searchQuery.trim() && (
        <View style={styles.searchResultsInfo}>
          <Text style={styles.searchResultsText}>
            {(() => {
              if (selectedTab === 'games') return `${filteredGames.length} of ${games.length} games match "${searchQuery}"`;
              if (selectedTab === 'standings') return `${filteredStandings.length} of ${standings.length} teams match "${searchQuery}"`;
              if (selectedTab === 'players') return `${filteredPlayers.length} of ${players.length} players match "${searchQuery}"`;
              return '';
            })()}
          </Text>
          <TouchableOpacity 
            onPress={() => {
              setSearchQuery('');
              handleNHLSearch('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.analyticsTitle}>Key Metrics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="flame" size={20} color="#ef4444" />
          <Text style={styles.metricValue}>{analytics.avgGoals || 0}</Text>
          <Text style={styles.metricLabel}>Avg Goals/Game</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="flash" size={20} color="#f59e0b" />
          <Text style={styles.metricValue}>{analytics.powerPlay}</Text>
          <Text style={styles.metricLabel}>Power Play %</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="shield" size={20} color="#10b981" />
          <Text style={styles.metricValue}>{analytics.penaltyKill}</Text>
          <Text style={styles.metricLabel}>Penalty Kill %</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="stats-chart" size={20} color="#3b82f6" />
          <Text style={styles.metricValue}>{filteredGames.length}</Text>
          <Text style={styles.metricLabel}>Games Tracked</Text>
        </View>
      </View>
    </View>
  );

  const renderGames = () => {
    const gamesToRender = searchQuery.trim() ? filteredGames : games.slice(0, 5);
    
    if (gamesToRender.length === 0) {
      return (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : "Today's Matchups"}
          </Text>
          <View style={styles.emptyData}>
            <Ionicons name="snow" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No games found' : 'No NHL games scheduled'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim() 
                ? 'Try a different search term'
                : 'Check back soon for upcoming NHL games'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>
          {searchQuery.trim() ? 'Search Results' : "Today's Matchups"} ({gamesToRender.length})
        </Text>
        {gamesToRender.map((game, index) => {
          // Safely extract game data
          const awayTeam = game.awayTeam?.name || game.away || 'Away';
          const homeTeam = game.homeTeam?.name || game.home || 'Home';
          const awayScore = game.awayScore || 0;
          const homeScore = game.homeScore || 0;
          const status = game.status || 'scheduled';
          const time = game.time || game.startTime || 'TBD';
          
          return (
            <View key={index} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamAbbrev}>{awayTeam.substring(0, 3).toUpperCase()}</Text>
                  <Text style={styles.teamName}>{awayTeam}</Text>
                  {status === 'final' && <Text style={styles.scoreText}>{awayScore}</Text>}
                </View>
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>@</Text>
                  <Text style={styles.gameTime}>{time}</Text>
                  <Text style={styles.gameStatus}>{status}</Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamAbbrev}>{homeTeam.substring(0, 3).toUpperCase()}</Text>
                  <Text style={styles.teamName}>{homeTeam}</Text>
                  {status === 'final' && <Text style={styles.scoreText}>{homeScore}</Text>}
                </View>
              </View>
              <View style={styles.gameStatusBar}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: status === 'live' ? '#10b981' : status === 'final' ? '#3b82f6' : '#6b7280' }
                ]} />
                <Text style={styles.statusText}>
                  {status === 'live' ? 'Live Now' : status === 'final' ? 'Final' : `Puck Drop: ${time}`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderStandings = () => {
    const standingsToRender = searchQuery.trim() ? filteredStandings : standings.slice(0, 8);
    
    if (standingsToRender.length === 0) {
      return (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'Division Leaders'}
          </Text>
          <View style={styles.emptyData}>
            <Ionicons name="trophy" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No teams found' : 'No standings data'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? 'Try a different search term'
                : 'NHL standings will be updated soon'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>
          {searchQuery.trim() ? 'Search Results' : 'Division Leaders'} ({standingsToRender.length})
        </Text>
        <View style={styles.standingsHeader}>
          <Text style={styles.standingsCol}>Team</Text>
          <Text style={styles.standingsCol}>GP</Text>
          <Text style={styles.standingsCol}>W</Text>
          <Text style={styles.standingsCol}>PTS</Text>
        </View>
        {standingsToRender.map((team, index) => (
          <View key={index} style={styles.standingsRow}>
            <View style={styles.teamCell}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <Text style={styles.teamNameCell}>{team.name || team.team || `Team ${index + 1}`}</Text>
            </View>
            <Text style={styles.standingsCell}>{team.gamesPlayed || team.gp || 0}</Text>
            <Text style={styles.standingsCell}>{team.wins || 0}</Text>
            <Text style={[styles.standingsCell, styles.pointsCell]}>{team.points || 0}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPlayers = () => {
    const playersToRender = searchQuery.trim() ? filteredPlayers : players.slice(0, 5);
    
    if (playersToRender.length === 0) {
      return (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'Top Performers'}
          </Text>
          <View style={styles.emptyData}>
            <Ionicons name="person" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No players found' : 'No player data'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? 'Try a different search term'
                : 'Player statistics will be updated soon'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>
          {searchQuery.trim() ? 'Search Results' : 'Top Performers'} ({playersToRender.length})
        </Text>
        {playersToRender.map((player, index) => (
          <View key={index} style={styles.playerCard}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name || `Player ${index + 1}`}</Text>
              <Text style={styles.playerTeam}>
                {player.team || ''} • {player.position || ''}
              </Text>
            </View>
            <View style={styles.playerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>GP</Text>
                <Text style={styles.statValue}>{player.gamesPlayed || player.gp || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>G</Text>
                <Text style={styles.statValue}>{player.goals || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>A</Text>
                <Text style={styles.statValue}>{player.assists || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>PTS</Text>
                <Text style={styles.statValue}>{player.points || 0}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (isSportsDataLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading NHL Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderSearchBar()}
        {renderAnalytics()}
        
        {selectedTab === 'games' && renderGames()}
        {selectedTab === 'standings' && renderStandings()}
        {selectedTab === 'players' && renderPlayers()}
        
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>NHL Insights</Text>
          <View style={styles.insightCard}>
            <Ionicons name="snow" size={24} color="#0ea5e9" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Search Capabilities</Text>
              <Text style={styles.insightText}>
                Use the search bar to find specific games, teams, or players across all NHL data
              </Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <Ionicons name="trending-up" size={24} color="#10b981" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Live Updates</Text>
              <Text style={styles.insightText}>
                Game scores and player stats update automatically every 30 seconds
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  searchSection: {
    marginTop: 16,
  },
  homeSearchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  searchResultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchResultsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  clearSearchText: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  analyticsContainer: {
    margin: 15,
    marginTop: 20,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  analyticsGrid: {
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
  contentSection: {
    backgroundColor: 'white',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  emptyData: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 5,
  },
  gameCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamInfo: {
    alignItems: 'center',
    flex: 1,
  },
  teamAbbrev: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  teamName: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginTop: 4,
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  vsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  gameTime: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  gameStatus: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  gameStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  standingsHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 10,
  },
  standingsCol: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  standingsRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  teamCell: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 10,
  },
  teamNameCell: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  standingsCell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  pointsCell: {
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  playerCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  playerInfo: {
    marginBottom: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  playerTeam: {
    fontSize: 12,
    color: '#6b7280',
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  insightsSection: {
    margin: 15,
    marginTop: 10,
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightContent: {
    flex: 1,
    marginLeft: 10,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  insightText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 16,
  },
});

export default NHLScreen;
