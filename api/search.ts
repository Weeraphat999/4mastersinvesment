import type { VercelRequest, VercelResponse } from '@vercel/node';

const YAHOO_BASE = 'https://query1.finance.yahoo.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing q parameter' });
  }

  try {
    const response = await fetch(
      `${YAHOO_BASE}/v1/finance/search?q=${encodeURIComponent(q.trim())}&quotesCount=8&newsCount=0`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: `Yahoo API returned ${response.status}` });
    }

    const data = await response.json();
    const quotes = data?.quotes ?? [];

    const results = quotes.map((item: Record<string, unknown>) => ({
      symbol: (item.symbol as string) ?? '',
      shortname: (item.shortname as string) ?? (item.shortName as string) ?? '',
      exchange: (item.exchange as string) ?? '',
      quoteType: (item.quoteType as string) ?? '',
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to search', details: String(error) });
  }
}
