import { describe, it, expect } from 'vitest';
import { computeIndicators } from './technicalIndicatorEngine';

describe('technicalIndicatorEngine', () => {
  describe('computeIndicators', () => {
    it('returns null when prices array has fewer than 26 data points', () => {
      expect(computeIndicators([])).toBeNull();
      expect(computeIndicators([100])).toBeNull();
      expect(computeIndicators(Array(25).fill(100))).toBeNull();
    });

    it('returns null for exactly 25 data points', () => {
      const prices = Array.from({ length: 25 }, (_, i) => 100 + i);
      expect(computeIndicators(prices)).toBeNull();
    });

    it('returns IndicatorResults for exactly 26 data points', () => {
      const prices = Array.from({ length: 26 }, (_, i) => 100 + i * 0.5);
      const result = computeIndicators(prices);
      expect(result).not.toBeNull();
      expect(result!.ema12).toBeDefined();
      expect(result!.ema26).toBeDefined();
      expect(result!.rsi14).toBeDefined();
      expect(result!.macd).toBeDefined();
    });

    it('computes EMA-12 with correct length', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i) * 10);
      const result = computeIndicators(prices)!;
      // EMA with period 12 on 50 data points produces 50 - 12 + 1 = 39 values
      expect(result.ema12.length).toBe(50 - 12 + 1);
    });

    it('computes EMA-26 with correct length', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i) * 10);
      const result = computeIndicators(prices)!;
      // EMA with period 26 on 50 data points produces 50 - 26 + 1 = 25 values
      expect(result.ema26.length).toBe(50 - 26 + 1);
    });

    it('computes RSI-14 with correct length', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i) * 10);
      const result = computeIndicators(prices)!;
      // RSI with period 14 on 50 data points produces 50 - 14 = 36 values
      expect(result.rsi14.length).toBe(50 - 14);
    });

    it('RSI values are within [0, 100] range', () => {
      const prices = Array.from({ length: 100 }, (_, i) => 50 + Math.sin(i * 0.5) * 30);
      const result = computeIndicators(prices)!;
      for (const rsi of result.rsi14) {
        expect(rsi).toBeGreaterThanOrEqual(0);
        expect(rsi).toBeLessThanOrEqual(100);
      }
    });

    it('MACD histogram equals macdLine minus signalLine', () => {
      const prices = Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i * 0.3) * 20);
      const result = computeIndicators(prices)!;
      const { macdLine, signalLine, histogram } = result.macd;
      expect(macdLine.length).toBe(signalLine.length);
      expect(macdLine.length).toBe(histogram.length);
      for (let i = 0; i < histogram.length; i++) {
        expect(histogram[i]).toBeCloseTo(macdLine[i] - signalLine[i], 4);
      }
    });

    it('MACD arrays have consistent lengths', () => {
      const prices = Array.from({ length: 60 }, (_, i) => 100 + i * 0.5);
      const result = computeIndicators(prices)!;
      expect(result.macd.macdLine.length).toBe(result.macd.signalLine.length);
      expect(result.macd.macdLine.length).toBe(result.macd.histogram.length);
      expect(result.macd.macdLine.length).toBeGreaterThan(0);
    });

    it('all EMA values are finite numbers', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + i);
      const result = computeIndicators(prices)!;
      for (const val of result.ema12) {
        expect(Number.isFinite(val)).toBe(true);
      }
      for (const val of result.ema26) {
        expect(Number.isFinite(val)).toBe(true);
      }
    });
  });
});
