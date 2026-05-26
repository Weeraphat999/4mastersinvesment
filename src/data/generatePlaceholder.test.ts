import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generatePlaceholderAnalysis } from './generatePlaceholder';

describe('generatePlaceholderAnalysis', () => {
  it('returns the same result for the same ticker (deterministic)', () => {
    const result1 = generatePlaceholderAnalysis('XYZ');
    const result2 = generatePlaceholderAnalysis('XYZ');
    expect(result1).toEqual(result2);
  });

  it('returns different results for different tickers', () => {
    const result1 = generatePlaceholderAnalysis('ABC');
    const result2 = generatePlaceholderAnalysis('DEF');
    expect(result1.price).not.toEqual(result2.price);
  });

  it('generates scores in range [0, 10]', () => {
    const result = generatePlaceholderAnalysis('TEST');
    expect(result.masterScores.buffett).toBeGreaterThanOrEqual(0);
    expect(result.masterScores.buffett).toBeLessThanOrEqual(10);
    expect(result.masterScores.munger).toBeGreaterThanOrEqual(0);
    expect(result.masterScores.munger).toBeLessThanOrEqual(10);
    expect(result.masterScores.lynch).toBeGreaterThanOrEqual(0);
    expect(result.masterScores.lynch).toBeLessThanOrEqual(10);
    expect(result.masterScores.rothschild).toBeGreaterThanOrEqual(0);
    expect(result.masterScores.rothschild).toBeLessThanOrEqual(10);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(10);
  });

  it('generates positive prices', () => {
    const result = generatePlaceholderAnalysis('PRICE');
    expect(result.price).toBeGreaterThan(0);
  });

  it('sets company name to "{TICKER} Corp."', () => {
    const result = generatePlaceholderAnalysis('MSFT');
    expect(result.companyName).toBe('MSFT Corp.');
  });

  it('sets the ticker field to the input ticker', () => {
    const result = generatePlaceholderAnalysis('GOOG');
    expect(result.ticker).toBe('GOOG');
  });

  it('populates all required fields', () => {
    const result = generatePlaceholderAnalysis('FULL');
    expect(result.ticker).toBeDefined();
    expect(result.companyName).toBeDefined();
    expect(result.price).toBeDefined();
    expect(result.priceChange).toBeDefined();
    expect(result.verdict).toBeDefined();
    expect(result.positionSize).toBeDefined();
    expect(result.entryStrategy).toBeDefined();
    expect(result.riskLevel).toBeDefined();
    expect(result.timeHorizon).toBeDefined();
    expect(result.masterScores).toBeDefined();
    expect(result.overallScore).toBeDefined();
    expect(result.quickFacts).toBeDefined();
    expect(result.quickFacts.marketCap).toBeDefined();
    expect(result.quickFacts.priceSales).toBeDefined();
    expect(result.quickFacts.cashRunway).toBeDefined();
    expect(result.quickFacts.sector).toBeDefined();
    expect(result.quickFacts.weekRange52).toBeDefined();
    expect(result.quickFacts.moat).toBeDefined();
    expect(result.quickFacts.profitMargin).toBeDefined();
    expect(result.quickFacts.debtEquity).toBeDefined();
  });
});

// Feature: four-masters-investor, Property 3: Deterministic placeholder generation
describe('Property 3: Deterministic placeholder generation', () => {
  const PREDEFINED_TICKERS = ['QTUM', 'AAPL', 'NVDA', 'PTT', 'AOT', 'CPALL'];

  /**
   * Validates: Requirements 10.4, 10.5
   *
   * For any ticker string not in the predefined data set, calling
   * generatePlaceholderAnalysis(ticker) multiple times SHALL always
   * return the same AnalysisResult.
   */
  it('generatePlaceholderAnalysis returns the same result on repeated calls for any string not in predefined set', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(
          (s) => !PREDEFINED_TICKERS.includes(s.toUpperCase())
        ),
        (ticker: string) => {
          const result1 = generatePlaceholderAnalysis(ticker);
          const result2 = generatePlaceholderAnalysis(ticker);
          const result3 = generatePlaceholderAnalysis(ticker);

          expect(result1).toEqual(result2);
          expect(result2).toEqual(result3);
        }
      ),
      { numRuns: 100 }
    );
  });
});
