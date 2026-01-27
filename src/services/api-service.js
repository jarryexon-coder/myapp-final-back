// Production-ready API service - CLEAN VERSION (NO NOTIFICATIONS)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    this.BASE_URL = 'https://pleasing-determination-production.up.railway.app';
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    this.cache = new Map();
  }

  // Headers
  getHeaders = async () => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add auth token if exists
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  // ============ API METHODS ============

  async getLiveGames() {
    try {
      console.log('📡 Fetching live games from /api/nba/games');
      const response = await axios.get(
        `${this.BASE_URL}/api/nba/games`,
        { 
          headers: await this.getHeaders(),
          timeout: 5000
        }
      );
      
      const games = response.data?.games || [];
      const liveGames = games.filter(game => game.status === "live");
      console.log(`✅ Found ${liveGames.length} live games`);
      return liveGames;
    } catch (error) {
      console.warn('⚠️ Live games error:', error.message);
      return [];
    }
  }

  async getGames(date = new Date().toISOString().split('T')[0]) {
    try {
      console.log(`📡 Fetching games for date: ${date}`);
      const response = await axios.get(
        `${this.BASE_URL}/api/nba/games?date=${date}`,
        { 
          headers: await this.getHeaders(),
          timeout: 5000
        }
      );
      console.log('✅ Games response:', response.status);
      return response.data?.games || [];
    } catch (error) {
      console.warn('⚠️ Games error:', error.message);
      return [];
    }
  }

  async getNBAPlayers() {
    try {
      console.log('📡 Fetching NBA players');
      const response = await axios.get(
        `${this.BASE_URL}/api/nba/players`,
        { 
          headers: await this.getHeaders(),
          timeout: 5000
        }
      );
      console.log('✅ Players response:', response.status);
      return response.data || [];
    } catch (error) {
      console.warn('⚠️ Players error:', error.message);
      return [];
    }
  }

  // Mock methods for endpoints that don't exist yet
  async getNHLGames() {
    console.log('📡 NHL games: Returning mock data');
    return [
      {
        id: 1,
        homeTeam: "Bruins",
        awayTeam: "Maple Leafs",
        homeScore: 3,
        awayScore: 2,
        period: "3rd",
        timeRemaining: "5:00",
        status: "live"
      }
    ];
  }

  async getDailyPicks() {
    console.log('📡 Daily picks: Returning mock data');
    return [
      {
        player: "LeBron James",
        stat: "Points",
        prediction: "Over 27.5",
        confidence: 85
      }
    ];
  }

  async getFantasyAdvice() {
    console.log('📡 Fantasy advice: Returning mock data');
    return [
      {
        title: "Start 'Em",
        players: ["Anthony Davis", "Luka Doncic"],
        reason: "Favorable matchups"
      }
    ];
  }

  async getNFLGames() {
    console.log('📡 NFL games: Returning mock data');
    return [
      { id: 1, home: 'Chiefs', away: 'Eagles', time: '8:20 PM ET' }
    ];
  }

  async getNFLStandings() {
    console.log('📡 NFL standings: Mock data');
    return [
      { team: 'Chiefs', wins: 10, losses: 2 },
      { team: 'Eagles', wins: 9, losses: 3 }
    ];
  }

  async getNFLNews() {
    console.log('📡 NFL news: Mock data');
    return [
      { title: 'NFL Week 13 Preview', source: 'ESPN' }
    ];
  }

  // Parlay Builder Methods (keep these if you want)
  async getPlayerProps(playerId) {
    console.log('📡 Getting player props for:', playerId);
    return [
      { id: 1, stat: 'Points', line: 27.5, odds: 1.91 },
      { id: 2, stat: 'Rebounds', line: 8.5, odds: 1.83 }
    ];
  }

  async getGameProps(gameId) {
    console.log('📡 Getting game props for:', gameId);
    return [
      { id: 1, type: 'Moneyline', team: 'Home', odds: 1.75 },
      { id: 2, type: 'Moneyline', team: 'Away', odds: 2.10 }
    ];
  }

  async placeParlay(parlayData) {
    console.log('📡 Placing parlay:', parlayData);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          ticketId: `TICKET-${Date.now()}`,
          potentialPayout: parlayData.betAmount * parlayData.odds,
          placedAt: new Date().toISOString()
        });
      }, 1000);
    });
  }

  // ============ NEW MOCK METHODS ============
  
  async getNewsAll() {
    console.log('📡 News: Mock data');
    return [
      {
        id: 1,
        title: "Latest Sports News",
        summary: "Your mock news item here.",
        source: "Mock Source"
      }
    ];
  }

  async getNHLStandings() {
    console.log('📡 NHL standings: Mock data');
    return [
      { team: 'Bruins', wins: 20, losses: 5, points: 40 },
      { team: 'Maple Leafs', wins: 18, losses: 7, points: 36 }
    ];
  }

  async getAiPredictions() {
    console.log('📡 AI Predictions: Mock data');
    return [
      {
        id: 1,
        player: 'LeBron James',
        prediction: 'Over 27.5 points',
        confidence: 85
      }
    ];
  }
}

// ✅ Export an INSTANCE of the class
export default new ApiService();
