import type { VercelRequest, VercelResponse } from '@vercel/node';

const YAHOO_BASE = 'https://query2.finance.yahoo.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { ticker } = req.query;

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    // Use quoteSummary endpoint for detailed company info
    const response = await fetch(
      `${YAHOO_BASE}/v10/finance/quoteSummary/${normalizedTicker}?modules=price,summaryProfile,defaultKeyStatistics,financialData`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: `Yahoo API returned ${response.status}` });
    }

    const data = await response.json();
    const result = data?.quoteSummary?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: `No profile data for ${normalizedTicker}` });
    }

    const price = result.price ?? {};
    const profile = result.summaryProfile ?? {};
    const keyStats = result.defaultKeyStatistics ?? {};
    const financialData = result.financialData ?? {};

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json({
      symbol: price.symbol ?? normalizedTicker,
      shortName: price.shortName ?? '',
      longName: price.longName ?? '',
      sector: profile.sector ?? '',
      industry: profile.industry ?? '',
      marketCap: price.marketCap?.raw ?? 0,
      regularMarketPrice: price.regularMarketPrice?.raw ?? 0,
      regularMarketChangePercent: price.regularMarketChangePercent?.raw ? price.regularMarketChangePercent.raw * 100 : 0,
      fiftyTwoWeekLow: keyStats.fiftyTwoWeekLow?.raw ?? 0,
      fiftyTwoWeekHigh: keyStats.fiftyTwoWeekHigh?.raw ?? 0,
      trailingPE: keyStats.trailingPE?.raw ?? 0,
      forwardPE: keyStats.forwardPE?.raw ?? 0,
      pegRatio: keyStats.pegRatio?.raw ?? 0,
      priceToBook: keyStats.priceToBook?.raw ?? 0,
      profitMargins: financialData.profitMargins?.raw ?? 0,
      debtToEquity: financialData.debtToEquity?.raw ?? 0,
      returnOnEquity: financialData.returnOnEquity?.raw ?? 0,
      revenueGrowth: financialData.revenueGrowth?.raw ?? 0,
      totalRevenue: financialData.totalRevenue?.raw ?? 0,
      totalDebt: financialData.totalDebt?.raw ?? 0,
      totalCash: financialData.totalCash?.raw ?? 0,
      operatingCashflow: financialData.operatingCashflow?.raw ?? 0,
      freeCashflow: financialData.freeCashflow?.raw ?? 0,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile', details: String(error) });
  }
}
