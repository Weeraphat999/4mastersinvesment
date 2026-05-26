import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  classifyError,
  isNetworkError,
  isTimeoutError,
  isNotFoundError,
} from './errorHandler';

describe('errorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('isNetworkError', () => {
    it('returns true for TypeError with "fetch" in message', () => {
      expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
    });

    it('returns true for TypeError with "network" in message', () => {
      expect(isNetworkError(new TypeError('network error occurred'))).toBe(true);
    });

    it('returns false for TypeError without network keywords', () => {
      expect(isNetworkError(new TypeError('Cannot read property'))).toBe(false);
    });

    it('returns false for non-TypeError errors', () => {
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(false);
    });

    it('returns false for non-error values', () => {
      expect(isNetworkError('network error')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe('isTimeoutError', () => {
    it('returns true for DOMException with name AbortError', () => {
      const error = new DOMException('The operation was aborted', 'AbortError');
      expect(isTimeoutError(error)).toBe(true);
    });

    it('returns true for Error with name AbortError', () => {
      const error = new Error('Aborted');
      error.name = 'AbortError';
      expect(isTimeoutError(error)).toBe(true);
    });

    it('returns false for regular errors', () => {
      expect(isTimeoutError(new Error('timeout'))).toBe(false);
    });

    it('returns false for non-error values', () => {
      expect(isTimeoutError('AbortError')).toBe(false);
      expect(isTimeoutError(null)).toBe(false);
    });
  });

  describe('isNotFoundError', () => {
    it('returns true for status 404', () => {
      expect(isNotFoundError(404)).toBe(true);
    });

    it('returns false for other status codes', () => {
      expect(isNotFoundError(200)).toBe(false);
      expect(isNotFoundError(500)).toBe(false);
      expect(isNotFoundError(403)).toBe(false);
    });
  });

  describe('classifyError', () => {
    it('classifies AbortError as TIMEOUT', () => {
      const error = new DOMException('The operation was aborted', 'AbortError');
      const result = classifyError(error);

      expect(result.type).toBe('TIMEOUT');
      expect(result.message).toBe('Request timed out. Showing cached or estimated data.');
      expect(result.technical).toContain('timeout');
    });

    it('classifies TypeError with fetch as NETWORK', () => {
      const error = new TypeError('Failed to fetch');
      const result = classifyError(error);

      expect(result.type).toBe('NETWORK');
      expect(result.message).toBe('Network connection issue. Showing cached or estimated data.');
      expect(result.technical).toContain('Failed to fetch');
    });

    it('classifies TypeError with network keyword as NETWORK', () => {
      const error = new TypeError('A network error occurred');
      const result = classifyError(error);

      expect(result.type).toBe('NETWORK');
      expect(result.message).toBe('Network connection issue. Showing cached or estimated data.');
    });

    it('classifies Error with "rate limit" in message as RATE_LIMIT', () => {
      const error = new Error('API rate limit exceeded');
      const result = classifyError(error);

      expect(result.type).toBe('RATE_LIMIT');
      expect(result.message).toBe('Daily API limit reached (25/day). Showing cached data.');
      expect(result.technical).toContain('rate limit');
    });

    it('classifies string with "rate limit" as RATE_LIMIT', () => {
      const result = classifyError('rate limit reached');

      expect(result.type).toBe('RATE_LIMIT');
      expect(result.message).toBe('Daily API limit reached (25/day). Showing cached data.');
    });

    it('classifies generic Error as UNKNOWN', () => {
      const error = new Error('Something unexpected');
      const result = classifyError(error);

      expect(result.type).toBe('UNKNOWN');
      expect(result.message).toBe('Something went wrong. Showing estimated data.');
      expect(result.technical).toContain('Something unexpected');
    });

    it('classifies string errors as UNKNOWN', () => {
      const result = classifyError('some error string');

      expect(result.type).toBe('UNKNOWN');
      expect(result.message).toBe('Something went wrong. Showing estimated data.');
      expect(result.technical).toContain('some error string');
    });

    it('classifies non-standard values as UNKNOWN', () => {
      const result = classifyError(42);

      expect(result.type).toBe('UNKNOWN');
      expect(result.message).toBe('Something went wrong. Showing estimated data.');
      expect(result.technical).toBeTruthy();
    });

    it('classifies null as UNKNOWN', () => {
      const result = classifyError(null);

      expect(result.type).toBe('UNKNOWN');
      expect(result.message).toBe('Something went wrong. Showing estimated data.');
    });

    it('includes context prefix in technical details', () => {
      const error = new Error('test error');
      const result = classifyError(error, 'YahooFinance');

      expect(result.technical).toContain('[YahooFinance]');
    });

    it('logs technical details to console.error', () => {
      const error = new Error('test error');
      classifyError(error);

      expect(console.error).toHaveBeenCalled();
    });

    it('always returns non-empty message and technical fields', () => {
      const inputs = [
        new Error('test'),
        new TypeError('Failed to fetch'),
        new DOMException('aborted', 'AbortError'),
        'string error',
        42,
        null,
        undefined,
        {},
      ];

      for (const input of inputs) {
        const result = classifyError(input);
        expect(result.message.length).toBeGreaterThan(0);
        expect(result.technical.length).toBeGreaterThan(0);
        expect(['NOT_FOUND', 'NETWORK', 'RATE_LIMIT', 'TIMEOUT', 'UNKNOWN']).toContain(result.type);
      }
    });
  });
});
