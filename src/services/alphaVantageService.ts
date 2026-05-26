const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

export interface AlphaVantageFinancials {
  incomeStatement: AnnualReport[];
  balanceSheet: AnnualReport[];
  cashFlow: AnnualReport[];
}

export interface AnnualReport {
  fiscalDateEnding: string;
  totalRevenue: string;
  netIncome: string;
  totalAssets: string;
  totalLiabilities: string;
  operatingCashflow: string;
  capitalExpenditures: string;
  [key: string]: string;
}

export interface AlphaVantageOverview {
  Symbol: string;
  Name: string;
  Sector: string;
  MarketCapitalization: string;
  PERatio: string;
  ProfitMargin: string;
  DebtToEquityRatio?: string;
  PEGRatio: string;
  PriceToSalesRatioTTM: string;
}

/**
 * Detects whether an Alpha Vantage response indicates a rate limit.
 * Alpha Vantage returns a JSON object with a "Note" or "Information" field
 * containing messages about rate limits or usage limits.
 */
export function isRateLimited(response: unknown): boolean {
  if (response === null || response === undefined || typeof response !== 'object') {
    return false;
  }

  const obj = response as Record<string, unknown>;

  const noteField = obj['Note'] ?? obj['Information'];
  if (typeof noteField === 'string') {
    const lower = noteField.toLowerCase();
    if (
      lower.includes('rate limit') ||
      lower.includes('thank you for using alpha vantage')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Returns the Alpha Vantage API key from environment variables, or null if not configured.
 */
function getApiKey(): string | null {
  const key = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
  if (!key || key === 'your_api_key_here') {
    return null;
  }
  return key as string;
}

/**
 * Fetches income statement, balance sheet, and cash flow for the most recent 4 annual periods.
 * Returns null if the API key is not configured or if a rate limit is detected.
 */
export async function fetchFinancials(ticker: string): Promise<AlphaVantageFinancials | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[AlphaVantageService] API key not configured. Skipping financial data fetch.');
    return null;
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    const [incomeRes, balanceRes, cashFlowRes] = await Promise.all([
      fetch(`${ALPHA_VANTAGE_BASE}?function=INCOME_STATEMENT&symbol=${normalizedTicker}&apikey=${apiKey}`),
      fetch(`${ALPHA_VANTAGE_BASE}?function=BALANCE_SHEET&symbol=${normalizedTicker}&apikey=${apiKey}`),
      fetch(`${ALPHA_VANTAGE_BASE}?function=CASH_FLOW&symbol=${normalizedTicker}&apikey=${apiKey}`),
    ]);

    const [incomeData, balanceData, cashFlowData] = await Promise.all([
      incomeRes.json(),
      balanceRes.json(),
      cashFlowRes.json(),
    ]);

    // Check for rate limiting on any response
    if (isRateLimited(incomeData) || isRateLimited(balanceData) || isRateLimited(cashFlowData)) {
      console.warn('[AlphaVantageService] Rate limit detected on financial data request.');
      return null;
    }

    const incomeReports = parseAnnualReports(incomeData?.annualReports);
    const balanceReports = parseAnnualReports(balanceData?.annualReports);
    const cashFlowReports = parseAnnualReports(cashFlowData?.annualReports);

    return {
      incomeStatement: incomeReports.slice(0, 4),
      balanceSheet: balanceReports.slice(0, 4),
      cashFlow: cashFlowReports.slice(0, 4),
    };
  } catch (error) {
    console.error('[AlphaVantageService] Error fetching financials:', error);
    return null;
  }
}

/**
 * Fetches company overview data from Alpha Vantage.
 * Returns null if the API key is not configured or if a rate limit is detected.
 */
export async function fetchOverview(ticker: string): Promise<AlphaVantageOverview | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[AlphaVantageService] API key not configured. Skipping overview fetch.');
    return null;
  }

  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE}?function=OVERVIEW&symbol=${normalizedTicker}&apikey=${apiKey}`
    );

    const data = await response.json();

    if (isRateLimited(data)) {
      console.warn('[AlphaVantageService] Rate limit detected on overview request.');
      return null;
    }

    // Alpha Vantage returns an empty object for invalid tickers
    if (!data || !data.Symbol) {
      return null;
    }

    return {
      Symbol: data.Symbol ?? '',
      Name: data.Name ?? '',
      Sector: data.Sector ?? '',
      MarketCapitalization: data.MarketCapitalization ?? '0',
      PERatio: data.PERatio ?? '0',
      ProfitMargin: data.ProfitMargin ?? '0',
      DebtToEquityRatio: data.DebtToEquityRatio ?? undefined,
      PEGRatio: data.PEGRatio ?? '0',
      PriceToSalesRatioTTM: data.PriceToSalesRatioTTM ?? '0',
    };
  } catch (error) {
    console.error('[AlphaVantageService] Error fetching overview:', error);
    return null;
  }
}

/**
 * Parses raw annual reports from Alpha Vantage response into typed AnnualReport objects.
 */
function parseAnnualReports(reports: unknown): AnnualReport[] {
  if (!Array.isArray(reports)) {
    return [];
  }

  return reports.map((report: Record<string, string>) => ({
    fiscalDateEnding: report.fiscalDateEnding ?? '',
    totalRevenue: report.totalRevenue ?? '0',
    netIncome: report.netIncome ?? '0',
    totalAssets: report.totalAssets ?? '0',
    totalLiabilities: report.totalLiabilities ?? '0',
    operatingCashflow: report.operatingCashflow ?? '0',
    capitalExpenditures: report.capitalExpenditures ?? '0',
    ...report,
  }));
}
