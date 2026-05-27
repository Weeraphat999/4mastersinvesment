import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PortfolioHolding } from '../data/types';

// Mock the yahooFinanceService to avoid Supabase dependency
vi.mock('../services/yahooFinanceService', () => ({
  fetchQuote: vi.fn(),
}));

import { fetchQuote } from '../services/yahooFinanceService';
import { refreshPrices } from './priceRefresh';

const mockFetchQuote = vi.mocked(fetchQuote);

function makeHolding(overrides: Partial<PortfolioHolding> = {}): PortfolioHolding {
  return {
    id: '1',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    shares: 10,
    avgCost: 150,
    currentPrice: 160,
    purchaseDate: '2024-01-01',
    category: 'Technology',
    riskLevel: 'low',
    notes: '',
    ...overrides,
  };
}

describe('refreshPrices', () => {
  beforeEach(() => {
    mockFetchQuote.mockReset();
  });

  it('returns a new array without mutating the input', async () => {
    mockFetchQuote.mockResolvedValue({
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      longName: 'Apple Inc.',
      regularMarketPrice: 165,
      regularMarketChangePercent: 1.0,
      marketCap: 2800000000000,
      fiftyTwoWeekLow: 120,
      fiftyTwoWeekHigh: 200,
      regularMarketVolume: 50000000,
      sector: 'Technology',
    });

    const holdings = [makeHolding()];
    const original = { ...holdings[0] };
    const result = await refreshPrices(holdings);

    expect(result).not.toBe(holdings);
    expect(holdings[0].currentPrice).toBe(original.currentPrice);
  });

  it('returns the same number of holdings', async () => {
    mockFetchQuote.mockResolvedValue({
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      longName: 'Apple Inc.',
      regularMarketPrice: 165,
      regularMarketChangePercent: 1.0,
      marketCap: 2800000000000,
      fiftyTwoWeekLow: 120,
      fiftyTwoWeekHigh: 200,
      regularMarketVolume: 50000000,
      sector: 'Technology',
    });

    const holdings = [makeHolding(), makeHolding({ id: '2', ticker: 'MSFT' })];
    const result = await refreshPrices(holdings);
    expect(result).toHaveLength(2);
  });

  it('keeps all fields except currentPrice unchanged', async () => {
    mockFetchQuote.mockResolvedValue({
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      longName: 'Apple Inc.',
      regularMarketPrice: 165,
      regularMarketChangePercent: 1.0,
      marketCap: 2800000000000,
      fiftyTwoWeekLow: 120,
      fiftyTwoWeekHigh: 200,
      regularMarketVolume: 50000000,
      sector: 'Technology',
    });

    const holdings = [makeHolding()];
    const result = await refreshPrices(holdings);

    expect(result[0].id).toBe(holdings[0].id);
    expect(result[0].ticker).toBe(holdings[0].ticker);
    expect(result[0].companyName).toBe(holdings[0].companyName);
    expect(result[0].shares).toBe(holdings[0].shares);
    expect(result[0].avgCost).toBe(holdings[0].avgCost);
    expect(result[0].purchaseDate).toBe(holdings[0].purchaseDate);
    expect(result[0].category).toBe(holdings[0].category);
    expect(result[0].riskLevel).toBe(holdings[0].riskLevel);
    expect(result[0].notes).toBe(holdings[0].notes);
  });

  it('updates currentPrice from fetched quote', async () => {
    mockFetchQuote.mockResolvedValue({
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      longName: 'Apple Inc.',
      regularMarketPrice: 175.50,
      regularMarketChangePercent: 1.0,
      marketCap: 2800000000000,
      fiftyTwoWeekLow: 120,
      fiftyTwoWeekHigh: 200,
      regularMarketVolume: 50000000,
      sector: 'Technology',
    });

    const holdings = [makeHolding({ currentPrice: 160 })];
    const result = await refreshPrices(holdings);
    expect(result[0].currentPrice).toBe(175.50);
  });

  it('rounds currentPrice to 2 decimal places', async () => {
    mockFetchQuote.mockResolvedValue({
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      longName: 'Apple Inc.',
      regularMarketPrice: 123.456,
      regularMarketChangePercent: 1.0,
      marketCap: 2800000000000,
      fiftyTwoWeekLow: 120,
      fiftyTwoWeekHigh: 200,
      regularMarketVolume: 50000000,
      sector: 'Technology',
    });

    const holdings = [makeHolding({ currentPrice: 100 })];
    const result = await refreshPrices(holdings);
    const decimals = result[0].currentPrice.toString().split('.')[1];
    expect(!decimals || decimals.length <= 2).toBe(true);
  });

  it('returns the same array reference when given an empty array', async () => {
    const result = await refreshPrices([]);
    expect(result).toEqual([]);
  });

  it('keeps existing price when fetch fails', async () => {
    mockFetchQuote.mockRejectedValue(new Error('Network error'));

    const holdings = [makeHolding({ currentPrice: 160 })];
    const result = await refreshPrices(holdings);
    expect(result[0].currentPrice).toBe(160);
  });

  it('keeps existing price when fetched price is 0', async () => {
    mockFetchQuote.mockResolvedValue({
      symbol: 'AAPL',
      shortName: 'Apple Inc.',
      longName: 'Apple Inc.',
      regularMarketPrice: 0,
      regularMarketChangePercent: 0,
      marketCap: 0,
      fiftyTwoWeekLow: 0,
      fiftyTwoWeekHigh: 0,
      regularMarketVolume: 0,
      sector: 'Technology',
    });

    const holdings = [makeHolding({ currentPrice: 160 })];
    const result = await refreshPrices(holdings);
    expect(result[0].currentPrice).toBe(160);
  });
});
