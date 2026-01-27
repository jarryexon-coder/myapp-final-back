const WebSocket = require('ws');

class WebSocketServer {
    constructor(server = null) {
        // For Google App Engine, use the main server instance
        if (server) {
            this.wss = new WebSocket.Server({ server });
            console.log('📡 WebSocket server attached to main HTTP server (GAE compatible)');
        } else {
            // Fallback for local development
            const port = process.env.WEBSOCKET_PORT || process.env.PORT || 8080;
            this.wss = new WebSocket.Server({ port });
            console.log(`📡 WebSocket server running on standalone port ${port} (local development)`);
        }
        
        this.liveConnections = new Map();
        this.userSubscriptions = new Map();
        this.init();
    }

    init() {        
        this.wss.on('connection', (ws, req) => {
            const userId = this.extractUserIdFromRequest(req);
            console.log(`🔗 WebSocket connected: ${userId}`);
            
            this.liveConnections.set(userId, ws);
            this.userSubscriptions.set(userId, { games: [], players: [], teams: [] });
            
            ws.on('message', (message) => {
                this.handleWebSocketMessage(userId, JSON.parse(message));
            });
            
            ws.on('close', () => {
                this.liveConnections.delete(userId);
                this.userSubscriptions.delete(userId);
                console.log(`🔌 WebSocket disconnected: ${userId}`);
            });
            
            // Send welcome with current live games
            this.sendInitialData(ws, userId);
        });

        console.log(`✅ WebSocket server initialized successfully`);
        
        // Start simulation of live updates (in production, this would be real data)
        this.startLiveUpdates();
    }

    extractUserIdFromRequest(req) {
        // Extract user ID from request (e.g., from query params or headers)
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            return url.searchParams.get('userId') || 'anonymous';
        } catch (error) {
            return 'anonymous';
        }
    }

    handleWebSocketMessage(userId, message) {
        console.log(`📨 WebSocket message from ${userId}:`, message.type);
        
        switch (message.type) {
            case 'SUBSCRIBE_GAMES':
                this.handleGameSubscription(userId, message.gameIds);
                break;
            case 'UNSUBSCRIBE_GAMES':
                this.handleGameUnsubscription(userId, message.gameIds);
                break;
            case 'SUBSCRIBE_PLAYERS':
                this.handlePlayerSubscription(userId, message.playerIds);
                break;
            case 'PING':
                this.sendToUser(userId, { type: 'PONG', timestamp: Date.now() });
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }

    handleGameSubscription(userId, gameIds) {
        const userSubs = this.userSubscriptions.get(userId) || { games: [], players: [], teams: [] };
        userSubs.games = [...new Set([...userSubs.games, ...gameIds])];
        this.userSubscriptions.set(userId, userSubs);
        console.log(`🎯 User ${userId} subscribed to games:`, gameIds);
    }

    handleGameUnsubscription(userId, gameIds) {
        const userSubs = this.userSubscriptions.get(userId) || { games: [], players: [], teams: [] };
        userSubs.games = userSubs.games.filter(id => !gameIds.includes(id));
        this.userSubscriptions.set(userId, userSubs);
        console.log(`🎯 User ${userId} unsubscribed from games:`, gameIds);
    }

    handlePlayerSubscription(userId, playerIds) {
        const userSubs = this.userSubscriptions.get(userId) || { games: [], players: [], teams: [] };
        userSubs.players = [...new Set([...userSubs.players, ...playerIds])];
        this.userSubscriptions.set(userId, userSubs);
        console.log(`🎯 User ${userId} subscribed to players:`, playerIds);
    }

    sendInitialData(ws, userId) {
        const welcomeData = {
            type: 'WELCOME',
            userId: userId,
            message: 'Connected to NBA Fantasy AI Live Updates',
            features: [
                'LIVE_GAME_UPDATES',
                'PLAYER_STAT_UPDATES', 
                'INJURY_ALERTS',
                'BETTING_ALERTS'
            ],
            timestamp: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(welcomeData));
    }

    // Broadcast methods
    sendToUser(userId, data) {
        const ws = this.liveConnections.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    broadcastToAll(data) {
        this.liveConnections.forEach((ws, userId) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        });
    }

    // Specific broadcast methods
    broadcastGameUpdate(gameData) {
        const updateData = {
            type: 'GAME_UPDATE',
            gameId: gameData.id,
            data: {
                score: gameData.score,
                status: gameData.status,
                time: gameData.time,
                keyPlays: gameData.key_plays,
                playerUpdates: gameData.player_updates,
                timestamp: new Date().toISOString()
            }
        };
        
        this.broadcastToAll(updateData);
    }

    broadcastInjuryUpdate(injuryData) {
        const updateData = {
            type: 'INJURY_UPDATE',
            data: {
                player: injuryData.player,
                team: injuryData.team,
                injury: injuryData.injury,
                status: injuryData.status,
                impact: injuryData.impact,
                timestamp: new Date().toISOString()
            }
        };
        
        this.broadcastToAll(updateData);
    }

    broadcastBettingAlert(alertData) {
        const updateData = {
            type: 'BETTING_ALERT',
            data: {
                type: alertData.type,
                game: alertData.game,
                description: alertData.description,
                confidence: alertData.confidence,
                timestamp: new Date().toISOString()
            }
        };
        
        this.broadcastToAll(updateData);
    }

    // Simulate live updates (in production, this would connect to real data feeds)
    startLiveUpdates() {
        setInterval(() => {
            this.simulateGameUpdates();
            this.simulateInjuryUpdates();
            this.simulateBettingAlerts();
        }, 30000); // Every 30 seconds
    }

    simulateGameUpdates() {
        const games = [
            {
                id: 'Lakers vs Warriors',
                score: 'LAL 89 - 84 GSW',
                status: 'LIVE - 3rd Quarter',
                time: '8:34 remaining',
                key_plays: [
                    '🏀 LeBron James dunk (2 pts)',
                    '🎯 Stephen Curry three-pointer (3 pts)'
                ],
                player_updates: {
                    'LeBron James': '28 PTS, 8 REB, 7 AST',
                    'Stephen Curry': '25 PTS, 4 REB, 5 AST'
                }
            }
        ];

        games.forEach(game => {
            // Only broadcast to users subscribed to this game
            this.liveConnections.forEach((ws, userId) => {
                const userSubs = this.userSubscriptions.get(userId);
                if (userSubs && userSubs.games.includes(game.id)) {
                    this.broadcastGameUpdate(game);
                }
            });
        });
    }

    simulateInjuryUpdates() {
        const injuries = [
            {
                player: 'Kawhi Leonard',
                team: 'LA Clippers',
                injury: 'Knee soreness',
                status: 'QUESTIONABLE',
                impact: 'High - Load management likely'
            }
        ];

        injuries.forEach(injury => {
            this.broadcastInjuryUpdate(injury);
        });
    }

    simulateBettingAlerts() {
        const alerts = [
            {
                type: 'LINE_MOVEMENT',
                game: 'Lakers vs Warriors',
                description: 'Over/Under moved from 228.5 to 230.5',
                confidence: 'High'
            }
        ];

        alerts.forEach(alert => {
            this.broadcastBettingAlert(alert);
        });
    }

    // Health check
    getStats() {
        return {
            totalConnections: this.liveConnections.size,
            activeUsers: Array.from(this.liveConnections.keys()),
            totalSubscriptions: Array.from(this.userSubscriptions.values()).reduce((acc, subs) => 
                acc + subs.games.length + subs.players.length + subs.teams.length, 0
            ),
            uptime: process.uptime()
        };
    }
}

module.exports = WebSocketServer;
