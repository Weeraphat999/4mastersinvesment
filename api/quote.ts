import type { VercelRequest, VercelResponse } from '@vercel/node';

const YAHOO_BASE = 'https://query1.finance.yahoo.com';
const YAHOO_BASE2 = 'https://query2.finance.yahoo.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { ticker } = req.query;

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    // Try v6 quote endpoint first (gives market cap, sector, etc.)
    let marketCap = 0;
    let sector = '';
    let shortName = '';
    let longName = '';
    let regularMarketPrice = 0;
    let regularMarketChangePercent = 0;
    let fiftyTwoWeekLow = 0;
    let fiftyTwoWeekHigh = 0;
    let regularMarketVolume = 0;

    // Attempt v6/finance/quote for comprehensive data
    try {
      const quoteResponse = await fetch(
        `${YAHOO_BASE2}/v6/finance/quote?symbols=${normalizedTicker}`
      );
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        const q = quoteData?.quoteResponse?.result?.[0];
        if (q) {
          shortName = q.shortName ?? '';
          longName = q.longName ?? '';
          regularMarketPrice = q.regularMarketPrice ?? 0;
          regularMarketChangePercent = q.regularMarketChangePercent ?? 0;
          marketCap = q.marketCap ?? 0;
          fiftyTwoWeekLow = q.fiftyTwoWeekLow ?? 0;
          fiftyTwoWeekHigh = q.fiftyTwoWeekHigh ?? 0;
          regularMarketVolume = q.regularMarketVolume ?? 0;
          sector = q.sector ?? '';
        }
      }
    } catch {
      // v6 failed, will try v8 chart below
    }

    // If v6 didn't give us price, fall back to v8 chart
    if (regularMarketPrice === 0) {
      const chartResponse = await fetch(
        `${YAHOO_BASE}/v8/finance/chart/${normalizedTicker}?interval=1d&range=1d`
      );

      if (!chartResponse.ok) {
        return res.status(chartResponse.status).json({ error: `Yahoo API returned ${chartResponse.status}` });
      }

      const chartData = await chartResponse.json();
      const result = chartData?.chart?.result?.[0];

      if (!result) {
        return res.status(404).json({ error: `No data found for ${normalizedTicker}` });
      }

      const meta = result.meta;
      shortName = shortName || meta.shortName ?? meta.symbol ?? normalizedTicker;
      longName = longName || meta.longName ?? '';
      regularMarketPrice = meta.regularMarketPrice ?? 0;
      regularMarketChangePercent = meta.previousClose
        ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
        : 0;
      marketCap = marketCap || meta.marketCap ?? 0;
      fiftyTwoWeekLow = fiftyTwoWeekLow || meta.fiftyTwoWeekLow ?? 0;
      fiftyTwoWeekHigh = fiftyTwoWeekHigh || meta.fiftyTwoWeekHigh ?? 0;
      regularMarketVolume = regularMarketVolume || meta.regularMarketVolume ?? 0;
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      symbol: normalizedTicker,
      shortName,
      longName,
      regularMarketPrice,
      regularMarketChangePercent,
      marketCap,
      fiftyTwoWeekLow,
      fiftyTwoWeekHigh,
      regularMarketVolume,
      sector,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch quote', details: String(error) });
  }
}
