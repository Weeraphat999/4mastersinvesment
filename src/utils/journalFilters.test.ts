import { describe, it, expect } from 'vitest';
import {
  filterBySearch,
  filterByDecisionType,
  filterByStatus,
  filterByDateRange,
  sortDecisions,
  applyFilters,
  getLosingDecisions,
  JournalFilters,
} from './journalFilters';
import type { DecisionEntry } from '../data/types';

function makeEntry(overrides: Partial<DecisionEntry> = {}): DecisionEntry {
  return {
    id: '1',
    date: '2024-01-15T10:00:00Z',
    ticker: 'AAPL',
    companyName: 'Apple Inc',
    decision: 'BUY',
    positionSizePercent: 5,
    positionSizeAmount: 10000,
    entryPriceTarget: 100,
    currentPrice: 110,
    reasoning: 'Strong fundamentals',
    expectedOutcome: 'Growth',
    exitPlan: 'Sell at 150',
    reviewDates: [],
    scores: { buffett: 8, munger: 7, lynch: 9, rothschild: 6, overall: 7.5 },
    alertsSet: [],
    status: 'active',
    actualOutcome: '',
    lessonsLearned: '',
    ...overrides,
  };
}

describe('filterBySearch', () => {
  it('returns all entries when search is empty', () => {
    const entries = [makeEntry({ ticker: 'AAPL' }), makeEntry({ ticker: 'GOOG' })];
    expect(filterBySearch(entries, '')).toEqual(entries);
  });

  it('filters by case-insensitive partial match on ticker', () => {
    const entries = [
      makeEntry({ ticker: 'AAPL' }),
      makeEntry({ ticker: 'GOOG' }),
      makeEntry({ ticker: 'AMZN' }),
    ];
    expect(filterBySearch(entries, 'aa')).toEqual([entries[0]]);
    expect(filterBySearch(entries, 'goo')).toEqual([entries[1]]);
    expect(filterBySearch(entries, 'A')).toEqual([entries[0], entries[2]]);
  });
});

describe('filterByDecisionType', () => {
  it('returns all entries for ALL', () => {
    const entries = [
      makeEntry({ decision: 'BUY' }),
      makeEntry({ decision: 'PASS' }),
      makeEntry({ decision: 'WATCHLIST' }),
    ];
    expect(filterByDecisionType(entries, 'ALL')).toEqual(entries);
  });

  it('filters by exact decision type', () => {
    const entries = [
      makeEntry({ decision: 'BUY' }),
      makeEntry({ decision: 'PASS' }),
      makeEntry({ decision: 'WATCHLIST' }),
    ];
    expect(filterByDecisionType(entries, 'BUY')).toEqual([entries[0]]);
    expect(filterByDecisionType(entries, 'PASS')).toEqual([entries[1]]);
    expect(filterByDecisionType(entries, 'WATCHLIST')).toEqual([entries[2]]);
  });
});

describe('filterByStatus', () => {
  it('returns all entries for ALL', () => {
    const entries = [
      makeEntry({ status: 'active', decision: 'BUY' }),
      makeEntry({ status: 'closed', decision: 'BUY' }),
      makeEntry({ status: 'active', decision: 'WATCHLIST' }),
    ];
    expect(filterByStatus(entries, 'ALL')).toEqual(entries);
  });

  it('ACTIVE matches status=active and decision!=WATCHLIST', () => {
    const entries = [
      makeEntry({ status: 'active', decision: 'BUY' }),
      makeEntry({ status: 'active', decision: 'WATCHLIST' }),
      makeEntry({ status: 'closed', decision: 'BUY' }),
    ];
    expect(filterByStatus(entries, 'ACTIVE')).toEqual([entries[0]]);
  });

  it('CLOSED matches status=closed', () => {
    const entries = [
      makeEntry({ status: 'active', decision: 'BUY' }),
      makeEntry({ status: 'closed', decision: 'BUY' }),
      makeEntry({ status: 'closed', decision: 'WATCHLIST' }),
    ];
    expect(filterByStatus(entries, 'CLOSED')).toEqual([entries[1], entries[2]]);
  });

  it('WATCHING matches decision=WATCHLIST and status=active', () => {
    const entries = [
      makeEntry({ status: 'active', decision: 'WATCHLIST' }),
      makeEntry({ status: 'closed', decision: 'WATCHLIST' }),
      makeEntry({ status: 'active', decision: 'BUY' }),
    ];
    expect(filterByStatus(entries, 'WATCHING')).toEqual([entries[0]]);
  });
});

describe('filterByDateRange', () => {
  it('returns all entries when both start and end are null', () => {
    const entries = [makeEntry({ date: '2024-01-01' }), makeEntry({ date: '2024-06-01' })];
    expect(filterByDateRange(entries, null, null)).toEqual(entries);
  });

  it('filters entries after start date', () => {
    const entries = [
      makeEntry({ date: '2024-01-01' }),
      makeEntry({ date: '2024-03-01' }),
      makeEntry({ date: '2024-06-01' }),
    ];
    expect(filterByDateRange(entries, '2024-02-01', null)).toEqual([entries[1], entries[2]]);
  });

  it('filters entries before end date', () => {
    const entries = [
      makeEntry({ date: '2024-01-01' }),
      makeEntry({ date: '2024-03-01' }),
      makeEntry({ date: '2024-06-01' }),
    ];
    expect(filterByDateRange(entries, null, '2024-04-01')).toEqual([entries[0], entries[1]]);
  });

  it('filters entries within date range (inclusive)', () => {
    const entries = [
      makeEntry({ date: '2024-01-01' }),
      makeEntry({ date: '2024-03-01' }),
      makeEntry({ date: '2024-06-01' }),
    ];
    expect(filterByDateRange(entries, '2024-01-01', '2024-03-01')).toEqual([entries[0], entries[1]]);
  });
});

describe('sortDecisions', () => {
  it('NEWEST sorts descending by date', () => {
    const entries = [
      makeEntry({ date: '2024-01-01' }),
      makeEntry({ date: '2024-06-01' }),
      makeEntry({ date: '2024-03-01' }),
    ];
    const sorted = sortDecisions(entries, 'NEWEST');
    expect(sorted[0].date).toBe('2024-06-01');
    expect(sorted[1].date).toBe('2024-03-01');
    expect(sorted[2].date).toBe('2024-01-01');
  });

  it('OLDEST sorts ascending by date', () => {
    const entries = [
      makeEntry({ date: '2024-06-01' }),
      makeEntry({ date: '2024-01-01' }),
      makeEntry({ date: '2024-03-01' }),
    ];
    const sorted = sortDecisions(entries, 'OLDEST');
    expect(sorted[0].date).toBe('2024-01-01');
    expect(sorted[1].date).toBe('2024-03-01');
    expect(sorted[2].date).toBe('2024-06-01');
  });

  it('BEST_PNL sorts descending by P&L percent', () => {
    const entries = [
      makeEntry({ entryPriceTarget: 100, currentPrice: 110 }), // +10%
      makeEntry({ entryPriceTarget: 100, currentPrice: 90 }),  // -10%
      makeEntry({ entryPriceTarget: 100, currentPrice: 130 }), // +30%
    ];
    const sorted = sortDecisions(entries, 'BEST_PNL');
    expect(sorted[0].currentPrice).toBe(130);
    expect(sorted[1].currentPrice).toBe(110);
    expect(sorted[2].currentPrice).toBe(90);
  });

  it('WORST_PNL sorts ascending by P&L percent', () => {
    const entries = [
      makeEntry({ entryPriceTarget: 100, currentPrice: 110 }), // +10%
      makeEntry({ entryPriceTarget: 100, currentPrice: 90 }),  // -10%
      makeEntry({ entryPriceTarget: 100, currentPrice: 130 }), // +30%
    ];
    const sorted = sortDecisions(entries, 'WORST_PNL');
    expect(sorted[0].currentPrice).toBe(90);
    expect(sorted[1].currentPrice).toBe(110);
    expect(sorted[2].currentPrice).toBe(130);
  });

  it('does not mutate the original array', () => {
    const entries = [
      makeEntry({ date: '2024-06-01' }),
      makeEntry({ date: '2024-01-01' }),
    ];
    const original = [...entries];
    sortDecisions(entries, 'NEWEST');
    expect(entries).toEqual(original);
  });
});

describe('applyFilters', () => {
  it('composes all filters and sort', () => {
    const entries = [
      makeEntry({ ticker: 'AAPL', decision: 'BUY', status: 'active', date: '2024-01-01', entryPriceTarget: 100, currentPrice: 110 }),
      makeEntry({ ticker: 'GOOG', decision: 'PASS', status: 'closed', date: '2024-03-01', entryPriceTarget: 100, currentPrice: 90 }),
      makeEntry({ ticker: 'AMZN', decision: 'BUY', status: 'active', date: '2024-06-01', entryPriceTarget: 100, currentPrice: 120 }),
    ];
    const filters: JournalFilters = {
      search: '',
      decisionType: 'BUY',
      status: 'ACTIVE',
      dateRange: { start: null, end: null },
      sortBy: 'NEWEST',
      viewMode: 'table',
    };
    const result = applyFilters(entries, filters);
    expect(result).toHaveLength(2);
    expect(result[0].ticker).toBe('AMZN');
    expect(result[1].ticker).toBe('AAPL');
  });
});

describe('getLosingDecisions', () => {
  it('returns only closed entries with negative P&L', () => {
    const entries = [
      makeEntry({ status: 'closed', entryPriceTarget: 100, currentPrice: 90 }),  // loss
      makeEntry({ status: 'closed', entryPriceTarget: 100, currentPrice: 110 }), // win
      makeEntry({ status: 'active', entryPriceTarget: 100, currentPrice: 80 }),  // active, not included
    ];
    const losers = getLosingDecisions(entries);
    expect(losers).toHaveLength(1);
    expect(losers[0].currentPrice).toBe(90);
  });

  it('returns empty array when no losing decisions', () => {
    const entries = [
      makeEntry({ status: 'closed', entryPriceTarget: 100, currentPrice: 110 }),
      makeEntry({ status: 'active', entryPriceTarget: 100, currentPrice: 80 }),
    ];
    expect(getLosingDecisions(entries)).toEqual([]);
  });

  it('handles zero entryPriceTarget gracefully', () => {
    const entries = [
      makeEntry({ status: 'closed', entryPriceTarget: 0, currentPrice: 100 }),
    ];
    // pnlPercent is 0 when entryPriceTarget is 0, so not negative
    expect(getLosingDecisions(entries)).toEqual([]);
  });
});
