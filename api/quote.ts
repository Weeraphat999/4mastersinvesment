import type { VercelRequest, VercelResponse } from '@vercel/node';
import YahooFinance from 'yahoo-finance2';
import { verifyAuth } from './_middleware/auth';

const yahooFinance = new YahooFinance();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await verifyAuth(req, res);
  if (!userId) return;

  const { ticker } = req.query;

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    const quote = await yahooFinance.quote(normalizedTicker);

    if (!quote || !quote.regularMarketPrice) {
      return res.status(404).json({ error: `No data found for ${normalizedTicker}` });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      symbol: quote.symbol ?? normalizedTicker,
      shortName: quote.shortName ?? '',
      longName: quote.longName ?? '',
      regularMarketPrice: quote.regularMarketPrice ?? 0,
      regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
      marketCap: quote.marketCap ?? 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? 0,
      regularMarketVolume: quote.regularMarketVolume ?? 0,
      sector: (quote as Record<string, unknown>).sector ?? '',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch quote', details: String(error) });
  }
}
