// src/services/NFLService.js - NFL-specific API calls
import { apiService } from './ApiService';

const NFL_BASE_URL = '/api/nfl';

export const NFLService = {
  // Games endpoints
  getGames(week = null, season = null) {
    const params = {};
    if (week) params.week = week;
    if (season) params.season = season;
    
    return apiService.fetchWithCache(`${NFL_BASE_URL}/games`, {
      ttl: 60000,
      params,
      cacheKey: `nfl_games_week${week || 'current'}_season${season || 'current'}`
    });
  },

  getLiveGames() {
    return apiService.fetchWithCache(`${NFL_BASE_URL}/games/live`, {
      ttl: 15000, // 15 seconds for NFL live
      cacheKey: 'nfl_live_games'
    });
  },

  // Standings
  getStandings(conference = null) {
    const params = {};
    if (conference) params.conference = conference;
    
    return apiService.fetchWithCache(`${NFL_BASE_URL}/standings`, {
      ttl: 300000,
      params,
      cacheKey: `nfl_standings_${conference || 'all'}`
    });
  },

  // Team data
  getTeams() {
    return apiService.fetchWithCache(`${NFL_BASE_URL}/teams`, {
      ttl: 86400000, // 24 hours
      cacheKey: 'nfl_teams'
    });
  },

  // Player stats
  getPlayers(position = null, team = null) {
    const params = {};
    if (position) params.position = position;
    if (team) params.team = team;
    
    return apiService.fetchWithCache(`${NFL_BASE_URL}/players`, {
      ttl: 300000,
      params,
      cacheKey: `nfl_players_${position || 'all'}_${team || 'all'}`
    });
  },

  // News (from your logs)
  getNews() {
    return apiService.fetchWithCache(`${NFL_BASE_URL}/news`, {
      ttl: 300000,
      cacheKey: 'nfl_news'
    });
  },

  // Analytics
  getAnalytics() {
    return apiService.fetchWithCache(`${NFL_BASE_URL}/analytics`, {
      ttl: 60000,
      cacheKey: 'nfl_analytics'
    });
  },

  // Schedule
  getSchedule(season = null) {
    const params = {};
    if (season) params.season = season;
    
    return apiService.fetchWithCache(`${NFL_BASE_URL}/schedule`, {
      ttl: 3600000, // 1 hour
      params,
      cacheKey: `nfl_schedule_${season || 'current'}`
    });
  },

  // Mock data fallback (from your logs)
  getMockData() {
    return {
      games: [
        {
          id: 1,
          homeTeam: 'Chiefs',
          awayTeam: '49ers',
          status: 'upcoming',
          time: '6:30 PM'
        }
      ],
      standings: [
        { team: 'Chiefs', wins: 10, losses: 2 },
        { team: '49ers', wins: 9, losses: 3 }
      ],
      news: [
        { id: 1, title: 'NFL Week 15 Preview', excerpt: 'Key matchups to watch...' }
      ]
    };
  },

  // Refresh methods
  refreshGames() {
    apiService.clearCache('nfl_games');
  },

  refreshStandings() {
    apiService.clearCache('nfl_standings');
  }
};
