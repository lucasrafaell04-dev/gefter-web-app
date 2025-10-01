/**
 * ZIP Code Cache Service
 * Caches ZIP code API responses with 1-day TTL
 */

interface CacheEntry {
  city: string;
  state: string;
  timestamp: number;
}

interface ZipCodeCache {
  [zipCode: string]: CacheEntry;
}

class ZipCodeCacheService {
  private cacheKey = 'geffter-zipcode-cache';
  private ttl = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  /**
   * Get cached ZIP code data
   * @param zipCode - 5-digit ZIP code
   * @returns Cached data or null if not found/expired
   */
  get(zipCode: string): { city: string; state: string } | null {
    try {
      const cacheStr = localStorage.getItem(this.cacheKey);
      if (!cacheStr) return null;

      const cache: ZipCodeCache = JSON.parse(cacheStr);
      const entry = cache[zipCode];

      if (!entry) return null;

      // Check if cache entry has expired
      const now = Date.now();
      if (now - entry.timestamp > this.ttl) {
        // Cache expired, remove it
        this.remove(zipCode);
        return null;
      }

      console.log(`✅ ZIP code ${zipCode} loaded from cache`);
      return {
        city: entry.city,
        state: entry.state,
      };
    } catch (error) {
      console.error('Error reading from ZIP code cache:', error);
      return null;
    }
  }

  /**
   * Set ZIP code data in cache
   * @param zipCode - 5-digit ZIP code
   * @param city - City name
   * @param state - State name/abbreviation
   */
  set(zipCode: string, city: string, state: string): void {
    try {
      const cacheStr = localStorage.getItem(this.cacheKey);
      const cache: ZipCodeCache = cacheStr ? JSON.parse(cacheStr) : {};

      cache[zipCode] = {
        city,
        state,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
      console.log(`✅ ZIP code ${zipCode} cached for 24 hours`);
    } catch (error) {
      console.error('Error writing to ZIP code cache:', error);
    }
  }

  /**
   * Remove a specific ZIP code from cache
   * @param zipCode - 5-digit ZIP code
   */
  remove(zipCode: string): void {
    try {
      const cacheStr = localStorage.getItem(this.cacheKey);
      if (!cacheStr) return;

      const cache: ZipCodeCache = JSON.parse(cacheStr);
      delete cache[zipCode];

      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
      console.log(`🗑️ ZIP code ${zipCode} removed from cache`);
    } catch (error) {
      console.error('Error removing from ZIP code cache:', error);
    }
  }

  /**
   * Clear all cached ZIP codes
   */
  clear(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('🗑️ ZIP code cache cleared');
    } catch (error) {
      console.error('Error clearing ZIP code cache:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanup(): void {
    try {
      const cacheStr = localStorage.getItem(this.cacheKey);
      if (!cacheStr) return;

      const cache: ZipCodeCache = JSON.parse(cacheStr);
      const now = Date.now();
      let cleanedCount = 0;

      Object.keys(cache).forEach((zipCode) => {
        if (now - cache[zipCode].timestamp > this.ttl) {
          delete cache[zipCode];
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        localStorage.setItem(this.cacheKey, JSON.stringify(cache));
        console.log(`🧹 Cleaned ${cleanedCount} expired ZIP code entries from cache`);
      }
    } catch (error) {
      console.error('Error cleaning ZIP code cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { totalEntries: number; oldestEntry: Date | null } {
    try {
      const cacheStr = localStorage.getItem(this.cacheKey);
      if (!cacheStr) return { totalEntries: 0, oldestEntry: null };

      const cache: ZipCodeCache = JSON.parse(cacheStr);
      const entries = Object.values(cache);
      
      if (entries.length === 0) {
        return { totalEntries: 0, oldestEntry: null };
      }

      const oldestTimestamp = Math.min(...entries.map(e => e.timestamp));

      return {
        totalEntries: entries.length,
        oldestEntry: new Date(oldestTimestamp),
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalEntries: 0, oldestEntry: null };
    }
  }
}

// Export singleton instance
export const zipCodeCache = new ZipCodeCacheService();

// Run cleanup on initialization (client-side only)
if (typeof window !== 'undefined') {
  zipCodeCache.cleanup();
}
