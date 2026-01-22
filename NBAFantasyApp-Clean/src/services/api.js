// src/services/api.js - Enhanced API Service with Complete Mock Data
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pleasing-determination-production.up.railway.app';

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

const apiService = {
  // Existing functions...

  logSecretPhrase: async (data) => {
    try {
      console.log('📝 API Logging:', data.phraseKey);
      
      // For now, just log to console
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

  // Authentication methods (mocked for now)
  login: async (email, password) => {
    console.log('🔐 Mock login for:', email);
    return { 
      success: true, 
      user: { 
        id: 'mock_user_' + Date.now(), 
        email: email,
        username: email.split('@')[0],
        firstName: 'Demo',
        lastName: 'User',
        subscriptionTier: 'premium',
        entitlements: ['elite_insights_access', 'success_metrics_access', 'kalshi_access']
      },
      token: 'mock_jwt_token_' + Date.now()
    };
  },

  signup: async (userData) => {
    console.log('📝 Mock signup for:', userData.email);
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
      token: 'mock_jwt_token_' + Date.now()
    };
  },

  logout: async () => {
    console.log('🚪 Mock logout');
    return { success: true };
  },

  // Health check
  checkHealth: async () => {
    return {
      status: 'online',
      baseUrl: BASE_URL,
      timestamp: new Date().toISOString(),
      services: {
        nba: 'mock',
        nhl: 'mock', 
        kalshi: 'mock',
        predictions: 'mock',
        authentication: 'mock'
      }
    };
  },

  // User profile
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

  // === NBA Functions ===
  async getNBAGames() {
    console.log('🏀 Using enhanced NBA mock data');
    return getNBAGames();
  },

  async getNBAStandings() {
    console.log('🏀 Using enhanced NBA standings mock data');
    return getNBAStandings();
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

  // === NHL Functions ===
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

  // === Kalshi Functions ===
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
    
    // Simulate API delay
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

  // === Sports Predictions ===
  async getSportsPredictions(sport = 'NBA') {
    console.log(`🎯 Using ${sport} predictions mock data`);
    return getSportsPredictions(sport);
  },

  async generatePrediction(prompt, sport = 'NBA') {
    console.log(`🤖 Generating AI prediction for ${sport}:`, prompt);
    
    // Simulate AI processing
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

  // === Helper Functions for ID to Name Mapping ===
  
  // NBA Player ID to Name Mapping
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

  // NBA Team ID to Name Mapping
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

  // NHL Player ID to Name Mapping
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

  // NHL Team ID to Name Mapping
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

  // === Subscription & RevenueCat Integration ===
  
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
    
    // Simulate API delay
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

  // === Analytics & Tracking ===
  
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

  // === Search Functionality ===
  
  async searchContent(query, sport = 'all') {
    console.log('🔍 Searching for:', query, 'in sport:', sport);
    
    // Simulate search delay
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
  }
};

export default apiService;
