import { AnalysisResult } from './types';

/**
 * djb2 hash function - produces a consistent numeric hash from a string.
 * Used to seed deterministic value generation for placeholder data.
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Simple seeded pseudo-random number generator (linear congruential).
 * Returns a function that produces deterministic values in [0, 1) from a seed.
 */
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Generates a deterministic number in [min, max] from the next random value.
 */
function randomInRange(next: () => number, min: number, max: number): number {
  return min + next() * (max - min);
}

/**
 * Generates a deterministic integer in [min, max] from the next random value.
 */
function randomInt(next: () => number, min: number, max: number): number {
  return Math.floor(randomInRange(next, min, max + 1));
}

const VERDICTS = [
  'SPECULATIVE BUY',
  'STRONG BUY',
  'BUY',
  'HOLD',
  'ACCUMULATE',
  'CAUTIOUS BUY',
  'WATCH',
  'MODERATE BUY',
];

const POSITION_SIZES = [
  '3-5% speculative',
  '5-10% maximum',
  '10-15% growth allocation',
  '15-20% core holding',
  '5-8% starter position',
  '10-12% core holding',
];

const ENTRY_STRATEGIES = [
  'DCA over 6 months',
  'DCA over 12 months',
  'Buy on any 5% dip',
  'Accumulate on pullbacks',
  'Buy below current support',
  'Scale in over 3 months',
];

const RISK_LEVELS = [
  '⚠️ HIGH (speculative)',
  'MODERATE (fair valuation)',
  'LOW (blue-chip, proven)',
  'LOW-MODERATE (stable business)',
  '⚠️ HIGH (early-stage, unproven)',
  'MODERATE (growth premium)',
];

const TIME_HORIZONS = [
  '1-2 years',
  '2-3 years',
  '3-5 years',
  '5-7 years minimum',
  '3-5 years',
  '5-10 years',
];

const SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Energy',
  'Consumer Goods',
  'Industrials',
  'Real Estate',
  'Telecommunications',
];

const MOATS = [
  '⚠️ Weak (competitive market)',
  '✅ Moderate (brand recognition)',
  '✅ Strong (network effects)',
  '⚠️ Narrow (cost advantage)',
  '✅ Strong (switching costs)',
  '✅ Moderate (scale advantage)',
];

/**
 * Generates deterministic placeholder analysis data for any ticker
 * not found in the predefined set. Uses a simple hash of the ticker
 * string to seed consistent values.
 *
 * @param ticker - The ticker string (already normalized to uppercase by the caller)
 * @returns A complete AnalysisResult with all fields populated deterministically
 */
export function generatePlaceholderAnalysis(ticker: string): AnalysisResult {
  const hash = hashString(ticker);
  const next = seededRandom(hash);

  // Generate scores in range [0, 10], rounded to 1 decimal
  const buffett = Math.round(randomInRange(next, 0, 10) * 10) / 10;
  const munger = Math.round(randomInRange(next, 0, 10) * 10) / 10;
  const lynch = Math.round(randomInRange(next, 0, 10) * 10) / 10;
  const rothschild = Math.round(randomInRange(next, 0, 10) * 10) / 10;
  const overallScore = Math.round(((buffett + munger + lynch + rothschild) / 4) * 100) / 100;

  // Generate price (positive, between $5 and $500)
  const price = Math.round(randomInRange(next, 5, 500) * 100) / 100;

  // Generate price change (-10% to +10%)
  const priceChange = Math.round(randomInRange(next, -10, 10) * 10) / 10;

  // Pick from predefined lists using deterministic index
  const verdict = VERDICTS[randomInt(next, 0, VERDICTS.length - 1)];
  const positionSize = POSITION_SIZES[randomInt(next, 0, POSITION_SIZES.length - 1)];
  const entryStrategy = ENTRY_STRATEGIES[randomInt(next, 0, ENTRY_STRATEGIES.length - 1)];
  const riskLevel = RISK_LEVELS[randomInt(next, 0, RISK_LEVELS.length - 1)];
  const timeHorizon = TIME_HORIZONS[randomInt(next, 0, TIME_HORIZONS.length - 1)];
  const sector = SECTORS[randomInt(next, 0, SECTORS.length - 1)];
  const moat = MOATS[randomInt(next, 0, MOATS.length - 1)];

  // Generate quick facts deterministically
  const marketCapB = Math.round(randomInRange(next, 1, 500) * 10) / 10;
  const priceSales = Math.round(randomInRange(next, 0.5, 30) * 10) / 10;
  const profitMargin = Math.round(randomInRange(next, -5, 60) * 10) / 10;
  const debtEquity = Math.round(randomInRange(next, 0, 3) * 10) / 10;
  const cashRunwayYears = randomInt(next, 1, 10);
  const low52 = Math.round(price * randomInRange(next, 0.5, 0.9) * 100) / 100;
  const high52 = Math.round(price * randomInRange(next, 1.1, 1.8) * 100) / 100;

  return {
    ticker,
    companyName: `${ticker} Corp.`,
    price,
    priceChange,
    verdict,
    positionSize,
    entryStrategy,
    riskLevel,
    timeHorizon,
    masterScores: {
      buffett,
      munger,
      lynch,
      rothschild,
    },
    overallScore,
    quickFacts: {
      marketCap: `$${marketCapB}B`,
      priceSales: `${priceSales}x`,
      cashRunway: `~${cashRunwayYears} years`,
      sector,
      weekRange52: `$${low52} - $${high52}`,
      moat,
      profitMargin: `${profitMargin}%`,
      debtEquity: `${debtEquity}`,
    },
  };
}
