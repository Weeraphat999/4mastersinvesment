import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateCsvContent, generateJsonContent, generateExportFilename } from './journalExport';
import type { DecisionEntry } from '../data/types';

// Arbitrary for DecisionEntry that generates valid entries
// IMPORTANT: String fields do NOT contain newline characters to avoid breaking CSV line counting
const noNewlineString = fc.string().filter(s => !s.includes('\n') && !s.includes('\r'));

// Generate a valid ISO date string without relying on fc.date() which can produce invalid dates
const isoDateStringArb = fc.tuple(
  fc.integer({ min: 2000, max: 2030 }),
  fc.integer({ min: 1, max: 12 }),
  fc.integer({ min: 1, max: 28 }),
  fc.integer({ min: 0, max: 23 }),
  fc.integer({ min: 0, max: 59 }),
  fc.integer({ min: 0, max: 59 })
).map(([y, m, d, h, min, s]) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(s)}.000Z`;
});

const dateOnlyArb = fc.tuple(
  fc.integer({ min: 2000, max: 2030 }),
  fc.integer({ min: 1, max: 12 }),
  fc.integer({ min: 1, max: 28 })
).map(([y, m, d]) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}-${pad(d)}`;
});

const decisionEntryArb: fc.Arbitrary<DecisionEntry> = fc.record({
  id: noNewlineString,
  date: isoDateStringArb,
  ticker: noNewlineString,
  companyName: noNewlineString,
  decision: fc.constantFrom('BUY' as const, 'PASS' as const, 'WATCHLIST' as const),
  positionSizePercent: fc.double({ min: 0, max: 100, noNaN: true }),
  positionSizeAmount: fc.double({ min: 0, max: 1000000, noNaN: true }),
  entryPriceTarget: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  currentPrice: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  reasoning: noNewlineString,
  expectedOutcome: noNewlineString,
  exitPlan: noNewlineString,
  reviewDates: fc.array(dateOnlyArb, { minLength: 0, maxLength: 5 }),
  scores: fc.record({
    buffett: fc.integer({ min: 0, max: 10 }),
    munger: fc.integer({ min: 0, max: 10 }),
    lynch: fc.integer({ min: 0, max: 10 }),
    rothschild: fc.integer({ min: 0, max: 10 }),
    overall: fc.integer({ min: 0, max: 10 }),
  }),
  alertsSet: fc.array(noNewlineString, { minLength: 0, maxLength: 5 }),
  status: fc.constantFrom('active' as const, 'closed' as const),
  actualOutcome: noNewlineString,
  lessonsLearned: noNewlineString,
});

describe('journalExport property tests', () => {
  /**
   * Property 17: CSV export contains all decision fields
   * For any non-empty array of DecisionEntry records, the generated CSV SHALL have
   * exactly n + 1 lines (1 header + n data rows), and the header row SHALL contain
   * column names for every DecisionEntry field.
   *
   * **Validates: Requirements 8.2**
   */
  it('Property 17: CSV export contains all decision fields', () => {
    fc.assert(
      fc.property(
        fc.array(decisionEntryArb, { minLength: 1, maxLength: 10 }),
        (decisions) => {
          const csv = generateCsvContent(decisions);
          const lines = csv.split('\n');

          // Should have exactly n + 1 lines (1 header + n data rows)
          expect(lines.length).toBe(decisions.length + 1);

          // Header row should contain column names for every DecisionEntry field
          const header = lines[0];
          const expectedColumns = [
            'id',
            'date',
            'ticker',
            'companyName',
            'decision',
            'positionSizePercent',
            'positionSizeAmount',
            'entryPriceTarget',
            'currentPrice',
            'reasoning',
            'expectedOutcome',
            'exitPlan',
            'reviewDates',
            'scores_buffett',
            'scores_munger',
            'scores_lynch',
            'scores_rothschild',
            'scores_overall',
            'alertsSet',
            'status',
            'actualOutcome',
            'lessonsLearned',
          ];

          for (const col of expectedColumns) {
            expect(header).toContain(col);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 18: JSON export round-trip
   * For any array of DecisionEntry records, JSON.parse(generateJsonContent(decisions))
   * SHALL be deeply equal to the original decisions array.
   *
   * **Validates: Requirements 8.3**
   */
  it('Property 18: JSON export round-trip', () => {
    fc.assert(
      fc.property(
        fc.array(decisionEntryArb, { minLength: 0, maxLength: 10 }),
        (decisions) => {
          const jsonContent = generateJsonContent(decisions);
          const parsed = JSON.parse(jsonContent);
          expect(parsed).toEqual(decisions);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 19: Export filename format
   * For any export format and any current date, the generated filename SHALL match
   * the regex pattern ^decision-journal-\d{4}-\d{2}-\d{2}\.(csv|json)$.
   *
   * **Validates: Requirements 8.4**
   */
  it('Property 19: Export filename format', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('csv' as const, 'json' as const),
        (format) => {
          const filename = generateExportFilename(format);
          const pattern = /^decision-journal-\d{4}-\d{2}-\d{2}\.(csv|json)$/;
          expect(filename).toMatch(pattern);

          // The extension should match the requested format
          expect(filename.endsWith(`.${format}`)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
