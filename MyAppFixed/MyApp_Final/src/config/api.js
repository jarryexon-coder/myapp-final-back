export const API_BASE_URL = 'http://10.0.0.183:3000'; // Your local IP
// OR for local development: 'http://localhost:3000'
// OR for production: 'https://your-backend-domain.com'

export const API_ENDPOINTS = {
  health: '/health',
  nba: {
    gamesToday: '/api/nba/games/today',
    players: '/api/nba/players',
    fantasy: '/api/nba/fantasy/advice',
    odds: '/api/nba/betting/odds'
  },
  // ... other endpoints
  analytics: '/api/analytics'
};
