const BALLDONTLIE_API_KEY = process.env.BALLDONTLIE_API_KEY;

class BallDontLieService {
  constructor() {
    this.baseURL = 'https://api.balldontlie.io/v1';
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );
      
      console.log(`🔄 Fetching from BallDontLie: ${endpoint}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': BALLDONTLIE_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`❌ BallDontLie API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // Player endpoints
  async searchPlayers(query, perPage = 25) {
    return this.makeRequest('/players', { search: query, per_page: perPage });
  }

  async getPlayer(playerId) {
    return this.makeRequest(`/players/${playerId}`);
  }

  async getPlayerStats(playerId, season = 2024) {
    return this.makeRequest('/stats', { 
      'player_ids[]': playerId, 
      seasons: season,
      per_page: 100 
    });
  }

  async getPlayerSeasonAverages(playerId, season = 2024) {
    return this.makeRequest('/season_averages', { 
      'player_ids[]': playerId, 
      season: season 
    });
  }

  // Game endpoints
  async getGames(date, perPage = 50) {
    return this.makeRequest('/games', { 
      'dates[]': date,
      per_page: perPage 
    });
  }

  async getGame(gameId) {
    return this.makeRequest(`/games/${gameId}`);
  }

  // Team endpoints
  async getTeams() {
    return this.makeRequest('/teams', { per_page: 30 });
  }

  async getTeam(teamId) {
    return this.makeRequest(`/teams/${teamId}`);
  }
}

module.exports = new BallDontLieService();
