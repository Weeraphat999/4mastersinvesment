/**
 * FMP (Financial Modeling Prep) Service — primary financial data provider.
 * 250 requests/day (vs Alpha Vantage's 25).
 * Base URL: https://financialmodelingprep.com/stable
 * Auth: append ?apikey=KEY to every request
 */

const FMP_BASE = 'https://financialmodelingprep.com/stable';

// --- Types ---

export interface FmpProfile {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  description: string;
  mktCap: number;
  price: number;
  beta: number;
  volAvg: number;
  lastDiv: number;
  range: string; // "52w low - 52w high"
  dcfDiff: number;
  dcf: number;
  ipoDate: string;
}

export interface FmpFinancials {
  incomeStatement: FmpIncomeStatement[];
  balanceSheet: FmpBalanceSheet[];
  cashFlow: FmpCashFlow[];
}

export interface FmpIncomeStatement {
  date: string;
  revenue: number;
  netIncome: number;
  grossProfit: number;
  operatingIncome: number;
  eps: number;
}

export interface FmpBalanceSheet {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
  totalDebt: number;
  cashAndCashEquivalents: number;
}

export interface FmpCashFlow {
  date: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
}

// --- Helpers ---

/**
 * Returns the FMP API key from environment variables, or null if not configured.
 */
function getApiKey(): string | null {
  const key = import.meta.env.VITE_FMP_API_KEY;
  if (!key || key === 'your_fmp_api_key_here') {
    return null;
  }
  return key as string;
}

/**
 * Checks if the FMP API key is configured.
 */
export function isFmpConfigured(): boolean {
  return getApiKey() !== null;
}

// --- Quote & Historical (FMP as primary source) ---

export interface FmpQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  marketCap: number;
  yearLow: number;
  yearHigh: number;
  volume: number;
}

export interface FmpHistoricalPoint {
  date: string;
  close: number;
}

/**
 * Fetches real-time quote from FMP.
 * Uses profile endpoint which is more reliable on free tier.
 */
export async function fetchFmpQuote(ticker: string): Promise<FmpQuote | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    // Use profile endpoint - more reliable on free tier
    const response = await fetch(
      `${FMP_BASE}/profile?symbol=${normalizedTicker}&apikey=${apiKey}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const raw = data[0];
    const price = raw.price ?? 0;
    const yearLow = raw.range ? parseFloat(raw.range.split('-')[0]) : 0;
    const yearHigh = raw.range ? parseFloat(raw.range.split('-')[1]) : 0;

    // Validate: if price is 0 or company name is empty, data is unreliable
    if (price <= 0) return null;

    return {
      symbol: raw.symbol ?? normalizedTicker,
      name: raw.companyName ?? '',
      price: price,
      changesPercentage: raw.changes ? (raw.changes / price) * 100 : 0,
      marketCap: raw.marketCap ?? raw.mktCap ?? 0,
      yearLow: yearLow,
      yearHigh: yearHigh,
      volume: raw.volAvg ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches historical daily prices from FMP (1 year).
 */
export async function fetchFmpHistorical(ticker: string): Promise<FmpHistoricalPoint[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    const response = await fetch(
      `${FMP_BASE}/historical-price-eod/full?symbol=${normalizedTicker}&apikey=${apiKey}`
    );
    if (!response.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(
        `https://financialmodelingprep.com/api/v3/historical-price-full/${normalizedTicker}?apikey=${apiKey}`
      );
      if (!altResponse.ok) return [];
      
      const altData = await altResponse.json();
      const altHistorical = altData?.historical ?? [];
      if (!Array.isArray(altHistorical) || altHistorical.length === 0) return [];

      return altHistorical
        .slice(0, 252)
        .map((item: Record<string, unknown>) => ({
          date: (item.date as string) ?? '',
          close: (item.close as number) ?? 0,
        }))
        .filter((p: FmpHistoricalPoint) => p.close > 0)
        .reverse();
    }

    const data = await response.json();
    
    // FMP returns { symbol, historical: [...] } or array directly
    const historical = Array.isArray(data) ? data : (data?.historical ?? []);
    if (!Array.isArray(historical) || historical.length === 0) return [];

    // Take last 252 trading days (~1 year), sort ascending
    const points: FmpHistoricalPoint[] = historical
      .slice(0, 252)
      .map((item: Record<string, unknown>) => ({
        date: (item.date as string) ?? '',
        close: (item.close as number) ?? 0,
      }))
      .filter((p: FmpHistoricalPoint) => p.close > 0)
      .reverse(); // FMP returns newest first, we want oldest first

    return points;
  } catch {
    return [];
  }
}

/**
 * Searches for tickers using FMP search endpoint.
 */
export async function searchFmpTickers(query: string): Promise<{ symbol: string; name: string; exchange: string }[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    // Try stable endpoint first
    let response = await fetch(
      `${FMP_BASE}/search?query=${encodeURIComponent(query)}&limit=8&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      // Try v3 endpoint as fallback
      response = await fetch(
        `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=8&apikey=${apiKey}`
      );
      if (!response.ok) return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: Record<string, unknown>) => ({
      symbol: (item.symbol as string) ?? '',
      name: (item.name as string) ?? '',
      exchange: (item.exchangeShortName as string) ?? (item.exchange as string) ?? '',
    }));
  } catch {
    return [];
  }
}

// --- Main exports ---

/**
 * Fetches company profile from FMP.
 * Returns null if API key is not configured or on error.
 */
export async function fetchFmpProfile(ticker: string): Promise<FmpProfile | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[FmpService] API key not configured. Skipping profile fetch.');
    return null;
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    const response = await fetch(
      `${FMP_BASE}/profile?symbol=${normalizedTicker}&apikey=${apiKey}`
    );

    if (!response.ok) {
      console.error(`[FmpService] Profile API returned HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();

    // FMP returns an array; take the first element
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[FmpService] No profile data returned for', normalizedTicker);
      return null;
    }

    const raw = data[0];

    return {
      symbol: raw.symbol ?? normalizedTicker,
      companyName: raw.companyName ?? '',
      sector: raw.sector ?? '',
      industry: raw.industry ?? '',
      description: raw.description ?? '',
      mktCap: raw.marketCap ?? raw.mktCap ?? 0,
      price: raw.price ?? 0,
      beta: raw.beta ?? 0,
      volAvg: raw.volAvg ?? 0,
      lastDiv: raw.lastDiv ?? 0,
      range: raw.range ?? '',
      dcfDiff: raw.dcfDiff ?? 0,
      dcf: raw.dcf ?? 0,
      ipoDate: raw.ipoDate ?? '',
    };
  } catch (error) {
    console.error('[FmpService] Error fetching profile:', error);
    return null;
  }
}

/**
 * FMP free tier does NOT support financial statements (income, balance, cash flow).
 * This function always returns null — financial data comes from Alpha Vantage instead.
 */
export async function fetchFmpFinancials(_ticker: string): Promise<FmpFinancials | null> {
  // FMP free tier only supports profile endpoint
  // Financial statements require premium subscription
  return null;
}

// --- Parsers ---

// @ts-ignore - parsers reserved for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _parseIncomeStatements(data: unknown): FmpIncomeStatement[] {
  if (!Array.isArray(data)) return [];

  return data.map((item: Record<string, unknown>) => ({
    date: (item.date as string) ?? '',
    revenue: (item.revenue as number) ?? 0,
    netIncome: (item.netIncome as number) ?? 0,
    grossProfit: (item.grossProfit as number) ?? 0,
    operatingIncome: (item.operatingIncome as number) ?? 0,
    eps: (item.eps as number) ?? 0,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _parseBalanceSheets(data: unknown): FmpBalanceSheet[] {
  if (!Array.isArray(data)) return [];

  return data.map((item: Record<string, unknown>) => ({
    date: (item.date as string) ?? '',
    totalAssets: (item.totalAssets as number) ?? 0,
    totalLiabilities: (item.totalLiabilities as number) ?? 0,
    totalStockholdersEquity: (item.totalStockholdersEquity as number) ?? 0,
    totalDebt: (item.totalDebt as number) ?? 0,
    cashAndCashEquivalents: (item.cashAndCashEquivalents as number) ?? 0,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _parseCashFlows(data: unknown): FmpCashFlow[] {
  if (!Array.isArray(data)) return [];

  return data.map((item: Record<string, unknown>) => ({
    date: (item.date as string) ?? '',
    operatingCashFlow: (item.operatingCashFlow as number) ?? 0,
    capitalExpenditure: (item.capitalExpenditure as number) ?? 0,
    freeCashFlow: (item.freeCashFlow as number) ?? 0,
  }));
}
