import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getAnalysis } from './getAnalysis';

describe('getAnalysis', () => {
  it('returns predefined data for known tickers', () => {
    const result = getAnalysis('AAPL');
    expect(result.ticker).toBe('AAPL');
    expect(result.companyName).toBe('Apple Inc.');
    expect(result.price).toBe(178.72);
  });

  it('is case-insensitive', () => {
    const lower = getAnalysis('aapl');
    const upper = getAnalysis('AAPL');
    const mixed = getAnalysis('Aapl');
    expect(lower).toEqual(upper);
    expect(mixed).toEqual(upper);
  });

  it('trims whitespace from ticker', () => {
    const result = getAnalysis('  NVDA  ');
    expect(result.ticker).toBe('NVDA');
    expect(result.companyName).toBe('NVIDIA Corporation');
  });

  it('returns placeholder data for unknown tickers', () => {
    const result = getAnalysis('XYZA');
    expect(result.ticker).toBe('XYZA');
    expect(result.companyName).toBe('XYZA Corp.');
    expect(result.price).toBeGreaterThan(0);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(10);
  });

  it('never returns null or undefined', () => {
    const tickers = ['', ' ', 'UNKNOWN', '123', 'aapl', 'QTUM'];
    for (const ticker of tickers) {
      const result = getAnalysis(ticker);
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.ticker).toBeDefined();
      expect(result.masterScores).toBeDefined();
      expect(result.quickFacts).toBeDefined();
    }
  });

  it('returns all required fields for any ticker', () => {
    const result = getAnalysis('RANDOM');
    expect(result).toHaveProperty('ticker');
    expect(result).toHaveProperty('companyName');
    expect(result).toHaveProperty('price');
    expect(result).toHaveProperty('priceChange');
    expect(result).toHaveProperty('verdict');
    expect(result).toHaveProperty('positionSize');
    expect(result).toHaveProperty('entryStrategy');
    expect(result).toHaveProperty('riskLevel');
    expect(result).toHaveProperty('timeHorizon');
    expect(result).toHaveProperty('masterScores');
    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('quickFacts');
    expect(result.masterScores).toHaveProperty('buffett');
    expect(result.masterScores).toHaveProperty('munger');
    expect(result.masterScores).toHaveProperty('lynch');
    expect(result.masterScores).toHaveProperty('rothschild');
  });
});

// Feature: four-masters-investor, Property 2: Case-insensitive equivalence
describe('Property 2: Case-insensitive equivalence', () => {
  /**
   * Validates: Requirements 10.3
   *
   * For any ticker string, getAnalysis(ticker.toLowerCase()) SHALL produce
   * an identical AnalysisResult to getAnalysis(ticker.toUpperCase()).
   */
  it('getAnalysis(ticker.toLowerCase()) produces identical result to getAnalysis(ticker.toUpperCase()) for any string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (ticker: string) => {
          const lowerResult = getAnalysis(ticker.toLowerCase());
          const upperResult = getAnalysis(ticker.toUpperCase());

          expect(lowerResult).toEqual(upperResult);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: four-masters-investor, Property 1: Totality of analysis lookup
describe('Property 1: Totality of analysis lookup', () => {
  /**
   * Validates: Requirements 10.1, 10.4, 10.5
   *
   * For any non-empty string used as a ticker symbol, getAnalysis(ticker)
   * SHALL return a complete AnalysisResult object with all required fields
   * populated — never null, never an error, never missing fields.
   */
  it('getAnalysis always returns a complete AnalysisResult with all required fields for any non-empty string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (ticker: string) => {
          const result = getAnalysis(ticker);

          // Result must not be null or undefined
          expect(result).not.toBeNull();
          expect(result).not.toBeUndefined();

          // Top-level required fields
          expect(typeof result.ticker).toBe('string');
          expect(result.ticker.length).toBeGreaterThan(0);

          expect(typeof result.companyName).toBe('string');
          expect(result.companyName.length).toBeGreaterThan(0);

          expect(typeof result.price).toBe('number');
          expect(result.price).not.toBeNaN();

          expect(typeof result.priceChange).toBe('number');
          expect(result.priceChange).not.toBeNaN();

          expect(typeof result.verdict).toBe('string');
          expect(result.verdict.length).toBeGreaterThan(0);

          expect(typeof result.positionSize).toBe('string');
          expect(result.positionSize.length).toBeGreaterThan(0);

          expect(typeof result.entryStrategy).toBe('string');
          expect(result.entryStrategy.length).toBeGreaterThan(0);

          expect(typeof result.riskLevel).toBe('string');
          expect(result.riskLevel.length).toBeGreaterThan(0);

          expect(typeof result.timeHorizon).toBe('string');
          expect(result.timeHorizon.length).toBeGreaterThan(0);

          // masterScores must be a complete object with all four masters
          expect(result.masterScores).not.toBeNull();
          expect(result.masterScores).not.toBeUndefined();
          expect(typeof result.masterScores.buffett).toBe('number');
          expect(result.masterScores.buffett).not.toBeNaN();
          expect(typeof result.masterScores.munger).toBe('number');
          expect(result.masterScores.munger).not.toBeNaN();
          expect(typeof result.masterScores.lynch).toBe('number');
          expect(result.masterScores.lynch).not.toBeNaN();
          expect(typeof result.masterScores.rothschild).toBe('number');
          expect(result.masterScores.rothschild).not.toBeNaN();

          // overallScore must be a number
          expect(typeof result.overallScore).toBe('number');
          expect(result.overallScore).not.toBeNaN();

          // quickFacts must be a complete object with all required fields
          expect(result.quickFacts).not.toBeNull();
          expect(result.quickFacts).not.toBeUndefined();
          expect(typeof result.quickFacts.marketCap).toBe('string');
          expect(result.quickFacts.marketCap.length).toBeGreaterThan(0);
          expect(typeof result.quickFacts.priceSales).toBe('string');
          expect(result.quickFacts.priceSales.length).toBeGreaterThan(0);
          expect(typeof result.quickFacts.cashRunway).toBe('string');
          expect(result.quickFacts.cashRunway.length).toBeGreaterThan(0);
          expect(typeof result.quickFacts.sector).toBe('string');
          expect(result.quickFacts.sector.length).toBeGreaterThan(0);
          expect(typeof result.quickFacts.weekRange52).toBe('string');
          expect(result.quickFacts.weekRange52.length).toBeGreaterThan(0);
          expect(typeof result.quickFacts.moat).toBe('string');
          expect(result.quickFacts.moat.length).toBeGreaterThan(0);
          expect(typeof result.quickFacts.profitMargin).toBe('string');
          expect(result.quickFacts.profitMargin.length).toBeGreaterThan(0);
          expect(typeof result.quickFacts.debtEquity).toBe('string');
          expect(result.quickFacts.debtEquity.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: four-masters-investor, Property 4: Score values within valid range
describe('Property 4: Score values within valid range', () => {
  /**
   * Validates: Requirements 7.4, 7.5
   *
   * For any ticker string, all scores in the returned AnalysisResult
   * (buffett, munger, lynch, rothschild, overallScore) SHALL be numbers
   * in the range [0, 10].
   */
  it('all scores (buffett, munger, lynch, rothschild, overallScore) are in [0, 10] for any ticker', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (ticker: string) => {
          const result = getAnalysis(ticker);

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
        }
      ),
      { numRuns: 100 }
    );
  });
});
