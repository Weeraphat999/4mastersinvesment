import { describe, it, expect } from 'vitest';
import {
  computePnlPercent,
  computePnlDollar,
  computeJournalMetrics,
  computePerformanceMetrics,
  computeMonthlyReturns,
  computeDecisionBreakdown,
  computeOutcomeDistribution,
  computeMistakeStats,
  computeCurrentStreak,
} from './journalCalculations';
import type { DecisionEntry } from '../data/types';

function makeEntry(overrides: Partial<DecisionEntry> = {}): DecisionEntry {
  return {
    id: '1',
    date: '2024-01-15T10:00:00Z',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    decision: 'BUY',
    positionSizePercent: 5,
    positionSizeAmount: 10000,
    entryPriceTarget: 100,
    currentPrice: 120,
    reasoning: 'Strong fundamentals',
    expectedOutcome: 'Growth',
    exitPlan: 'Sell at 150',
    reviewDates: ['2024-02-15'],
    scores: { buffett: 8, munger: 7, lynch: 9, rothschild: 6, overall: 7.5 },
    alertsSet: [],
    status: 'closed',
    actualOutcome: 'Gained 20%',
    lessonsLearned: 'Good entry',
    ...overrides,
  };
}

describe('computePnlPercent', () => {
  it('computes positive P&L correctly', () => {
    const entry = makeEntry({ entryPriceTarget: 100, currentPrice: 120 });
    expect(computePnlPercent(entry)).toBeCloseTo(20);
  });

  it('computes negative P&L correctly', () => {
    const entry = makeEntry({ entryPriceTarget: 100, currentPrice: 80 });
    expect(computePnlPercent(entry)).toBeCloseTo(-20);
  });

  it('returns 0 when entryPriceTarget is 0', () => {
    const entry = makeEntry({ entryPriceTarget: 0, currentPrice: 120 });
    expect(computePnlPercent(entry)).toBe(0);
  });

  it('returns 0 when prices are equal', () => {
    const entry = makeEntry({ entryPriceTarget: 100, currentPrice: 100 });
    expect(computePnlPercent(entry)).toBe(0);
  });
});

describe('computePnlDollar', () => {
  it('computes positive dollar P&L correctly', () => {
    const entry = makeEntry({ entryPriceTarget: 100, currentPrice: 120, positionSizeAmount: 10000 });
    // (120 - 100) * (10000 / 100) = 20 * 100 = 2000
    expect(computePnlDollar(entry)).toBeCloseTo(2000);
  });

  it('computes negative dollar P&L correctly', () => {
    const entry = makeEntry({ entryPriceTarget: 100, currentPrice: 80, positionSizeAmount: 10000 });
    // (80 - 100) * (10000 / 100) = -20 * 100 = -2000
    expect(computePnlDollar(entry)).toBeCloseTo(-2000);
  });

  it('returns 0 when entryPriceTarget is 0', () => {
    const entry = makeEntry({ entryPriceTarget: 0, currentPrice: 120, positionSizeAmount: 10000 });
    expect(computePnlDollar(entry)).toBe(0);
  });
});

describe('computeJournalMetrics', () => {
  it('returns correct totalDecisions for any array', () => {
    const decisions = [makeEntry(), makeEntry({ id: '2' }), makeEntry({ id: '3' })];
    const metrics = computeJournalMetrics(decisions);
    expect(metrics.totalDecisions).toBe(3);
  });

  it('returns null metrics when no closed decisions exist', () => {
    const decisions = [makeEntry({ status: 'active' }), makeEntry({ id: '2', status: 'active' })];
    const metrics = computeJournalMetrics(decisions);
    expect(metrics.totalDecisions).toBe(2);
    expect(metrics.winRate).toBeNull();
    expect(metrics.avgReturn).toBeNull();
    expect(metrics.bestTrade).toBeNull();
  });

  it('returns null metrics for empty array', () => {
    const metrics = computeJournalMetrics([]);
    expect(metrics.totalDecisions).toBe(0);
    expect(metrics.winRate).toBeNull();
    expect(metrics.avgReturn).toBeNull();
    expect(metrics.bestTrade).toBeNull();
  });

  it('computes winRate correctly', () => {
    const decisions = [
      makeEntry({ id: '1', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }), // win
      makeEntry({ id: '2', entryPriceTarget: 100, currentPrice: 80, status: 'closed' }),  // loss
      makeEntry({ id: '3', entryPriceTarget: 100, currentPrice: 110, status: 'closed' }), // win
    ];
    const metrics = computeJournalMetrics(decisions);
    expect(metrics.winRate).toBeCloseTo((2 / 3) * 100);
  });

  it('computes avgReturn correctly', () => {
    const decisions = [
      makeEntry({ id: '1', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }), // +20%
      makeEntry({ id: '2', entryPriceTarget: 100, currentPrice: 80, status: 'closed' }),  // -20%
      makeEntry({ id: '3', entryPriceTarget: 100, currentPrice: 110, status: 'closed' }), // +10%
    ];
    const metrics = computeJournalMetrics(decisions);
    // avg = (20 + -20 + 10) / 3 = 10/3
    expect(metrics.avgReturn).toBeCloseTo(10 / 3);
  });

  it('identifies bestTrade correctly', () => {
    const decisions = [
      makeEntry({ id: '1', ticker: 'AAPL', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }),
      makeEntry({ id: '2', ticker: 'GOOG', entryPriceTarget: 100, currentPrice: 150, status: 'closed' }),
      makeEntry({ id: '3', ticker: 'MSFT', entryPriceTarget: 100, currentPrice: 110, status: 'closed' }),
    ];
    const metrics = computeJournalMetrics(decisions);
    expect(metrics.bestTrade).toEqual({ ticker: 'GOOG', returnPct: 50 });
  });

  it('ignores active decisions for winRate/avgReturn/bestTrade', () => {
    const decisions = [
      makeEntry({ id: '1', entryPriceTarget: 100, currentPrice: 200, status: 'active' }), // active, ignored
      makeEntry({ id: '2', entryPriceTarget: 100, currentPrice: 110, status: 'closed' }),
    ];
    const metrics = computeJournalMetrics(decisions);
    expect(metrics.totalDecisions).toBe(2);
    expect(metrics.winRate).toBeCloseTo(100);
    expect(metrics.avgReturn).toBeCloseTo(10);
    expect(metrics.bestTrade?.returnPct).toBeCloseTo(10);
  });
});

describe('computePerformanceMetrics', () => {
  it('returns zeroed metrics for empty array', () => {
    const metrics = computePerformanceMetrics([]);
    expect(metrics.winRate).toBe(0);
    expect(metrics.avgWinPercent).toBe(0);
    expect(metrics.avgLossPercent).toBe(0);
    expect(metrics.profitFactor).toBe(0);
    expect(metrics.currentStreak).toEqual({ type: 'win', count: 0 });
  });

  it('returns Infinity profitFactor when no losses', () => {
    const decisions = [
      makeEntry({ id: '1', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }),
      makeEntry({ id: '2', entryPriceTarget: 100, currentPrice: 110, status: 'closed' }),
    ];
    const metrics = computePerformanceMetrics(decisions);
    expect(metrics.profitFactor).toBe(Infinity);
  });

  it('computes profitFactor correctly', () => {
    const decisions = [
      makeEntry({ id: '1', entryPriceTarget: 100, currentPrice: 130, status: 'closed' }), // +30%
      makeEntry({ id: '2', entryPriceTarget: 100, currentPrice: 90, status: 'closed' }),  // -10%
    ];
    const metrics = computePerformanceMetrics(decisions);
    // profitFactor = 30 / 10 = 3
    expect(metrics.profitFactor).toBeCloseTo(3);
  });

  it('computes avgWinPercent and avgLossPercent correctly', () => {
    const decisions = [
      makeEntry({ id: '1', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }), // +20%
      makeEntry({ id: '2', entryPriceTarget: 100, currentPrice: 140, status: 'closed' }), // +40%
      makeEntry({ id: '3', entryPriceTarget: 100, currentPrice: 85, status: 'closed' }),  // -15%
    ];
    const metrics = computePerformanceMetrics(decisions);
    expect(metrics.avgWinPercent).toBeCloseTo(30); // (20+40)/2
    expect(metrics.avgLossPercent).toBeCloseTo(-15); // -15/1
  });
});

describe('computeMonthlyReturns', () => {
  it('returns empty array for no closed decisions', () => {
    const decisions = [makeEntry({ status: 'active' })];
    expect(computeMonthlyReturns(decisions)).toEqual([]);
  });

  it('groups by month and computes average return', () => {
    const decisions = [
      makeEntry({ id: '1', date: '2024-01-10T00:00:00Z', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }),
      makeEntry({ id: '2', date: '2024-01-20T00:00:00Z', entryPriceTarget: 100, currentPrice: 110, status: 'closed' }),
      makeEntry({ id: '3', date: '2024-02-05T00:00:00Z', entryPriceTarget: 100, currentPrice: 90, status: 'closed' }),
    ];
    const result = computeMonthlyReturns(decisions);
    expect(result).toHaveLength(2);
    expect(result[0].month).toBe('2024-01');
    expect(result[0].returnPct).toBeCloseTo(15); // (20+10)/2
    expect(result[1].month).toBe('2024-02');
    expect(result[1].returnPct).toBeCloseTo(-10);
  });
});

describe('computeDecisionBreakdown', () => {
  it('returns zero counts for empty array', () => {
    const result = computeDecisionBreakdown([]);
    expect(result).toEqual([
      { type: 'BUY', count: 0, percentage: 0 },
      { type: 'PASS', count: 0, percentage: 0 },
      { type: 'WATCHLIST', count: 0, percentage: 0 },
    ]);
  });

  it('computes correct breakdown', () => {
    const decisions = [
      makeEntry({ id: '1', decision: 'BUY' }),
      makeEntry({ id: '2', decision: 'BUY' }),
      makeEntry({ id: '3', decision: 'PASS' }),
      makeEntry({ id: '4', decision: 'WATCHLIST' }),
    ];
    const result = computeDecisionBreakdown(decisions);
    expect(result).toEqual([
      { type: 'BUY', count: 2, percentage: 50 },
      { type: 'PASS', count: 1, percentage: 25 },
      { type: 'WATCHLIST', count: 1, percentage: 25 },
    ]);
  });
});

describe('computeOutcomeDistribution', () => {
  it('returns zeros for no closed decisions', () => {
    const decisions = [makeEntry({ status: 'active' })];
    expect(computeOutcomeDistribution(decisions)).toEqual({ wins: 0, losses: 0 });
  });

  it('counts wins and losses correctly', () => {
    const decisions = [
      makeEntry({ id: '1', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }), // win
      makeEntry({ id: '2', entryPriceTarget: 100, currentPrice: 80, status: 'closed' }),  // loss
      makeEntry({ id: '3', entryPriceTarget: 100, currentPrice: 100, status: 'closed' }), // loss (0 is not > 0)
      makeEntry({ id: '4', entryPriceTarget: 100, currentPrice: 150, status: 'active' }), // ignored
    ];
    expect(computeOutcomeDistribution(decisions)).toEqual({ wins: 1, losses: 2 });
  });
});

describe('computeMistakeStats', () => {
  it('returns zeroed stats for empty array', () => {
    expect(computeMistakeStats([])).toEqual({
      totalLosses: 0,
      totalDollarLost: 0,
      avgLossPercent: 0,
    });
  });

  it('computes stats correctly for losing decisions', () => {
    const losers = [
      makeEntry({ id: '1', entryPriceTarget: 100, currentPrice: 80, positionSizeAmount: 10000, status: 'closed' }),
      makeEntry({ id: '2', entryPriceTarget: 100, currentPrice: 90, positionSizeAmount: 5000, status: 'closed' }),
    ];
    const stats = computeMistakeStats(losers);
    expect(stats.totalLosses).toBe(2);
    // Dollar lost: |(-20)*100| + |(-10)*50| = 2000 + 500 = 2500
    expect(stats.totalDollarLost).toBeCloseTo(2500);
    // Avg loss %: (-20 + -10) / 2 = -15
    expect(stats.avgLossPercent).toBeCloseTo(-15);
  });
});

describe('computeCurrentStreak', () => {
  it('returns zero streak for empty array', () => {
    expect(computeCurrentStreak([])).toEqual({ type: 'win', count: 0 });
  });

  it('returns zero streak for no closed decisions', () => {
    const decisions = [makeEntry({ status: 'active' })];
    expect(computeCurrentStreak(decisions)).toEqual({ type: 'win', count: 0 });
  });

  it('computes winning streak correctly', () => {
    const decisions = [
      makeEntry({ id: '1', date: '2024-01-01T00:00:00Z', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }),
      makeEntry({ id: '2', date: '2024-01-02T00:00:00Z', entryPriceTarget: 100, currentPrice: 110, status: 'closed' }),
      makeEntry({ id: '3', date: '2024-01-03T00:00:00Z', entryPriceTarget: 100, currentPrice: 130, status: 'closed' }),
    ];
    expect(computeCurrentStreak(decisions)).toEqual({ type: 'win', count: 3 });
  });

  it('computes losing streak correctly', () => {
    const decisions = [
      makeEntry({ id: '1', date: '2024-01-01T00:00:00Z', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }),
      makeEntry({ id: '2', date: '2024-01-02T00:00:00Z', entryPriceTarget: 100, currentPrice: 80, status: 'closed' }),
      makeEntry({ id: '3', date: '2024-01-03T00:00:00Z', entryPriceTarget: 100, currentPrice: 90, status: 'closed' }),
    ];
    // Newest first: Jan 3 (loss), Jan 2 (loss), Jan 1 (win) → streak = loss, 2
    expect(computeCurrentStreak(decisions)).toEqual({ type: 'loss', count: 2 });
  });

  it('streak breaks at first different result', () => {
    const decisions = [
      makeEntry({ id: '1', date: '2024-01-01T00:00:00Z', entryPriceTarget: 100, currentPrice: 80, status: 'closed' }),
      makeEntry({ id: '2', date: '2024-01-02T00:00:00Z', entryPriceTarget: 100, currentPrice: 120, status: 'closed' }),
      makeEntry({ id: '3', date: '2024-01-03T00:00:00Z', entryPriceTarget: 100, currentPrice: 130, status: 'closed' }),
      makeEntry({ id: '4', date: '2024-01-04T00:00:00Z', entryPriceTarget: 100, currentPrice: 110, status: 'closed' }),
    ];
    // Newest first: Jan 4 (win), Jan 3 (win), Jan 2 (win), Jan 1 (loss) → streak = win, 3
    expect(computeCurrentStreak(decisions)).toEqual({ type: 'win', count: 3 });
  });
});
