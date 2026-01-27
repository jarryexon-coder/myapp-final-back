const SPORTS_RADAR_API_KEY = process.env.SPORTS_RADAR_API_KEY_PROD || process.env.SPORTS_RADAR_API_KEY;

class SportsRadarService {
    constructor() {
        this.baseURL = 'https://api.sportradar.com/nba/trial/v8/en';
        this.apiKey = SPORTS_RADAR_API_KEY;
    }

    // Existing methods
    async getPlayerStats(playerName, season = '2024') {
        try {
            if (!this.apiKey) {
                console.log('⚠️ No Sports Radar API key, using mock data');
                return this.getMockPlayerStats(playerName);
            }
            
            console.log(`🔍 Fetching real stats for: ${playerName}`);
            
            // Search for player ID first
            const searchUrl = `${this.baseURL}/players.json?api_key=${this.apiKey}`;
            const searchResponse = await fetch(searchUrl);
            
            if (!searchResponse.ok) {
                throw new Error(`Player search API responded with status: ${searchResponse.status}`);
            }
            
            const playersData = await searchResponse.json();
            const players = playersData.players || [];
            
            const player = players.find(p => 
                p.full_name && p.full_name.toLowerCase().includes(playerName.toLowerCase())
            );
            
            if (!player) {
                console.log(`❌ Player not found in API: ${playerName}`);
                return this.getMockPlayerStats(playerName);
            }
            
            console.log(`✅ Found player: ${player.full_name} (ID: ${player.id})`);
            
            // Get player profile with stats
            const profileUrl = `${this.baseURL}/players/${player.id}/profile.json?api_key=${this.apiKey}`;
            const profileResponse = await fetch(profileUrl);
            
            if (!profileResponse.ok) {
                throw new Error(`Player profile API responded with status: ${profileResponse.status}`);
            }
            
            const profile = await profileResponse.json();
            return this.formatPlayerStats(profile);
            
        } catch (error) {
            console.error('💥 Sports Radar API Error:', error.message);
            return this.getMockPlayerStats(playerName);
        }
    }

    // NEW: Injury methods
    async getPlayerInjuries() {
        try {
            if (!this.apiKey) {
                console.log('⚠️ No Sports Radar API key, using mock injury data');
                return this.getMockInjuries();
            }

            const url = `${this.baseURL}/league/injuries.json?api_key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Injuries API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Real injury data fetched successfully');
            return data;
        } catch (error) {
            console.error('Error fetching player injuries:', error);
            return this.getMockInjuries();
        }
    }

    async getTeamInjuries(teamId) {
        try {
            if (!this.apiKey) {
                return this.getMockInjuries().teams?.find(t => t.id === teamId) || { players: [] };
            }

            const url = `${this.baseURL}/teams/${teamId}/injuries.json?api_key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Team injuries API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching team injuries:', error);
            return { players: [] };
        }
    }

    // NEW: Daily injuries for historical tracking
    async getDailyInjuries(date) {
        try {
            if (!this.apiKey) {
                return this.getMockInjuries();
            }

            const url = `${this.baseURL}/league/daily_injuries/${date}.json?api_key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Daily injuries API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching daily injuries:', error);
            return { teams: [] };
        }
    }

    // Formatting and mock data methods
    formatPlayerStats(profile) {
        try {
            const seasons = profile.seasons || [];
            const currentSeason = seasons[seasons.length - 1] || {};
            const teams = currentSeason.teams || [];
            const currentTeam = teams[teams.length - 1] || {};
            const stats = currentTeam.statistics || {};
            const totals = stats.total || {};
            
            return {
                points: totals.points ? parseFloat(totals.points) : 0,
                rebounds: totals.rebounds ? parseFloat(totals.rebounds) : 0,
                assists: totals.assists ? parseFloat(totals.assists) : 0,
                steals: totals.steals ? parseFloat(totals.steals) : 0,
                blocks: totals.blocks ? parseFloat(totals.blocks) : 0,
                fgp: totals.field_goals_pct ? parseFloat(totals.field_goals_pct) * 100 : 0,
                games_played: totals.games_played || 0
            };
        } catch (error) {
            console.error('Error formatting player stats:', error);
            return this.getMockPlayerStats(profile.full_name || 'Unknown Player');
        }
    }

    getMockPlayerStats(playerName) {
        const mockStats = {
            'Stephen Curry': { points: 28.5, rebounds: 5.2, assists: 6.5, steals: 1.2, blocks: 0.3, fgp: 47.5, games_played: 65 },
            'LeBron James': { points: 25.3, rebounds: 7.8, assists: 7.3, steals: 1.3, blocks: 0.6, fgp: 52.1, games_played: 68 },
            'Nikola Jokic': { points: 26.1, rebounds: 12.3, assists: 9.1, steals: 1.3, blocks: 0.9, fgp: 58.3, games_played: 72 },
            'Giannis Antetokounmpo': { points: 30.8, rebounds: 11.5, assists: 6.4, steals: 1.2, blocks: 1.1, fgp: 54.7, games_played: 70 },
            'Kevin Durant': { points: 28.2, rebounds: 6.6, assists: 5.7, steals: 0.9, blocks: 1.3, fgp: 53.0, games_played: 62 }
        };
        
        const defaultStats = { points: 18.5, rebounds: 5.2, assists: 4.1, steals: 0.8, blocks: 0.4, fgp: 45.2, games_played: 60 };
        return mockStats[playerName] || defaultStats;
    }

    getMockInjuries() {
        return {
            teams: [
                {
                    id: 'lakers',
                    name: 'Los Angeles Lakers',
                    players: [
                        {
                            id: 'lebron-james',
                            full_name: 'LeBron James',
                            injury: {
                                comment: 'Questionable for Wednesday\'s game',
                                desc: 'Ankle',
                                status: 'Day To Day',
                                start_date: '2024-11-15',
                                update_date: '2024-11-16'
                            }
                        }
                    ]
                },
                {
                    id: 'warriors', 
                    name: 'Golden State Warriors',
                    players: [
                        {
                            id: 'stephen-curry',
                            full_name: 'Stephen Curry',
                            injury: {
                                comment: 'Probable for next game',
                                desc: 'Knee',
                                status: 'Day To Day', 
                                start_date: '2024-11-14',
                                update_date: '2024-11-16'
                            }
                        }
                    ]
                },
                {
                    id: 'celtics',
                    name: 'Boston Celtics',
                    players: [
                        {
                            id: 'kristaps-porzingis',
                            full_name: 'Kristaps Porzingis',
                            injury: {
                                comment: 'Out for 2 weeks',
                                desc: 'Calf strain',
                                status: 'Out',
                                start_date: '2024-11-10',
                                update_date: '2024-11-16'
                            }
                        }
                    ]
                }
            ]
        };
    }

    // Live games method
    async getLiveGames() {
        try {
            if (!this.apiKey) {
                return this.getMockGames();
            }
            
            const url = `${this.baseURL}/games/2024/REG/schedule.json?api_key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Schedule API responded with status: ${response.status}`);
            }
            
            const schedule = await response.json();
            return this.formatGames(schedule);
        } catch (error) {
            console.error('Live games API error:', error);
            return this.getMockGames();
        }
    }

    formatGames(schedule) {
        try {
            const games = schedule.games || [];
            return games.slice(0, 10).map(game => ({
                id: game.id,
                home: game.home?.name || 'Unknown',
                away: game.away?.name || 'Unknown',
                status: game.status || 'scheduled',
                date: game.scheduled || ''
            }));
        } catch (error) {
            console.error('Error formatting games:', error);
            return this.getMockGames();
        }
    }

    getMockGames() {
        return [
            { id: '1', home: 'Lakers', away: 'Warriors', status: 'scheduled', date: '2024-11-15' },
            { id: '2', home: 'Celtics', away: 'Heat', status: 'scheduled', date: '2024-11-15' },
            { id: '3', home: 'Nuggets', away: 'Suns', status: 'scheduled', date: '2024-11-15' }
        ];
    }
}

module.exports = new SportsRadarService();
