/**
 * Yahoo Finance API client.
 * Fetches stock quotes, historical prices, and ticker search results
 * via the corsproxy.io CORS proxy. No API key required.
 */

// --- Constants ---

export const CORS_PROXY_BASE = 'https://corsproxy.io/?';
export const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com';
export const REQUEST_TIMEOUT_MS = 10000;

// --- Interfaces ---

export interface YahooQuoteResponse {
  symbol: string;
  shortName: string;
  longName?: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  marketCap: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  regularMarketVolume: number;
  sector?: string;
}

export interface YahooHistoricalPoint {
  date: string; // ISO date
  close: number; // adjusted close
}

export interface YahooSearchResult {
  symbol: string;
  shortname: string;
  exchange: string;
  quoteType: string;
}

// --- Helper ---

/**
 * Builds a proxy URL for a given Yahoo Finance API path.
 * Pattern: CORS_PROXY_BASE + encodeURIComponent(YAHOO_BASE_URL + path)
 */
export function buildProxyUrl(path: string): string {
  return CORS_PROXY_BASE + encodeURIComponent(YAHOO_BASE_URL + path);
}

/**
 * Normalizes a ticker symbol to uppercase trimmed form.
 */
export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

// --- Internal fetch helper ---

/**
 * Performs a fetch with an AbortController timeout.
 * Throws on non-OK responses or timeout.
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// --- Public API ---

/**
 * Fetches the current stock quote for a ticker.
 * Uses Yahoo Finance v8 chart endpoint: /v8/finance/chart/{ticker}?interval=1d&range=1d
 */
export async function fetchQuote(ticker: string): Promise<YahooQuoteResponse> {
  const normalizedTicker = normalizeTicker(ticker);
  const path = `/v8/finance/chart/${normalizedTicker}?interval=1d&range=1d`;
  const url = buildProxyUrl(path);

  const response = await fetchWithTimeout(url);
  const data = await response.json();

  // Parse the v8 chart response into our YahooQuoteResponse shape
  const result = data?.chart?.result?.[0];
  if (!result) {
    throw new Error(`No quote data found for ticker: ${normalizedTicker}`);
  }

  const meta = result.meta;
  const quote: YahooQuoteResponse = {
    symbol: meta.symbol ?? normalizedTicker,
    shortName: meta.shortName ?? meta.symbol ?? normalizedTicker,
    longName: meta.longName,
    regularMarketPrice: meta.regularMarketPrice ?? 0,
    regularMarketChangePercent: meta.regularMarketDayHigh && meta.previousClose
      ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
      : 0,
    marketCap: meta.marketCap ?? 0,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? 0,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? 0,
    regularMarketVolume: meta.regularMarketVolume ?? 0,
    sector: meta.sector,
  };

  return quote;
}

/**
 * Fetches 12 months of historical daily prices for a ticker.
 * Uses Yahoo Finance v8 chart endpoint: /v8/finance/chart/{ticker}?interval=1d&range=1y
 * Returns YahooHistoricalPoint[] sorted ascending by date.
 */
export async function fetchHistorical(ticker: string): Promise<YahooHistoricalPoint[]> {
  const normalizedTicker = normalizeTicker(ticker);
  const path = `/v8/finance/chart/${normalizedTicker}?interval=1d&range=1y`;
  const url = buildProxyUrl(path);

  const response = await fetchWithTimeout(url);
  const data = await response.json();

  const result = data?.chart?.result?.[0];
  if (!result) {
    throw new Error(`No historical data found for ticker: ${normalizedTicker}`);
  }

  const timestamps: number[] = result.timestamp ?? [];
  const adjClose: number[] =
    result.indicators?.adjclose?.[0]?.adjclose ??
    result.indicators?.quote?.[0]?.close ??
    [];

  const points: YahooHistoricalPoint[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const closeValue = adjClose[i];
    if (closeValue == null || isNaN(closeValue)) {
      continue; // skip null/NaN entries
    }

    const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
    points.push({ date, close: closeValue });
  }

  // Sort ascending by date (oldest first)
  points.sort((a, b) => a.date.localeCompare(b.date));

  return points;
}

/**
 * Searches Yahoo Finance for matching tickers.
 * Uses: /v1/finance/search?q={query}&quotesCount=8&newsCount=0
 * Returns YahooSearchResult[].
 */
export async function searchTickers(query: string): Promise<YahooSearchResult[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const path = `/v1/finance/search?q=${encodeURIComponent(trimmedQuery)}&quotesCount=8&newsCount=0`;
  const url = buildProxyUrl(path);

  const response = await fetchWithTimeout(url);
  const data = await response.json();

  const quotes = data?.quotes ?? [];

  const results: YahooSearchResult[] = quotes.map((item: Record<string, unknown>) => ({
    symbol: (item.symbol as string) ?? '',
    shortname: (item.shortname as string) ?? (item.shortName as string) ?? '',
    exchange: (item.exchange as string) ?? '',
    quoteType: (item.quoteType as string) ?? '',
  }));

  return results;
}
