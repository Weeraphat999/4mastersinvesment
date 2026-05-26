import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  filterBySearch,
  filterByDecisionType,
  filterByStatus,
  filterByDateRange,
  sortDecisions,
  getLosingDecisions,
} from './journalFilters';
import type { DecisionEntry } from '../data/types';

// --- Arbitrary for DecisionEntry ---

const decisionTypeArb = fc.constantFrom('BUY' as const, 'PASS' as const, 'WATCHLIST' as const);
const statusArb = fc.constantFrom('active' as const, 'closed' as const);

// Generate ISO date strings like "2020-01-15" using integer components
const isoDateArb = fc
  .record({
    year: fc.integer({ min: 2020, max: 2025 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }), // Use 28 to avoid invalid dates
  })
  .map(({ year, month, day }) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });

const tickerArb = fc
  .array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), {
    minLength: 1,
    maxLength: 5,
  })
  .map((chars) => chars.join(''));

const decisionEntryArb: fc.Arbitrary<DecisionEntry> = fc.record({
  id: fc.uuid(),
  date: isoDateArb,
  ticker: tickerArb,
  companyName: fc.string({ minLength: 1, maxLength: 30 }),
  decision: decisionTypeArb,
  positionSizePercent: fc.double({ min: 0, max: 100, noNaN: true }),
  positionSizeAmount: fc.double({ min: 0, max: 100000, noNaN: true }),
  entryPriceTarget: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  currentPrice: fc.double({ min: 0, max: 10000, noNaN: true }),
  reasoning: fc.string({ minLength: 0, maxLength: 50 }),
  expectedOutcome: fc.string({ minLength: 0, maxLength: 50 }),
  exitPlan: fc.string({ minLength: 0, maxLength: 50 }),
  reviewDates: fc.array(isoDateArb, { minLength: 0, maxLength: 3 }),
  scores: fc.record({
    buffett: fc.integer({ min: 0, max: 10 }),
    munger: fc.integer({ min: 0, max: 10 }),
    lynch: fc.integer({ min: 0, max: 10 }),
    rothschild: fc.integer({ min: 0, max: 10 }),
    overall: fc.integer({ min: 0, max: 10 }),
  }),
  alertsSet: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 0, maxLength: 3 }),
  status: statusArb,
  actualOutcome: fc.string({ minLength: 0, maxLength: 50 }),
  lessonsLearned: fc.string({ minLength: 0, maxLength: 50 }),
});

const decisionEntriesArb = fc.array(decisionEntryArb, { minLength: 0, maxLength: 20 });


// --- Property 5: Ticker search filter correctness ---
// **Validates: Requirements 2.1**

describe('Property 5: Ticker search filter correctness', () => {
  it('every entry in the filtered result has a ticker containing the search string (case-insensitive), and no excluded entry has a ticker containing the search string', () => {
    fc.assert(
      fc.property(
        decisionEntriesArb,
        fc.string({ minLength: 0, maxLength: 5 }),
        (entries, search) => {
          const result = filterBySearch(entries, search);
          const excluded = entries.filter((e) => !result.includes(e));
          const lowerSearch = search.toLowerCase();

          // Every included entry must contain the search string
          for (const entry of result) {
            expect(entry.ticker.toLowerCase()).toContain(lowerSearch);
          }

          // No excluded entry should contain the search string (only when search is non-empty)
          if (search !== '') {
            for (const entry of excluded) {
              expect(entry.ticker.toLowerCase()).not.toContain(lowerSearch);
            }
          }
        }
      )
    );
  });
});

// --- Property 6: Decision type filter correctness ---
// **Validates: Requirements 2.2**

describe('Property 6: Decision type filter correctness', () => {
  it('every entry in the filtered result has a decision field matching the filter value', () => {
    fc.assert(
      fc.property(
        decisionEntriesArb,
        fc.constantFrom('BUY' as const, 'PASS' as const, 'WATCHLIST' as const),
        (entries, filterType) => {
          const result = filterByDecisionType(entries, filterType);

          // Every included entry must match the filter type
          for (const entry of result) {
            expect(entry.decision).toBe(filterType);
          }

          // Result should contain ALL entries that match
          const expected = entries.filter((e) => e.decision === filterType);
          expect(result.length).toBe(expected.length);
        }
      )
    );
  });
});

// --- Property 7: Status filter correctness ---
// **Validates: Requirements 2.3**

describe('Property 7: Status filter correctness', () => {
  it('ACTIVE filter returns entries with status=active and decision≠WATCHLIST', () => {
    fc.assert(
      fc.property(decisionEntriesArb, (entries) => {
        const result = filterByStatus(entries, 'ACTIVE');

        for (const entry of result) {
          expect(entry.status).toBe('active');
          expect(entry.decision).not.toBe('WATCHLIST');
        }

        // All matching entries should be included
        const expected = entries.filter(
          (e) => e.status === 'active' && e.decision !== 'WATCHLIST'
        );
        expect(result.length).toBe(expected.length);
      })
    );
  });

  it('CLOSED filter returns entries with status=closed', () => {
    fc.assert(
      fc.property(decisionEntriesArb, (entries) => {
        const result = filterByStatus(entries, 'CLOSED');

        for (const entry of result) {
          expect(entry.status).toBe('closed');
        }

        const expected = entries.filter((e) => e.status === 'closed');
        expect(result.length).toBe(expected.length);
      })
    );
  });

  it('WATCHING filter returns entries with decision=WATCHLIST and status=active', () => {
    fc.assert(
      fc.property(decisionEntriesArb, (entries) => {
        const result = filterByStatus(entries, 'WATCHING');

        for (const entry of result) {
          expect(entry.decision).toBe('WATCHLIST');
          expect(entry.status).toBe('active');
        }

        const expected = entries.filter(
          (e) => e.decision === 'WATCHLIST' && e.status === 'active'
        );
        expect(result.length).toBe(expected.length);
      })
    );
  });
});

// --- Property 8: Date range filter correctness ---
// **Validates: Requirements 2.4**

describe('Property 8: Date range filter correctness', () => {
  it('every entry in the filtered result has a date within the specified range (inclusive), and no entry outside the range appears', () => {
    // Generate a valid date range where start <= end
    const dateRangeArb = fc
      .tuple(isoDateArb, isoDateArb)
      .map(([a, b]) => (a <= b ? { start: a, end: b } : { start: b, end: a }));

    fc.assert(
      fc.property(decisionEntriesArb, dateRangeArb, (entries, range) => {
        const result = filterByDateRange(entries, range.start, range.end);
        const excluded = entries.filter((e) => !result.includes(e));

        // Every included entry must be within the range
        for (const entry of result) {
          expect(entry.date >= range.start).toBe(true);
          expect(entry.date <= range.end).toBe(true);
        }

        // No excluded entry should be within the range
        for (const entry of excluded) {
          const inRange = entry.date >= range.start && entry.date <= range.end;
          expect(inRange).toBe(false);
        }
      })
    );
  });
});

// --- Property 9: Sort ordering correctness ---
// **Validates: Requirements 2.5**

describe('Property 9: Sort ordering correctness', () => {
  function computePnlPercent(entry: DecisionEntry): number {
    if (entry.entryPriceTarget === 0) return 0;
    return ((entry.currentPrice - entry.entryPriceTarget) / entry.entryPriceTarget) * 100;
  }

  it('NEWEST sort: for every consecutive pair (a, b), a.date >= b.date', () => {
    fc.assert(
      fc.property(decisionEntriesArb, (entries) => {
        const sorted = sortDecisions(entries, 'NEWEST');
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].date >= sorted[i + 1].date).toBe(true);
        }
      })
    );
  });

  it('OLDEST sort: for every consecutive pair (a, b), a.date <= b.date', () => {
    fc.assert(
      fc.property(decisionEntriesArb, (entries) => {
        const sorted = sortDecisions(entries, 'OLDEST');
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].date <= sorted[i + 1].date).toBe(true);
        }
      })
    );
  });

  it('BEST_PNL sort: for every consecutive pair (a, b), pnl(a) >= pnl(b)', () => {
    fc.assert(
      fc.property(decisionEntriesArb, (entries) => {
        const sorted = sortDecisions(entries, 'BEST_PNL');
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(computePnlPercent(sorted[i])).toBeGreaterThanOrEqual(
            computePnlPercent(sorted[i + 1])
          );
        }
      })
    );
  });

  it('WORST_PNL sort: for every consecutive pair (a, b), pnl(a) <= pnl(b)', () => {
    fc.assert(
      fc.property(decisionEntriesArb, (entries) => {
        const sorted = sortDecisions(entries, 'WORST_PNL');
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(computePnlPercent(sorted[i])).toBeLessThanOrEqual(
            computePnlPercent(sorted[i + 1])
          );
        }
      })
    );
  });
});

// --- Property 13: Mistakes autopsy shows only closed losses ---
// **Validates: Requirements 6.2**

describe('Property 13: Mistakes autopsy shows only closed losses', () => {
  it('getLosingDecisions returns exactly those entries where status=closed AND pnlPercent < 0', () => {
    fc.assert(
      fc.property(decisionEntriesArb, (entries) => {
        const result = getLosingDecisions(entries);

        // Every entry in the result must be closed with negative P&L
        for (const entry of result) {
          expect(entry.status).toBe('closed');
          const pnl =
            entry.entryPriceTarget === 0
              ? 0
              : ((entry.currentPrice - entry.entryPriceTarget) / entry.entryPriceTarget) * 100;
          expect(pnl).toBeLessThan(0);
        }

        // Every entry NOT in the result must either not be closed or not have negative P&L
        const excluded = entries.filter((e) => !result.includes(e));
        for (const entry of excluded) {
          const pnl =
            entry.entryPriceTarget === 0
              ? 0
              : ((entry.currentPrice - entry.entryPriceTarget) / entry.entryPriceTarget) * 100;
          const isClosedLoss = entry.status === 'closed' && pnl < 0;
          expect(isClosedLoss).toBe(false);
        }
      })
    );
  });
});
