import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { DecisionEntry } from '../data/types';
import { loadFromStorage, saveToStorage } from '../utils/storageUtils';

/**
 * Property 12: Update persistence round-trip
 *
 * For any valid DecisionUpdate applied to any DecisionEntry, after saving to
 * localStorage and reloading, the retrieved entry SHALL reflect all updated fields.
 *
 * **Validates: Requirements 5.8, 10.2**
 */

interface DecisionUpdate {
  status: 'active' | 'closed';
  exitPrice: number | null;
  actualOutcome: string;
  lessonsLearned: string;
  tags: string[];
}

const STORAGE_KEY = 'investment_decisions';

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
 * Arbitrary for generating a valid DecisionUpdate.
 */
const decisionUpdateArb: fc.Arbitrary<DecisionUpdate> = fc.record({
  status: fc.constantFrom('active' as const, 'closed' as const),
  exitPrice: fc.oneof(
    fc.constant(null),
    fc.double({ min: 0.01, max: 10000, noNaN: true })
  ),
  actualOutcome: fc.string({ minLength: 0, maxLength: 200 }),
  lessonsLearned: fc.string({ minLength: 0, maxLength: 200 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
});

describe('JournalPage Persistence - Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Property 12: Update persistence round-trip
   *
   * For any valid DecisionUpdate applied to any DecisionEntry, after saving to
   * localStorage and reloading, the retrieved entry SHALL reflect all updated fields.
   *
   * **Validates: Requirements 5.8, 10.2**
   */
  it('Property 12: update persistence round-trip preserves all updated fields', () => {
    fc.assert(
      fc.property(decisionEntryArb, decisionUpdateArb, (entry, update) => {
        // Apply the update logic from JournalPage.handleUpdate
        const updated: DecisionEntry = {
          ...entry,
          status: update.status,
          currentPrice: update.exitPrice !== null ? update.exitPrice : entry.currentPrice,
          actualOutcome: update.actualOutcome,
          lessonsLearned: update.lessonsLearned,
        };

        // Save to localStorage
        const saveResult = saveToStorage(STORAGE_KEY, [updated]);
        expect(saveResult).toBe(true);

        // Reload from localStorage
        const loaded = loadFromStorage<DecisionEntry[]>(STORAGE_KEY, []);

        // Verify the loaded array has exactly one entry
        expect(loaded).toHaveLength(1);

        const retrieved = loaded[0];

        // Verify all updated fields match
        expect(retrieved.status).toBe(update.status);
        expect(retrieved.actualOutcome).toBe(update.actualOutcome);
        expect(retrieved.lessonsLearned).toBe(update.lessonsLearned);

        // Verify currentPrice reflects exitPrice logic
        if (update.exitPrice !== null) {
          expect(retrieved.currentPrice).toBe(update.exitPrice);
        } else {
          expect(retrieved.currentPrice).toBe(entry.currentPrice);
        }

        // Verify non-updated fields are preserved
        expect(retrieved.id).toBe(entry.id);
        expect(retrieved.date).toBe(entry.date);
        expect(retrieved.ticker).toBe(entry.ticker);
        expect(retrieved.companyName).toBe(entry.companyName);
        expect(retrieved.decision).toBe(entry.decision);
        expect(retrieved.positionSizePercent).toBe(entry.positionSizePercent);
        expect(retrieved.positionSizeAmount).toBe(entry.positionSizeAmount);
        expect(retrieved.entryPriceTarget).toBe(entry.entryPriceTarget);
        expect(retrieved.reasoning).toBe(entry.reasoning);
        expect(retrieved.expectedOutcome).toBe(entry.expectedOutcome);
        expect(retrieved.exitPlan).toBe(entry.exitPlan);
        expect(retrieved.reviewDates).toEqual(entry.reviewDates);
        expect(retrieved.scores).toEqual(entry.scores);
        expect(retrieved.alertsSet).toEqual(entry.alertsSet);
      })
    );
  });
});
