import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import apiService from '../services/api-service';

const { width } = Dimensions.get('window');

export default function GameDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId, gameData } = route.params || {};
  
  const [game, setGame] = useState(gameData || null);
  const [loading, setLoading] = useState(!gameData);
  const [activeTab, setActiveTab] = useState('boxscore');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!gameData && gameId) {
      fetchGameDetails();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  const fetchGameDetails = async () => {
    try {
      // This would be a real API call to get detailed game data
      // For now, we'll mock it
      const mockGameDetails = {
        id: gameId,
        homeTeam: "Los Angeles Lakers",
        awayTeam: "Golden State Warriors",
        homeScore: 108,
        awayScore: 105,
        quarter: "4th",
        timeRemaining: "2:14",
        status: "live",
        arena: "Crypto.com Arena",
        date: "2025-12-19T21:40:15.397Z",
        boxscore: {
          homeStats: [
            { player: 'LeBron James', points: 32, rebounds: 8, assists: 9 },
            { player: 'Anthony Davis', points: 28, rebounds: 12, assists: 3 },
            { player: 'Austin Reaves', points: 18, rebounds: 4, assists: 6 },
          ],
          awayStats: [
            { player: 'Stephen Curry', points: 31, rebounds: 5, assists: 7 },
            { player: 'Klay Thompson', points: 22, rebounds: 3, assists: 2 },
            { player: 'Draymond Green', points: 8, rebounds: 9, assists: 11 },
          ]
        },
        playByPlay: [
          { time: '12:00', description: 'Game starts', score: '0-0' },
          { time: '11:32', description: 'Curry 3-pointer', score: '3-0' },
          { time: '10:45', description: 'James dunk', score: '3-2' },
        ],
        teamStats: {
          home: { fg: '45%', threePt: '38%', rebounds: 42, turnovers: 12 },
          away: { fg: '43%', threePt: '40%', rebounds: 38, turnovers: 10 }
        }
      };
      
      setGame(mockGameDetails);
      setLoading(false);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching game details:', error);
      setLoading(false);
    }
  };

  const renderBoxscore = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Box Score</Text>
      
      {/* Away Team */}
      <View style={styles.teamSection}>
        <Text style={styles.teamName}>{game.awayTeam}</Text>
        <View style={styles.statsHeader}>
          <Text style={styles.statsHeaderCell}>Player</Text>
          <Text style={styles.statsHeaderCell}>PTS</Text>
          <Text style={styles.statsHeaderCell}>REB</Text>
          <Text style={styles.statsHeaderCell}>AST</Text>
        </View>
        {game.boxscore.awayStats.map((player, index) => (
          <View key={index} style={styles.playerRow}>
            <Text style={styles.playerName}>{player.player}</Text>
            <Text style={styles.playerStat}>{player.points}</Text>
            <Text style={styles.playerStat}>{player.rebounds}</Text>
            <Text style={styles.playerStat}>{player.assists}</Text>
          </View>
        ))}
      </View>

      {/* Home Team */}
      <View style={styles.teamSection}>
        <Text style={styles.teamName}>{game.homeTeam}</Text>
        <View style={styles.statsHeader}>
          <Text style={styles.statsHeaderCell}>Player</Text>
          <Text style={styles.statsHeaderCell}>PTS</Text>
          <Text style={styles.statsHeaderCell}>REB</Text>
          <Text style={styles.statsHeaderCell}>AST</Text>
        </View>
        {game.boxscore.homeStats.map((player, index) => (
          <View key={index} style={styles.playerRow}>
            <Text style={styles.playerName}>{player.player}</Text>
            <Text style={styles.playerStat}>{player.points}</Text>
            <Text style={styles.playerStat}>{player.rebounds}</Text>
            <Text style={styles.playerStat}>{player.assists}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTeamStats = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Team Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Field Goal %</Text>
          <Text style={styles.statValue}>{game.teamStats.away.fg}</Text>
          <Text style={styles.statValue}>{game.teamStats.home.fg}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>3-Point %</Text>
          <Text style={styles.statValue}>{game.teamStats.away.threePt}</Text>
          <Text style={styles.statValue}>{game.teamStats.home.threePt}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Rebounds</Text>
          <Text style={styles.statValue}>{game.teamStats.away.rebounds}</Text>
          <Text style={styles.statValue}>{game.teamStats.home.rebounds}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Turnovers</Text>
          <Text style={styles.statValue}>{game.teamStats.away.turnovers}</Text>
          <Text style={styles.statValue}>{game.teamStats.home.turnovers}</Text>
        </View>
      </View>
    </View>
  );

  const renderPlayByPlay = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Play by Play</Text>
      
      {game.playByPlay.map((play, index) => (
        <View key={index} style={styles.playItem}>
          <Text style={styles.playTime}>{play.time}</Text>
          <Text style={styles.playDescription}>{play.description}</Text>
          <Text style={styles.playScore}>{play.score}</Text>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading game details...</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>Game not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView style={styles.container}>
        {/* Game Header */}
        <View style={styles.gameHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.scoreContainer}>
            <View style={styles.teamContainer}>
              <Text style={styles.teamNameLarge}>{game.awayTeam}</Text>
              <Text style={styles.scoreLarge}>{game.awayScore}</Text>
            </View>
            
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
              <Text style={styles.gameStatus}>{game.status}</Text>
              <Text style={styles.gameTime}>{game.quarter} • {game.timeRemaining}</Text>
            </View>
            
            <View style={styles.teamContainer}>
              <Text style={styles.teamNameLarge}>{game.homeTeam}</Text>
              <Text style={styles.scoreLarge}>{game.homeScore}</Text>
            </View>
          </View>
          
          <View style={styles.gameInfo}>
            <Text style={styles.arena}>📍 {game.arena}</Text>
            <Text style={styles.date}>{new Date(game.date).toLocaleString()}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['boxscore', 'teamstats', 'playbyplay'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabButtonText,
                activeTab === tab && styles.tabButtonTextActive
              ]}>
                {tab === 'boxscore' ? 'Box Score' : 
                 tab === 'teamstats' ? 'Team Stats' : 'Play by Play'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'boxscore' && renderBoxscore()}
        {activeTab === 'teamstats' && renderTeamStats()}
        {activeTab === 'playbyplay' && renderPlayByPlay()}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gameHeader: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamNameLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreLarge: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  vsContainer: {
    alignItems: 'center',
  },
  vsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  gameStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gameTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  gameInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  arena: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: 'white',
  },
  tabContent: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  teamSection: {
    marginBottom: 25,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f7ff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  statsHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#666',
  },
  playerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerName: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  playerStat: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    flex: 2,
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  playItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playTime: {
    width: 60,
    fontSize: 14,
    color: '#666',
  },
  playDescription: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 10,
  },
  playScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
