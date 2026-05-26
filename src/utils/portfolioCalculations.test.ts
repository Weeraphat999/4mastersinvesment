import { describe, it, expect } from 'vitest';
import {
  computeTotalValue,
  computeTotalPnL,
  computeHighRiskExposure,
  computeGainLoss,
  computeGainLossPercent,
  computePortfolioPercent,
  computeRiskBreakdown,
  getTopPerformers,
  getBottomPerformers,
  getOverLimitHoldings,
  computePieSlices,
  sortHoldings,
  filterHoldings,
} from './portfolioCalculations';
import { PortfolioHolding } from '../data/types';

function makeHolding(overrides: Partial<PortfolioHolding> = {}): PortfolioHolding {
  return {
    id: '1',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    shares: 10,
    avgCost: 100,
    currentPrice: 150,
    purchaseDate: '2024-01-01',
    category: 'Technology',
    riskLevel: 'medium',
    notes: '',
    ...overrides,
  };
}

describe('computeTotalValue', () => {
  it('returns 0 for empty array', () => {
    expect(computeTotalValue([])).toBe(0);
  });

  it('sums shares × currentPrice for all holdings', () => {
    const holdings = [
      makeHolding({ shares: 10, currentPrice: 100 }),
      makeHolding({ shares: 5, currentPrice: 200 }),
    ];
    expect(computeTotalValue(holdings)).toBe(2000);
  });
});

describe('computeTotalPnL', () => {
  it('returns 0 for empty array', () => {
    expect(computeTotalPnL([])).toBe(0);
  });

  it('sums (currentPrice - avgCost) × shares', () => {
    const holdings = [
      makeHolding({ shares: 10, avgCost: 100, currentPrice: 150 }),
      makeHolding({ shares: 5, avgCost: 200, currentPrice: 180 }),
    ];
    // (150-100)*10 + (180-200)*5 = 500 + (-100) = 400
    expect(computeTotalPnL(holdings)).toBe(400);
  });
});

describe('computeHighRiskExposure', () => {
  it('returns 0 when totalValue is 0', () => {
    expect(computeHighRiskExposure([], 0)).toBe(0);
  });

  it('computes percentage of high-risk holdings', () => {
    const holdings = [
      makeHolding({ shares: 10, currentPrice: 100, riskLevel: 'high' }),
      makeHolding({ shares: 10, currentPrice: 100, riskLevel: 'low' }),
    ];
    // high-risk value = 1000, total = 2000 → 50%
    expect(computeHighRiskExposure(holdings, 2000)).toBe(50);
  });
});

describe('computeGainLoss', () => {
  it('computes (currentPrice - avgCost) × shares', () => {
    const holding = makeHolding({ shares: 10, avgCost: 100, currentPrice: 120 });
    expect(computeGainLoss(holding)).toBe(200);
  });

  it('returns negative for loss', () => {
    const holding = makeHolding({ shares: 5, avgCost: 100, currentPrice: 80 });
    expect(computeGainLoss(holding)).toBe(-100);
  });
});

describe('computeGainLossPercent', () => {
  it('returns 0 when avgCost is 0', () => {
    const holding = makeHolding({ avgCost: 0, currentPrice: 100 });
    expect(computeGainLossPercent(holding)).toBe(0);
  });

  it('computes percentage gain', () => {
    const holding = makeHolding({ avgCost: 100, currentPrice: 150 });
    expect(computeGainLossPercent(holding)).toBe(50);
  });
});

describe('computePortfolioPercent', () => {
  it('returns 0 when totalValue is 0', () => {
    const holding = makeHolding({ shares: 10, currentPrice: 100 });
    expect(computePortfolioPercent(holding, 0)).toBe(0);
  });

  it('computes holding value as percentage of total', () => {
    const holding = makeHolding({ shares: 10, currentPrice: 100 });
    // value = 1000, total = 5000 → 20%
    expect(computePortfolioPercent(holding, 5000)).toBe(20);
  });
});

describe('computeRiskBreakdown', () => {
  it('returns zeros when totalValue is 0', () => {
    expect(computeRiskBreakdown([], 0)).toEqual({ low: 0, medium: 0, high: 0 });
  });

  it('computes percentage for each risk level', () => {
    const holdings = [
      makeHolding({ shares: 10, currentPrice: 100, riskLevel: 'low' }),
      makeHolding({ shares: 10, currentPrice: 100, riskLevel: 'medium' }),
      makeHolding({ shares: 10, currentPrice: 100, riskLevel: 'high' }),
    ];
    const result = computeRiskBreakdown(holdings, 3000);
    expect(result.low).toBeCloseTo(33.33, 1);
    expect(result.medium).toBeCloseTo(33.33, 1);
    expect(result.high).toBeCloseTo(33.33, 1);
  });
});

describe('getTopPerformers', () => {
  it('returns top N by gain/loss percent descending', () => {
    const holdings = [
      makeHolding({ id: '1', ticker: 'A', avgCost: 100, currentPrice: 110 }), // 10%
      makeHolding({ id: '2', ticker: 'B', avgCost: 100, currentPrice: 150 }), // 50%
      makeHolding({ id: '3', ticker: 'C', avgCost: 100, currentPrice: 130 }), // 30%
    ];
    const top = getTopPerformers(holdings, 2);
    expect(top).toHaveLength(2);
    expect(top[0].ticker).toBe('B');
    expect(top[1].ticker).toBe('C');
  });
});

describe('getBottomPerformers', () => {
  it('returns bottom N by gain/loss percent ascending', () => {
    const holdings = [
      makeHolding({ id: '1', ticker: 'A', avgCost: 100, currentPrice: 110 }), // 10%
      makeHolding({ id: '2', ticker: 'B', avgCost: 100, currentPrice: 80 }),  // -20%
      makeHolding({ id: '3', ticker: 'C', avgCost: 100, currentPrice: 90 }),  // -10%
    ];
    const bottom = getBottomPerformers(holdings, 2);
    expect(bottom).toHaveLength(2);
    expect(bottom[0].ticker).toBe('B');
    expect(bottom[1].ticker).toBe('C');
  });
});

describe('getOverLimitHoldings', () => {
  it('returns empty when totalValue is 0', () => {
    expect(getOverLimitHoldings([makeHolding()], 0)).toEqual([]);
  });

  it('filters holdings exceeding threshold', () => {
    const holdings = [
      makeHolding({ id: '1', ticker: 'A', shares: 20, currentPrice: 100 }), // 2000/5000 = 40%
      makeHolding({ id: '2', ticker: 'B', shares: 5, currentPrice: 100 }),   // 500/5000 = 10%
      makeHolding({ id: '3', ticker: 'C', shares: 25, currentPrice: 100 }),  // 2500/5000 = 50%
    ];
    const totalValue = 5000;
    const overLimit = getOverLimitHoldings(holdings, totalValue);
    expect(overLimit).toHaveLength(2);
    expect(overLimit.map(h => h.ticker)).toContain('A');
    expect(overLimit.map(h => h.ticker)).toContain('C');
  });

  it('uses custom threshold', () => {
    const holdings = [
      makeHolding({ id: '1', ticker: 'A', shares: 20, currentPrice: 100 }), // 2000/5000 = 40%
      makeHolding({ id: '2', ticker: 'B', shares: 5, currentPrice: 100 }),   // 500/5000 = 10%
    ];
    const overLimit = getOverLimitHoldings(holdings, 5000, 30);
    expect(overLimit).toHaveLength(1);
    expect(overLimit[0].ticker).toBe('A');
  });
});

describe('computePieSlices', () => {
  it('returns empty array when totalValue is 0', () => {
    expect(computePieSlices([], 0)).toEqual([]);
  });

  it('computes slices with correct angles summing to 360', () => {
    const holdings = [
      makeHolding({ id: '1', ticker: 'A', shares: 10, currentPrice: 100 }),
      makeHolding({ id: '2', ticker: 'B', shares: 10, currentPrice: 100 }),
    ];
    const slices = computePieSlices(holdings, 2000);
    expect(slices).toHaveLength(2);
    expect(slices[0].startAngle).toBe(0);
    expect(slices[0].endAngle).toBeCloseTo(180);
    expect(slices[1].startAngle).toBeCloseTo(180);
    expect(slices[1].endAngle).toBeCloseTo(360);
    expect(slices[0].percent).toBeCloseTo(50);
    expect(slices[1].percent).toBeCloseTo(50);
  });
});

describe('sortHoldings', () => {
  it('sorts by ticker ascending', () => {
    const holdings = [
      makeHolding({ ticker: 'MSFT' }),
      makeHolding({ ticker: 'AAPL' }),
      makeHolding({ ticker: 'GOOG' }),
    ];
    const sorted = sortHoldings(holdings, 'ticker', 'asc', 0);
    expect(sorted[0].ticker).toBe('AAPL');
    expect(sorted[1].ticker).toBe('GOOG');
    expect(sorted[2].ticker).toBe('MSFT');
  });

  it('sorts by currentPrice descending', () => {
    const holdings = [
      makeHolding({ ticker: 'A', currentPrice: 50 }),
      makeHolding({ ticker: 'B', currentPrice: 200 }),
      makeHolding({ ticker: 'C', currentPrice: 100 }),
    ];
    const sorted = sortHoldings(holdings, 'currentPrice', 'desc', 0);
    expect(sorted[0].ticker).toBe('B');
    expect(sorted[1].ticker).toBe('C');
    expect(sorted[2].ticker).toBe('A');
  });
});

describe('filterHoldings', () => {
  it('filters by ticker case-insensitively', () => {
    const holdings = [
      makeHolding({ ticker: 'AAPL', companyName: 'Apple Inc.' }),
      makeHolding({ ticker: 'MSFT', companyName: 'Microsoft Corp.' }),
    ];
    const result = filterHoldings(holdings, 'aapl');
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('AAPL');
  });

  it('filters by companyName case-insensitively', () => {
    const holdings = [
      makeHolding({ ticker: 'AAPL', companyName: 'Apple Inc.' }),
      makeHolding({ ticker: 'MSFT', companyName: 'Microsoft Corp.' }),
    ];
    const result = filterHoldings(holdings, 'micro');
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('MSFT');
  });

  it('returns all holdings for empty query', () => {
    const holdings = [
      makeHolding({ ticker: 'AAPL' }),
      makeHolding({ ticker: 'MSFT' }),
    ];
    const result = filterHoldings(holdings, '');
    expect(result).toHaveLength(2);
  });
});
