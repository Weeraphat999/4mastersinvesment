import { PortfolioHolding } from '../data/types';
import { fetchQuote } from '../services/yahooFinanceService';

/**
 * Fetches real-time prices from Yahoo Finance for all holdings.
 * Falls back to existing currentPrice if a fetch fails for a specific ticker.
 * Returns a new array (immutable).
 */
export async function refreshPrices(holdings: PortfolioHolding[]): Promise<PortfolioHolding[]> {
  if (holdings.length === 0) return holdings;

  console.log('[PriceRefresh] Fetching prices for:', holdings.map(h => h.ticker));

  // Fetch all quotes in parallel
  const results = await Promise.allSettled(
    holdings.map((holding) => fetchQuote(holding.ticker))
  );

  return holdings.map((holding, index) => {
    const result = results[index];
    if (result.status === 'fulfilled' && result.value.regularMarketPrice > 0) {
      console.log(`[PriceRefresh] ${holding.ticker}: $${result.value.regularMarketPrice}`);
      return { ...holding, currentPrice: Math.round(result.value.regularMarketPrice * 100) / 100 };
    }
    if (result.status === 'rejected') {
      console.warn(`[PriceRefresh] ${holding.ticker} failed:`, result.reason);
    }
    // Keep existing price if fetch failed
    return holding;
  });
}
