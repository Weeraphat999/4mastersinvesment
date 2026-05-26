import type { VercelRequest, VercelResponse } from '@vercel/node';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

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

    const price = (result.price ?? {}) as Record<string, unknown>;
    const profile = (result.summaryProfile ?? {}) as Record<string, unknown>;
    const keyStats = (result.defaultKeyStatistics ?? {}) as Record<string, unknown>;
    const financialData = (result.financialData ?? {}) as Record<string, unknown>;

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json({
      symbol: price.symbol ?? normalizedTicker,
      shortName: price.shortName ?? '',
      longName: price.longName ?? '',
      sector: profile.sector ?? '',
      industry: profile.industry ?? '',
      marketCap: price.marketCap ?? 0,
      regularMarketPrice: price.regularMarketPrice ?? 0,
      regularMarketChangePercent: price.regularMarketChangePercent ?? 0,
      fiftyTwoWeekLow: keyStats.fiftyTwoWeekLow ?? 0,
      fiftyTwoWeekHigh: keyStats.fiftyTwoWeekHigh ?? 0,
      trailingPE: keyStats.trailingPE ?? 0,
      forwardPE: keyStats.forwardPE ?? 0,
      pegRatio: keyStats.pegRatio ?? 0,
      priceToBook: keyStats.priceToBook ?? 0,
      profitMargins: financialData.profitMargins ?? 0,
      debtToEquity: financialData.debtToEquity ?? 0,
      returnOnEquity: financialData.returnOnEquity ?? 0,
      revenueGrowth: financialData.revenueGrowth ?? 0,
      totalRevenue: financialData.totalRevenue ?? 0,
      totalDebt: financialData.totalDebt ?? 0,
      totalCash: financialData.totalCash ?? 0,
      operatingCashflow: financialData.operatingCashflow ?? 0,
      freeCashflow: financialData.freeCashflow ?? 0,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile', details: String(error) });
  }
}
