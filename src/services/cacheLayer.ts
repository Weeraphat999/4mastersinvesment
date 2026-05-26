import type { CacheEntry } from './types';

export type CacheDataType = 'quote' | 'historical' | 'financials' | 'overview' | 'gemini' | 'fmpProfile';

export const TTL_CONFIG: Record<CacheDataType, number> = {
  quote: 60 * 1000,               // 1 minute
  historical: 60 * 60 * 1000,     // 1 hour
  financials: 24 * 60 * 60 * 1000, // 24 hours
  overview: 24 * 60 * 60 * 1000,   // 24 hours
  gemini: 60 * 60 * 1000,          // 1 hour
  fmpProfile: 24 * 60 * 60 * 1000, // 24 hours
};

const CACHE_KEY_PREFIX = 'fdi';

// In-memory fallback when localStorage is unavailable
const memoryCache = new Map<string, string>();
let useMemoryFallback = false;

/**
 * Builds a cache key in the format `fdi:{TICKER}:{dataType}`
 */
export function buildCacheKey(ticker: string, dataType: CacheDataType): string {
  return `${CACHE_KEY_PREFIX}:${ticker.toUpperCase()}:${dataType}`;
}

/**
 * Checks if a cache entry has expired based on its data type's TTL.
 */
export function isExpired(entry: CacheEntry<unknown>, dataType: CacheDataType): boolean {
  const ttl = TTL_CONFIG[dataType];
  return Date.now() - entry.timestamp >= ttl;
}

/**
 * Retrieves a cached value. Returns null if the entry is missing or expired.
 */
export function get<T>(ticker: string, dataType: CacheDataType): T | null {
  const key = buildCacheKey(ticker, dataType);
  const raw = storageGet(key);

  if (raw === null) {
    return null;
  }

  try {
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (isExpired(entry, dataType)) {
      storageRemove(key);
      return null;
    }
    return entry.data;
  } catch {
    // Corrupted entry — remove it
    storageRemove(key);
    return null;
  }
}

/**
 * Stores a value in the cache with the current timestamp.
 */
export function set<T>(ticker: string, dataType: CacheDataType, data: T): void {
  const key = buildCacheKey(ticker, dataType);
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };

  storageSet(key, JSON.stringify(entry));
}

/**
 * Clears cache entries. If a ticker is provided, only entries for that ticker
 * are removed. Otherwise, all `fdi:` prefixed entries are removed.
 */
export function clear(ticker?: string): void {
  const prefix = ticker
    ? `${CACHE_KEY_PREFIX}:${ticker.toUpperCase()}:`
    : `${CACHE_KEY_PREFIX}:`;

  if (useMemoryFallback) {
    for (const key of Array.from(memoryCache.keys())) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }
  } else {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      // If localStorage throws during clear, switch to memory fallback
      switchToMemoryFallback();
      clear(ticker);
    }
  }
}

// --- Internal storage helpers ---

function storageGet(key: string): string | null {
  if (useMemoryFallback) {
    return memoryCache.get(key) ?? null;
  }

  try {
    return localStorage.getItem(key);
  } catch {
    switchToMemoryFallback();
    return memoryCache.get(key) ?? null;
  }
}

function storageSet(key: string, value: string): void {
  if (useMemoryFallback) {
    memoryCache.set(key, value);
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or private browsing — fall back to memory
    switchToMemoryFallback();
    memoryCache.set(key, value);
  }
}

function storageRemove(key: string): void {
  if (useMemoryFallback) {
    memoryCache.delete(key);
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch {
    switchToMemoryFallback();
    memoryCache.delete(key);
  }
}

function switchToMemoryFallback(): void {
  if (!useMemoryFallback) {
    useMemoryFallback = true;
    console.warn('[CacheLayer] localStorage unavailable — using in-memory cache for this session.');
  }
}

// Exported for testing purposes only
export function _resetForTesting(): void {
  useMemoryFallback = false;
  memoryCache.clear();
}
