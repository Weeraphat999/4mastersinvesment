// Journal calculation utilities - pure computation functions
// Implements metrics for Performance Summary Cards, Performance Analytics, and Mistakes Autopsy

import type { DecisionEntry } from '../data/types';

export interface JournalMetrics {
  totalDecisions: number;
  winRate: number | null;
  avgReturn: number | null;
  bestTrade: { ticker: string; returnPct: number } | null;
}

export interface PerformanceMetrics {
  winRate: number;
  avgWinPercent: number;
  avgLossPercent: number;
  profitFactor: number;
  currentStreak: { type: 'win' | 'loss'; count: number };
}

export interface MonthlyReturn {
  month: string; // "YYYY-MM"
  returnPct: number;
}

export interface DecisionBreakdown {
  type: 'BUY' | 'PASS' | 'WATCHLIST';
  count: number;
  percentage: number;
}

export interface MistakeStats {
  totalLosses: number;
  totalDollarLost: number;
  avgLossPercent: number;
}

/**
 * Compute P&L percentage for a decision entry.
 * Returns 0 if entryPriceTarget is 0 to avoid division by zero.
 */
export function computePnlPercent(entry: DecisionEntry): number {
  if (entry.entryPriceTarget === 0) return 0;
  return ((entry.currentPrice - entry.entryPriceTarget) / entry.entryPriceTarget) * 100;
}

/**
 * Compute P&L dollar amount for a decision entry.
 * Returns 0 if entryPriceTarget is 0 to avoid division by zero.
 */
export function computePnlDollar(entry: DecisionEntry): number {
  if (entry.entryPriceTarget === 0) return 0;
  return (entry.currentPrice - entry.entryPriceTarget) * (entry.positionSizeAmount / entry.entryPriceTarget);
}

/**
 * Compute summary metrics from all decisions.
 * Returns null for winRate, avgReturn, and bestTrade when no closed decisions exist.
 */
export function computeJournalMetrics(decisions: DecisionEntry[]): JournalMetrics {
  const totalDecisions = decisions.length;

  const closedDecisions = decisions.filter((d) => d.status === 'closed');

  if (closedDecisions.length === 0) {
    return {
      totalDecisions,
      winRate: null,
      avgReturn: null,
      bestTrade: null,
    };
  }

  const pnlPercents = closedDecisions.map((d) => computePnlPercent(d));
  const wins = pnlPercents.filter((pnl) => pnl > 0).length;
  const winRate = (wins / closedDecisions.length) * 100;
  const avgReturn = pnlPercents.reduce((sum, pnl) => sum + pnl, 0) / closedDecisions.length;

  // Find best trade (highest P&L percent)
  let bestIdx = 0;
  for (let i = 1; i < pnlPercents.length; i++) {
    if (pnlPercents[i] > pnlPercents[bestIdx]) {
      bestIdx = i;
    }
  }

  const bestTrade = {
    ticker: closedDecisions[bestIdx].ticker,
    returnPct: pnlPercents[bestIdx],
  };

  return {
    totalDecisions,
    winRate,
    avgReturn,
    bestTrade,
  };
}

/**
 * Compute performance analytics metrics from closed decisions.
 * Returns zeroed metrics if no closed decisions exist.
 */
export function computePerformanceMetrics(decisions: DecisionEntry[]): PerformanceMetrics {
  const closedDecisions = decisions.filter((d) => d.status === 'closed');

  if (closedDecisions.length === 0) {
    return {
      winRate: 0,
      avgWinPercent: 0,
      avgLossPercent: 0,
      profitFactor: 0,
      currentStreak: { type: 'win', count: 0 },
    };
  }

  const pnlPercents = closedDecisions.map((d) => computePnlPercent(d));
  const wins = pnlPercents.filter((pnl) => pnl > 0);
  const losses = pnlPercents.filter((pnl) => pnl <= 0);

  const winRate = (wins.length / closedDecisions.length) * 100;
  const avgWinPercent = wins.length > 0 ? wins.reduce((sum, pnl) => sum + pnl, 0) / wins.length : 0;
  const avgLossPercent = losses.length > 0 ? losses.reduce((sum, pnl) => sum + pnl, 0) / losses.length : 0;

  // Profit factor = sum(positive pnl) / abs(sum(negative pnl)), Infinity if no losses
  const totalWins = wins.reduce((sum, pnl) => sum + pnl, 0);
  const totalLosses = Math.abs(losses.reduce((sum, pnl) => sum + pnl, 0));
  const profitFactor = totalLosses === 0 ? Infinity : totalWins / totalLosses;

  const currentStreak = computeCurrentStreak(closedDecisions);

  return {
    winRate,
    avgWinPercent,
    avgLossPercent,
    profitFactor,
    currentStreak,
  };
}

/**
 * Compute monthly returns for chart data.
 * Groups closed decisions by month (YYYY-MM) and computes average return per month.
 */
export function computeMonthlyReturns(decisions: DecisionEntry[]): MonthlyReturn[] {
  const closedDecisions = decisions.filter((d) => d.status === 'closed');

  if (closedDecisions.length === 0) return [];

  const monthMap = new Map<string, number[]>();

  for (const d of closedDecisions) {
    const month = d.date.slice(0, 7); // "YYYY-MM"
    const pnl = computePnlPercent(d);
    if (!monthMap.has(month)) {
      monthMap.set(month, []);
    }
    monthMap.get(month)!.push(pnl);
  }

  const results: MonthlyReturn[] = [];
  for (const [month, pnls] of monthMap) {
    const returnPct = pnls.reduce((sum: number, p: number) => sum + p, 0) / pnls.length;
    results.push({ month, returnPct });
  }

  // Sort by month ascending
  results.sort((a, b) => a.month.localeCompare(b.month));

  return results;
}

/**
 * Compute decision type breakdown.
 * Returns count and percentage for each decision type (BUY, PASS, WATCHLIST).
 */
export function computeDecisionBreakdown(decisions: DecisionEntry[]): DecisionBreakdown[] {
  const total = decisions.length;

  if (total === 0) {
    return [
      { type: 'BUY', count: 0, percentage: 0 },
      { type: 'PASS', count: 0, percentage: 0 },
      { type: 'WATCHLIST', count: 0, percentage: 0 },
    ];
  }

  const buyCount = decisions.filter((d) => d.decision === 'BUY').length;
  const passCount = decisions.filter((d) => d.decision === 'PASS').length;
  const watchlistCount = decisions.filter((d) => d.decision === 'WATCHLIST').length;

  return [
    { type: 'BUY', count: buyCount, percentage: (buyCount / total) * 100 },
    { type: 'PASS', count: passCount, percentage: (passCount / total) * 100 },
    { type: 'WATCHLIST', count: watchlistCount, percentage: (watchlistCount / total) * 100 },
  ];
}

/**
 * Compute outcome distribution (wins vs losses) for closed decisions.
 * A win is a closed decision with positive P&L percent.
 */
export function computeOutcomeDistribution(decisions: DecisionEntry[]): { wins: number; losses: number } {
  const closedDecisions = decisions.filter((d) => d.status === 'closed');

  let wins = 0;
  let losses = 0;

  for (const d of closedDecisions) {
    if (computePnlPercent(d) > 0) {
      wins++;
    } else {
      losses++;
    }
  }

  return { wins, losses };
}

/**
 * Compute mistake autopsy stats from losing decisions.
 * Expects an array of closed decisions with negative P&L.
 */
export function computeMistakeStats(losingDecisions: DecisionEntry[]): MistakeStats {
  if (losingDecisions.length === 0) {
    return {
      totalLosses: 0,
      totalDollarLost: 0,
      avgLossPercent: 0,
    };
  }

  const totalLosses = losingDecisions.length;
  const dollarLosses = losingDecisions.map((d) => Math.abs(computePnlDollar(d)));
  const totalDollarLost = dollarLosses.reduce((sum, loss) => sum + loss, 0);
  const pctLosses = losingDecisions.map((d) => computePnlPercent(d));
  const avgLossPercent = pctLosses.reduce((sum, pnl) => sum + pnl, 0) / totalLosses;

  return {
    totalLosses,
    totalDollarLost,
    avgLossPercent,
  };
}

/**
 * Get current streak (consecutive wins or losses, sorted by date descending).
 * A win is a closed decision with positive P&L percent.
 */
export function computeCurrentStreak(decisions: DecisionEntry[]): { type: 'win' | 'loss'; count: number } {
  const closedDecisions = decisions
    .filter((d) => d.status === 'closed')
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  if (closedDecisions.length === 0) {
    return { type: 'win', count: 0 };
  }

  const firstPnl = computePnlPercent(closedDecisions[0]);
  const streakType: 'win' | 'loss' = firstPnl > 0 ? 'win' : 'loss';
  let count = 0;

  for (const d of closedDecisions) {
    const pnl = computePnlPercent(d);
    const isWin = pnl > 0;
    if ((streakType === 'win' && isWin) || (streakType === 'loss' && !isWin)) {
      count++;
    } else {
      break;
    }
  }

  return { type: streakType, count };
}
