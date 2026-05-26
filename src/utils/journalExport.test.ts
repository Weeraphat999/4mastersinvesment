import { describe, it, expect } from 'vitest';
import { generateCsvContent, generateJsonContent, generateExportFilename } from './journalExport';
import type { DecisionEntry } from '../data/types';

const sampleEntry: DecisionEntry = {
  id: 'test-1',
  date: '2024-01-15T10:00:00Z',
  ticker: 'AAPL',
  companyName: 'Apple, Inc.',
  decision: 'BUY',
  positionSizePercent: 5,
  positionSizeAmount: 10000,
  entryPriceTarget: 180,
  currentPrice: 195,
  reasoning: 'Strong moat, consistent growth',
  expectedOutcome: 'Price target $220 within 12 months',
  exitPlan: 'Sell at $220 or if fundamentals deteriorate',
  reviewDates: ['2024-04-15', '2024-07-15'],
  scores: { buffett: 8, munger: 7, lynch: 6, rothschild: 5, overall: 7 },
  alertsSet: ['price-above-200', 'earnings-report'],
  status: 'active',
  actualOutcome: '',
  lessonsLearned: '',
};

describe('generateCsvContent', () => {
  it('should generate header row with all field names', () => {
    const csv = generateCsvContent([sampleEntry]);
    const lines = csv.split('\n');
    const headers = lines[0];
    expect(headers).toContain('id');
    expect(headers).toContain('ticker');
    expect(headers).toContain('scores_buffett');
    expect(headers).toContain('scores_munger');
    expect(headers).toContain('scores_lynch');
    expect(headers).toContain('scores_rothschild');
    expect(headers).toContain('scores_overall');
    expect(headers).toContain('reviewDates');
    expect(headers).toContain('alertsSet');
  });

  it('should have n+1 lines for n entries', () => {
    const csv = generateCsvContent([sampleEntry, sampleEntry]);
    const lines = csv.split('\n');
    expect(lines.length).toBe(3); // 1 header + 2 data rows
  });

  it('should flatten scores into separate columns', () => {
    const csv = generateCsvContent([sampleEntry]);
    const lines = csv.split('\n');
    const dataRow = lines[1];
    // scores_buffett=8, scores_munger=7, scores_lynch=6, scores_rothschild=5, scores_overall=7
    expect(dataRow).toContain('8,7,6,5,7');
  });

  it('should join arrays with semicolons', () => {
    const csv = generateCsvContent([sampleEntry]);
    const lines = csv.split('\n');
    const dataRow = lines[1];
    expect(dataRow).toContain('2024-04-15;2024-07-15');
    expect(dataRow).toContain('price-above-200;earnings-report');
  });

  it('should wrap values containing commas in double quotes', () => {
    const csv = generateCsvContent([sampleEntry]);
    const lines = csv.split('\n');
    const dataRow = lines[1];
    // "Apple, Inc." contains a comma so should be quoted
    expect(dataRow).toContain('"Apple, Inc."');
  });

  it('should return only header for empty array', () => {
    const csv = generateCsvContent([]);
    const lines = csv.split('\n');
    expect(lines.length).toBe(1);
    expect(lines[0]).toContain('id');
  });
});

describe('generateJsonContent', () => {
  it('should produce valid JSON that parses back to original', () => {
    const json = generateJsonContent([sampleEntry]);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual([sampleEntry]);
  });

  it('should handle empty array', () => {
    const json = generateJsonContent([]);
    expect(JSON.parse(json)).toEqual([]);
  });
});

describe('generateExportFilename', () => {
  it('should match pattern decision-journal-YYYY-MM-DD.csv', () => {
    const filename = generateExportFilename('csv');
    expect(filename).toMatch(/^decision-journal-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('should match pattern decision-journal-YYYY-MM-DD.json', () => {
    const filename = generateExportFilename('json');
    expect(filename).toMatch(/^decision-journal-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('should use current date', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const filename = generateExportFilename('csv');
    expect(filename).toBe(`decision-journal-${year}-${month}-${day}.csv`);
  });
});
