// src/screens/NFLScreen-enhanced.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// REMOVED: import * as Progress from 'react-native-progress';
import apiService from '../services/api-service';

const { width } = Dimensions.get('window');

// Custom Progress Bar component to replace react-native-progress
const CustomProgressBar = ({ 
  progress, 
  width: barWidth = 200, 
  height = 10, 
  color = '#f59e0b',
  unfilledColor = '#e5e7eb',
  borderRadius = 5
}) => {
  return (
    <View style={[styles.customProgressBar, { 
      width: barWidth, 
      height, 
      backgroundColor: unfilledColor,
      borderRadius 
    }]}>
      <View 
        style={[styles.customProgressBarFill, { 
          width: `${progress * 100}%`, 
          height: '100%', 
          backgroundColor: color,
          borderRadius 
        }]} 
      />
    </View>
  );
};

const NFLScreen = () => {
  const [games, setGames] = useState([]);
  const [standings, setStandings] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('games');
  const [analytics, setAnalytics] = useState({
    totalGames: 0,
    avgPoints: 0,
    passingYards: '265',
    rushingYards: '112',
    playoffRace: '12 teams',
    injuryReports: 8,
  });
  const [depthChartData, setDepthChartData] = useState(null);
  const [fantasyData, setFantasyData] = useState([]);
  const [socialComments, setSocialComments] = useState([]);
  const [showDepthChart, setShowDepthChart] = useState(false);
  const [showFantasy, setShowFantasy] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('Kansas City Chiefs');
  const [liveScores, setLiveScores] = useState([]);
  const [statsLeaders, setStatsLeaders] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  const teams = [
    'Kansas City Chiefs', 'Philadelphia Eagles', 'San Francisco 49ers',
    'Buffalo Bills', 'Dallas Cowboys', 'Baltimore Ravens',
    'Miami Dolphins', 'Detroit Lions', 'Los Angeles Rams'
  ];

  const loadData = async () => {
    try {
      console.log('🏈 Loading enhanced NFL data...');
      setLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        const mockGames = [
          { id: 1, away: 'KC', awayScore: 28, home: 'LV', homeScore: 17, time: 'FINAL', tv: 'CBS', quarter: 'F', spread: 'KC -7.5' },
          { id: 2, away: 'PHI', awayScore: 31, home: 'DAL', homeScore: 28, time: 'FINAL', tv: 'FOX', quarter: 'F', spread: 'PHI -2.5' },
          { id: 3, away: 'SF', awayScore: 24, home: 'SEA', homeScore: 21, time: 'FINAL', tv: 'NBC', quarter: 'F', spread: 'SF -6.5' },
          { id: 4, away: 'BUF', awayScore: '34', home: 'NE', homeScore: '10', time: '4:25 PM', tv: 'CBS', quarter: '4Q', spread: 'BUF -10.5' },
          { id: 5, away: 'MIA', awayScore: '38', home: 'NYJ', homeScore: '17', time: '8:20 PM', tv: 'NBC', quarter: '3Q', spread: 'MIA -8.5' },
        ];

        const mockStandings = [
          { id: 1, name: 'Philadelphia Eagles', wins: 13, losses: 4, ties: 0, points: 436, conference: 'NFC', division: 'East' },
          { id: 2, name: 'Kansas City Chiefs', wins: 12, losses: 5, ties: 0, points: 428, conference: 'AFC', division: 'West' },
          { id: 3, name: 'San Francisco 49ers', wins: 12, losses: 5, ties: 0, points: 422, conference: 'NFC', division: 'West' },
          { id: 4, name: 'Buffalo Bills', wins: 11, losses: 6, ties: 0, points: 418, conference: 'AFC', division: 'East' },
          { id: 5, name: 'Dallas Cowboys', wins: 11, losses: 6, ties: 0, points: 408, conference: 'NFC', division: 'East' },
          { id: 6, name: 'Baltimore Ravens', wins: 10, losses: 7, ties: 0, points: 398, conference: 'AFC', division: 'North' },
          { id: 7, name: 'Miami Dolphins', wins: 10, losses: 7, ties: 0, points: 395, conference: 'AFC', division: 'East' },
          { id: 8, name: 'Detroit Lions', wins: 9, losses: 8, ties: 0, points: 392, conference: 'NFC', division: 'North' },
        ];

        const mockNews = [
          { id: 1, title: 'Mahomes Sets Record in Chiefs Win', source: 'ESPN', time: '2h ago' },
          { id: 2, title: 'Playoff Picture: Week 17 Analysis', source: 'NFL Network', time: '4h ago' },
          { id: 3, title: 'Injury Report: Key Players Out', source: 'CBS Sports', time: '6h ago' },
        ];

        const mockStatsLeaders = [
          { id: 1, name: 'Patrick Mahomes', stat: '4,183', label: 'Passing Yards', team: 'KC', rank: 1 },
          { id: 2, name: 'Christian McCaffrey', stat: '1,459', label: 'Rushing Yards', team: 'SF', rank: 1 },
          { id: 3, name: 'Tyreek Hill', stat: '1,717', label: 'Receiving Yards', team: 'MIA', rank: 1 },
          { id: 4, name: 'Myles Garrett', stat: '14.0', label: 'Sacks', team: 'CLE', rank: 1 },
          { id: 5, name: 'DaRon Bland', stat: '8', label: 'Interceptions', team: 'DAL', rank: 1 },
        ];

        const liveScoresData = [
          { id: 1, teams: 'BUF vs NE', score: '34-10', time: '4Q 2:15', status: 'LIVE' },
          { id: 2, teams: 'MIA vs NYJ', score: '38-17', time: '3Q 8:45', status: 'LIVE' },
        ];

        const avgPoints = mockGames.length > 0 ? 
          (mockGames.reduce((sum, game) => sum + (parseInt(game.awayScore) || 0) + (parseInt(game.homeScore) || 0), 0) / mockGames.length).toFixed(1) : 0;

        setGames(mockGames);
        setStandings(mockStandings);
        setNews(mockNews);
        setStatsLeaders(mockStatsLeaders);
        setLiveScores(liveScoresData);
        setAnalytics(prev => ({
          ...prev,
          totalGames: mockGames.length,
          avgPoints,
        }));

        loadDepthChartData();
        loadFantasyData();
        loadSocialComments();
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        setLoading(false);
        setRefreshing(false);
      }, 1500);
      
    } catch (error) {
      console.log('Error loading NFL data:', error.message);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDepthChartData = () => {
    const depthChart = {
      team: 'Kansas City Chiefs',
      offense: {
        QB: ['Patrick Mahomes', 'Blaine Gabbert', 'Shane Buechele'],
        RB: ['Isiah Pacheco', 'Clyde Edwards-Helaire', 'Jerick McKinnon'],
        WR: ['Travis Kelce (TE)', 'Rashee Rice', 'Skyy Moore', 'Kadarius Toney', 'Marquez Valdes-Scantling'],
        OL: ['Donovan Smith (LT)', 'Joe Thuney (LG)', 'Creed Humphrey (C)', 'Trey Smith (RG)', 'Jawaan Taylor (RT)'],
      },
      defense: {
        DL: ['Chris Jones', 'George Karlaftis', 'Mike Danna', 'Charles Omenihu'],
        LB: ['Nick Bolton', 'Willie Gay Jr.', 'Leo Chenal', 'Drue Tranquill'],
        DB: ["L'Jarius Sneed", "Trent McDuffie", "Justin Reid", "Bryan Cook", "Mike Edwards"],
      },
      specialTeams: {
        K: 'Harrison Butker',
        P: 'Tommy Townsend',
        KR: 'Richie James',
        PR: 'Kadarius Toney',
        LS: 'James Winchester',
      },
      injuries: ['Creed Humphrey (Questionable)', 'L\'Jarius Sneed (Probable)'],
    };
    setDepthChartData(depthChart);
  };

  const loadFantasyData = () => {
    const fantasyPlayers = [
      {
        id: 1,
        name: 'Patrick Mahomes',
        position: 'QB',
        team: 'KC',
        fantasyPoints: 24.8,
        rank: 1,
        matchup: 'vs LV',
        projected: 25.2,
        status: 'Must Start',
        trend: 'up',
        value: 95,
      },
      {
        id: 2,
        name: 'Christian McCaffrey',
        position: 'RB',
        team: 'SF',
        fantasyPoints: 22.4,
        rank: 1,
        matchup: '@ SEA',
        projected: 21.8,
        status: 'Elite',
        trend: 'stable',
        value: 98,
      },
      {
        id: 3,
        name: 'Tyreek Hill',
        position: 'WR',
        team: 'MIA',
        fantasyPoints: 20.7,
        rank: 1,
        matchup: 'vs NE',
        projected: 19.5,
        status: 'Must Start',
        trend: 'up',
        value: 97,
      },
      {
        id: 4,
        name: 'Travis Kelce',
        position: 'TE',
        team: 'KC',
        fantasyPoints: 18.9,
        rank: 1,
        matchup: 'vs LV',
        projected: 17.8,
        status: 'Elite',
        trend: 'stable',
        value: 96,
      },
      {
        id: 5,
        name: 'Justin Jefferson',
        position: 'WR',
        team: 'MIN',
        fantasyPoints: 19.2,
        rank: 2,
        matchup: '@ GB',
        projected: 18.5,
        status: 'Must Start',
        trend: 'up',
        value: 94,
      },
      {
        id: 6,
        name: 'Jalen Hurts',
        position: 'QB',
        team: 'PHI',
        fantasyPoints: 23.5,
        rank: 2,
        matchup: 'vs DAL',
        projected: 24.1,
        status: 'Must Start',
        trend: 'up',
        value: 93,
      },
    ];
    setFantasyData(fantasyPlayers);
  };

  const loadSocialComments = () => {
    const comments = [
      {
        id: 1,
        user: 'NFLFan42',
        avatar: '👤',
        text: 'Chiefs defense looking strong this season! Chris Jones is a monster.',
        likes: 24,
        time: '2h ago',
        replies: 3,
        verified: true,
      },
      {
        id: 2,
        user: 'FootballExpert',
        avatar: '🧠',
        text: 'Mahomes MVP season incoming with these weapons. That connection with Kelce is unstoppable.',
        likes: 18,
        time: '4h ago',
        replies: 2,
        verified: true,
      },
      {
        id: 3,
        user: 'FantasyGuru',
        avatar: '🏆',
        text: 'McCaffrey is carrying my fantasy team right now. 30+ points every week!',
        likes: 32,
        time: '6h ago',
        replies: 5,
        verified: false,
      },
      {
        id: 4,
        user: 'RavensFan',
        avatar: '🦅',
        text: 'Lamar Jackson back to his MVP form. Ravens looking dangerous for playoffs!',
        likes: 15,
        time: '1h ago',
        replies: 1,
        verified: false,
      },
    ];
    setSocialComments(comments);
  };

  const addComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: socialComments.length + 1,
        user: 'You',
        avatar: '🌟',
        text: newComment,
        likes: 0,
        time: 'Just now',
        replies: 0,
        verified: false,
      };
      setSocialComments([newCommentObj, ...socialComments]);
      setNewComment('');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#0c4a6e', '#0369a1']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>NFL Gridiron Analytics</Text>
            <Text style={styles.subtitle}>Real-time stats, scores & team analysis</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        
        <View style={styles.viewTabs}>
          {['games', 'standings', 'depth', 'fantasy', 'social', 'stats'].map((view) => (
            <TouchableOpacity
              key={view}
              style={[
                styles.viewTab,
                selectedView === view && styles.activeViewTab
              ]}
              onPress={() => setSelectedView(view)}
            >
              <Ionicons 
                name={
                  view === 'games' ? 'football' :
                  view === 'standings' ? 'trophy' :
                  view === 'depth' ? 'people' :
                  view === 'fantasy' ? 'stats-chart' :
                  view === 'social' ? 'chatbubbles' :
                  'analytics'
                } 
                size={16} 
                color={selectedView === view ? 'white' : 'rgba(255,255,255,0.7)'} 
                style={styles.viewTabIcon}
              />
              <Text style={[
                styles.viewTabText,
                selectedView === view && styles.activeViewTabText
              ]}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );

  const renderAnalytics = () => (
    <Animated.View style={[styles.analyticsContainer, { opacity: fadeAnim }]}>
      <Text style={styles.analyticsTitle}>League Metrics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="football-outline" size={20} color="#f59e0b" />
          <Text style={styles.metricValue}>{analytics.totalGames}</Text>
          <Text style={styles.metricLabel}>Games Today</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="stats-chart-outline" size={20} color="#3b82f6" />
          <Text style={styles.metricValue}>{analytics.avgPoints}</Text>
          <Text style={styles.metricLabel}>Avg Points</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="trending-up-outline" size={20} color="#10b981" />
          <Text style={styles.metricValue}>{analytics.passingYards}</Text>
          <Text style={styles.metricLabel}>Pass Yds/G</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="pulse-outline" size={20} color="#ef4444" />
          <Text style={styles.metricValue}>{analytics.injuryReports}</Text>
          <Text style={styles.metricLabel}>Injuries</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderLiveScores = () => (
    <View style={styles.liveScoresContainer}>
      <View style={styles.liveScoresHeader}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveIndicatorDot} />
          <Text style={styles.liveIndicatorText}>Live Scores</Text>
        </View>
        <Text style={styles.liveScoresTime}>Last Updated: Now</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {liveScores.map((score) => (
          <View key={score.id} style={styles.liveScoreCard}>
            <Text style={styles.liveScoreTeams}>{score.teams}</Text>
            <Text style={styles.liveScore}>{score.score}</Text>
            <View style={[
              styles.liveStatusBadge,
              score.status === 'LIVE' && styles.liveStatusActive
            ]}>
              <Text style={styles.liveStatusText}>{score.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderGames = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Today's Matchups</Text>
      
      {liveScores.length > 0 && (
        <View style={styles.liveSection}>
          {renderLiveScores()}
        </View>
      )}
      
      {games.map((game, index) => (
        <TouchableOpacity key={game.id} style={styles.gameCard}>
          <View style={styles.gameTeams}>
            <View style={styles.teamInfo}>
              <Text style={styles.teamAbbrev}>{game.away}</Text>
              <Text style={styles.teamType}>Away</Text>
            </View>
            <View style={styles.gameCenter}>
              <View style={[
                styles.gameStatusBadge,
                game.time === 'FINAL' && styles.gameStatusFinal,
                game.quarter && game.quarter.includes('Q') && styles.gameStatusLive
              ]}>
                <Text style={styles.gameStatusText}>
                  {game.time === 'FINAL' ? 'FINAL' : game.quarter || game.time}
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={[
                  styles.score,
                  (parseInt(game.awayScore) > parseInt(game.homeScore)) && styles.winningScore
                ]}>{game.awayScore}</Text>
                <Text style={styles.scoreDivider}>-</Text>
                <Text style={[
                  styles.score,
                  (parseInt(game.homeScore) > parseInt(game.awayScore)) && styles.winningScore
                ]}>{game.homeScore}</Text>
              </View>
              <Text style={styles.gameSpread}>{game.spread}</Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamAbbrev}>{game.home}</Text>
              <Text style={styles.teamType}>Home</Text>
            </View>
          </View>
          <View style={styles.gameFooter}>
            <View style={styles.gameChannel}>
              <Ionicons name="tv-outline" size={12} color="#6b7280" />
              <Text style={styles.gameChannelText}>{game.tv}</Text>
            </View>
            <TouchableOpacity style={styles.gameStatsButton}>
              <Text style={styles.gameStatsText}>View Stats →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStandings = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>League Standings</Text>
        <View style={styles.conferenceTabs}>
          <TouchableOpacity style={[styles.conferenceTab, styles.conferenceTabActive]}>
            <Text style={styles.conferenceTabText}>AFC</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.conferenceTab}>
            <Text style={styles.conferenceTabText}>NFC</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.standingsContainer}>
        <View style={styles.standingsHeader}>
          <Text style={[styles.standingsCol, { flex: 2 }]}>Team</Text>
          <Text style={styles.standingsCol}>W</Text>
          <Text style={styles.standingsCol}>L</Text>
          <Text style={styles.standingsCol}>T</Text>
          <Text style={[styles.standingsCol, { color: '#0ea5e9' }]}>PCT</Text>
          <Text style={[styles.standingsCol, { color: '#10b981' }]}>PTS</Text>
        </View>
        
        {standings.map((team, index) => (
          <TouchableOpacity key={team.id} style={styles.standingsRow}>
            <View style={[styles.standingsCell, { flex: 2 }]}>
              <View style={styles.teamRankBadge}>
                <Text style={[
                  styles.teamRank,
                  index < 4 && styles.topTeamRank
                ]}>
                  #{index + 1}
                </Text>
              </View>
              <View style={styles.teamNameContainer}>
                <Text style={styles.teamNameCell}>{team.name}</Text>
                <Text style={styles.teamConference}>{team.conference} • {team.division}</Text>
              </View>
            </View>
            <Text style={[styles.standingsCell, styles.winCell]}>{team.wins || 0}</Text>
            <Text style={[styles.standingsCell, styles.lossCell]}>{team.losses || 0}</Text>
            <Text style={styles.standingsCell}>{team.ties || 0}</Text>
            <Text style={[styles.standingsCell, styles.pctCell]}>
              {(() => {
                const totalGames = (team.wins || 0) + (team.losses || 0) + (team.ties || 0);
                if (totalGames === 0) return "0.000";
                const winPercentage = (team.wins || 0) / totalGames;
                return winPercentage.toFixed(3);
              })()}
            </Text>
            <Text style={[styles.standingsCell, styles.pointsCell]}>{team.points || 0}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.playoffIndicator}>
        <View style={styles.playoffMarker}>
          <View style={styles.playoffDot} />
          <Text style={styles.playoffText}>Playoff Position</Text>
        </View>
        <Text style={styles.playoffNote}>Top 7 in each conference</Text>
      </View>
    </View>
  );

  const renderStatsLeaders = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Stat Leaders</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>All Stats →</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        {statsLeaders.map((leader) => (
          <View key={leader.id} style={styles.leaderCard}>
            <View style={styles.leaderHeader}>
              <View style={styles.leaderRank}>
                <Text style={styles.leaderRankNumber}>#{leader.rank}</Text>
              </View>
              <View style={styles.leaderBadge}>
                <Text style={styles.leaderBadgeText}>LEADER</Text>
              </View>
            </View>
            <Text style={styles.leaderName}>{leader.name}</Text>
            <Text style={styles.leaderStat}>{leader.stat}</Text>
            <Text style={styles.leaderLabel}>{leader.label}</Text>
            <View style={styles.leaderTeam}>
              <Text style={styles.leaderTeamText}>{leader.team}</Text>
            </View>
            <View style={styles.leaderProgress}>
              {/* Replaced Progress.Bar with CustomProgressBar */}
              <CustomProgressBar 
                progress={0.85 + (Math.random() * 0.1)}
                width={120}
                height={4}
                color={leader.rank === 1 ? '#f59e0b' : '#3b82f6'}
                unfilledColor="#e5e7eb"
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderDepthChart = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Team Depth Chart</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => setShowDepthChart(true)}
        >
          <Text style={styles.viewAllText}>Full Chart →</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.teamSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {teams.map((team) => (
            <TouchableOpacity
              key={team}
              style={[
                styles.teamOption,
                selectedTeam === team && styles.teamOptionActive
              ]}
              onPress={() => setSelectedTeam(team)}
            >
              <Text style={[
                styles.teamOptionText,
                selectedTeam === team && styles.teamOptionTextActive
              ]}>
                {team.split(' ').pop()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {depthChartData && (
        <View style={styles.depthChartPreview}>
          <View style={styles.depthChartTeam}>
            <Text style={styles.depthChartTeamName}>{selectedTeam}</Text>
            <View style={styles.teamRecord}>
              <Text style={styles.teamRecordText}>12-5 • 1st in AFC West</Text>
            </View>
          </View>
          
          <View style={styles.depthChartSections}>
            <View style={styles.depthChartSection}>
              <Text style={styles.depthChartSectionTitle}>Offense</Text>
              <View style={styles.depthChartPosition}>
                <Text style={styles.positionLabel}>QB:</Text>
                <View style={styles.playerList}>
                  <View style={styles.starterContainer}>
                    <Text style={styles.starterPlayer}>Patrick Mahomes</Text>
                    <View style={styles.starterTag}>STARTER</View>
                  </View>
                  <Text style={styles.backupPlayer}>Blaine Gabbert</Text>
                </View>
              </View>
              <View style={styles.depthChartPosition}>
                <Text style={styles.positionLabel}>RB:</Text>
                <View style={styles.playerList}>
                  <View style={styles.starterContainer}>
                    <Text style={styles.starterPlayer}>Isiah Pacheco</Text>
                    <View style={styles.starterTag}>STARTER</View>
                  </View>
                  <Text style={styles.backupPlayer}>Clyde Edwards-Helaire</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.depthChartSection}>
              <Text style={styles.depthChartSectionTitle}>Defense</Text>
              <View style={styles.depthChartPosition}>
                <Text style={styles.positionLabel}>DL:</Text>
                <View style={styles.playerList}>
                  <View style={styles.starterContainer}>
                    <Text style={styles.starterPlayer}>Chris Jones</Text>
                    <View style={styles.starterTag}>STARTER</View>
                  </View>
                  <Text style={styles.backupPlayer}>George Karlaftis</Text>
                </View>
              </View>
            </View>
          </View>
          
          {depthChartData.injuries && depthChartData.injuries.length > 0 && (
            <View style={styles.injuryReport}>
              <Text style={styles.injuryTitle}>Injury Report</Text>
              {depthChartData.injuries.map((injury, index) => (
                <Text key={index} style={styles.injuryText}>• {injury}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderFantasyIntegration = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fantasy Football</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => setShowFantasy(true)}
        >
          <Text style={styles.viewAllText}>All Players →</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.fantasySubtitle}>Top Fantasy Performers</Text>
      
      <View style={styles.fantasyGrid}>
        {fantasyData.slice(0, 3).map((player) => (
          <TouchableOpacity key={player.id} style={styles.fantasyCard}>
            <View style={styles.fantasyHeader}>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerPosition}>{player.position} • {player.team} • {player.matchup}</Text>
              </View>
              <View style={[
                styles.fantasyRank,
                { backgroundColor: player.rank <= 3 ? '#fef3c7' : '#f1f5f9' }
              ]}>
                <Text style={[
                  styles.fantasyRankText,
                  { color: player.rank <= 3 ? '#92400e' : '#6b7280' }
                ]}>
                  #{player.rank}
                </Text>
              </View>
            </View>
            
            <View style={styles.fantasyStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>FPTS</Text>
                <Text style={styles.statValue}>{player.fantasyPoints}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>PROJ</Text>
                <Text style={styles.statValue}>{player.projected}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>VALUE</Text>
                <Text style={styles.statValue}>{player.value}/100</Text>
              </View>
            </View>
            
            <View style={styles.fantasyStatus}>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: player.status === 'Must Start' ? '#d1fae5' : 
                                  player.status === 'Elite' ? '#fef3c7' : '#f1f5f9'
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { 
                    color: player.status === 'Must Start' ? '#065f46' : 
                           player.status === 'Elite' ? '#92400e' : '#6b7280'
                  }
                ]}>
                  {player.status}
                </Text>
              </View>
              <Ionicons 
                name={player.trend === 'up' ? 'trending-up-outline' : 
                      player.trend === 'down' ? 'trending-down-outline' : 'remove-outline'}
                size={16} 
                color={player.trend === 'up' ? '#10b981' : 
                       player.trend === 'down' ? '#ef4444' : '#6b7280'} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.fantasyTips}>
        <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
        <Text style={styles.fantasyTipsText}>
          Start players with favorable matchups. Monitor injury reports for last-minute changes.
        </Text>
      </View>
    </View>
  );

  const renderSocialFeatures = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community Talk</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => setShowSocial(true)}
        >
          <Text style={styles.viewAllText}>Join Discussion →</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.socialPreview}>
        {socialComments.slice(0, 2).map((comment) => (
          <View key={comment.id} style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatarContainer}>
                  <Text style={styles.userAvatar}>{comment.avatar}</Text>
                  {comment.verified && (
                    <Ionicons name="checkmark-circle" size={12} color="#3b82f6" style={styles.verifiedBadge} />
                  )}
                </View>
                <View>
                  <View style={styles.usernameContainer}>
                    <Text style={styles.username}>{comment.user}</Text>
                    {comment.verified && (
                      <Text style={styles.verifiedText}>Verified</Text>
                    )}
                  </View>
                  <Text style={styles.commentTime}>{comment.time}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.likeButton}>
                <Ionicons name="heart-outline" size={16} color="#ef4444" />
                <Text style={styles.likeCount}>{comment.likes}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.commentText}>{comment.text}</Text>
            <View style={styles.commentFooter}>
              <TouchableOpacity style={styles.replyButton}>
                <Ionicons name="chatbubble-outline" size={14} color="#6b7280" />
                <Text style={styles.replyText}>{comment.replies} replies</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={14} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.addCommentButton}
        onPress={() => setShowSocial(true)}
      >
        <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
        <Text style={styles.addCommentText}>Add your comment</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectedView = () => {
    switch(selectedView) {
      case 'games':
        return renderGames();
      case 'standings':
        return renderStandings();
      case 'depth':
        return renderDepthChart();
      case 'fantasy':
        return renderFantasyIntegration();
      case 'social':
        return renderSocialFeatures();
      case 'stats':
        return renderStatsLeaders();
      default:
        return renderGames();
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading NFL Analytics...</Text>
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
      >
        {renderAnalytics()}
        {renderSelectedView()}
        
        <View style={styles.newsSection}>
          <Text style={styles.newsTitle}>Latest News</Text>
          {news.map((item) => (
            <TouchableOpacity key={item.id} style={styles.newsCard}>
              <View style={styles.newsContent}>
                <Text style={styles.newsHeadline}>{item.title}</Text>
                <View style={styles.newsMeta}>
                  <Text style={styles.newsSource}>{item.source}</Text>
                  <Text style={styles.newsTime}>{item.time}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
          <Text style={styles.footerText}>
            NFL data updates in real-time. Tap refresh for latest scores and stats.
          </Text>
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
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    marginTop: 10,
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
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  viewTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewTab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 70,
  },
  activeViewTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  viewTabIcon: {
    marginBottom: 4,
  },
  viewTabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeViewTabText: {
    color: 'white',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewAllText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '500',
  },
  liveScoresContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  liveScoresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  liveScoresTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  liveScoreCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  liveScoreTeams: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  liveScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  liveStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  liveStatusActive: {
    backgroundColor: '#fee2e2',
  },
  liveStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  gameCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gameTeams: {
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
  teamType: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  gameCenter: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  gameStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginBottom: 8,
  },
  gameStatusFinal: {
    backgroundColor: '#e5e7eb',
  },
  gameStatusLive: {
    backgroundColor: '#fee2e2',
  },
  gameStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 30,
    textAlign: 'center',
  },
  winningScore: {
    color: '#10b981',
  },
  scoreDivider: {
    fontSize: 20,
    color: '#9ca3af',
    marginHorizontal: 10,
  },
  gameSpread: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  gameChannel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameChannelText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  gameStatsButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gameStatsText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  conferenceTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 2,
  },
  conferenceTab: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 18,
  },
  conferenceTabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  conferenceTabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  standingsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  standingsHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  standingsCell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamRankBadge: {
    width: 30,
  },
  teamRank: {
    fontSize: 12,
    color: '#9ca3af',
  },
  topTeamRank: {
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  teamNameContainer: {
    flex: 1,
    marginLeft: 8,
  },
  teamNameCell: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  teamConference: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  winCell: {
    color: '#10b981',
    fontWeight: '600',
  },
  lossCell: {
    color: '#ef4444',
    fontWeight: '600',
  },
  pctCell: {
    fontWeight: '500',
    color: '#0ea5e9',
  },
  pointsCell: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  playoffIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  playoffMarker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playoffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  playoffText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
  },
  playoffNote: {
    fontSize: 11,
    color: '#6b7280',
  },
  statsScroll: {
    marginHorizontal: -5,
  },
  leaderCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    width: 150,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  leaderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  leaderRank: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  leaderRankNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  leaderBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  leaderBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400e',
  },
  leaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  leaderStat: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  leaderLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  leaderTeam: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  leaderTeamText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  leaderProgress: {
    width: '100%',
    alignItems: 'center',
  },
  teamSelector: {
    marginBottom: 15,
  },
  teamOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  teamOptionActive: {
    backgroundColor: '#0ea5e9',
  },
  teamOptionText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  teamOptionTextActive: {
    color: 'white',
  },
  depthChartPreview: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
  },
  depthChartTeam: {
    alignItems: 'center',
    marginBottom: 20,
  },
  depthChartTeamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  teamRecord: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  teamRecordText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  depthChartSections: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  depthChartSection: {
    flex: 1,
    marginRight: 10,
  },
  depthChartSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  depthChartPosition: {
    marginBottom: 15,
  },
  positionLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 6,
  },
  playerList: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  starterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  starterPlayer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  starterTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  backupPlayer: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  injuryReport: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  injuryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  injuryText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  fantasySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  fantasyGrid: {
    marginBottom: 15,
  },
  fantasyCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fantasyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  playerPosition: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  fantasyRank: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  fantasyRankText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fantasyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  fantasyStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fantasyTips: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
  },
  fantasyTipsText: {
    fontSize: 13,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  socialPreview: {
    marginTop: 10,
  },
  commentCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  userAvatar: {
    fontSize: 24,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  verifiedText: {
    fontSize: 10,
    color: '#3b82f6',
    marginLeft: 4,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  commentTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  shareButton: {
    padding: 4,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  addCommentText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 8,
    fontWeight: '500',
  },
  newsSection: {
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
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  newsContent: {
    flex: 1,
  },
  newsHeadline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: '#0ea5e9',
    marginRight: 10,
  },
  newsTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginLeft: 8,
  },
  // Custom Progress Bar Styles
  customProgressBar: {
    overflow: 'hidden',
  },
  customProgressBarFill: {
    height: '100%',
  },
});

export default NFLScreen;
