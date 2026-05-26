import { EMA, RSI, MACD } from 'technicalindicators';

export interface IndicatorResults {
  ema12: number[];
  ema26: number[];
  rsi14: number[];
  macd: {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  };
}

/**
 * Computes technical indicators (EMA-12, EMA-26, RSI-14, MACD) from an array of closing prices.
 * Returns null if the prices array has fewer than 26 data points.
 */
export function computeIndicators(prices: number[]): IndicatorResults | null {
  if (prices.length < 26) {
    return null;
  }

  const ema12 = EMA.calculate({ period: 12, values: prices });
  const ema26 = EMA.calculate({ period: 26, values: prices });
  const rsi14 = RSI.calculate({ period: 14, values: prices });

  const macdResult = MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  const macdLine: number[] = [];
  const signalLine: number[] = [];
  const histogram: number[] = [];

  for (const point of macdResult) {
    if (
      point.MACD !== undefined &&
      point.signal !== undefined &&
      point.histogram !== undefined
    ) {
      macdLine.push(point.MACD);
      signalLine.push(point.signal);
      histogram.push(point.histogram);
    }
  }

  return {
    ema12,
    ema26,
    rsi14,
    macd: {
      macdLine,
      signalLine,
      histogram,
    },
  };
}
