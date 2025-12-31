// src/services/ApiService.js - Main caching service
class ApiService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.requestTimestamps = new Map();
    this.logEnabled = true;
  }

  _log(message, type = 'info') {
    if (this.logEnabled) {
      const prefix = {
        info: '📡',
        cache: '📦',
        error: '❌',
        warn: '⚠️'
      }[type] || '📡';
      console.log(`${prefix} ${message}`);
    }
  }

  async fetchWithCache(endpoint, options = {}) {
    const {
      ttl = 60000, // 1 minute default cache
      forceRefresh = false,
      cacheKey: customCacheKey,
      method = 'GET',
      body,
      headers = {},
      params = {}
    } = options;

    // Build URL with query parameters
    let url = endpoint;
    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    }

    // Generate cache key
    const cacheKey = customCacheKey || `${method}:${url}:${JSON.stringify(body || {})}`;

    // Debounce duplicate requests within 2 seconds
    const now = Date.now();
    const lastRequestTime = this.requestTimestamps.get(cacheKey);
    if (lastRequestTime && (now - lastRequestTime) < 2000) {
      this._log(`Debouncing duplicate request: ${cacheKey}`, 'warn');
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) return cachedData;
    }

    // Return cached data if available and valid
    const cached = this.cache.get(cacheKey);
    if (cached && !forceRefresh && (now - cached.timestamp) < ttl) {
      this._log(`Cache hit for: ${endpoint}`, 'cache');
      return cached.data;
    }

    // Handle pending requests
    if (this.pendingRequests.has(cacheKey)) {
      this._log(`Returning pending request for: ${endpoint}`, 'info');
      return this.pendingRequests.get(cacheKey);
    }

    // Mark request timestamp
    this.requestTimestamps.set(cacheKey, now);

    try {
      this._log(`Fetching: ${endpoint}`, 'info');
      
      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const promise = fetch(url, fetchOptions)
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          
          // Cache successful response
          this.cache.set(cacheKey, {
            data,
            timestamp: now,
            endpoint
          });
          
          this._log(`Success: ${endpoint}`, 'info');
          return data;
        })
        .catch(error => {
          // On error, return stale cache if available
          const staleCache = this.cache.get(cacheKey);
          if (staleCache) {
            this._log(`Using stale cache due to error: ${error.message}`, 'warn');
            return staleCache.data;
          }
          
          throw error;
        })
        .finally(() => {
          // Clean up pending request
          this.pendingRequests.delete(cacheKey);
        });

      // Store the promise for pending requests
      this.pendingRequests.set(cacheKey, promise);
      
      return await promise;

    } catch (error) {
      this._log(`Failed: ${endpoint} - ${error.message}`, 'error');
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  getCachedData(cacheKey) {
    const cached = this.cache.get(cacheKey);
    return cached ? cached.data : null;
  }

  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      this._log('All cache cleared', 'info');
    } else {
      let count = 0;
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          count++;
        }
      }
      this._log(`Cleared ${count} cache entries matching: ${pattern}`, 'info');
    }
  }

  invalidateCache(pattern) {
    this.clearCache(pattern);
  }

  getCacheStats() {
    const stats = {
      totalEntries: this.cache.size,
      totalPending: this.pendingRequests.size,
      cacheKeys: Array.from(this.cache.keys())
    };
    
    // Calculate cache age distribution
    const now = Date.now();
    let recent = 0, medium = 0, old = 0;
    
    for (const entry of this.cache.values()) {
      const age = now - entry.timestamp;
      if (age < 30000) recent++;
      else if (age < 120000) medium++;
      else old++;
    }
    
    stats.ageDistribution = { recent, medium, old };
    return stats;
  }

  enableLogging(enable = true) {
    this.logEnabled = enable;
  }
}

// Export singleton instance
export const apiService = new ApiService();
