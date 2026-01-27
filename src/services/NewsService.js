// src/services/NewsService.js - News API calls
import { apiService } from './ApiService';

const NEWS_BASE_URL = '/api/news';

export const NewsService = {
  // Get all news with filtering
  getNews(options = {}) {
    const {
      sport = null,
      category = null,
      limit = 20,
      offset = 0
    } = options;
    
    const params = { limit, offset };
    if (sport) params.sport = sport;
    if (category) params.category = category;
    
    const cacheKey = `news_${sport || 'all'}_${category || 'all'}_${limit}_${offset}`;
    
    return apiService.fetchWithCache(NEWS_BASE_URL, {
      ttl: 300000, // 5 minutes
      params,
      cacheKey
    });
  },

  // Get top stories
  getTopStories(limit = 5) {
    return apiService.fetchWithCache(`${NEWS_BASE_URL}/top`, {
      ttl: 600000, // 10 minutes
      params: { limit },
      cacheKey: `news_top_${limit}`
    });
  },

  // Get trending news
  getTrending() {
    return apiService.fetchWithCache(`${NEWS_BASE_URL}/trending`, {
      ttl: 300000,
      cacheKey: 'news_trending'
    });
  },

  // Get news by sport
  getSportNews(sport, limit = 10) {
    return this.getNews({ sport, limit });
  },

  // NBA News (from your logs)
  getNBANews() {
    return this.getSportNews('nba');
  },

  // NFL News (from your logs)
  getNFLNews() {
    return this.getSportNews('nfl');
  },

  // Get single article
  getArticle(articleId) {
    return apiService.fetchWithCache(`${NEWS_BASE_URL}/${articleId}`, {
      ttl: 600000,
      cacheKey: `news_article_${articleId}`
    });
  },

  // Search news
  searchNews(query, options = {}) {
    const { limit = 20, sport = null } = options;
    
    const params = { q: query, limit };
    if (sport) params.sport = sport;
    
    return apiService.fetchWithCache(`${NEWS_BASE_URL}/search`, {
      ttl: 300000,
      params,
      cacheKey: `news_search_${query}_${sport || 'all'}`
    });
  },

  // Mock data fallback (from your logs)
  getMockNews() {
    return [
      {
        id: 1,
        title: 'NBA Trade Deadline Approaching',
        excerpt: 'Teams are making last-minute moves...',
        sport: 'nba',
        publishedAt: new Date().toISOString(),
        imageUrl: 'https://example.com/image.jpg'
      },
      {
        id: 2,
        title: 'NFL Playoff Picture Clearer',
        excerpt: 'With 3 weeks remaining, playoff spots are taking shape...',
        sport: 'nfl',
        publishedAt: new Date().toISOString(),
        imageUrl: 'https://example.com/image2.jpg'
      }
    ];
  },

  // Refresh methods
  refreshNews(sport = null) {
    const pattern = sport ? `news_${sport}` : 'news_';
    apiService.clearCache(pattern);
  },

  // Get news by multiple sports
  async getMultiSportNews(sports = ['nba', 'nfl'], limit = 5) {
    const promises = sports.map(sport => 
      this.getSportNews(sport, limit)
        .catch(() => []) // Return empty array on error
    );
    
    const results = await Promise.all(promises);
    
    // Combine and sort by date
    const allNews = results.flat();
    return allNews.sort((a, b) => 
      new Date(b.publishedAt) - new Date(a.publishedAt)
    ).slice(0, limit * sports.length);
  }
};
