/ src/services/api.js - ENHANCED with Player/Team/Stats Endpoints AND Fantasy Draft
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pleasing-determination-production.up.railway.app';
const API_URL = BASE_URL; // Add this for consistency with File 1

// Import all mock data functions
import { 
  getNBAGames, 
  getNBAStandings, 
  getNBAPlayerStats,
  getNHLGames,
  getNHLStandings,
  getNHLPlayerStats,
  getKalshiMarkets,
  getSportsPredictions 
} from './mockData';

// Import generated data (we'll create these files)
import { samplePlayers } from '../data/players';
import { teams } from '../data/teams';
import { statCategories } from '../data/stats';

// === AUTH TOKEN STORAGE ===
let authToken = null;

// Auth base URL - Added from File 1
const AUTH_BASE_URL = process.env.EXPO_PUBLIC_AUTH_URL || `${BASE_URL}/api/auth`;

// Helper function to get auth token (from File 1)
const getAuthToken = () => {
  return authToken;
};

// Mock data generators for fantasy drafts (Added from File 1)
const generateMockSnakeDraft = (position, sport, platform = 'FanDuel', teams = 10, rounds = 6) => {
  const mockPlayers = [
    {
      id: 1,
      name: 'Stephen Curry',
      position: 'PG',
      team: 'GSW',
      value: 1.42,
      fantasyScore: 52.3,
      fanDuelSalary: 9500,
      draftKingsSalary: 9200,
      reason: `Excellent value at pick ${position} - Elite shooting and high floor`
    },
    {
      id: 2,
      name: 'LeBron James',
      position: 'SF',
      team: 'LAL',
      value: 1.35,
      fantasyScore: 48.7,
      fanDuelSalary: 9800,
      draftKingsSalary: 9500,
      reason: `Consistent production at pick ${position} - All-around contributor`
    },
    {
      id: 3,
      name: 'Nikola Jokic',
      position: 'C',
      team: 'DEN',
      value: 1.48,
      fantasyScore: 56.1,
      fanDuelSalary: 10500,
      draftKingsSalary: 10200,
      reason: `Best available at pick ${position} - Triple-double machine`
    }
  ];
  
  return {
    success: true,
    draftPosition: parseInt(position),
    sport,
    platform,
    totalTeams: teams,
    totalRounds: rounds,
    results: mockPlayers
  };
};

const generateMockTurnDraft = (position, sport, platform = 'FanDuel', criteria = 'all') => {
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  const results = {};
  
  positions.forEach(pos => {
    results[pos] = Array.from({ length: 5 }, (_, i) => ({
      player: {
        id: i + 1,
        name: `${pos} Player ${i + 1}`,
        position: pos,
        team: ['GSW', 'LAL', 'DEN', 'BOS', 'MIL'][i],
        salary: platform === 'FanDuel' ? 
          [8500, 7200, 6500, 5800, 5000][i] :
          [8000, 6800, 6200, 5500, 4800][i],
        value: [1.4, 1.3, 1.25, 1.2, 1.15][i],
        fantasyScore: [45, 38, 35, 32, 28][i],
        injuryStatus: i === 2 ? 'GTD' : 'ACTIVE',
        opponent: ['SAS', 'DET', 'HOU', 'CHA', 'ORL'][i]
      },
      selectionScore: [85.5, 78.2, 72.4, 68.1, 62.3][i],
      reasons: i === 0 ? 
        ['Excellent value', 'Favorable matchup', 'No injury concerns'] :
        ['Good value', 'Solid matchup', 'Safe pick']
    }));
  });
  
  return {
    success: true,
    draftPosition: parseInt(position),
    sport,
    platform,
    criteria,
    results
  };
};

const generateMockOptimalDraft = (params) => {
  const { sport = 'NBA', draftType = 'snake', teamCount = 8, platform = 'FanDuel' } = params;
  
  const mockDraft = {
    success: true,
    sport,
    draftType,
    teamCount,
    platform,
    optimalLineup: {
      totalSalary: platform === 'FanDuel' ? 60000 : 50000,
      totalProjection: 285.5,
      valueScore: 1.42,
      lineup: [
        { position: 'PG', name: 'Stephen Curry', team: 'GSW', salary: 9500, projection: 52.3 },
        { position: 'SG', name: 'Devin Booker', team: 'PHX', salary: 8200, projection: 45.8 },
        { position: 'SF', name: 'LeBron James', team: 'LAL', salary: 9800, projection: 48.7 },
        { position: 'PF', name: 'Giannis Antetokounmpo', team: 'MIL', salary: 10500, projection: 56.1 },
        { position: 'C', name: 'Nikola Jokic', team: 'DEN', salary: 10500, projection: 56.2 },
        { position: 'G', name: 'Luka Doncic', team: 'DAL', salary: 10200, projection: 54.8 },
        { position: 'F', name: 'Jayson Tatum', team: 'BOS', salary: 9500, projection: 49.2 },
        { position: 'UTIL', name: 'Anthony Davis', team: 'LAL', salary: 9800, projection: 51.4 }
      ]
    },
    alternatives: [
      {
        description: 'High-floor balanced lineup',
        totalSalary: 59500,
        totalProjection: 280.2,
        valueScore: 1.38
      },
      {
        description: 'Stars and scrubs approach',
        totalSalary: 60000,
        totalProjection: 288.1,
        valueScore: 1.45,
        riskLevel: 'High'
      }
    ],
    strategy: draftType === 'snake' ? 'Target elite players at premium positions' : 'Maximize value per round',
    timestamp: new Date().toISOString()
  };
  
  return mockDraft;
};

// NEW MOCK FUNCTIONS FOR FANTASY OPTIMIZATION (from File 1)
const generateMockLineup = (params) => {
  const { sport = 'NBA', platform = 'FanDuel', salaryCap = 60000 } = params;
  
  return {
    success: true,
    lineup: [
      { position: 'PG', name: 'Stephen Curry', team: 'GSW', salary: 9500, projection: 52.3 },
      { position: 'SG', name: 'Devin Booker', team: 'PHX', salary: 8200, projection: 45.8 },
      { position: 'SF', name: 'Jayson Tatum', team: 'BOS', salary: 9500, projection: 49.2 },
      { position: 'PF', name: 'Giannis Antetokounmpo', team: 'MIL', salary: 10500, projection: 56.1 },
      { position: 'C', name: 'Nikola Jokic', team: 'DEN', salary: 10500, projection: 56.2 },
      { position: 'G', name: 'Luka Doncic', team: 'DAL', salary: 10200, projection: 54.8 },
      { position: 'F', name: 'LeBron James', team: 'LAL', salary: 9800, projection: 48.7 },
      { position: 'UTIL', name: 'Anthony Davis', team: 'LAL', salary: 9800, projection: 51.4 }
    ],
    totalSalary: 60000,
    totalProjection: 285.5,
    valueScore: 1.42,
    exposure: {
      teamExposure: { 'LAL': 2, 'DEN': 1, 'BOS': 1, 'MIL': 1, 'GSW': 1, 'PHX': 1, 'DAL': 1 },
      gameExposure: { 'LAL vs DEN': 3, 'BOS vs MIL': 2, 'GSW vs PHX': 2, 'DAL vs SAS': 1 }
    },
    timestamp: new Date().toISOString()
  };
};

const generateMockLineupAnalysis = (players, sport, platform) => {
  return {
    success: true,
    analysis: {
      totalProjection: 285.5,
      totalSalary: 60000,
      valueScore: 1.42,
      riskLevel: 'Medium',
      strengths: ['Balanced scoring', 'Good positional distribution', 'High floor'],
      weaknesses: ['Limited upside', 'High ownership projected'],
      recommendations: [
        'Consider swapping one Laker player for diversification',
        'Add more game stack exposure to Warriors vs Suns',
        'Monitor injury status of Anthony Davis'
      ],
      optimalSwap: {
        from: 'Anthony Davis',
        to: 'Joel Embiid',
        projectionIncrease: 2.3,
        salaryChange: -200
      }
    },
    playerAnalysis: players.map(player => ({
      name: player.name,
      valueScore: Math.random() * 0.5 + 1.1,
      projection: Math.random() * 20 + 35,
      ownershipProjection: Math.random() * 0.3 + 0.4,
      risk: Math.random() < 0.3 ? 'High' : 'Low'
    }))
  };
};

const generateMockOptimizeStack = (team, sport, platform, stackType = 'correlation') => {
  return {
    success: true,
    optimizedStack: {
      team,
      stackType,
      players: [
        { name: 'LeBron James', position: 'SF', salary: 9800, projection: 48.7, correlationScore: 0.85 },
        { name: 'Anthony Davis', position: 'PF/C', salary: 9800, projection: 51.4, correlationScore: 0.82 },
        { name: 'D\'Angelo Russell', position: 'PG', salary: 6500, projection: 32.1, correlationScore: 0.78 }
      ],
      totalProjection: 132.2,
      totalSalary: 26100,
      stackScore: 0.92,
      alternativeStacks: [
        {
          description: 'Game stack with opponents',
          players: [
            { name: 'LeBron James', team: 'LAL' },
            { name: 'Nikola Jokic', team: 'DEN' }
          ],
          projection: 104.9
        }
      ]
    }
  };
};

const generateMockComparePlayers = (playerIds, platform = 'FanDuel') => {
  const playerNames = ['Stephen Curry', 'LeBron James', 'Nikola Jokic', 'Luka Doncic', 'Giannis Antetokounmpo'];
  
  return {
    success: true,
    comparison: playerIds.map((id, index) => ({
      playerId: id,
      name: playerNames[index % playerNames.length],
      stats: {
        projection: Math.random() * 20 + 40,
        value: Math.random() * 0.5 + 1.1,
        salary: platform === 'FanDuel' ? [9500, 9800, 10500, 10200, 10500][index % 5] : 
                [9200, 9500, 10200, 9900, 10200][index % 5],
        ownership: Math.random() * 0.3 + 0.4,
        risk: ['Low', 'Medium', 'High'][index % 3]
      },
      advantages: [
        'Higher ceiling projection',
        'Lower ownership',
        'Better matchup'
      ].slice(0, 2 + (index % 2))
    })),
    bestValue: playerIds[0],
    highestCeiling: playerIds[1],
    safestPlay: playerIds[2]
  };
};

const generateMockAIAdvice = (prompt, sport = 'NBA', platform = 'FanDuel') => {
  return {
    success: true,
    advice: `Based on ${sport} analytics and ${platform} scoring: ${prompt}. I recommend focusing on players from teams with high pace and positive matchups. Consider stacking players from the Warriors vs Lakers game for optimal correlation.`,
    recommendations: [
      'Prioritize point guards in high-paced games',
      'Target centers with high usage rates',
      'Consider value plays from injury-riddled teams'
    ],
    keyInsights: [
      `Point guards average 15% more fantasy points on ${platform} compared to other positions`,
      'Game stacks with high totals have 23% higher correlation',
      'Players returning from injury often outperform salary expectations'
    ],
    confidence: 85,
    timestamp: new Date().toISOString()
  };
};

const generateMockSaveDraft = (draftData, name = 'My Draft') => {
  return {
    success: true,
    draftId: `draft_${Date.now()}`,
    name,
    savedAt: new Date().toISOString(),
    data: draftData
  };
};

const generateMockSavedDrafts = () => {
  return {
    success: true,
    drafts: [
      {
        id: 'draft_1',
        name: 'NBA Tournament Lineup',
        sport: 'NBA',
        platform: 'FanDuel',
        date: new Date(Date.now() - 86400000).toISOString(),
        lineupSize: 8,
        totalSalary: 60000
      },
      {
        id: 'draft_2',
        name: 'Sunday Slate Optimal',
        sport: 'NBA',
        platform: 'DraftKings',
        date: new Date(Date.now() - 172800000).toISOString(),
        lineupSize: 9,
        totalSalary: 50000
      }
    ]
  };
};

const generateMockExportLineup = (lineupId, format = 'csv') => {
  // For mock, we return a blob with sample data
  const sampleData = `Player,Position,Team,Salary,Projection\nStephen Curry,PG,GSW,9500,52.3\nLeBron James,SF,LAL,9800,48.7`;
  return new Blob([sampleData], { type: format === 'csv' ? 'text/csv' : 'application/json' });
};

// =============================================
// === ENHANCED FETCH WITH FALLBACKS (File 3) ===
// =============================================

// Enhanced fetch with monitoring and fallbacks
async function fetchWithFallbacks(endpoint, options = {}, fallbackEndpoints = [], mockFallback) {
  const sources = [
    { 
      name: 'primary', 
      url: `${BASE_URL}${endpoint}`,
      priority: 1 
    },
    ...fallbackEndpoints.map((ep, i) => ({ 
      name: `fallback_${i}`, 
      url: ep,
      priority: 2 + i 
    }))
  ];
  
  // Sort by priority
  sources.sort((a, b) => a.priority - b.priority);
  
  for (const source of sources) {
    try {
      console.log(`Trying ${source.name}: ${source.url}`);
      const startTime = Date.now();
      
      const response = await fetch(source.url, {
        ...options,
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        // Track successful fetch
        await trackDataUsage(endpoint, source.name, responseTime, true);
        
        return {
          ...data,
          _metadata: {
            source: source.name,
            responseTime,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        console.warn(`${source.name} returned ${response.status}`);
      }
    } catch (error) {
      console.warn(`${source.name} failed:`, error.message);
      continue;
    }
  }
  
  // All real sources failed, try mock
  console.warn(`All real sources failed for ${endpoint}, using mock`);
  await trackDataUsage(endpoint, 'mock', 0, false);
  
  if (typeof mockFallback === 'function') {
    return mockFallback();
  }
  
  return mockFallback;
}

// Track data usage
async function trackDataUsage(endpoint, source, responseTime, success) {
  try {
    // Send to your analytics endpoint
    await fetch(`${BASE_URL}/api/analytics/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        endpoint,
        source,
        responseTime,
        success,
        timestamp: new Date().toISOString(),
        userId: getCurrentUser()?.id
      })
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.log('Analytics tracking failed:', error.message);
  }
}

// Helper function to get current user
function getCurrentUser() {
  // Mock implementation - you should replace with actual user retrieval
  return {
    id: 'mock_user_123',
    email: 'demo@example.com'
  };
}

const apiService = {
  // === AUTHENTICATION & USER METHODS (Enhanced from File 1) ===
  
  // Register a new user - Enhanced from File 1
  async register(userData) {
    console.log('📝 Registering user:', userData.email);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        if (response.ok) {
          const data = await response.json();
          authToken = data.token;
          return { 
            success: true, 
            user: data.user,
            token: data.token
          };
        } else {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Registration failed' 
          };
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Continue to mock data on error
    }
    
    // Fallback to mock registration
    console.log('📝 Mock signup for:', userData.email);
    const token = 'mock_jwt_token_' + Date.now();
    authToken = token;
    
    return { 
      success: true, 
      user: { 
        id: 'mock_user_' + Date.now(), 
        email: userData.email,
        username: userData.username || userData.email.split('@')[0],
        firstName: userData.firstName || 'Demo',
        lastName: userData.lastName || 'User',
        subscriptionTier: 'free',
        entitlements: []
      },
      token: token
    };
  },
  
  // Login user - Enhanced from File 1
  async login(credentials) {
    console.log('🔐 Logging in user:', credentials.email);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        if (response.ok) {
          const data = await response.json();
          authToken = data.token;
          return { 
            success: true, 
            user: data.user,
            token: data.token
          };
        } else {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Login failed' 
          };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      // Continue to mock data on error
    }
    
    // Fallback to mock login
    console.log('🔐 Mock login for:', credentials.email);
    const token = 'mock_jwt_token_' + Date.now();
    authToken = token;
    
    return { 
      success: true, 
      user: { 
        id: 'mock_user_' + Date.now(), 
        email: credentials.email,
        username: credentials.email.split('@')[0],
        firstName: 'Demo',
        lastName: 'User',
        subscriptionTier: 'premium',
        entitlements: ['elite_insights_access', 'success_metrics_access', 'kalshi_access']
      },
      token: token
    };
  },
  
  // Get current user with token - Added from File 1
  async getCurrentUser(token = null) {
    const useToken = token || authToken;
    console.log('👤 Getting current user');
    
    if (!useToken) {
      return { 
        success: false, 
        error: 'No authentication token available' 
      };
    }
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${AUTH_BASE_URL}/me`, {
          headers: { 
            'Authorization': `Bearer ${useToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return { 
            success: true, 
            user: data.user,
            token: useToken
          };
        } else {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Failed to get current user' 
          };
        }
      }
    } catch (error) {
      console.error('Get current user error:', error);
      // Continue to mock data on error
    }
    
    // Fallback to mock current user
    console.log('👤 Mock getCurrentUser with token:', useToken);
    return {
      success: true,
      user: {
        id: 'mock_user_123',
        email: 'demo@example.com',
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        subscriptionTier: 'premium',
        entitlements: ['elite_insights_access', 'success_metrics_access', 'kalshi_access'],
        favoriteTeams: ['Lakers', 'Bruins'],
        notificationSettings: {
          gameAlerts: true,
          scoreUpdates: false,
          newsAlerts: true
        },
        stats: {
          predictionsMade: 42,
          accuracyRate: '68.3%',
          favoriteSport: 'NBA'
        }
      }
    };
  },

  logSecretPhrase: async (data) => {
    try {
      console.log('📝 API Logging:', data.phraseKey);
      return {
        success: true,
        eventId: `mock_${Date.now()}`,
        timestamp: new Date().toISOString(),
        note: 'Mock API response - backend not connected'
      };
    } catch (error) {
      console.error('❌ API Error:', error.message);
      return {
        success: false,
        error: error.message,
        eventId: `error_${Date.now()}`
      };
    }
  },

  signup: async (userData) => {
    // Alias for register to maintain backward compatibility
    return apiService.register(userData);
  },

  logout: async () => {
    console.log('🚪 Logging out');
    authToken = null;
    return { success: true };
  },

  getAuthToken: () => {
    return authToken;
  },

  setAuthToken: (token) => {
    authToken = token;
  },

  checkHealth: async () => {
    return {
      status: 'online',
      baseUrl: BASE_URL,
      authUrl: AUTH_BASE_URL,
      timestamp: new Date().toISOString(),
      services: {
        nba: 'mock',
        nhl: 'mock', 
        kalshi: 'mock',
        predictions: 'mock',
        authentication: 'mock',
        players: 'mock',
        teams: 'mock',
        stats: 'mock'
      }
    };
  },

  getUserProfile: async (userId) => {
    console.log('👤 Getting user profile for:', userId);
    return {
      success: true,
      user: {
        id: userId,
        email: 'demo@example.com',
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        subscriptionTier: 'premium',
        entitlements: ['elite_insights_access', 'success_metrics_access', 'kalshi_access'],
        favoriteTeams: ['Lakers', 'Bruins'],
        notificationSettings: {
          gameAlerts: true,
          scoreUpdates: false,
          newsAlerts: true
        },
        stats: {
          predictionsMade: 42,
          accuracyRate: '68.3%',
          favoriteSport: 'NBA'
        }
      }
    };
  },

  // === ENHANCED NBA FUNCTIONS WITH FALLBACKS ===
  async getNBAGames() {
    console.log('🏀 Fetching NBA games with fallbacks');
    
    const fallbackEndpoints = [
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      'https://data.nba.net/data/10s/prod/v1/today.json'
    ];
    
    try {
      const result = await fetchWithFallbacks(
        '/api/nba/games',
        {},
        fallbackEndpoints,
        () => {
          console.warn('Using mock NBA games');
          return getNBAGames();
        }
      );
      return result;
    } catch (error) {
      console.error('Error fetching NBA games:', error);
      return getNBAGames();
    }
  },

  async getNBAStandings() {
    console.log('🏀 Fetching NBA standings with fallbacks');
    
    const fallbackEndpoints = [
      'https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings',
      'https://data.nba.net/data/10s/prod/v1/current/standings_all.json'
    ];
    
    try {
      const result = await fetchWithFallbacks(
        '/api/nba/standings',
        {},
        fallbackEndpoints,
        () => {
          console.warn('Using mock NBA standings');
          return getNBAStandings();
        }
      );
      return result;
    } catch (error) {
      console.error('Error fetching NBA standings:', error);
      return getNBAStandings();
    }
  },

  async getNBAPlayerStats(playerId) {
    console.log('🏀 Using enhanced NBA player stats mock data');
    const playerName = this.getPlayerNameById(playerId);
    return getNBAPlayerStats(playerName);
  },

  async getNBATeamSchedule(teamId) {
    console.log('🏀 Getting NBA team schedule for:', teamId);
    const allGames = getNBAGames();
    const teamName = this.getNBATeamNameById(teamId);
    
    const teamGames = allGames.games.filter(game => 
      game.homeTeam.name === teamName || game.awayTeam.name === teamName
    );
    
    return {
      success: true,
      team: teamName,
      games: teamGames,
      record: `${teamGames.filter(g => g.homeTeam.name === teamName ? g.homeScore > g.awayScore : g.awayScore > g.homeScore).length}-${teamGames.length - teamGames.filter(g => g.homeTeam.name === teamName ? g.homeScore > g.awayScore : g.awayScore > g.homeScore).length}`,
      upcoming: teamGames.filter(g => g.status === 'Scheduled').slice(0, 5),
      recent: teamGames.filter(g => g.status === 'Final').slice(0, 5)
    };
  },

  // === NHL FUNCTIONS WITH FALLBACKS ===
  async getNHLGames() {
    console.log('🏒 Using NHL mock data');
    return getNHLGames();
  },

  async getNHLStandings() {
    console.log('🏒 Using NHL standings mock data');
    return getNHLStandings();
  },

  async getNHLPlayerStats(playerId) {
    console.log('🏒 Using NHL player stats mock data');
    const playerName = this.getNHLPlayerNameById(playerId);
    return getNHLPlayerStats(playerName);
  },

  async getNHLTeamSchedule(teamId) {
    console.log('🏒 Getting NHL team schedule for:', teamId);
    const allGames = getNHLGames();
    const teamName = this.getNHLTeamNameById(teamId);
    
    const teamGames = allGames.games.filter(game => 
      game.homeTeam.name === teamName || game.awayTeam.name === teamName
    );
    
    return {
      success: true,
      team: teamName,
      games: teamGames,
      record: `${teamGames.filter(g => g.homeTeam.name === teamName ? g.homeScore > g.awayScore : g.awayScore > g.homeScore).length}-${teamGames.length - teamGames.filter(g => g.homeTeam.name === teamName ? g.homeScore > g.awayScore : g.awayScore > g.homeScore).length}`,
      upcoming: teamGames.filter(g => g.status === 'Scheduled').slice(0, 5),
      recent: teamGames.filter(g => g.status === 'Final').slice(0, 5)
    };
  },

  // === KALSHI FUNCTIONS ===
  async getKalshiMarkets() {
    console.log('📈 Using Kalshi markets mock data');
    return getKalshiMarkets();
  },

  async getKalshiMarketById(marketId) {
    console.log('📈 Getting Kalshi market by ID:', marketId);
    const allMarkets = getKalshiMarkets();
    const market = allMarkets.markets.find(m => m.id === marketId || m.marketId === marketId);
    
    return {
      success: !!market,
      market: market || null,
      tradingHistory: [
        { time: '2:30 PM', price: '0.67', volume: 150 },
        { time: '2:15 PM', price: '0.66', volume: 85 },
        { time: '1:45 PM', price: '0.68', volume: 120 },
        { time: '1:20 PM', price: '0.65', volume: 95 }
      ],
      volume24h: market?.volume || '$0',
      relatedMarkets: allMarkets.markets.filter(m => m.category === market?.category && m.id !== marketId).slice(0, 3)
    };
  },

  async placeKalshiTrade(marketId, side, amount, price) {
    console.log('📈 Placing Kalshi trade:', { marketId, side, amount, price });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      tradeId: `trade_${Date.now()}_${marketId}`,
      marketId,
      side,
      amount,
      price,
      filled: amount,
      remaining: 0,
      status: 'filled',
      timestamp: new Date().toISOString(),
      fees: (amount * 0.02).toFixed(2)
    };
  },

  // === SPORTS PREDICTIONS ===
  async getSportsPredictions(sport = 'NBA') {
    console.log(`🎯 Using ${sport} predictions mock data`);
    return getSportsPredictions(sport);
  },

  async generatePrediction(prompt, sport = 'NBA') {
    console.log(`🤖 Generating AI prediction for ${sport}:`, prompt);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      prediction: {
        id: `pred_${Date.now()}`,
        sport,
        prompt,
        generatedAt: new Date().toISOString(),
        analysis: `Based on ${sport} analytics and historical data, ${prompt}. The AI model indicates a 68% confidence level with +3.2% expected value.`,
        confidence: Math.floor(Math.random() * 30) + 65,
        edge: (Math.random() * 5 + 1).toFixed(1) + '%',
        keyFactors: [
          'Recent team performance trends',
          'Player injury reports',
          'Historical matchup data',
          'Venue and travel considerations',
          'Betting market inefficiencies'
        ],
        recommendation: `${sport === 'NBA' ? 'Take the over on points' : sport === 'NHL' ? 'Bet the under on goals' : 'Consider the moneyline'}`
      }
    };
  },

  async getPredictionHistory(userId) {
    console.log('📊 Getting prediction history for:', userId);
    return {
      success: true,
      userId,
      predictions: [
        {
          id: 'pred_1',
          sport: 'NBA',
          game: 'Lakers vs Warriors',
          predicted: 'Lakers win',
          actual: 'Lakers win',
          correct: true,
          confidence: 72,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          notes: 'LeBron James MVP performance'
        },
        {
          id: 'pred_2', 
          sport: 'NHL',
          game: 'Bruins vs Maple Leafs',
          predicted: 'Bruins win',
          actual: 'Maple Leafs win',
          correct: false,
          confidence: 65,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          notes: 'Unexpected goaltender performance'
        }
      ],
      stats: {
        total: 42,
        correct: 29,
        accuracy: '69.0%',
        roi: '+12.4%'
      }
    };
  },

  // === HELPER FUNCTIONS FOR ID TO NAME MAPPING ===
  getPlayerNameById(playerId) {
    const playerMap = {
      'lebron-james': 'LeBron James',
      'stephen-curry': 'Stephen Curry',
      'nikola-jokic': 'Nikola Jokic',
      'luka-doncic': 'Luka Doncic',
      'giannis-antetokounmpo': 'Giannis Antetokounmpo',
      'jayson-tatum': 'Jayson Tatum',
      'kevin-durant': 'Kevin Durant',
      'joel-embiid': 'Joel Embiid',
      'damian-lillard': 'Damian Lillard',
      'jimmy-butler': 'Jimmy Butler'
    };
    return playerMap[playerId] || 'LeBron James';
  },

  getNBATeamNameById(teamId) {
    const teamMap = {
      'lakers': 'Lakers',
      'warriors': 'Warriors',
      'celtics': 'Celtics',
      'bucks': 'Bucks',
      'nuggets': 'Nuggets',
      'suns': 'Suns',
      'knicks': 'Knicks',
      'heat': 'Heat',
      'clippers': 'Clippers',
      '76ers': '76ers',
      'mavericks': 'Mavericks',
      'cavaliers': 'Cavaliers'
    };
    return teamMap[teamId] || 'Lakers';
  },

  getNHLPlayerNameById(playerId) {
    const playerMap = {
      'connor-mcdavid': 'Connor McDavid',
      'nathan-mackinnon': 'Nathan MacKinnon',
      'auston-matthews': 'Auston Matthews',
      'nikita-kucherov': 'Nikita Kucherov',
      'david-pastrnak': 'David Pastrnak',
      'cale-makar': 'Cale Makar',
      'leon-draisaitl': 'Leon Draisaitl',
      'jack-hughes': 'Jack Hughes',
      'kirill-kaprizov': 'Kirill Kaprizov',
      'artemi-panarin': 'Artemi Panarin'
    };
    return playerMap[playerId] || 'Connor McDavid';
  },

  getNHLTeamNameById(teamId) {
    const teamMap = {
      'bruins': 'Bruins',
      'maple-leafs': 'Maple Leafs',
      'rangers': 'Rangers',
      'penguins': 'Penguins',
      'golden-knights': 'Golden Knights',
      'oilers': 'Oilers',
      'avalanche': 'Avalanche',
      'canucks': 'Canucks',
      'lightning': 'Lightning',
      'capitals': 'Capitals',
      'flames': 'Flames',
      'stars': 'Stars'
    };
    return teamMap[teamId] || 'Bruins';
  },

  // === SUBSCRIPTION & REVENUECAT INTEGRATION ===
  async getSubscriptionInfo(userId) {
    console.log('💎 Getting subscription info for:', userId);
    return {
      success: true,
      userId,
      subscription: {
        tier: 'premium',
        status: 'active',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'Apple Pay',
        price: '$14.99/month',
        entitlements: ['elite_insights_access', 'success_metrics_access', 'kalshi_access'],
        features: [
          'Unlimited Kalshi predictions',
          'Advanced NHL analytics',
          'AI-generated sports predictions',
          'Premium player dashboards',
          'No ads'
        ]
      }
    };
  },

  async upgradeSubscription(planId, paymentMethod) {
    console.log('🔄 Upgrading subscription to:', planId);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
      planId,
      newTier: planId.includes('premium') ? 'premium' : 'elite',
      entitlements: ['elite_insights_access', 'success_metrics_access', 'kalshi_access'],
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      receipt: {
        amount: planId.includes('premium') ? 14.99 : 29.99,
        currency: 'USD',
        date: new Date().toISOString()
      }
    };
  },

  // === ANALYTICS & TRACKING ===
  async logAnalyticsEvent(eventName, eventData) {
    console.log('📊 Analytics Event:', eventName, eventData);
    return {
      success: true,
      eventId: `analytics_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  },

  async getAnalyticsSummary(userId) {
    console.log('📈 Getting analytics summary for:', userId);
    return {
      success: true,
      userId,
      summary: {
        totalSessions: 42,
        favoriteFeature: 'Kalshi Predictions',
        timeSpent: '12h 45m',
        predictionsGenerated: 28,
        predictionsCorrect: 19,
        accuracyRate: '67.9%',
        topSports: ['NBA', 'NHL', 'NFL'],
        usageByDay: {
          monday: 2.5,
          tuesday: 3.2,
          wednesday: 4.1,
          thursday: 3.8,
          friday: 5.2,
          saturday: 6.8,
          sunday: 7.4
        }
      }
    };
  },

  // === SEARCH FUNCTIONALITY ===
  async searchContent(query, sport = 'all') {
    console.log('🔍 Searching for:', query, 'in sport:', sport);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const nbaGames = getNBAGames();
    const nhlGames = getNHLGames();
    const kalshiMarkets = getKalshiMarkets();
    
    const results = {
      games: [],
      players: [],
      teams: [],
      markets: []
    };
    
    // Search NBA games
    if (sport === 'all' || sport === 'NBA') {
      results.games = [
        ...nbaGames.games.filter(game => 
          game.homeTeam.name.toLowerCase().includes(query.toLowerCase()) ||
          game.awayTeam.name.toLowerCase().includes(query.toLowerCase()) ||
          game.status.toLowerCase().includes(query.toLowerCase())
        )
      ];
    }
    
    // Search NHL games
    if (sport === 'all' || sport === 'NHL') {
      results.games = [
        ...results.games,
        ...nhlGames.games.filter(game => 
          game.homeTeam.name.toLowerCase().includes(query.toLowerCase()) ||
          game.awayTeam.name.toLowerCase().includes(query.toLowerCase()) ||
          game.status.toLowerCase().includes(query.toLowerCase())
        )
      ];
    }
    
    // Search Kalshi markets
    if (sport === 'all' || sport === 'kalshi') {
      results.markets = kalshiMarkets.markets.filter(market => 
        market.question.toLowerCase().includes(query.toLowerCase()) ||
        market.category.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return {
      success: true,
      query,
      sport,
      results,
      totalResults: results.games.length + results.players.length + results.teams.length + results.markets.length,
      timestamp: new Date().toISOString()
    };
  },

  // === FANTASY DRAFT METHODS (Enhanced from File 1) ===
  
  // Search fantasy players (from File 1)
  async searchFantasyPlayers(sport, searchQuery, filters = {}) {
    console.log(`🔍 Searching fantasy players for ${sport}:`, searchQuery, filters);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const params = new URLSearchParams({
          sport,
          ...filters
        });
        if (searchQuery) params.append('search', searchQuery);
        
        const response = await fetch(`${API_URL}/fantasy/players?${params}`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Fantasy search API error:', error);
    }
    
    // Fallback to mock data - use existing searchPlayers method
    return this.searchPlayers(sport, searchQuery, filters);
  },
  
  // Get snake draft (enhanced from File 1)
  async getSnakeDraft(position, sport = 'NBA', platform = 'FanDuel', teams = 10, rounds = 6) {
    console.log(`🎯 Getting snake draft for position ${position}, sport ${sport}, platform ${platform}`);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(
          `${API_URL}/fantasy/draft/snake?position=${position}&sport=${sport}&platform=${platform}&totalTeams=${teams}&totalRounds=${rounds}`,
          {
            headers: {
              'Authorization': `Bearer ${this.getAuthToken()}`
            }
          }
        );
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Snake draft API error:', error);
    }
    
    // Fallback to mock data
    return generateMockSnakeDraft(position, sport, platform, teams, rounds);
  },
  
  // Get turn draft (enhanced from File 1)
  async getTurnDraft(position, sport = 'NBA', platform = 'FanDuel', criteria = 'all') {
    console.log(`🎯 Getting turn draft for position ${position}, sport ${sport}, platform ${platform}, criteria ${criteria}`);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(
          `${API_URL}/fantasy/draft/turn?position=${position}&sport=${sport}&platform=${platform}&criteria=${criteria}`,
          {
            headers: {
              'Authorization': `Bearer ${this.getAuthToken()}`
            }
          }
        );
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Turn draft API error:', error);
    }
    
    // Fallback to mock data
    return generateMockTurnDraft(position, sport, platform, criteria);
  },
  
  // Generate lineup (from File 1)
  async generateLineup(params) {
    console.log('🎯 Generating lineup with params:', params);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${API_URL}/fantasy/lineup/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(params)
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Generate lineup API error:', error);
    }
    
    // Fallback to mock data
    return generateMockLineup(params);
  },
  
  // Analyze lineup (from File 1)
  async analyzeLineup(players, sport, platform) {
    console.log('📊 Analyzing lineup for sport:', sport, 'platform:', platform);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${API_URL}/fantasy/lineup/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ players, sport, platform })
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Analyze lineup API error:', error);
    }
    
    // Fallback to mock data
    return generateMockLineupAnalysis(players, sport, platform);
  },
  
  // Optimize stack (from File 1)
  async optimizeStack(team, sport = 'NBA', platform = 'FanDuel', stackType = 'correlation') {
    console.log('🔗 Optimizing stack for team:', team, 'sport:', sport, 'stackType:', stackType);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${API_URL}/fantasy/optimize/stack`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ team, sport, platform, stackType })
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Optimize stack API error:', error);
    }
    
    // Fallback to mock data
    return generateMockOptimizeStack(team, sport, platform, stackType);
  },
  
  // Compare players for fantasy (from File 1)
  async compareFantasyPlayers(playerIds, platform = 'FanDuel') {
    console.log('📊 Comparing fantasy players:', playerIds, 'platform:', platform);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${API_URL}/fantasy/optimize/compare-players`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ playerIds, platform })
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Compare players API error:', error);
    }
    
    // Fallback to mock data
    return generateMockComparePlayers(playerIds, platform);
  },
  
  // Get AI advice (from File 1)
  async getAIAdvice(prompt, sport = 'NBA', platform = 'FanDuel') {
    console.log('🤖 Getting AI advice for sport:', sport, 'platform:', platform);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(
          `${API_URL}/fantasy/ai-advice?prompt=${encodeURIComponent(prompt)}&sport=${sport}&platform=${platform}`,
          {
            headers: {
              'Authorization': `Bearer ${this.getAuthToken()}`
            }
          }
        );
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('AI advice API error:', error);
    }
    
    // Fallback to mock data
    return generateMockAIAdvice(prompt, sport, platform);
  },
  
  // Save draft (from File 1)
  async saveDraft(draftData, name = 'My Draft') {
    console.log('💾 Saving draft:', name);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${API_URL}/fantasy/draft/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ draftData, name })
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Save draft API error:', error);
    }
    
    // Fallback to mock data
    return generateMockSaveDraft(draftData, name);
  },
  
  // Get saved drafts (from File 1)
  async getSavedDrafts() {
    console.log('📁 Getting saved drafts');
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${API_URL}/fantasy/draft/saved`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Get saved drafts API error:', error);
    }
    
    // Fallback to mock data
    return generateMockSavedDrafts();
  },
  
  // Export lineup (from File 1)
  async exportLineup(lineupId, format = 'csv') {
    console.log('📤 Exporting lineup:', lineupId, 'format:', format);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(`${API_URL}/fantasy/lineup/export/${lineupId}/${format}`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        if (response.ok) {
          return await response.blob();
        }
      }
    } catch (error) {
      console.error('Export lineup API error:', error);
    }
    
    // Fallback to mock data
    return generateMockExportLineup(lineupId, format);
  },
  
  async generateOptimalDraft(params) {
    console.log('🎯 Generating optimal draft with params:', params);
    
    try {
      if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
        const response = await fetch(
          `${BASE_URL}/api/fantasy/optimal-draft`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(params)
          }
        );
        if (response.ok) {
          return await response.json();
        }
      }
    } catch (error) {
      console.error('Optimal draft API error:', error);
    }
    
    // Fallback to mock data
    return generateMockOptimalDraft(params);
  },

  // =============================================
  // === NEW: PLAYER, TEAM, & STATS ENDPOINTS ===
  // =============================================

  // Get players for a sport with optional filters
  async getPlayers(sport, filters = {}) {
    console.log(`👥 Getting ${sport} players with filters:`, filters);
    
    // Try backend first if configured
    if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
      try {
        const response = await fetch(`${BASE_URL}/api/players/${sport}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters)
        });
        
        if (response.ok) {
          const data = await response.json();
          return { 
            success: true, 
            players: data.players || data,
            count: (data.players || data).length,
            source: 'backend'
          };
        }
      } catch (error) {
        console.log('Backend failed, using mock data:', error.message);
      }
    }
    
    // Fallback to mock data
    const sportPlayers = samplePlayers[sport] || [];
    let filteredPlayers = [...sportPlayers];
    
    // Apply filters
    if (filters.position && filters.position !== 'all') {
      filteredPlayers = filteredPlayers.filter(player => 
        player.position === filters.position
      );
    }
    
    if (filters.team && filters.team !== 'all') {
      filteredPlayers = filteredPlayers.filter(player => 
        player.team.toLowerCase().includes(filters.team.toLowerCase())
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredPlayers = filteredPlayers.filter(player =>
        player.name.toLowerCase().includes(searchLower) ||
        player.team.toLowerCase().includes(searchLower) ||
        player.position.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      success: true,
      players: filteredPlayers,
      count: filteredPlayers.length,
      source: 'mock'
    };
  },
  
  // Search players across all sports or specific sport
  async searchPlayers(sport, query, filters = {}) {
    console.log(`🔍 Searching ${sport} players for:`, query);
    
    if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
      try {
        const response = await fetch(`${BASE_URL}/api/players/${sport}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: query, ...filters })
        });
        
        if (response.ok) {
          const data = await response.json();
          return { 
            success: true, 
            players: data.players || data,
            query,
            source: 'backend'
          };
        }
      } catch (error) {
        console.log('Backend search failed, using mock search:', error.message);
      }
    }
    
    // Mock search
    const sportPlayers = samplePlayers[sport] || [];
    const searchLower = query.toLowerCase().trim();
    
    const searchResults = sportPlayers.filter(player => {
      return (
        player.name.toLowerCase().includes(searchLower) ||
        player.team.toLowerCase().includes(searchLower) ||
        player.position.toLowerCase().includes(searchLower) ||
        `${player.name} ${player.team}`.toLowerCase().includes(searchLower)
      );
    });
    
    // Apply additional filters
    let filteredResults = searchResults;
    if (filters.position && filters.position !== 'all') {
      filteredResults = filteredResults.filter(player => 
        player.position === filters.position
      );
    }
    
    return {
      success: true,
      players: filteredResults,
      count: filteredResults.length,
      query,
      source: 'mock'
    };
  },
  
  // Get player by ID across all sports
  async getPlayerById(playerId) {
    console.log(`👤 Getting player with ID:`, playerId);
    
    // Try backend first
    if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
      try {
        const response = await fetch(`${BASE_URL}/api/players/id/${playerId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return data;
          }
        }
      } catch (error) {
        console.log('Backend player fetch failed, using mock data:', error.message);
      }
    }
    
    // Search all sports for player
    for (const sport in samplePlayers) {
      const player = samplePlayers[sport].find(p => p.id === parseInt(playerId));
      if (player) {
        return { 
          success: true, 
          player, 
          sport,
          source: 'mock'
        };
      }
    }
    
    return { 
      success: false, 
      error: 'Player not found',
      source: 'mock'
    };
  },
  
  // Get player stats by ID
  async getPlayerStats(playerId, season = '2024') {
    console.log(`📊 Getting stats for player ${playerId}, season ${season}`);
    
    // Find player first
    const playerResult = await this.getPlayerById(playerId);
    if (!playerResult.success) {
      return playerResult;
    }
    
    // Return player stats
    return {
      success: true,
      player: playerResult.player,
      stats: playerResult.player.stats,
      season,
      sport: playerResult.sport,
      source: playerResult.source
    };
  },
  
  // Get teams for a sport
  async getTeams(sport) {
    console.log(`🏟️ Getting ${sport} teams`);
    
    if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
      try {
        const response = await fetch(`${BASE_URL}/api/teams/${sport}`);
        if (response.ok) {
          const data = await response.json();
          return { 
            success: true, 
            teams: data.teams || data,
            source: 'backend'
          };
        }
      } catch (error) {
        console.log('Backend teams failed, using mock teams:', error.message);
      }
    }
    
    return {
      success: true,
      teams: teams[sport] || [],
      count: (teams[sport] || []).length,
      source: 'mock'
    };
  },
  
  // Get team roster by team ID
  async getTeamRoster(teamId) {
    console.log(`👥 Getting roster for team ${teamId}`);
    
    // Find team in any sport
    for (const sport in teams) {
      const team = teams[sport].find(t => t.id === parseInt(teamId));
      if (team) {
        // Find players on this team
        const roster = samplePlayers[sport].filter(player => 
          player.team === team.name
        );
        
        return {
          success: true,
          team,
          roster,
          sport,
          count: roster.length,
          source: 'mock'
        };
      }
    }
    
    return { 
      success: false, 
      error: 'Team not found',
      source: 'mock'
    };
  },
  
  // Get league standings for a sport
  async getStandings(sport) {
    console.log(`📈 Getting ${sport} standings`);
    
    // Try backend first
    if (process.env.EXPO_PUBLIC_USE_BACKEND === 'true') {
      try {
        const response = await fetch(`${BASE_URL}/api/standings/${sport}`);
        if (response.ok) {
          const data = await response.json();
          return { 
            success: true, 
            standings: data.standings || data,
            sport,
            source: 'backend'
          };
        }
      } catch (error) {
        console.log('Backend standings failed, using mock standings:', error.message);
      }
    }
    
    // Generate standings from team data
    const sportTeams = teams[sport] || [];
    
    const standings = sportTeams
      .map(team => ({
        team: team.name,
        wins: team.record?.wins || 0,
        losses: team.record?.losses || 0,
        ties: team.record?.ties || 0,
        pointsFor: team.record?.pointsFor || 0,
        pointsAgainst: team.record?.pointsAgainst || 0,
        winPercentage: team.record?.wins ? team.record.wins / (team.record.wins + team.record.losses + (team.record.ties || 0)) : 0
      }))
      .sort((a, b) => b.winPercentage - a.winPercentage)
      .map((team, index) => ({
        ...team,
        rank: index + 1
      }));
    
    return {
      success: true,
      standings,
      sport,
      lastUpdated: new Date().toISOString(),
      source: 'mock'
    };
  },
  
  // Get schedule for a sport
  async getSchedule(sport, week = null) {
    console.log(`📅 Getting ${sport} schedule`, week ? `for week ${week}` : '');
    
    // Use existing game functions for NBA/NHL
    if (sport === 'NBA') {
      const games = await this.getNBAGames();
      return { 
        ...games, 
        sport: 'NBA',
        source: 'mock'
      };
    } else if (sport === 'NHL') {
      const games = await this.getNHLGames();
      return { 
        ...games, 
        sport: 'NHL',
        source: 'mock'
      };
    }
    
    // For NFL/MLB, generate mock schedule
    const sportTeams = teams[sport] || [];
    const schedule = [];
    
    if (sportTeams.length > 0) {
      // Generate 5 mock games
      for (let i = 0; i < 5; i++) {
        const homeTeam = sportTeams[Math.floor(Math.random() * sportTeams.length)];
        const awayTeam = sportTeams[Math.floor(Math.random() * sportTeams.length)];
        
        if (homeTeam.id !== awayTeam.id) {
          schedule.push({
            id: `game_${sport}_${Date.now()}_${i}`,
            sport,
            homeTeam: {
              id: homeTeam.id,
              name: homeTeam.name,
              city: homeTeam.city,
              abbreviation: homeTeam.name.split(' ').pop()
            },
            awayTeam: {
              id: awayTeam.id,
              name: awayTeam.name,
              city: awayTeam.city,
              abbreviation: awayTeam.name.split(' ').pop()
            },
            date: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            time: '7:00 PM',
            location: homeTeam.stadium || 'Stadium',
            status: i < 2 ? 'Final' : 'Scheduled',
            homeScore: i < 2 ? Math.floor(Math.random() * 40) + 80 : null,
            awayScore: i < 2 ? Math.floor(Math.random() * 40) + 70 : null
          });
        }
      }
    }
    
    return {
      success: true,
      sport,
      schedule,
      count: schedule.length,
      source: 'mock'
    };
  },
  
  // Get stat categories for a sport
  async getStatCategories(sport) {
    console.log(`📊 Getting ${sport} stat categories`);
    
    return {
      success: true,
      sport,
      categories: statCategories[sport] || {},
      source: 'mock'
    };
  },
  
  // Get stat leaders for a category
  async getStatLeaders(sport, category, limit = 10) {
    console.log(`🏆 Getting ${sport} leaders for ${category}`);
    
    const players = samplePlayers[sport] || [];
    
    // Determine which stat to use based on category
    let statKey = category;
    if (sport === 'NBA' && category === 'scoring') {
      statKey = 'points';
    } else if (sport === 'NFL' && category === 'passing') {
      statKey = 'passingYards';
    } else if (sport === 'MLB' && category === 'batting') {
      statKey = 'battingAvg';
    } else if (sport === 'NHL' && category === 'scoring') {
      statKey = 'points';
    }
    
    // Get leaders
    const leaders = players
      .filter(player => {
        if (!player.stats) return false;
        
        // Position-specific filtering for NFL
        if (sport === 'NFL') {
          if (category === 'passing' && player.position !== 'QB') return false;
          if (category === 'rushing' && player.position !== 'RB') return false;
          if (category === 'receiving' && !['WR', 'TE'].includes(player.position)) return false;
        }
        
        return true;
      })
      .map(player => {
        let value = 0;
        
        // Get appropriate stat value
        if (player.stats && player.stats[statKey]) {
          value = player.stats[statKey];
        } else if (category === 'fantasyPoints') {
          value = player.fantasyPoints || 0;
        }
        
        return {
          playerId: player.id,
          playerName: player.name,
          playerTeam: player.team,
          playerPosition: player.position,
          value: value,
          rank: 0
        };
      })
      .filter(player => player.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));
    
    return {
      success: true,
      sport,
      category,
      statKey,
      leaders,
      count: leaders.length,
      source: 'mock'
    };
  },

  // === PLAYER COMPARISON ===
  async comparePlayers(playerIds) {
    console.log(`📊 Comparing players:`, playerIds);
    
    const players = [];
    
    for (const playerId of playerIds) {
      const playerResult = await this.getPlayerById(playerId);
      if (playerResult.success) {
        players.push(playerResult.player);
      }
    }
    
    if (players.length === 0) {
      return { success: false, error: 'No valid players found' };
    }
    
    // Extract common stats for comparison
    const commonStats = {};
    const sport = players[0].sport || 'NFL';
    
    if (sport === 'NBA') {
      commonStats.points = players.map(p => p.stats?.points || 0);
      commonStats.rebounds = players.map(p => p.stats?.rebounds || 0);
      commonStats.assists = players.map(p => p.stats?.assists || 0);
    } else if (sport === 'NFL') {
      commonStats.touchdowns = players.map(p => (p.stats?.passingTDs || 0) + (p.stats?.rushingTDs || 0) + (p.stats?.receivingTDs || 0));
      commonStats.yards = players.map(p => (p.stats?.passingYards || 0) + (p.stats?.rushingYards || 0) + (p.stats?.receivingYards || 0));
    }
    
    return {
      success: true,
      players,
      sport,
      comparison: commonStats,
      source: 'mock'
    };
  },

  // === PLAYER TRENDS ===
  async getPlayerTrends(playerId, period = 'last5') {
    console.log(`📈 Getting trends for player ${playerId}, period: ${period}`);
    
    const playerResult = await this.getPlayerById(playerId);
    if (!playerResult.success) {
      return playerResult;
    }
    
    // Generate mock trend data
    const player = playerResult.player;
    const sport = playerResult.sport;
    
    let trendStats = [];
    
    if (sport === 'NBA') {
      trendStats = [
        { game: 'Game 1', points: Math.floor(player.stats?.points * 0.9), rebounds: Math.floor(player.stats?.rebounds * 0.9), assists: Math.floor(player.stats?.assists * 0.9) },
        { game: 'Game 2', points: Math.floor(player.stats?.points * 1.1), rebounds: Math.floor(player.stats?.rebounds * 1.2), assists: Math.floor(player.stats?.assists * 1.1) },
        { game: 'Game 3', points: Math.floor(player.stats?.points * 0.8), rebounds: Math.floor(player.stats?.rebounds * 0.7), assists: Math.floor(player.stats?.assists * 0.9) },
        { game: 'Game 4', points: Math.floor(player.stats?.points * 1.2), rebounds: Math.floor(player.stats?.rebounds * 1.1), assists: Math.floor(player.stats?.assists * 1.3) },
        { game: 'Game 5', points: Math.floor(player.stats?.points), rebounds: Math.floor(player.stats?.rebounds), assists: Math.floor(player.stats?.assists) },
      ];
    }
    
    return {
      success: true,
      player: player,
      period,
      trends: trendStats,
      average: {
        points: trendStats.reduce((sum, game) => sum + game.points, 0) / trendStats.length,
        rebounds: trendStats.reduce((sum, game) => sum + game.rebounds, 0) / trendStats.length,
        assists: trendStats.reduce((sum, game) => sum + game.assists, 0) / trendStats.length,
      },
      source: 'mock'
    };
  },

  // === ENHANCED FETCH METHOD (From File 3) ===
  fetchWithFallbacks,
  trackDataUsage
};

export default apiService;
