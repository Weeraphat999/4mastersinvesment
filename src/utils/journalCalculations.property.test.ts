import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeJournalMetrics, computePnlPercent } from './journalCalculations';
import type { DecisionEntry } from '../data/types';

/**
 * Generate a valid ISO date string between 2020 and 2025.
 */
const isoDateArb = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-12-31').getTime() })
  .map((ts) => new Date(ts).toISOString());

/**
 * Generate a valid ISO date-only string (YYYY-MM-DD) between 2020 and 2025.
 */
const dateOnlyArb = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-12-31').getTime() })
  .map((ts) => new Date(ts).toISOString().slice(0, 10));

/**
 * Arbitrary for generating a valid DecisionEntry with realistic values.
 * Used for Property 1 where status can be either 'active' or 'closed'.
 */
const decisionEntryArb: fc.Arbitrary<DecisionEntry> = fc.record({
  id: fc.uuid(),
  date: isoDateArb,
  ticker: fc.stringMatching(/^[A-Z]{1,5}$/),
  companyName: fc.string({ minLength: 1, maxLength: 50 }),
  decision: fc.constantFrom('BUY' as const, 'PASS' as const, 'WATCHLIST' as const),
  positionSizePercent: fc.double({ min: 0.1, max: 100, noNaN: true }),
  positionSizeAmount: fc.double({ min: 100, max: 1000000, noNaN: true }),
  entryPriceTarget: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  currentPrice: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  reasoning: fc.string({ minLength: 0, maxLength: 200 }),
  expectedOutcome: fc.string({ minLength: 0, maxLength: 200 }),
  exitPlan: fc.string({ minLength: 0, maxLength: 200 }),
  reviewDates: fc.array(dateOnlyArb, { minLength: 0, maxLength: 3 }),
  scores: fc.record({
    buffett: fc.integer({ min: 0, max: 10 }),
    munger: fc.integer({ min: 0, max: 10 }),
    lynch: fc.integer({ min: 0, max: 10 }),
    rothschild: fc.integer({ min: 0, max: 10 }),
    overall: fc.integer({ min: 0, max: 10 }),
  }),
  alertsSet: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
  status: fc.constantFrom('active' as const, 'closed' as const),
  actualOutcome: fc.string({ minLength: 0, maxLength: 200 }),
  lessonsLearned: fc.string({ minLength: 0, maxLength: 200 }),
});

/**
 * Arbitrary for generating a closed DecisionEntry with entryPriceTarget > 0.
 * Used for Properties 2-4 where we need closed decisions with valid P&L computation.
 */
const closedDecisionEntryArb: fc.Arbitrary<DecisionEntry> = fc.record({
  id: fc.uuid(),
  date: isoDateArb,
  ticker: fc.stringMatching(/^[A-Z]{1,5}$/),
  companyName: fc.string({ minLength: 1, maxLength: 50 }),
  decision: fc.constantFrom('BUY' as const, 'PASS' as const, 'WATCHLIST' as const),
  positionSizePercent: fc.double({ min: 0.1, max: 100, noNaN: true }),
  positionSizeAmount: fc.double({ min: 100, max: 1000000, noNaN: true }),
  entryPriceTarget: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  currentPrice: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  reasoning: fc.string({ minLength: 0, maxLength: 200 }),
  expectedOutcome: fc.string({ minLength: 0, maxLength: 200 }),
  exitPlan: fc.string({ minLength: 0, maxLength: 200 }),
  reviewDates: fc.array(dateOnlyArb, { minLength: 0, maxLength: 3 }),
  scores: fc.record({
    buffett: fc.integer({ min: 0, max: 10 }),
    munger: fc.integer({ min: 0, max: 10 }),
    lynch: fc.integer({ min: 0, max: 10 }),
    rothschild: fc.integer({ min: 0, max: 10 }),
    overall: fc.integer({ min: 0, max: 10 }),
  }),
  alertsSet: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
  status: fc.constant('closed' as const),
  actualOutcome: fc.string({ minLength: 0, maxLength: 200 }),
  lessonsLearned: fc.string({ minLength: 0, maxLength: 200 }),
});

describe('journalCalculations - Property Tests', () => {
  /**
   * Property 1: Total Decisions equals array length
   *
   * For any array of DecisionEntry records, the computed `totalDecisions` metric
   * SHALL equal the length of the input array.
   *
   * **Validates: Requirements 1.2**
   */
  it('Property 1: totalDecisions equals the length of the input array', () => {
    fc.assert(
      fc.property(fc.array(decisionEntryArb, { minLength: 0, maxLength: 20 }), (decisions) => {
        const metrics = computeJournalMetrics(decisions);
        expect(metrics.totalDecisions).toBe(decisions.length);
      })
    );
  });

  /**
   * Property 2: Win Rate computation correctness
   *
   * For any non-empty array of closed DecisionEntry records, the computed win rate
   * SHALL equal `(count of entries with positive P&L / total closed entries) * 100`.
   *
   * **Validates: Requirements 1.3**
   */
  it('Property 2: winRate equals (positive P&L count / total closed) * 100', () => {
    fc.assert(
      fc.property(fc.array(closedDecisionEntryArb, { minLength: 1, maxLength: 20 }), (decisions) => {
        const metrics = computeJournalMetrics(decisions);

        // All entries are closed, so winRate should not be null
        expect(metrics.winRate).not.toBeNull();

        // Manually compute expected win rate
        const pnlPercents = decisions.map((d) => computePnlPercent(d));
        const wins = pnlPercents.filter((pnl) => pnl > 0).length;
        const expectedWinRate = (wins / decisions.length) * 100;

        expect(metrics.winRate).toBeCloseTo(expectedWinRate, 10);
      })
    );
  });

  /**
   * Property 3: Average Return computation correctness
   *
   * For any non-empty array of closed DecisionEntry records, the computed average return
   * SHALL equal the arithmetic mean of all individual P&L percentages.
   *
   * **Validates: Requirements 1.4**
   */
  it('Property 3: avgReturn equals the arithmetic mean of all P&L percentages', () => {
    fc.assert(
      fc.property(fc.array(closedDecisionEntryArb, { minLength: 1, maxLength: 20 }), (decisions) => {
        const metrics = computeJournalMetrics(decisions);

        // All entries are closed, so avgReturn should not be null
        expect(metrics.avgReturn).not.toBeNull();

        // Manually compute expected average return
        const pnlPercents = decisions.map((d) => computePnlPercent(d));
        const expectedAvgReturn = pnlPercents.reduce((sum, pnl) => sum + pnl, 0) / decisions.length;

        expect(metrics.avgReturn).toBeCloseTo(expectedAvgReturn, 10);
      })
    );
  });

  /**
   * Property 4: Best Trade identification
   *
   * For any non-empty array of closed DecisionEntry records, the computed best trade
   * SHALL have a P&L percentage greater than or equal to every other closed decision's
   * P&L percentage.
   *
   * **Validates: Requirements 1.5**
   */
  it('Property 4: bestTrade has P&L >= every other closed decision P&L', () => {
    fc.assert(
      fc.property(fc.array(closedDecisionEntryArb, { minLength: 1, maxLength: 20 }), (decisions) => {
        const metrics = computeJournalMetrics(decisions);

        // All entries are closed, so bestTrade should not be null
        expect(metrics.bestTrade).not.toBeNull();

        // The best trade's returnPct should be >= all other P&L percents
        const pnlPercents = decisions.map((d) => computePnlPercent(d));
        const maxPnl = Math.max(...pnlPercents);

        expect(metrics.bestTrade!.returnPct).toBeCloseTo(maxPnl, 10);
      })
    );
  });
});
