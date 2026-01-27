import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { NBAService } from '../services/NBAService';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSportsData } from '../hooks/useSportsData';

const EnhancedPlayerStats = ({ playerName, season = '2024' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Option 1: Using the sports data hook (if player stats are available in the hook)
  const { 
    data: { nba },
    isLoading: isSportsDataLoading,
    refreshAllData 
  } = useSportsData({
    autoRefresh: true,
    refreshInterval: 30000
  });

  useEffect(() => {
    fetchPlayerStats();
  }, [playerName, season]);

  const fetchPlayerStats = async () => {
    if (!playerName) return;

    setLoading(true);
    try {
      // New way: with caching using NBAService
      const statsData = await NBAService.getPlayerStats(playerName, season);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch player stats:', err);
      setError('Failed to load player stats');
      // Optional: Set fallback data
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  // Alternative: If using sports data hook directly
  useEffect(() => {
    if (nba && nba.players && playerName) {
      // Find the specific player in the cached data
      const playerData = nba.players.find(player => 
        player.name.toLowerCase().includes(playerName.toLowerCase())
      );
      if (playerData) {
        setStats(playerData);
        setLoading(false);
      }
    }
  }, [nba, playerName]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading stats for {playerName}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No stats available for {playerName}</Text>
      </View>
    );
  }

  // Prepare data for the chart (example: points per game over last 10 games)
  const chartData = {
    labels: stats.last_10_games?.map((game, index) => `G${index + 1}`) || [],
    datasets: [
      {
        data: stats.last_10_games?.map(game => game.points) || [],
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ErrorBoundary 
      fallback={
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Player stats data unavailable</Text>
        </View>
      }
    >
      <View style={styles.container}>
        <Text style={styles.playerName}>{stats.name}</Text>
        <Text style={styles.playerDetails}>
          {stats.team} | {stats.position} | {season} Season
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.points || 'N/A'}</Text>
            <Text style={styles.statLabel}>PPG</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.rebounds || 'N/A'}</Text>
            <Text style={styles.statLabel}>RPG</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.assists || 'N/A'}</Text>
            <Text style={styles.statLabel}>APG</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.fg_percentage || 'N/A'}%</Text>
            <Text style={styles.statLabel}>FG%</Text>
          </View>
        </View>

        {stats.last_10_games && stats.last_10_games.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Points in Last 10 Games</Text>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#007bff',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  playerDetails: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  chartContainer: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  noDataText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default EnhancedPlayerStats;
