import type { VercelRequest, VercelResponse } from '@vercel/node';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing q parameter' });
  }

  try {
    const result = await yahooFinance.search(q.trim(), { quotesCount: 8, newsCount: 0 });

    const quotes = (result.quotes ?? []).map((item: Record<string, unknown>) => ({
      symbol: (item.symbol as string) ?? '',
      shortname: (item.shortname as string) ?? (item.longname as string) ?? '',
      exchange: (item.exchange as string) ?? '',
      quoteType: (item.quoteType as string) ?? '',
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(quotes);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to search', details: String(error) });
  }
}
