const NEWS_API_KEY = process.env.NEWS_API_KEY;

class NewsService {
    constructor() {
        this.baseURL = 'https://newsapi.org/v2';
    }

    async getNBANews(pageSize = 10) {
        try {
            if (!NEWS_API_KEY) {
                console.log('⚠️ No News API key, using mock news data');
                return this.getMockNews();
            }

            const url = `${this.baseURL}/everything?q=NBA&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`News API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Fetched ${data.articles?.length || 0} NBA news articles`);
            return data.articles || [];
        } catch (error) {
            console.error('Error fetching NBA news:', error);
            return this.getMockNews();
        }
    }

    async getTeamNews(teamName, pageSize = 5) {
        try {
            if (!NEWS_API_KEY) {
                return this.getMockTeamNews(teamName);
            }

            const url = `${this.baseURL}/everything?q=${encodeURIComponent(teamName + ' NBA')}&language=en&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Team news API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.articles || [];
        } catch (error) {
            console.error('Error fetching team news:', error);
            return this.getMockTeamNews(teamName);
        }
    }

    async getPlayerNews(playerName, pageSize = 5) {
        try {
            if (!NEWS_API_KEY) {
                return this.getMockPlayerNews(playerName);
            }

            const url = `${this.baseURL}/everything?q=${encodeURIComponent(playerName + ' NBA')}&language=en&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Player news API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.articles || [];
        } catch (error) {
            console.error('Error fetching player news:', error);
            return this.getMockPlayerNews(playerName);
        }
    }

    getMockNews() {
        return [
            {
                title: 'NBA Season Heats Up With Surprising Team Performances',
                description: 'Unexpected teams are making waves in the early season with impressive performances.',
                url: 'https://example.com/nba-news-1',
                publishedAt: '2024-11-16T12:00:00Z',
                source: { name: 'NBA News' }
            },
            {
                title: 'Star Player Sets New Record in Historic Performance',
                description: 'Another milestone achieved in what is shaping up to be an incredible season.',
                url: 'https://example.com/nba-news-2', 
                publishedAt: '2024-11-15T18:30:00Z',
                source: { name: 'Basketball Insider' }
            },
            {
                title: 'Injury Updates Impacting Fantasy Basketball Lineups',
                description: 'Key players facing injury concerns that could affect upcoming games.',
                url: 'https://example.com/nba-news-3',
                publishedAt: '2024-11-15T15:45:00Z',
                source: { name: 'Fantasy Sports Network' }
            }
        ];
    }

    getMockTeamNews(teamName) {
        return [
            {
                title: `${teamName} Make Strategic Roster Move Ahead of Deadline`,
                description: `Latest updates and analysis on ${teamName}'s recent roster decisions and future plans.`,
                url: `https://example.com/${teamName.toLowerCase()}-news-1`,
                publishedAt: '2024-11-16T10:00:00Z',
                source: { name: 'Team News' }
            },
            {
                title: `${teamName} Coaching Staff Implements New Offensive System`,
                description: `Breaking down the strategic changes that could impact ${teamName}'s performance.`,
                url: `https://example.com/${teamName.toLowerCase()}-news-2`,
                publishedAt: '2024-11-15T14:20:00Z',
                source: { name: 'Basketball Analysis' }
            }
        ];
    }

    getMockPlayerNews(playerName) {
        return [
            {
                title: `${playerName} Continues Dominant Season With Career-High Performance`,
                description: `In-depth look at ${playerName}'s recent performances and impact on the team's success.`,
                url: `https://example.com/${playerName.toLowerCase()}-news-1`,
                publishedAt: '2024-11-16T14:00:00Z',
                source: { name: 'Player Spotlight' }
            },
            {
                title: `${playerName} Named Player of the Week After Stellar Performances`,
                description: `Recognition for outstanding contributions and leadership on the court.`,
                url: `https://example.com/${playerName.toLowerCase()}-news-2`,
                publishedAt: '2024-11-15T16:30:00Z',
                source: { name: 'NBA Awards' }
            }
        ];
    }
}

module.exports = new NewsService();
