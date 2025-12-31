import { API_BASE_URL, ENDPOINTS, API_TIMEOUT } from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`📡 Making API request to: ${url}`);
      
      const response = await fetch(url, config);
      
      console.log(`📊 Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Specific API methods
  async getGamesToday() {
    return this.request(ENDPOINTS.GAMES_TODAY);
  }

  async getFantasyAdvice() {
    return this.request(ENDPOINTS.FANTASY_ADVICE);
  }

  async getLiveGames() {
    return this.request(ENDPOINTS.LIVE_GAMES);
  }

  async searchPlayers(query) {
    return this.request(`${ENDPOINTS.PLAYER_SEARCH}?q=${encodeURIComponent(query)}`);
  }

  async getPlayerStats(playerName) {
    return this.request(`${ENDPOINTS.PLAYER_STATS}/${encodeURIComponent(playerName)}`);
  }

  async getFantasyTeams() {
    return this.request(ENDPOINTS.FANTASY_TEAMS);
  }

  async getValueBets() {
    return this.request(ENDPOINTS.VALUE_BETS);
  }
}

export default new ApiService();
