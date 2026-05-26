import { PortfolioHolding } from '../data/types';

/**
 * Generates a CSV string from portfolio holdings.
 * @param holdings - Array of PortfolioHolding entries
 * @param totalValue - Total portfolio value used to compute portfolio percentages
 * @returns CSV string with header and one data row per holding
 */
export function generatePortfolioCSV(holdings: PortfolioHolding[], totalValue: number): string {
  const header = 'Ticker,Company,Shares,Avg Cost,Current Price,Gain/Loss,Portfolio %,Purchase Date,Category,Risk Level';
  const rows = holdings.map((h) => {
    const gainLoss = (h.currentPrice - h.avgCost) * h.shares;
    const portfolioPercent = totalValue === 0 ? 0 : (h.shares * h.currentPrice) / totalValue * 100;
    return `${h.ticker},${h.companyName},${h.shares},${h.avgCost},${h.currentPrice},${gainLoss.toFixed(2)},${portfolioPercent.toFixed(2)},${h.purchaseDate},${h.category},${h.riskLevel}`;
  });
  return [header, ...rows].join('\n');
}
