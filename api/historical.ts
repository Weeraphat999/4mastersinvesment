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
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const result = await yahooFinance.chart(normalizedTicker, {
      period1: oneYearAgo.toISOString().split('T')[0],
      period2: now.toISOString().split('T')[0],
      interval: '1d',
    });

    if (!result || !result.quotes || result.quotes.length === 0) {
      return res.status(404).json({ error: `No historical data for ${normalizedTicker}` });
    }

    const points = result.quotes
      .filter((q: Record<string, unknown>) => q.close != null && !isNaN(q.close as number))
      .map((q: Record<string, unknown>) => ({
        date: new Date(q.date as string).toISOString().split('T')[0],
        close: Math.round((q.close as number) * 100) / 100,
      }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json(points);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch historical data', details: String(error) });
  }
}
