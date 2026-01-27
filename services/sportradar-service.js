const SPORTS_RADAR_API_KEY = process.env.SPORTS_RADAR_API_KEY;

class SportradarService {
  constructor() {
    this.baseURL = 'https://api.sportradar.com/nba/trial/v8/en';
  }

  async makeRequest(endpoint) {
    try {
      const url = `${this.baseURL}${endpoint}?api_key=${SPORTS_RADAR_API_KEY}`;
      console.log(`🔄 Fetching from Sportradar: ${endpoint}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`❌ Sportradar API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // Player endpoints
  async getPlayerProfile(playerId) {
    return this.makeRequest(`/players/${playerId}/profile`);
  }

  async getPlayerStats(playerId, season = '2024') {
    return this.makeRequest(`/players/${playerId}/profile`);
  }

  // Team endpoints
  async getTeamProfile(teamId) {
    return this.makeRequest(`/teams/${teamId}/profile`);
  }

  async getTeamRoster(teamId) {
    return this.makeRequest(`/teams/${teamId}/profile`);
  }

  // Game endpoints
  async getDailySchedule(year, month, day) {
    return this.makeRequest(`/games/${year}/${month}/${day}/schedule`);
  }

  async getLiveGameStats(gameId) {
    return this.makeRequest(`/games/${gameId}/summary`);
  }

  async getSeasonSchedule(season = '2024', type = 'REG') {
    return this.makeRequest(`/games/${season}/${type}/schedule`);
  }

  // League endpoints
  async getLeagueHierarchy() {
    return this.makeRequest('/league/hierarchy');
  }

  async getStandings(season = '2024') {
    return this.makeRequest(`/seasons/${season}/REG/standings`);
  }
}

module.exports = new SportradarService();
