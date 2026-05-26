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
      `${YAHOO_BASE}/v8/finance/chart/${normalizedTicker}?interval=1d&range=1y`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: `Yahoo API returned ${response.status}` });
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: `No historical data for ${normalizedTicker}` });
    }

    const timestamps: number[] = result.timestamp ?? [];
    const adjClose: number[] =
      result.indicators?.adjclose?.[0]?.adjclose ??
      result.indicators?.quote?.[0]?.close ??
      [];

    const points: { date: string; close: number }[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const closeValue = adjClose[i];
      if (closeValue == null || isNaN(closeValue)) continue;

      const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
      points.push({ date, close: closeValue });
    }

    points.sort((a, b) => a.date.localeCompare(b.date));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json(points);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch historical data', details: String(error) });
  }
}
