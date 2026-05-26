import type { VercelRequest, VercelResponse } from '@vercel/node';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { ticker } = req.query;

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    const result = await yahooFinance.quoteSummary(normalizedTicker, {
      modules: ['price', 'summaryProfile', 'defaultKeyStatistics', 'financialData'],
    });

    if (!result) {
      return res.status(404).json({ error: `No profile data for ${normalizedTicker}` });
    }

    const price = result.price ?? {};
    const profile = result.summaryProfile ?? {};
    const keyStats = result.defaultKeyStatistics ?? {};
    const financialData = result.financialData ?? {};

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json({
      symbol: (price as Record<string, unknown>).symbol ?? normalizedTicker,
      shortName: (price as Record<string, unknown>).shortName ?? '',
      longName: (price as Record<string, unknown>).longName ?? '',
      sector: (profile as Record<string, unknown>).sector ?? '',
      industry: (profile as Record<string, unknown>).industry ?? '',
      marketCap: (price as Record<string, unknown>).marketCap ?? 0,
      regularMarketPrice: (price as Record<string, unknown>).regularMarketPrice ?? 0,
      regularMarketChangePercent: (price as Record<string, unknown>).regularMarketChangePercent ?? 0,
      fiftyTwoWeekLow: (keyStats as Record<string, unknown>).fiftyTwoWeekLow ?? 0,
      fiftyTwoWeekHigh: (keyStats as Record<string, unknown>).fiftyTwoWeekHigh ?? 0,
      trailingPE: (keyStats as Record<string, unknown>).trailingPE ?? 0,
      forwardPE: (keyStats as Record<string, unknown>).forwardPE ?? 0,
      pegRatio: (keyStats as Record<string, unknown>).pegRatio ?? 0,
      priceToBook: (keyStats as Record<string, unknown>).priceToBook ?? 0,
      profitMargins: (financialData as Record<string, unknown>).profitMargins ?? 0,
      debtToEquity: (financialData as Record<string, unknown>).debtToEquity ?? 0,
      returnOnEquity: (financialData as Record<string, unknown>).returnOnEquity ?? 0,
      revenueGrowth: (financialData as Record<string, unknown>).revenueGrowth ?? 0,
      totalRevenue: (financialData as Record<string, unknown>).totalRevenue ?? 0,
      totalDebt: (financialData as Record<string, unknown>).totalDebt ?? 0,
      totalCash: (financialData as Record<string, unknown>).totalCash ?? 0,
      operatingCashflow: (financialData as Record<string, unknown>).operatingCashflow ?? 0,
      freeCashflow: (financialData as Record<string, unknown>).freeCashflow ?? 0,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile', details: String(error) });
  }
}
