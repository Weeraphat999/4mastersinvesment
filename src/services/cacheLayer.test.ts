import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildCacheKey,
  get,
  set,
  isExpired,
  clear,
  TTL_CONFIG,
  _resetForTesting,
} from './cacheLayer';
import type { CacheEntry } from './types';

describe('cacheLayer', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetForTesting();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildCacheKey', () => {
    it('builds key in fdi:{TICKER}:{dataType} format', () => {
      expect(buildCacheKey('aapl', 'quote')).toBe('fdi:AAPL:quote');
    });

    it('uppercases the ticker', () => {
      expect(buildCacheKey('msft', 'historical')).toBe('fdi:MSFT:historical');
    });

    it('handles already-uppercase tickers', () => {
      expect(buildCacheKey('GOOG', 'financials')).toBe('fdi:GOOG:financials');
    });

    it('handles mixed case tickers', () => {
      expect(buildCacheKey('TsLa', 'overview')).toBe('fdi:TSLA:overview');
    });
  });

  describe('isExpired', () => {
    it('returns false when entry is within TTL', () => {
      const entry: CacheEntry<string> = { data: 'test', timestamp: Date.now() - 30_000 };
      expect(isExpired(entry, 'quote')).toBe(false); // 30s < 60s TTL
    });

    it('returns true when entry exceeds TTL', () => {
      const entry: CacheEntry<string> = { data: 'test', timestamp: Date.now() - 120_000 };
      expect(isExpired(entry, 'quote')).toBe(true); // 120s > 60s TTL
    });

    it('returns true when entry is exactly at TTL boundary', () => {
      const entry: CacheEntry<string> = { data: 'test', timestamp: Date.now() - TTL_CONFIG.quote };
      expect(isExpired(entry, 'quote')).toBe(true);
    });

    it('uses correct TTL for historical (1 hour)', () => {
      const entry: CacheEntry<string> = { data: 'test', timestamp: Date.now() - 30 * 60 * 1000 };
      expect(isExpired(entry, 'historical')).toBe(false); // 30min < 1hr
    });

    it('uses correct TTL for financials (24 hours)', () => {
      const entry: CacheEntry<string> = { data: 'test', timestamp: Date.now() - 12 * 60 * 60 * 1000 };
      expect(isExpired(entry, 'financials')).toBe(false); // 12hr < 24hr
    });

    it('uses correct TTL for overview (24 hours)', () => {
      const entry: CacheEntry<string> = { data: 'test', timestamp: Date.now() - 25 * 60 * 60 * 1000 };
      expect(isExpired(entry, 'overview')).toBe(true); // 25hr > 24hr
    });
  });

  describe('set and get', () => {
    it('stores and retrieves data', () => {
      set('AAPL', 'quote', { price: 150 });
      expect(get('AAPL', 'quote')).toEqual({ price: 150 });
    });

    it('returns null for missing entries', () => {
      expect(get('AAPL', 'quote')).toBeNull();
    });

    it('returns null for expired entries', () => {
      // Manually store an expired entry
      const key = buildCacheKey('AAPL', 'quote');
      const entry: CacheEntry<{ price: number }> = {
        data: { price: 150 },
        timestamp: Date.now() - TTL_CONFIG.quote - 1000,
      };
      localStorage.setItem(key, JSON.stringify(entry));

      expect(get('AAPL', 'quote')).toBeNull();
    });

    it('removes expired entries from localStorage on get', () => {
      const key = buildCacheKey('AAPL', 'quote');
      const entry: CacheEntry<{ price: number }> = {
        data: { price: 150 },
        timestamp: Date.now() - TTL_CONFIG.quote - 1000,
      };
      localStorage.setItem(key, JSON.stringify(entry));

      get('AAPL', 'quote');
      expect(localStorage.getItem(key)).toBeNull();
    });

    it('handles corrupted JSON gracefully', () => {
      const key = buildCacheKey('AAPL', 'quote');
      localStorage.setItem(key, 'not-valid-json');
      expect(get('AAPL', 'quote')).toBeNull();
    });

    it('normalizes ticker case on get', () => {
      set('aapl', 'quote', { price: 150 });
      expect(get('AAPL', 'quote')).toEqual({ price: 150 });
    });

    it('stores timestamp with the entry', () => {
      const before = Date.now();
      set('AAPL', 'quote', { price: 150 });
      const after = Date.now();

      const key = buildCacheKey('AAPL', 'quote');
      const raw = localStorage.getItem(key);
      const entry = JSON.parse(raw!) as CacheEntry<unknown>;

      expect(entry.timestamp).toBeGreaterThanOrEqual(before);
      expect(entry.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('clear', () => {
    it('removes all fdi: entries when no ticker specified', () => {
      set('AAPL', 'quote', { price: 150 });
      set('GOOG', 'historical', [1, 2, 3]);
      localStorage.setItem('other-key', 'should-remain');

      clear();

      expect(get('AAPL', 'quote')).toBeNull();
      expect(get('GOOG', 'historical')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('should-remain');
    });

    it('removes only entries for a specific ticker', () => {
      set('AAPL', 'quote', { price: 150 });
      set('AAPL', 'historical', [1, 2, 3]);
      set('GOOG', 'quote', { price: 2800 });

      clear('AAPL');

      expect(get('AAPL', 'quote')).toBeNull();
      expect(get('AAPL', 'historical')).toBeNull();
      expect(get('GOOG', 'quote')).toEqual({ price: 2800 });
    });

    it('normalizes ticker case when clearing', () => {
      set('AAPL', 'quote', { price: 150 });
      clear('aapl');
      expect(get('AAPL', 'quote')).toBeNull();
    });
  });

  describe('in-memory fallback', () => {
    it('falls back to memory when localStorage.setItem throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      set('AAPL', 'quote', { price: 150 });
      // Should still be retrievable from memory
      expect(get('AAPL', 'quote')).toEqual({ price: 150 });
    });

    it('falls back to memory when localStorage.getItem throws', () => {
      // First store in memory mode
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('SecurityError');
      });

      // This will trigger fallback
      get('AAPL', 'quote');

      // Now set should use memory
      set('AAPL', 'quote', { price: 150 });
      expect(get('AAPL', 'quote')).toEqual({ price: 150 });
    });

    it('logs a warning when switching to memory fallback', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      set('AAPL', 'quote', { price: 150 });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('localStorage unavailable')
      );
    });

    it('clear works with memory fallback', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      set('AAPL', 'quote', { price: 150 });
      set('GOOG', 'quote', { price: 2800 });

      clear('AAPL');
      expect(get('AAPL', 'quote')).toBeNull();
      expect(get('GOOG', 'quote')).toEqual({ price: 2800 });
    });
  });
});
