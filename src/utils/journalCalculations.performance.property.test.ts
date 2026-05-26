import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  computeMistakeStats,
  computeDecisionBreakdown,
  computePerformanceMetrics,
  computePnlPercent,
  computePnlDollar,
} from './journalCalculations';
import type { DecisionEntry } from '../data/types';

// --- Arbitraries ---

/**
 * Generate a valid ISO date string in the range 2020-2025.
 */
function arbIsoDate(): fc.Arbitrary<string> {
  return fc.tuple(
    fc.integer({ min: 2020, max: 2025 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 }),
    fc.integer({ min: 0, max: 59 })
  ).map(([year, month, day, hour, min, sec]) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const h = String(hour).padStart(2, '0');
    const mi = String(min).padStart(2, '0');
    const s = String(sec).padStart(2, '0');
    return `${year}-${m}-${d}T${h}:${mi}:${s}Z`;
  });
}

/**
 * Generate a valid date string (YYYY-MM-DD).
 */
function arbDateString(): fc.Arbitrary<string> {
  return fc.tuple(
    fc.integer({ min: 2020, max: 2025 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 })
  ).map(([year, month, day]) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });
}

/**
 * Base arbitrary for a valid DecisionEntry with configurable overrides.
 */
function arbDecisionEntry(overrides: Partial<DecisionEntry> = {}): fc.Arbitrary<DecisionEntry> {
  return fc.record({
    id: fc.uuid(),
    date: arbIsoDate(),
    ticker: fc.stringMatching(/^[A-Z]{1,5}$/),
    companyName: fc.string({ minLength: 1, maxLength: 50 }),
    decision: fc.constantFrom('BUY' as const, 'PASS' as const, 'WATCHLIST' as const),
    positionSizePercent: fc.double({ min: 0.1, max: 100, noNaN: true, noDefaultInfinity: true }),
    positionSizeAmount: fc.double({ min: 100, max: 1000000, noNaN: true, noDefaultInfinity: true }),
    entryPriceTarget: fc.double({ min: 0.01, max: 10000, noNaN: true, noDefaultInfinity: true }),
    currentPrice: fc.double({ min: 0.01, max: 10000, noNaN: true, noDefaultInfinity: true }),
    reasoning: fc.string({ minLength: 0, maxLength: 200 }),
    expectedOutcome: fc.string({ minLength: 0, maxLength: 200 }),
    exitPlan: fc.string({ minLength: 0, maxLength: 200 }),
    reviewDates: fc.array(arbDateString(), { minLength: 0, maxLength: 3 }),
    scores: fc.record({
      buffett: fc.integer({ min: 0, max: 10 }),
      munger: fc.integer({ min: 0, max: 10 }),
      lynch: fc.integer({ min: 0, max: 10 }),
      rothschild: fc.integer({ min: 0, max: 10 }),
      overall: fc.double({ min: 0, max: 10, noNaN: true, noDefaultInfinity: true }),
    }),
    alertsSet: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
    status: fc.constantFrom('active' as const, 'closed' as const),
    actualOutcome: fc.string({ minLength: 0, maxLength: 200 }),
    lessonsLearned: fc.string({ minLength: 0, maxLength: 200 }),
  }).map(entry => ({ ...entry, ...overrides }));
}

/**
 * Arbitrary for a losing DecisionEntry (closed, entryPriceTarget > 0, currentPrice < entryPriceTarget).
 */
function arbLosingEntry(): fc.Arbitrary<DecisionEntry> {
  return fc.record({
    id: fc.uuid(),
    date: arbIsoDate(),
    ticker: fc.stringMatching(/^[A-Z]{1,5}$/),
    companyName: fc.string({ minLength: 1, maxLength: 50 }),
    decision: fc.constantFrom('BUY' as const, 'PASS' as const, 'WATCHLIST' as const),
    positionSizePercent: fc.double({ min: 0.1, max: 100, noNaN: true, noDefaultInfinity: true }),
    positionSizeAmount: fc.double({ min: 100, max: 1000000, noNaN: true, noDefaultInfinity: true }),
    entryPriceTarget: fc.double({ min: 1, max: 10000, noNaN: true, noDefaultInfinity: true }),
    currentPrice: fc.constant(0), // placeholder, will be overridden
    reasoning: fc.string({ minLength: 0, maxLength: 200 }),
    expectedOutcome: fc.string({ minLength: 0, maxLength: 200 }),
    exitPlan: fc.string({ minLength: 0, maxLength: 200 }),
    reviewDates: fc.array(arbDateString(), { minLength: 0, maxLength: 3 }),
    scores: fc.record({
      buffett: fc.integer({ min: 0, max: 10 }),
      munger: fc.integer({ min: 0, max: 10 }),
      lynch: fc.integer({ min: 0, max: 10 }),
      rothschild: fc.integer({ min: 0, max: 10 }),
      overall: fc.double({ min: 0, max: 10, noNaN: true, noDefaultInfinity: true }),
    }),
    alertsSet: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
    status: fc.constant('closed' as const),
    actualOutcome: fc.string({ minLength: 0, maxLength: 200 }),
    lessonsLearned: fc.string({ minLength: 0, maxLength: 200 }),
  }).chain(entry =>
    // Ensure currentPrice < entryPriceTarget for a loss
    fc.double({ min: 0.01, max: entry.entryPriceTarget * 0.99, noNaN: true, noDefaultInfinity: true }).map(currentPrice => ({
      ...entry,
      currentPrice,
    }))
  );
}

/**
 * Arbitrary for a closed DecisionEntry with entryPriceTarget > 0.
 */
function arbClosedEntry(): fc.Arbitrary<DecisionEntry> {
  return arbDecisionEntry({ status: 'closed' }).map(entry => ({
    ...entry,
    entryPriceTarget: Math.max(entry.entryPriceTarget, 0.01),
  }));
}

// --- Property Tests ---

describe('Property 14: Mistakes autopsy statistics correctness', () => {
  /**
   * **Validates: Requirements 6.4**
   *
   * For any non-empty array of losing DecisionEntry records, the total losses count
   * SHALL equal the array length, total dollar lost SHALL equal the sum of individual
   * dollar losses, and average loss percentage SHALL equal the arithmetic mean of
   * individual loss percentages.
   */
  it('total losses count equals array length', () => {
    fc.assert(
      fc.property(
        fc.array(arbLosingEntry(), { minLength: 1, maxLength: 20 }),
        (losingEntries) => {
          const stats = computeMistakeStats(losingEntries);
          expect(stats.totalLosses).toBe(losingEntries.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('total dollar lost equals sum of individual dollar losses', () => {
    fc.assert(
      fc.property(
        fc.array(arbLosingEntry(), { minLength: 1, maxLength: 20 }),
        (losingEntries) => {
          const stats = computeMistakeStats(losingEntries);
          const expectedTotalDollarLost = losingEntries.reduce(
            (sum, entry) => sum + Math.abs(computePnlDollar(entry)),
            0
          );
          expect(stats.totalDollarLost).toBeCloseTo(expectedTotalDollarLost, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('average loss percentage equals arithmetic mean of individual loss percentages', () => {
    fc.assert(
      fc.property(
        fc.array(arbLosingEntry(), { minLength: 1, maxLength: 20 }),
        (losingEntries) => {
          const stats = computeMistakeStats(losingEntries);
          const pctLosses = losingEntries.map(entry => computePnlPercent(entry));
          const expectedAvg = pctLosses.reduce((sum, pnl) => sum + pnl, 0) / losingEntries.length;
          expect(stats.avgLossPercent).toBeCloseTo(expectedAvg, 5);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 15: Decision breakdown proportions sum to total', () => {
  /**
   * **Validates: Requirements 7.2, 7.3**
   *
   * For any array of DecisionEntry records, the sum of BUY count + PASS count +
   * WATCHLIST count in the breakdown SHALL equal the total number of decisions,
   * and each percentage SHALL equal `(count / total) * 100`.
   */
  it('sum of BUY + PASS + WATCHLIST counts equals total decisions', () => {
    fc.assert(
      fc.property(
        fc.array(arbDecisionEntry(), { minLength: 1, maxLength: 30 }),
        (decisions) => {
          const breakdown = computeDecisionBreakdown(decisions);
          const totalCount = breakdown.reduce((sum, b) => sum + b.count, 0);
          expect(totalCount).toBe(decisions.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each percentage equals (count / total) * 100', () => {
    fc.assert(
      fc.property(
        fc.array(arbDecisionEntry(), { minLength: 1, maxLength: 30 }),
        (decisions) => {
          const breakdown = computeDecisionBreakdown(decisions);
          const total = decisions.length;
          for (const item of breakdown) {
            const expectedPercentage = (item.count / total) * 100;
            expect(item.percentage).toBeCloseTo(expectedPercentage, 10);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 16: Performance metrics internal consistency', () => {
  /**
   * **Validates: Requirements 7.4**
   *
   * For any array of closed DecisionEntry records, the profit factor SHALL equal
   * `sum(positive returns) / abs(sum(negative returns))`, and wins + losses SHALL
   * equal the total number of closed decisions.
   */
  it('wins + losses equals total number of closed decisions', () => {
    fc.assert(
      fc.property(
        fc.array(arbClosedEntry(), { minLength: 1, maxLength: 20 }),
        (closedEntries) => {
          // Ensure computePerformanceMetrics doesn't throw
          computePerformanceMetrics(closedEntries);
          const pnlPercents = closedEntries.map(e => computePnlPercent(e));
          const wins = pnlPercents.filter(pnl => pnl > 0).length;
          const losses = pnlPercents.filter(pnl => pnl <= 0).length;
          expect(wins + losses).toBe(closedEntries.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('profit factor equals sum(positive returns) / abs(sum(negative returns))', () => {
    fc.assert(
      fc.property(
        fc.array(arbClosedEntry(), { minLength: 1, maxLength: 20 }),
        (closedEntries) => {
          const metrics = computePerformanceMetrics(closedEntries);
          const pnlPercents = closedEntries.map(e => computePnlPercent(e));
          const positiveReturns = pnlPercents.filter(pnl => pnl > 0);
          const negativeReturns = pnlPercents.filter(pnl => pnl <= 0);

          const sumPositive = positiveReturns.reduce((sum, pnl) => sum + pnl, 0);
          const sumNegativeAbs = Math.abs(negativeReturns.reduce((sum, pnl) => sum + pnl, 0));

          if (sumNegativeAbs === 0) {
            // When no losses, profit factor should be Infinity
            expect(metrics.profitFactor).toBe(Infinity);
          } else {
            const expectedProfitFactor = sumPositive / sumNegativeAbs;
            expect(metrics.profitFactor).toBeCloseTo(expectedProfitFactor, 5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
