import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { DecisionEntry } from '../../data/types';
import { computePnlPercent } from '../../utils/journalCalculations';

/**
 * Pure function: maps a decision type to its display color class.
 * This mirrors the color logic used in DecisionTable (badge) and DecisionCardGrid (border/badge).
 *
 * BUY → green (text-green-400, border-green-500, bg-green-500/20)
 * PASS → yellow (text-yellow-400, border-yellow-500, bg-yellow-500/20)
 * WATCHLIST → blue (text-blue-400, border-blue-500, bg-blue-500/20)
 */
function getDecisionColor(decision: 'BUY' | 'PASS' | 'WATCHLIST'): string {
  switch (decision) {
    case 'BUY':
      return 'green';
    case 'PASS':
      return 'yellow';
    case 'WATCHLIST':
      return 'blue';
  }
}

/**
 * Pure function: maps a P&L percentage to its display color.
 * Positive P&L → green (text-green-400)
 * Negative P&L → red (text-red-400)
 * Zero P&L → green (same as positive, per component logic: pnlPercent >= 0 → green)
 */
function getPnlColor(pnlPercent: number): string {
  return pnlPercent >= 0 ? 'green' : 'red';
}

// --- Arbitraries ---

const isoDateArb = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-12-31').getTime() })
  .map((ts) => new Date(ts).toISOString());

const dateOnlyArb = fc
  .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-12-31').getTime() })
  .map((ts) => new Date(ts).toISOString().slice(0, 10));

/**
 * Arbitrary for generating a valid DecisionEntry with realistic values.
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

describe('Color Mapping - Property Tests', () => {
  /**
   * Property 10: Decision type to color mapping consistency
   *
   * For any DecisionEntry, the color assigned to its decision type SHALL always be:
   * green for BUY, yellow for PASS, blue for WATCHLIST — regardless of other entry fields.
   *
   * **Validates: Requirements 3.2, 4.2**
   */
  it('Property 10: Decision type always maps to the correct color regardless of other fields', () => {
    fc.assert(
      fc.property(decisionEntryArb, (entry) => {
        const color = getDecisionColor(entry.decision);

        switch (entry.decision) {
          case 'BUY':
            expect(color).toBe('green');
            break;
          case 'PASS':
            expect(color).toBe('yellow');
            break;
          case 'WATCHLIST':
            expect(color).toBe('blue');
            break;
        }
      })
    );
  });

  /**
   * Property 11: P&L sign determines display color
   *
   * For any DecisionEntry with a computed P&L, positive P&L SHALL map to green
   * and negative P&L SHALL map to red — regardless of the magnitude.
   *
   * **Validates: Requirements 3.3, 3.4**
   */
  it('Property 11: Positive P&L maps to green and negative P&L maps to red', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }),
        (pnlPercent) => {
          const color = getPnlColor(pnlPercent);

          if (pnlPercent >= 0) {
            expect(color).toBe('green');
          } else {
            expect(color).toBe('red');
          }
        }
      )
    );
  });

  /**
   * Property 11 (extended): P&L color derived from DecisionEntry prices
   *
   * For any DecisionEntry with entryPriceTarget > 0, the P&L color derived from
   * computePnlPercent SHALL be green when currentPrice >= entryPriceTarget
   * and red when currentPrice < entryPriceTarget.
   *
   * **Validates: Requirements 3.3, 3.4**
   */
  it('Property 11 (entry-based): P&L color from entry prices is consistent with price relationship', () => {
    fc.assert(
      fc.property(decisionEntryArb, (entry) => {
        const pnlPercent = computePnlPercent(entry);
        const color = getPnlColor(pnlPercent);

        if (entry.currentPrice >= entry.entryPriceTarget) {
          expect(color).toBe('green');
        } else {
          expect(color).toBe('red');
        }
      })
    );
  });
});
