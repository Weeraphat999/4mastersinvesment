import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authenticatedFetch } from './apiClient';

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { supabase } from '../lib/supabase';

describe('apiClient', () => {
  const mockGetSession = vi.mocked(supabase.auth.getSession);

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('authenticatedFetch', () => {
    it('throws an error when no active session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await expect(authenticatedFetch('/api/test')).rejects.toThrow('No active session');
    });

    it('throws an error when session has no access token', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { access_token: '' } as any },
        error: null,
      });

      await expect(authenticatedFetch('/api/test')).rejects.toThrow('No active session');
    });

    it('attaches Authorization Bearer header with session token', async () => {
      const mockToken = 'test-access-token-123';
      mockGetSession.mockResolvedValue({
        data: {
          session: { access_token: mockToken } as any,
        },
        error: null,
      });

      await authenticatedFetch('/api/quote?ticker=AAPL');

      expect(global.fetch).toHaveBeenCalledWith('/api/quote?ticker=AAPL', {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it('preserves existing headers while adding Authorization', async () => {
      const mockToken = 'my-token';
      mockGetSession.mockResolvedValue({
        data: {
          session: { access_token: mockToken } as any,
        },
        error: null,
      });

      await authenticatedFetch('/api/data', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/data', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it('passes through other RequestInit options', async () => {
      const mockToken = 'token-abc';
      mockGetSession.mockResolvedValue({
        data: {
          session: { access_token: mockToken } as any,
        },
        error: null,
      });

      await authenticatedFetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ ticker: 'AAPL' }),
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ ticker: 'AAPL' }),
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it('returns the fetch Response', async () => {
      const mockResponse = new Response('{"data": "test"}', { status: 200 });
      (global.fetch as any).mockResolvedValue(mockResponse);

      mockGetSession.mockResolvedValue({
        data: {
          session: { access_token: 'token' } as any,
        },
        error: null,
      });

      const result = await authenticatedFetch('/api/test');
      expect(result).toBe(mockResponse);
    });
  });
});
