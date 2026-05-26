import type { VercelRequest, VercelResponse } from '@vercel/node';

const YAHOO_BASE = 'https://query1.finance.yahoo.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { ticker } = req.query;

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    const response = await fetch(
      `${YAHOO_BASE}/v8/finance/chart/${normalizedTicker}?interval=1d&range=1d`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: `Yahoo API returned ${response.status}` });
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: `No data found for ${normalizedTicker}` });
    }

    const meta = result.meta;

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      symbol: meta.symbol ?? normalizedTicker,
      shortName: meta.shortName ?? meta.symbol ?? normalizedTicker,
      longName: meta.longName ?? '',
      regularMarketPrice: meta.regularMarketPrice ?? 0,
      regularMarketChangePercent: meta.previousClose
        ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
        : 0,
      marketCap: meta.marketCap ?? 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? 0,
      regularMarketVolume: meta.regularMarketVolume ?? 0,
      sector: meta.sector ?? '',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch quote', details: String(error) });
  }
}
