import { PortfolioHolding } from '../data/types';

export interface PieSlice {
  ticker: string;
  percent: number;
  startAngle: number;
  endAngle: number;
  color: string;
}

const COLORS: string[] = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#14B8A6', // teal
  '#6366F1', // indigo
  '#84CC16', // lime
  '#A855F7', // purple
  '#22D3EE', // sky
  '#FBBF24', // yellow
  '#E11D48', // rose
];

/**
 * Compute total portfolio value: sum of shares × currentPrice for each holding.
 */
export function computeTotalValue(holdings: PortfolioHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
}

/**
 * Compute total P&L: sum of (currentPrice - avgCost) × shares for each holding.
 */
export function computeTotalPnL(holdings: PortfolioHolding[]): number {
  return holdings.reduce((sum, h) => sum + (h.currentPrice - h.avgCost) * h.shares, 0);
}

/**
 * Compute high-risk exposure as a percentage of total value.
 * Returns 0 if totalValue is 0.
 */
export function computeHighRiskExposure(holdings: PortfolioHolding[], totalValue: number): number {
  if (totalValue === 0) return 0;
  const highRiskValue = holdings
    .filter(h => h.riskLevel === 'high')
    .reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
  return (highRiskValue / totalValue) * 100;
}

/**
 * Compute gain/loss for a single holding: (currentPrice - avgCost) × shares.
 */
export function computeGainLoss(holding: PortfolioHolding): number {
  return (holding.currentPrice - holding.avgCost) * holding.shares;
}

/**
 * Compute gain/loss percentage for a single holding: ((currentPrice - avgCost) / avgCost) × 100.
 * Returns 0 if avgCost is 0.
 */
export function computeGainLossPercent(holding: PortfolioHolding): number {
  if (holding.avgCost === 0) return 0;
  return ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100;
}

/**
 * Compute portfolio percentage for a single holding: (shares × currentPrice) / totalValue × 100.
 * Returns 0 if totalValue is 0.
 */
export function computePortfolioPercent(holding: PortfolioHolding, totalValue: number): number {
  if (totalValue === 0) return 0;
  return (holding.shares * holding.currentPrice) / totalValue * 100;
}

/**
 * Compute risk breakdown: group holdings by riskLevel and return percentage of total value for each.
 * Returns { low: %, medium: %, high: % }.
 */
export function computeRiskBreakdown(holdings: PortfolioHolding[], totalValue: number): Record<string, number> {
  const breakdown: Record<string, number> = { low: 0, medium: 0, high: 0 };
  if (totalValue === 0) return breakdown;

  for (const h of holdings) {
    const value = h.shares * h.currentPrice;
    breakdown[h.riskLevel] = (breakdown[h.riskLevel] || 0) + value;
  }

  breakdown.low = (breakdown.low / totalValue) * 100;
  breakdown.medium = (breakdown.medium / totalValue) * 100;
  breakdown.high = (breakdown.high / totalValue) * 100;

  return breakdown;
}

/**
 * Get top performers sorted by gain/loss percentage descending, take first `count`.
 */
export function getTopPerformers(holdings: PortfolioHolding[], count: number): PortfolioHolding[] {
  return [...holdings]
    .sort((a, b) => computeGainLossPercent(b) - computeGainLossPercent(a))
    .slice(0, count);
}

/**
 * Get bottom performers sorted by gain/loss percentage ascending, take first `count`.
 */
export function getBottomPerformers(holdings: PortfolioHolding[], count: number): PortfolioHolding[] {
  return [...holdings]
    .sort((a, b) => computeGainLossPercent(a) - computeGainLossPercent(b))
    .slice(0, count);
}

/**
 * Get holdings where portfolio percentage exceeds threshold (default 15%).
 */
export function getOverLimitHoldings(
  holdings: PortfolioHolding[],
  totalValue: number,
  threshold: number = 15
): PortfolioHolding[] {
  if (totalValue === 0) return [];
  return holdings.filter(h => computePortfolioPercent(h, totalValue) > threshold);
}

/**
 * Compute pie chart slices with startAngle, endAngle, percent, and color for each holding.
 */
export function computePieSlices(holdings: PortfolioHolding[], totalValue: number): PieSlice[] {
  if (totalValue === 0) return [];

  let cumulativeAngle = 0;
  return holdings.map((h, i) => {
    const percent = (h.shares * h.currentPrice) / totalValue * 100;
    const angle = (percent / 100) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ticker: h.ticker,
      percent,
      startAngle,
      endAngle: cumulativeAngle,
      color: COLORS[i % COLORS.length],
    };
  });
}

/**
 * Sort holdings by a given column and direction.
 */
export function sortHoldings(
  holdings: PortfolioHolding[],
  column: string,
  direction: 'asc' | 'desc',
  totalValue: number
): PortfolioHolding[] {
  const sorted = [...holdings].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (column) {
      case 'ticker':
        aVal = a.ticker.toLowerCase();
        bVal = b.ticker.toLowerCase();
        break;
      case 'companyName':
        aVal = a.companyName.toLowerCase();
        bVal = b.companyName.toLowerCase();
        break;
      case 'shares':
        aVal = a.shares;
        bVal = b.shares;
        break;
      case 'avgCost':
        aVal = a.avgCost;
        bVal = b.avgCost;
        break;
      case 'currentPrice':
        aVal = a.currentPrice;
        bVal = b.currentPrice;
        break;
      case 'gainLoss':
        aVal = computeGainLoss(a);
        bVal = computeGainLoss(b);
        break;
      case 'gainLossPercent':
        aVal = computeGainLossPercent(a);
        bVal = computeGainLossPercent(b);
        break;
      case 'portfolioPercent':
        aVal = computePortfolioPercent(a, totalValue);
        bVal = computePortfolioPercent(b, totalValue);
        break;
      default:
        aVal = 0;
        bVal = 0;
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

/**
 * Filter holdings by case-insensitive match on ticker or companyName.
 */
export function filterHoldings(holdings: PortfolioHolding[], query: string): PortfolioHolding[] {
  const lower = query.toLowerCase();
  return holdings.filter(
    h => h.ticker.toLowerCase().includes(lower) || h.companyName.toLowerCase().includes(lower)
  );
}
