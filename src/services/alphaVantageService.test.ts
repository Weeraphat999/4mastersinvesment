import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRateLimited, fetchFinancials, fetchOverview } from './alphaVantageService';

describe('AlphaVantageService', () => {
  describe('isRateLimited', () => {
    it('returns false for null/undefined', () => {
      expect(isRateLimited(null)).toBe(false);
      expect(isRateLimited(undefined)).toBe(false);
    });

    it('returns false for non-object values', () => {
      expect(isRateLimited('string')).toBe(false);
      expect(isRateLimited(123)).toBe(false);
      expect(isRateLimited(true)).toBe(false);
    });

    it('returns false for objects without Note or Information fields', () => {
      expect(isRateLimited({ data: 'some data' })).toBe(false);
      expect(isRateLimited({})).toBe(false);
    });

    it('detects rate limit via Note field', () => {
      expect(
        isRateLimited({
          Note: 'Thank you for using Alpha Vantage! Our standard API call frequency is 25 calls per day.',
        })
      ).toBe(true);
    });

    it('detects rate limit via Information field', () => {
      expect(
        isRateLimited({
          Information: 'Thank you for using Alpha Vantage! This is a rate limit message.',
        })
      ).toBe(true);
    });

    it('detects rate limit keyword in Note', () => {
      expect(
        isRateLimited({
          Note: 'API rate limit reached. Please wait.',
        })
      ).toBe(true);
    });

    it('returns false for Note field without rate limit keywords', () => {
      expect(
        isRateLimited({
          Note: 'Some other informational message.',
        })
      ).toBe(false);
    });
  });

  describe('fetchFinancials', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('returns null when API key is not configured', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', '');
      const result = await fetchFinancials('AAPL');
      expect(result).toBeNull();
    });

    it('returns null when API key is placeholder', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'your_api_key_here');
      const result = await fetchFinancials('AAPL');
      expect(result).toBeNull();
    });

    it('fetches and returns financial data for 4 annual periods', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'test_key_123');

      const mockReports = [
        { fiscalDateEnding: '2023-12-31', totalRevenue: '100000', netIncome: '20000', totalAssets: '500000', totalLiabilities: '200000', operatingCashflow: '30000', capitalExpenditures: '10000' },
        { fiscalDateEnding: '2022-12-31', totalRevenue: '90000', netIncome: '18000', totalAssets: '450000', totalLiabilities: '180000', operatingCashflow: '28000', capitalExpenditures: '9000' },
        { fiscalDateEnding: '2021-12-31', totalRevenue: '80000', netIncome: '16000', totalAssets: '400000', totalLiabilities: '160000', operatingCashflow: '25000', capitalExpenditures: '8000' },
        { fiscalDateEnding: '2020-12-31', totalRevenue: '70000', netIncome: '14000', totalAssets: '350000', totalLiabilities: '140000', operatingCashflow: '22000', capitalExpenditures: '7000' },
        { fiscalDateEnding: '2019-12-31', totalRevenue: '60000', netIncome: '12000', totalAssets: '300000', totalLiabilities: '120000', operatingCashflow: '20000', capitalExpenditures: '6000' },
      ];

      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ annualReports: mockReports }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchFinancials('aapl');
      expect(result).not.toBeNull();
      expect(result!.incomeStatement).toHaveLength(4);
      expect(result!.balanceSheet).toHaveLength(4);
      expect(result!.cashFlow).toHaveLength(4);
      expect(result!.incomeStatement[0].fiscalDateEnding).toBe('2023-12-31');
    });

    it('normalizes ticker to uppercase', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'test_key_123');

      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ annualReports: [] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await fetchFinancials('  aapl  ');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('symbol=AAPL')
      );
    });

    it('returns null when rate limited', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'test_key_123');

      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ Note: 'Thank you for using Alpha Vantage! Our standard API call frequency is 25 calls per day.' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchFinancials('AAPL');
      expect(result).toBeNull();
    });

    it('returns null on fetch error', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'test_key_123');

      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchFinancials('AAPL');
      expect(result).toBeNull();
    });
  });

  describe('fetchOverview', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('returns null when API key is not configured', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', '');
      const result = await fetchOverview('AAPL');
      expect(result).toBeNull();
    });

    it('fetches and returns overview data', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'test_key_123');

      const mockOverview = {
        Symbol: 'AAPL',
        Name: 'Apple Inc',
        Sector: 'Technology',
        MarketCapitalization: '3000000000000',
        PERatio: '28.5',
        ProfitMargin: '0.25',
        DebtToEquityRatio: '1.5',
        PEGRatio: '2.1',
        PriceToSalesRatioTTM: '7.5',
      };

      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockOverview),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchOverview('AAPL');
      expect(result).not.toBeNull();
      expect(result!.Symbol).toBe('AAPL');
      expect(result!.Name).toBe('Apple Inc');
      expect(result!.Sector).toBe('Technology');
      expect(result!.MarketCapitalization).toBe('3000000000000');
      expect(result!.PERatio).toBe('28.5');
      expect(result!.ProfitMargin).toBe('0.25');
      expect(result!.DebtToEquityRatio).toBe('1.5');
      expect(result!.PEGRatio).toBe('2.1');
      expect(result!.PriceToSalesRatioTTM).toBe('7.5');
    });

    it('normalizes ticker to uppercase', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'test_key_123');

      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ Symbol: 'MSFT', Name: 'Microsoft' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await fetchOverview('  msft  ');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('symbol=MSFT')
      );
    });

    it('returns null when rate limited', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'test_key_123');

      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ Information: 'Thank you for using Alpha Vantage! API rate limit reached.' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchOverview('AAPL');
      expect(result).toBeNull();
    });

    it('returns null for invalid ticker (empty response)', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'test_key_123');

      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({}),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchOverview('INVALIDTICKER');
      expect(result).toBeNull();
    });

    it('returns null on fetch error', async () => {
      vi.stubEnv('VITE_ALPHA_VANTAGE_KEY', 'test_key_123');

      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchOverview('AAPL');
      expect(result).toBeNull();
    });
  });
});
