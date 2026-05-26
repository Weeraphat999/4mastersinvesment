import { describe, it, expect } from 'vitest';
import { refreshPrices } from './priceRefresh';
import { PortfolioHolding } from '../data/types';

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
  it('returns a new array without mutating the input', () => {
    const holdings = [makeHolding()];
    const original = { ...holdings[0] };
    const result = refreshPrices(holdings);

    expect(result).not.toBe(holdings);
    expect(holdings[0].currentPrice).toBe(original.currentPrice);
  });

  it('returns the same number of holdings', () => {
    const holdings = [makeHolding(), makeHolding({ id: '2', ticker: 'MSFT' })];
    const result = refreshPrices(holdings);
    expect(result).toHaveLength(2);
  });

  it('keeps all fields except currentPrice unchanged', () => {
    const holdings = [makeHolding()];
    const result = refreshPrices(holdings);

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

  it('produces a currentPrice within ±5% of the original', () => {
    const holdings = [makeHolding({ currentPrice: 100 })];
    // Run multiple times to increase confidence
    for (let i = 0; i < 100; i++) {
      const result = refreshPrices(holdings);
      expect(result[0].currentPrice).toBeGreaterThanOrEqual(95);
      expect(result[0].currentPrice).toBeLessThanOrEqual(105);
    }
  });

  it('rounds currentPrice to 2 decimal places', () => {
    const holdings = [makeHolding({ currentPrice: 123.456 })];
    for (let i = 0; i < 50; i++) {
      const result = refreshPrices(holdings);
      const decimals = result[0].currentPrice.toString().split('.')[1];
      expect(!decimals || decimals.length <= 2).toBe(true);
    }
  });

  it('returns an empty array when given an empty array', () => {
    const result = refreshPrices([]);
    expect(result).toEqual([]);
  });
});
