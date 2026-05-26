/**
 * DataMapper — transforms raw API responses into existing AnalysisResult and DetailedAnalysis types.
 * Computes meaningful scores from real API data (financials, overview, quote, indicators).
 * Falls back to getAnalysis()/getDetailedAnalysis() only when real data is unavailable.
 */

import {
  AnalysisResult,
  DetailedAnalysis,
  LynchAnalysis,
  TechnicalAnalysis,
  TechnicalSignal,
  FinancialMetric,
} from '../data/types';
import { getAnalysis } from '../data/getAnalysis';
import { getDetailedAnalysis } from '../data/getDetailedAnalysis';
import type { YahooQuoteResponse, YahooHistoricalPoint } from './yahooFinanceService';
import type { AlphaVantageFinancials, AlphaVantageOverview } from './alphaVantageService';
import type { FmpProfile, FmpFinancials } from './fmpService';
import type { IndicatorResults } from './technicalIndicatorEngine';
import type { GeminiAnalysisResult } from './geminiService';

// --- Exported interface ---

export interface RawApiData {
  quote: YahooQuoteResponse | null;
  historical: YahooHistoricalPoint[] | null;
  financials: AlphaVantageFinancials | null;
  overview: AlphaVantageOverview | null;
  indicators: IndicatorResults | null;
}

// --- FMP → Alpha Vantage format mapping ---

/**
 * Maps FMP data to the Alpha Vantage format used by the existing mapper.
 * This allows FMP data to flow through the same scoring/mapping pipeline
 * without rewriting the entire mapper.
 */
export function mapFmpToRawApiData(
  profile: FmpProfile | null,
  financials: FmpFinancials | null
): { overview: AlphaVantageOverview | null; financials: AlphaVantageFinancials | null } {
  let overview: AlphaVantageOverview | null = null;
  let mappedFinancials: AlphaVantageFinancials | null = null;

  // Map FmpProfile → AlphaVantageOverview
  if (profile) {
    // Calculate P/E from price and EPS (from most recent income statement if available)
    let peRatio = '0';
    if (financials && financials.incomeStatement.length > 0) {
      const eps = financials.incomeStatement[0].eps;
      if (eps > 0 && profile.price > 0) {
        peRatio = (profile.price / eps).toFixed(2);
      }
    }

    // Calculate profit margin from most recent income statement
    let profitMargin = '0';
    if (financials && financials.incomeStatement.length > 0) {
      const { netIncome, revenue } = financials.incomeStatement[0];
      if (revenue > 0) {
        profitMargin = (netIncome / revenue).toFixed(4);
      }
    }

    // Calculate debt/equity from most recent balance sheet
    let debtToEquity: string | undefined;
    if (financials && financials.balanceSheet.length > 0) {
      const { totalLiabilities, totalStockholdersEquity } = financials.balanceSheet[0];
      if (totalStockholdersEquity > 0) {
        debtToEquity = (totalLiabilities / totalStockholdersEquity).toFixed(2);
      }
    }

    // Calculate PEG ratio (P/E divided by earnings growth rate)
    let pegRatio = '0';
    if (financials && financials.incomeStatement.length >= 2) {
      const currentEps = financials.incomeStatement[0].eps;
      const previousEps = financials.incomeStatement[1].eps;
      if (previousEps > 0 && currentEps > 0) {
        const epsGrowth = ((currentEps - previousEps) / previousEps) * 100;
        const pe = parseFloat(peRatio);
        if (epsGrowth > 0 && pe > 0) {
          pegRatio = (pe / epsGrowth).toFixed(2);
        }
      }
    }

    // Calculate Price/Sales ratio
    let priceSales = '0';
    if (financials && financials.incomeStatement.length > 0 && profile.mktCap > 0) {
      const revenue = financials.incomeStatement[0].revenue;
      if (revenue > 0) {
        priceSales = (profile.mktCap / revenue).toFixed(2);
      }
    }

    overview = {
      Symbol: profile.symbol,
      Name: profile.companyName,
      Sector: profile.sector,
      MarketCapitalization: profile.mktCap.toString(),
      PERatio: peRatio,
      ProfitMargin: profitMargin,
      DebtToEquityRatio: debtToEquity,
      PEGRatio: pegRatio,
      PriceToSalesRatioTTM: priceSales,
    };
  }

  // Map FmpFinancials → AlphaVantageFinancials
  if (financials) {
    const incomeStatement = financials.incomeStatement.map((item) => ({
      fiscalDateEnding: item.date,
      totalRevenue: item.revenue.toString(),
      netIncome: item.netIncome.toString(),
      totalAssets: '0', // Not in income statement
      totalLiabilities: '0', // Not in income statement
      operatingCashflow: '0', // Not in income statement
      capitalExpenditures: '0', // Not in income statement
      grossProfit: item.grossProfit.toString(),
      operatingIncome: item.operatingIncome.toString(),
      eps: item.eps.toString(),
    }));

    const balanceSheet = financials.balanceSheet.map((item) => ({
      fiscalDateEnding: item.date,
      totalRevenue: '0',
      netIncome: '0',
      totalAssets: item.totalAssets.toString(),
      totalLiabilities: item.totalLiabilities.toString(),
      operatingCashflow: '0',
      capitalExpenditures: '0',
      totalStockholdersEquity: item.totalStockholdersEquity.toString(),
      totalDebt: item.totalDebt.toString(),
      cashAndCashEquivalents: item.cashAndCashEquivalents.toString(),
    }));

    const cashFlow = financials.cashFlow.map((item) => ({
      fiscalDateEnding: item.date,
      totalRevenue: '0',
      netIncome: '0',
      totalAssets: '0',
      totalLiabilities: '0',
      operatingCashflow: item.operatingCashFlow.toString(),
      capitalExpenditures: item.capitalExpenditure.toString(),
      freeCashFlow: item.freeCashFlow.toString(),
    }));

    mappedFinancials = { incomeStatement, balanceSheet, cashFlow };
  }

  return { overview, financials: mappedFinancials };
}

// --- Helper functions ---

/**
 * Formats a number as a market cap string (e.g., "$150.2B" or "$800M").
 */
function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return `$${value.toLocaleString()}`;
}

/**
 * Formats a market cap string from Alpha Vantage (which provides it as a string number).
 */
function formatAlphaMarketCap(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num) || num === 0) return '';
  return formatMarketCap(num);
}


// --- Scoring computation helpers ---

/**
 * Extracts ROE from financials data.
 * ROE = Net Income / Shareholders' Equity
 */
function computeROE(financials: AlphaVantageFinancials): number | null {
  const income = financials.incomeStatement;
  const balance = financials.balanceSheet;
  if (income.length < 1 || balance.length < 1) return null;

  const netIncome = parseFloat(income[0].netIncome) || 0;
  const totalAssets = parseFloat(balance[0].totalAssets) || 0;
  const totalLiabilities = parseFloat(balance[0].totalLiabilities) || 0;
  const equity = totalAssets - totalLiabilities;
  if (equity <= 0) return 0;
  return (netIncome / equity) * 100;
}

/**
 * Extracts profit margin from overview or financials.
 */
function computeProfitMargin(overview: AlphaVantageOverview | null, financials: AlphaVantageFinancials | null): number | null {
  // Prefer overview (already a ratio like 0.25 for 25%)
  if (overview) {
    const margin = parseFloat(overview.ProfitMargin);
    if (!isNaN(margin)) return margin * 100;
  }
  // Fallback to computing from financials
  if (financials && financials.incomeStatement.length >= 1) {
    const netIncome = parseFloat(financials.incomeStatement[0].netIncome) || 0;
    const revenue = parseFloat(financials.incomeStatement[0].totalRevenue) || 0;
    if (revenue > 0) return (netIncome / revenue) * 100;
  }
  return null;
}

/**
 * Extracts Debt/Equity ratio from overview or financials.
 */
function computeDebtEquity(overview: AlphaVantageOverview | null, financials: AlphaVantageFinancials | null): number | null {
  // Prefer overview
  if (overview && overview.DebtToEquityRatio) {
    const de = parseFloat(overview.DebtToEquityRatio);
    if (!isNaN(de)) return de;
  }
  // Fallback to computing from balance sheet
  if (financials && financials.balanceSheet.length >= 1) {
    const totalAssets = parseFloat(financials.balanceSheet[0].totalAssets) || 0;
    const totalLiabilities = parseFloat(financials.balanceSheet[0].totalLiabilities) || 0;
    const equity = totalAssets - totalLiabilities;
    if (equity > 0) return totalLiabilities / equity;
  }
  return null;
}

/**
 * Computes revenue growth from financials (YoY).
 */
function computeRevenueGrowth(financials: AlphaVantageFinancials): number | null {
  const income = financials.incomeStatement;
  if (income.length < 2) return null;
  const currentRevenue = parseFloat(income[0].totalRevenue) || 0;
  const previousRevenue = parseFloat(income[1].totalRevenue) || 0;
  if (previousRevenue <= 0) return null;
  return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
}

/**
 * Computes net income growth from financials (YoY).
 */
function computeNetIncomeGrowth(financials: AlphaVantageFinancials): number | null {
  const income = financials.incomeStatement;
  if (income.length < 2) return null;
  const currentIncome = parseFloat(income[0].netIncome) || 0;
  const previousIncome = parseFloat(income[1].netIncome) || 0;
  if (previousIncome <= 0) return null;
  return ((currentIncome - previousIncome) / previousIncome) * 100;
}

/**
 * Computes free cash flow status from financials.
 * Returns: 2 = positive & growing, 1.5 = positive, 0 = negative
 */
function computeFCFScore(financials: AlphaVantageFinancials): number {
  const cashFlow = financials.cashFlow;
  if (cashFlow.length < 1) return 0;

  const opCashFlow = parseFloat(cashFlow[0].operatingCashflow) || 0;
  const capEx = parseFloat(cashFlow[0].capitalExpenditures) || 0;
  const fcfCurrent = opCashFlow - Math.abs(capEx);

  if (fcfCurrent <= 0) return 0;

  // Check if growing (compare to previous year)
  if (cashFlow.length >= 2) {
    const prevOpCashFlow = parseFloat(cashFlow[1].operatingCashflow) || 0;
    const prevCapEx = parseFloat(cashFlow[1].capitalExpenditures) || 0;
    const fcfPrevious = prevOpCashFlow - Math.abs(prevCapEx);
    if (fcfCurrent > fcfPrevious) return 2;
  }

  return 1.5;
}

/**
 * Checks profit margin stability across years.
 * Returns: 2 = stable/growing, 0 = declining
 */
function computeMarginStability(financials: AlphaVantageFinancials): number {
  const income = financials.incomeStatement;
  if (income.length < 2) return 1; // Not enough data, give partial credit

  const margins: number[] = [];
  for (let i = 0; i < Math.min(income.length, 3); i++) {
    const netIncome = parseFloat(income[i].netIncome) || 0;
    const revenue = parseFloat(income[i].totalRevenue) || 0;
    if (revenue > 0) {
      margins.push((netIncome / revenue) * 100);
    }
  }

  if (margins.length < 2) return 1;

  // Check if most recent margin >= previous (stable/growing)
  if (margins[0] >= margins[1] * 0.9) return 2; // Allow 10% tolerance
  return 0;
}

/**
 * Checks revenue consistency across years.
 * Returns: 3 = consistent growth, 1 = volatile
 */
function computeRevenueConsistency(financials: AlphaVantageFinancials): number {
  const income = financials.incomeStatement;
  if (income.length < 3) return 1.5; // Not enough data

  const revenues: number[] = [];
  for (let i = 0; i < Math.min(income.length, 4); i++) {
    revenues.push(parseFloat(income[i].totalRevenue) || 0);
  }

  // Check if each year is greater than the next (consistent growth)
  // revenues[0] is most recent
  let consistentGrowth = true;
  for (let i = 0; i < revenues.length - 1; i++) {
    if (revenues[i] < revenues[i + 1]) {
      consistentGrowth = false;
      break;
    }
  }

  return consistentGrowth ? 3 : 1;
}


// --- Master Score Computation ---

interface ComputedScores {
  buffett: number;
  munger: number;
  lynch: number;
  rothschild: number;
  overall: number;
}

/**
 * Computes Buffett Score (0-10) - Value & Quality
 * - ROE: >20% = 2, 15-20% = 1.5, 10-15% = 1, <10% = 0
 * - Profit Margin: >20% = 2, 10-20% = 1.5, 5-10% = 1, <5% = 0
 * - Debt/Equity: <0.5 = 2, 0.5-1.0 = 1.5, 1.0-2.0 = 1, >2.0 = 0
 * - Revenue Growth: >15% = 2, 5-15% = 1.5, 0-5% = 1, negative = 0
 * - Free Cash Flow: positive & growing = 2, positive = 1.5, negative = 0
 */
function computeBuffettScore(
  financials: AlphaVantageFinancials | null,
  overview: AlphaVantageOverview | null
): number | null {
  if (!financials && !overview) return null;

  let total = 0;
  let components = 0;

  // ROE
  if (financials) {
    const roe = computeROE(financials);
    if (roe !== null) {
      components++;
      if (roe > 20) total += 2;
      else if (roe >= 15) total += 1.5;
      else if (roe >= 10) total += 1;
    }
  }

  // Profit Margin
  const profitMargin = computeProfitMargin(overview, financials);
  if (profitMargin !== null) {
    components++;
    if (profitMargin > 20) total += 2;
    else if (profitMargin >= 10) total += 1.5;
    else if (profitMargin >= 5) total += 1;
  }

  // Debt/Equity
  const debtEquity = computeDebtEquity(overview, financials);
  if (debtEquity !== null) {
    components++;
    if (debtEquity < 0.5) total += 2;
    else if (debtEquity <= 1.0) total += 1.5;
    else if (debtEquity <= 2.0) total += 1;
  }

  // Revenue Growth
  if (financials) {
    const revenueGrowth = computeRevenueGrowth(financials);
    if (revenueGrowth !== null) {
      components++;
      if (revenueGrowth > 15) total += 2;
      else if (revenueGrowth >= 5) total += 1.5;
      else if (revenueGrowth >= 0) total += 1;
    }
  }

  // Free Cash Flow
  if (financials) {
    const fcfScore = computeFCFScore(financials);
    components++;
    total += fcfScore;
  }

  if (components === 0) return null;

  // Scale to 0-10: max possible per component is 2, so max total = components * 2
  const maxPossible = components * 2;
  return Math.round((total / maxPossible) * 10 * 10) / 10;
}

/**
 * Computes Munger Score (0-10) - Risk & Quality
 * - Profit Margin stability: stable/growing = 2, declining = 0
 * - Debt level: low (<0.5) = 2, moderate (0.5-1.5) = 1, high (>1.5) = 0
 * - Business predictability (revenue consistency): consistent = 3, volatile = 1
 * - Valuation (P/E): <15 = 3, 15-25 = 2, 25-40 = 1, >40 = 0
 */
function computeMungerScore(
  financials: AlphaVantageFinancials | null,
  overview: AlphaVantageOverview | null
): number | null {
  if (!financials && !overview) return null;

  let total = 0;
  let maxPossible = 0;

  // Profit Margin stability
  if (financials) {
    maxPossible += 2;
    total += computeMarginStability(financials);
  }

  // Debt level
  const debtEquity = computeDebtEquity(overview, financials);
  if (debtEquity !== null) {
    maxPossible += 2;
    if (debtEquity < 0.5) total += 2;
    else if (debtEquity <= 1.5) total += 1;
  }

  // Business predictability (revenue consistency)
  if (financials) {
    maxPossible += 3;
    total += computeRevenueConsistency(financials);
  }

  // Valuation (P/E)
  if (overview) {
    const pe = parseFloat(overview.PERatio);
    if (!isNaN(pe) && pe > 0) {
      maxPossible += 3;
      if (pe < 15) total += 3;
      else if (pe <= 25) total += 2;
      else if (pe <= 40) total += 1;
    }
  }

  if (maxPossible === 0) return null;
  return Math.round((total / maxPossible) * 10 * 10) / 10;
}

/**
 * Computes Lynch Score (0-10) - Growth at Reasonable Price
 * - PEG ratio: <1 = 4, 1-1.5 = 3, 1.5-2 = 2, >2 = 0
 * - Revenue Growth: >25% = 3, 15-25% = 2, 5-15% = 1, <5% = 0
 * - Earnings Growth (net income): >20% = 3, 10-20% = 2, <10% = 1
 */
function computeLynchScore(
  financials: AlphaVantageFinancials | null,
  overview: AlphaVantageOverview | null
): number | null {
  if (!financials && !overview) return null;

  let total = 0;
  let maxPossible = 0;

  // PEG ratio
  if (overview) {
    const peg = parseFloat(overview.PEGRatio);
    if (!isNaN(peg) && peg > 0) {
      maxPossible += 4;
      if (peg < 1) total += 4;
      else if (peg <= 1.5) total += 3;
      else if (peg <= 2) total += 2;
    }
  }

  // Revenue Growth
  if (financials) {
    const revenueGrowth = computeRevenueGrowth(financials);
    if (revenueGrowth !== null) {
      maxPossible += 3;
      if (revenueGrowth > 25) total += 3;
      else if (revenueGrowth >= 15) total += 2;
      else if (revenueGrowth >= 5) total += 1;
    }
  }

  // Earnings Growth (net income growth)
  if (financials) {
    const earningsGrowth = computeNetIncomeGrowth(financials);
    if (earningsGrowth !== null) {
      maxPossible += 3;
      if (earningsGrowth > 20) total += 3;
      else if (earningsGrowth >= 10) total += 2;
      else if (earningsGrowth > 0) total += 1;
    }
  }

  if (maxPossible === 0) return null;
  return Math.round((total / maxPossible) * 10 * 10) / 10;
}

/**
 * Computes Rothschild Score (0-10) - Contrarian/Timing
 * - 52-week position: near 52w low = 3 (contrarian buy), near high = 0
 * - Price momentum: bearish = 3 (blood in streets), bullish = 1
 * - RSI: <30 = 2 (oversold), 30-50 = 1, >70 = 0
 * - Sector drawdown (price vs 52w high): >30% down = 2, 15-30% = 1, <15% = 0
 */
function computeRothschildScore(
  quote: YahooQuoteResponse | null,
  indicators: IndicatorResults | null
): number | null {
  if (!quote && !indicators) return null;

  let total = 0;
  let maxPossible = 0;

  // 52-week position
  if (quote && quote.fiftyTwoWeekLow > 0 && quote.fiftyTwoWeekHigh > 0) {
    maxPossible += 3;
    const range = quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow;
    if (range > 0) {
      const position = (quote.regularMarketPrice - quote.fiftyTwoWeekLow) / range;
      // position 0 = at 52w low, 1 = at 52w high
      if (position < 0.25) total += 3;
      else if (position < 0.5) total += 2;
      else if (position < 0.75) total += 1;
      // near high = 0
    }
  }

  // Price momentum (from indicators - EMA crossover)
  if (indicators && indicators.ema12.length > 0 && indicators.ema26.length > 0) {
    maxPossible += 3;
    const latestEma12 = indicators.ema12[indicators.ema12.length - 1];
    const latestEma26 = indicators.ema26[indicators.ema26.length - 1];
    const isBullish = latestEma12 > latestEma26;
    // Contrarian: bearish = blood in streets = opportunity
    if (!isBullish) total += 3;
    else total += 1;
  }

  // RSI
  if (indicators && indicators.rsi14.length > 0) {
    maxPossible += 2;
    const latestRsi = indicators.rsi14[indicators.rsi14.length - 1];
    if (latestRsi < 30) total += 2;
    else if (latestRsi <= 50) total += 1;
    // >70 = 0 (overbought, not contrarian)
  }

  // Sector drawdown (price vs 52w high)
  if (quote && quote.fiftyTwoWeekHigh > 0) {
    maxPossible += 2;
    const drawdown = ((quote.fiftyTwoWeekHigh - quote.regularMarketPrice) / quote.fiftyTwoWeekHigh) * 100;
    if (drawdown > 30) total += 2;
    else if (drawdown >= 15) total += 1;
  }

  if (maxPossible === 0) return null;
  return Math.round((total / maxPossible) * 10 * 10) / 10;
}

/**
 * Computes all four master scores and overall score from real data.
 * Returns null if no meaningful data is available.
 */
function computeAllScores(raw: RawApiData): ComputedScores | null {
  const buffett = computeBuffettScore(raw.financials, raw.overview);
  const munger = computeMungerScore(raw.financials, raw.overview);
  const lynch = computeLynchScore(raw.financials, raw.overview);
  const rothschild = computeRothschildScore(raw.quote, raw.indicators);

  // Need at least one score to be meaningful
  if (buffett === null && munger === null && lynch === null && rothschild === null) {
    return null;
  }

  // Use computed scores, fallback individual nulls to 5 (neutral)
  const b = buffett ?? 5;
  const m = munger ?? 5;
  const l = lynch ?? 5;
  const r = rothschild ?? 5;

  const overall = Math.round(((b + m + l + r) / 4) * 10) / 10;

  return { buffett: b, munger: m, lynch: l, rothschild: r, overall };
}


// --- Verdict and derived field computation ---

/**
 * Derives verdict from overall score.
 */
function computeVerdict(overall: number): string {
  if (overall >= 7) return 'STRONG BUY';
  if (overall >= 5.5) return 'BUY';
  if (overall >= 4) return 'HOLD';
  if (overall >= 2.5) return 'WATCH';
  return 'AVOID';
}

/**
 * Derives moat assessment from profit margin and market cap.
 * Large cap + high margin = "Strong", mid + moderate = "Moderate", else "Weak"
 */
function computeMoat(
  overview: AlphaVantageOverview | null,
  financials: AlphaVantageFinancials | null,
  quote: YahooQuoteResponse | null
): string {
  const profitMargin = computeProfitMargin(overview, financials);
  let marketCapNum = 0;

  if (quote && quote.marketCap > 0) {
    marketCapNum = quote.marketCap;
  } else if (overview) {
    marketCapNum = parseFloat(overview.MarketCapitalization) || 0;
  }

  const isLargeCap = marketCapNum >= 50_000_000_000; // $50B+
  const isMidCap = marketCapNum >= 10_000_000_000; // $10B+
  const highMargin = profitMargin !== null && profitMargin > 20;
  const moderateMargin = profitMargin !== null && profitMargin > 10;

  if (isLargeCap && highMargin) return 'Strong';
  if ((isLargeCap && moderateMargin) || (isMidCap && highMargin)) return 'Moderate';
  if (isMidCap && moderateMargin) return 'Moderate';
  return 'Weak';
}

/**
 * Derives risk level from debt/equity and price volatility.
 */
function computeRiskLevel(
  overview: AlphaVantageOverview | null,
  financials: AlphaVantageFinancials | null,
  quote: YahooQuoteResponse | null
): string {
  const debtEquity = computeDebtEquity(overview, financials);
  let highVolatility = false;

  // Check volatility from 52-week range
  if (quote && quote.fiftyTwoWeekHigh > 0 && quote.fiftyTwoWeekLow > 0) {
    const range = (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow) / quote.fiftyTwoWeekLow;
    highVolatility = range > 0.6; // 60%+ range = high volatility
  }

  if ((debtEquity !== null && debtEquity > 2.0) || highVolatility) return 'HIGH';
  if ((debtEquity !== null && debtEquity > 1.0) || (debtEquity === null && highVolatility)) return 'MEDIUM';
  return 'LOW';
}

/**
 * Derives position size recommendation from risk level.
 */
function computePositionSize(riskLevel: string): string {
  if (riskLevel === 'HIGH') return '1-3% speculative';
  if (riskLevel === 'MEDIUM') return '3-5%';
  return '5-10% core';
}

/**
 * Derives entry strategy from technical signals.
 */
function computeEntryStrategy(indicators: IndicatorResults | null): string {
  if (!indicators) return 'DCA over 3-6 months';

  // Determine overall signal direction
  let bullishSignals = 0;
  let bearishSignals = 0;

  if (indicators.ema12.length > 0 && indicators.ema26.length > 0) {
    const latestEma12 = indicators.ema12[indicators.ema12.length - 1];
    const latestEma26 = indicators.ema26[indicators.ema26.length - 1];
    if (latestEma12 > latestEma26) bullishSignals++;
    else bearishSignals++;
  }

  if (indicators.macd.histogram.length > 0) {
    const latestHist = indicators.macd.histogram[indicators.macd.histogram.length - 1];
    if (latestHist > 0) bullishSignals++;
    else bearishSignals++;
  }

  if (indicators.rsi14.length > 0) {
    const latestRsi = indicators.rsi14[indicators.rsi14.length - 1];
    if (latestRsi < 40) bullishSignals++; // Oversold = bullish entry
    else if (latestRsi > 60) bearishSignals++;
  }

  if (bullishSignals > bearishSignals) return 'Buy now at market';
  if (bearishSignals > bullishSignals) return 'Wait for pullback to support';
  return 'DCA over 3-6 months';
}

/**
 * Derives time horizon from growth rate.
 */
function computeTimeHorizon(financials: AlphaVantageFinancials | null): string {
  if (!financials) return '5-7 years';

  const revenueGrowth = computeRevenueGrowth(financials);
  if (revenueGrowth !== null) {
    if (revenueGrowth > 20) return '3-5 years';
    if (revenueGrowth > 5) return '5-7 years';
  }
  return '7-10 years';
}


// --- Financial quality metrics (for DetailedAnalysis) ---

/**
 * Derives financial quality metrics from Alpha Vantage financials data.
 */
function deriveFinancialQuality(financials: AlphaVantageFinancials): FinancialMetric[] {
  const metrics: FinancialMetric[] = [];
  const income = financials.incomeStatement;
  const balance = financials.balanceSheet;
  const cashFlow = financials.cashFlow;

  // Revenue Growth
  if (income.length >= 2) {
    const currentRevenue = parseFloat(income[0].totalRevenue) || 0;
    const previousRevenue = parseFloat(income[1].totalRevenue) || 0;
    if (previousRevenue > 0) {
      const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      const growthRounded = Math.round(growth);
      const status: 'pass' | 'caution' | 'fail' = growth > 15 ? 'pass' : growth > 0 ? 'caution' : 'fail';
      metrics.push({ name: 'Revenue Growth', value: `${growthRounded}% YoY`, status });
    }
  }

  // Free Cash Flow
  if (cashFlow.length >= 1) {
    const opCashFlow = parseFloat(cashFlow[0].operatingCashflow) || 0;
    const capEx = parseFloat(cashFlow[0].capitalExpenditures) || 0;
    const fcf = opCashFlow - Math.abs(capEx);
    const fcfM = Math.round(fcf / 1_000_000);
    const status = fcf > 0 ? 'pass' : 'fail';
    metrics.push({ name: 'Free Cash Flow', value: `$${fcfM}M annually`, status });
  }

  // Return on Equity
  if (income.length >= 1 && balance.length >= 1) {
    const netIncome = parseFloat(income[0].netIncome) || 0;
    const totalAssets = parseFloat(balance[0].totalAssets) || 0;
    const totalLiabilities = parseFloat(balance[0].totalLiabilities) || 0;
    const equity = totalAssets - totalLiabilities;
    if (equity > 0) {
      const roe = (netIncome / equity) * 100;
      const roeRounded = Math.round(roe);
      // Negative ROE always fails, then check thresholds
      const status: 'pass' | 'caution' | 'fail' = roe < 0 ? 'fail' : roe > 15 ? 'pass' : roe >= 5 ? 'caution' : 'fail';
      metrics.push({ name: 'Return on Equity', value: `${roeRounded}%`, status });
    } else {
      metrics.push({ name: 'Return on Equity', value: 'Negative Equity', status: 'fail' });
    }
  }

  // Profit Margin
  if (income.length >= 1) {
    const netIncome = parseFloat(income[0].netIncome) || 0;
    const revenue = parseFloat(income[0].totalRevenue) || 0;
    if (revenue > 0) {
      const margin = (netIncome / revenue) * 100;
      const marginRounded = Math.round(margin * 10) / 10;
      // Negative margin always fails
      const status: 'pass' | 'caution' | 'fail' = margin < 0 ? 'fail' : margin > 15 ? 'pass' : margin > 0 ? 'caution' : 'fail';
      metrics.push({ name: 'Profit Margin', value: `${marginRounded}% net margin`, status });
    }
  }

  // Debt/Equity
  if (balance.length >= 1) {
    const totalAssets = parseFloat(balance[0].totalAssets) || 0;
    const totalLiabilities = parseFloat(balance[0].totalLiabilities) || 0;
    const equity = totalAssets - totalLiabilities;
    if (equity > 0) {
      const debtEquity = totalLiabilities / equity;
      const deRounded = Math.round(debtEquity * 10) / 10;
      const status: 'pass' | 'caution' | 'fail' = debtEquity < 0.5 ? 'pass' : debtEquity < 1.5 ? 'caution' : 'fail';
      metrics.push({ name: 'Debt/Equity', value: `${deRounded}`, status });
    } else {
      metrics.push({ name: 'Debt/Equity', value: 'Negative Equity', status: 'fail' });
    }
  }

  return metrics;
}

/**
 * Derives PEG analysis from Alpha Vantage overview data.
 */
function derivePegAnalysis(overview: AlphaVantageOverview): LynchAnalysis['pegAnalysis'] | null {
  const pe = parseFloat(overview.PERatio);
  const peg = parseFloat(overview.PEGRatio);

  if (isNaN(pe) || pe <= 0 || isNaN(peg) || peg <= 0) {
    return null;
  }

  const growthRate = Math.round(pe / peg);

  let assessment: string;
  if (peg < 1.0) {
    assessment = 'PEG below 1.0 indicates potential undervaluation — growth is not fully priced in.';
  } else if (peg <= 1.5) {
    assessment = 'PEG ratio suggests the stock is fairly valued relative to its growth rate.';
  } else if (peg <= 2.0) {
    assessment = 'PEG ratio is reasonable for a company at this stage of its growth cycle.';
  } else {
    assessment = 'PEG above 2.0 suggests the market is pricing in optimistic growth assumptions.';
  }

  return {
    pe: Math.round(pe),
    growthRate,
    peg: Math.round(peg * 100) / 100,
    assessment,
  };
}

/**
 * Maps technical indicator results to TechnicalSignal array.
 */
function mapIndicatorsToSignals(indicators: IndicatorResults): TechnicalSignal[] {
  const signals: TechnicalSignal[] = [];

  // EMA Crossover signal
  if (indicators.ema12.length > 0 && indicators.ema26.length > 0) {
    const latestEma12 = indicators.ema12[indicators.ema12.length - 1];
    const latestEma26 = indicators.ema26[indicators.ema26.length - 1];
    const isBullish = latestEma12 > latestEma26;
    signals.push({
      name: 'EMA Crossover',
      status: isBullish ? '12 above 26 — Bullish' : '12 below 26 — Bearish',
      score: isBullish ? 2 : 0,
    });
  }

  // RSI signal
  if (indicators.rsi14.length > 0) {
    const latestRsi = indicators.rsi14[indicators.rsi14.length - 1];
    const rsiRounded = Math.round(latestRsi);
    let status: string;
    let score: number;
    if (latestRsi > 70) {
      status = `${rsiRounded} — Overbought`;
      score = 0;
    } else if (latestRsi < 30) {
      status = `${rsiRounded} — Oversold (Bullish)`;
      score = 2;
    } else if (latestRsi >= 50) {
      status = `${rsiRounded} — Neutral-Bullish`;
      score = 1;
    } else {
      status = `${rsiRounded} — Neutral-Bearish`;
      score = 1;
    }
    signals.push({ name: 'RSI (14)', status, score });
  }

  // MACD signal
  if (indicators.macd.histogram.length > 0) {
    const latestHistogram = indicators.macd.histogram[indicators.macd.histogram.length - 1];
    let status: string;
    let score: number;
    if (latestHistogram > 0) {
      status = 'Bullish crossover';
      score = 2;
    } else if (latestHistogram < 0) {
      status = 'Bearish divergence';
      score = 0;
    } else {
      status = 'Flat histogram';
      score = 1;
    }
    signals.push({ name: 'MACD', status, score });
  }

  // Trend signal (based on price vs EMA-26)
  if (indicators.ema26.length > 0 && indicators.ema12.length > 0) {
    const latestEma26 = indicators.ema26[indicators.ema26.length - 1];
    const latestEma12 = indicators.ema12[indicators.ema12.length - 1];
    const aboveTrend = latestEma12 > latestEma26;
    signals.push({
      name: 'Trend (200 EMA)',
      status: aboveTrend ? 'Above — Bullish' : 'Below — Bearish',
      score: aboveTrend ? 2 : 0,
    });
  }

  return signals;
}

/**
 * Maps historical price points to the chart data pricePoints array.
 */
function mapHistoricalToPricePoints(historical: YahooHistoricalPoint[]): number[] {
  return historical.map((point) => Math.round(point.close * 100) / 100);
}


// --- Main mapping functions ---

/**
 * Maps raw API data to a complete AnalysisResult.
 * Computes meaningful scores from real data when available.
 * Falls back to getAnalysis(ticker) only when no real data is present.
 */
export function mapToAnalysisResult(ticker: string, raw: RawApiData): AnalysisResult {
  // Get fallback data — this always returns a complete AnalysisResult
  const fallback = getAnalysis(ticker);

  // Start with fallback as the base
  const result: AnalysisResult = { ...fallback };

  // Map Yahoo quote data
  if (raw.quote) {
    result.price = raw.quote.regularMarketPrice;
    result.priceChange = Math.round(raw.quote.regularMarketChangePercent * 100) / 100;
    result.companyName = raw.quote.longName || raw.quote.shortName || fallback.companyName;

    // Quick facts from quote
    if (raw.quote.marketCap > 0) {
      result.quickFacts = {
        ...result.quickFacts,
        marketCap: formatMarketCap(raw.quote.marketCap),
      };
    }

    if (raw.quote.fiftyTwoWeekLow > 0 && raw.quote.fiftyTwoWeekHigh > 0) {
      result.quickFacts = {
        ...result.quickFacts,
        weekRange52: `$${raw.quote.fiftyTwoWeekLow.toFixed(2)} - $${raw.quote.fiftyTwoWeekHigh.toFixed(2)}`,
      };
    }

    if (raw.quote.sector) {
      result.quickFacts = {
        ...result.quickFacts,
        sector: raw.quote.sector,
      };
    }
  }

  // Map Alpha Vantage overview data
  if (raw.overview) {
    const profitMargin = parseFloat(raw.overview.ProfitMargin);
    if (!isNaN(profitMargin)) {
      result.quickFacts = {
        ...result.quickFacts,
        profitMargin: `${Math.round(profitMargin * 1000) / 10}%`,
      };
    }

    if (raw.overview.DebtToEquityRatio) {
      const debtEquity = parseFloat(raw.overview.DebtToEquityRatio);
      if (!isNaN(debtEquity)) {
        result.quickFacts = {
          ...result.quickFacts,
          debtEquity: `${Math.round(debtEquity * 10) / 10}`,
        };
      }
    }

    const priceSales = parseFloat(raw.overview.PriceToSalesRatioTTM);
    if (!isNaN(priceSales) && priceSales > 0) {
      result.quickFacts = {
        ...result.quickFacts,
        priceSales: `${Math.round(priceSales * 10) / 10}x`,
      };
    }

    // FMP/Alpha Vantage market cap is more reliable — always use it when available
    const overviewMarketCap = formatAlphaMarketCap(raw.overview.MarketCapitalization);
    if (overviewMarketCap) {
      result.quickFacts = {
        ...result.quickFacts,
        marketCap: overviewMarketCap,
      };
    }

    // Use overview sector if quote didn't provide it
    if ((!raw.quote || !raw.quote.sector) && raw.overview.Sector) {
      result.quickFacts = {
        ...result.quickFacts,
        sector: raw.overview.Sector,
      };
    }
  }

  // --- Compute real scores when data is available ---
  const hasRealData = raw.overview || raw.financials;

  if (hasRealData) {
    const scores = computeAllScores(raw);
    if (scores) {
      result.masterScores = {
        buffett: scores.buffett,
        munger: scores.munger,
        lynch: scores.lynch,
        rothschild: scores.rothschild,
      };
      result.overallScore = scores.overall;
      result.verdict = computeVerdict(scores.overall);
    }

    // Compute moat from real data
    result.quickFacts = {
      ...result.quickFacts,
      moat: computeMoat(raw.overview, raw.financials, raw.quote),
    };

    // Compute risk level
    const riskLevel = computeRiskLevel(raw.overview, raw.financials, raw.quote);
    result.riskLevel = riskLevel;

    // Compute position size from risk level
    result.positionSize = computePositionSize(riskLevel);

    // Compute entry strategy from technical signals
    result.entryStrategy = computeEntryStrategy(raw.indicators);

    // Compute time horizon from growth rate
    result.timeHorizon = computeTimeHorizon(raw.financials);
  }

  return result;
}

/**
 * Maps raw API data to a complete DetailedAnalysis.
 * Fills missing sub-analyses from getDetailedAnalysis(ticker) fallback.
 * Computes real scores and updates analysis sections with real data.
 */
export function mapToDetailedAnalysis(ticker: string, raw: RawApiData): DetailedAnalysis {
  // Get fallback data — this always returns a complete DetailedAnalysis
  const fallback = getDetailedAnalysis(ticker);

  // Start with fallback as the base
  const result: DetailedAnalysis = {
    buffettAnalysis: { ...fallback.buffettAnalysis },
    mungerAnalysis: { ...fallback.mungerAnalysis },
    lynchAnalysis: { ...fallback.lynchAnalysis },
    rothschildAnalysis: { ...fallback.rothschildAnalysis },
    technicalAnalysis: { ...fallback.technicalAnalysis },
  };

  // Map Alpha Vantage financials → BuffettAnalysis.financialQuality
  if (raw.financials) {
    const derivedMetrics = deriveFinancialQuality(raw.financials);
    if (derivedMetrics.length > 0) {
      result.buffettAnalysis = {
        ...result.buffettAnalysis,
        financialQuality: derivedMetrics,
      };
    }
  }

  // Update buffettAnalysis.businessUnderstanding.sector with real sector
  if (raw.overview && raw.overview.Sector) {
    result.buffettAnalysis = {
      ...result.buffettAnalysis,
      businessUnderstanding: {
        ...result.buffettAnalysis.businessUnderstanding,
        sector: raw.overview.Sector,
      },
    };
  } else if (raw.quote && raw.quote.sector) {
    result.buffettAnalysis = {
      ...result.buffettAnalysis,
      businessUnderstanding: {
        ...result.buffettAnalysis.businessUnderstanding,
        sector: raw.quote.sector,
      },
    };
  }

  // Update buffettAnalysis.valuation with real P/E, P/S from overview
  if (raw.overview) {
    const pe = parseFloat(raw.overview.PERatio);
    const ps = parseFloat(raw.overview.PriceToSalesRatioTTM);
    const currentPrice = raw.quote?.regularMarketPrice ?? result.buffettAnalysis.valuation.currentPrice;

    result.buffettAnalysis = {
      ...result.buffettAnalysis,
      valuation: {
        ...result.buffettAnalysis.valuation,
        currentPrice,
        peRatio: !isNaN(pe) ? Math.round(pe * 10) / 10 : result.buffettAnalysis.valuation.peRatio,
        psRatio: !isNaN(ps) ? Math.round(ps * 10) / 10 : result.buffettAnalysis.valuation.psRatio,
      },
    };
  }

  // Map Alpha Vantage overview → LynchAnalysis.pegAnalysis
  if (raw.overview) {
    const pegData = derivePegAnalysis(raw.overview);
    if (pegData) {
      result.lynchAnalysis = {
        ...result.lynchAnalysis,
        pegAnalysis: pegData,
      };
    }
  }

  // Update rothschildAnalysis.bloodInStreets with real data
  if (raw.quote && raw.quote.fiftyTwoWeekHigh > 0) {
    const drawdown = ((raw.quote.fiftyTwoWeekHigh - raw.quote.regularMarketPrice) / raw.quote.fiftyTwoWeekHigh) * 100;
    let sectorPerformance: string;
    if (drawdown > 30) sectorPerformance = `Down ${Math.round(drawdown)}% from 52-week high — significant drawdown`;
    else if (drawdown > 15) sectorPerformance = `Down ${Math.round(drawdown)}% from 52-week high — moderate pullback`;
    else sectorPerformance = `Down ${Math.round(drawdown)}% from 52-week high — near highs`;

    result.rothschildAnalysis = {
      ...result.rothschildAnalysis,
      bloodInStreets: {
        ...result.rothschildAnalysis.bloodInStreets,
        sectorPerformance,
      },
    };
  }

  // Map historical prices → TechnicalAnalysis.chartData.pricePoints
  if (raw.historical && raw.historical.length > 0) {
    const pricePoints = mapHistoricalToPricePoints(raw.historical);
    const prices = raw.historical.map((p) => p.close);
    const currentPrice = prices[prices.length - 1];

    // Derive support and resistance from historical data
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const p20Index = Math.floor(sortedPrices.length * 0.2);
    const p80Index = Math.floor(sortedPrices.length * 0.8);
    const supportLevel = Math.round(sortedPrices[p20Index] * 100) / 100;
    const resistanceLevel = Math.round(sortedPrices[p80Index] * 100) / 100;

    // Buy zone: 5-15% below current price
    const buyZoneLow = Math.round(currentPrice * 0.85 * 100) / 100;
    const buyZoneHigh = Math.round(currentPrice * 0.95 * 100) / 100;

    result.technicalAnalysis = {
      ...result.technicalAnalysis,
      chartData: {
        pricePoints,
        supportLevel,
        resistanceLevel,
        buyZone: { low: buyZoneLow, high: buyZoneHigh },
      },
    };
  }

  // Map indicators → TechnicalAnalysis.signals
  if (raw.indicators) {
    const signals = mapIndicatorsToSignals(raw.indicators);
    if (signals.length > 0) {
      result.technicalAnalysis = {
        ...result.technicalAnalysis,
        signals,
      };

      // Update timing score based on computed signals
      const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
      const maxPossibleScore = signals.length * 2;
      const timingScore = Math.round((totalScore / maxPossibleScore) * 16);

      const recommendation: TechnicalAnalysis['timingVerdict']['recommendation'] =
        timingScore >= 10 ? 'BUY NOW' : timingScore >= 5 ? 'WAIT' : 'AVOID';

      // Derive stop loss and take profit from current price
      const currentPrice = raw.historical && raw.historical.length > 0
        ? raw.historical[raw.historical.length - 1].close
        : raw.quote?.regularMarketPrice ?? 0;

      const stopLoss = currentPrice > 0 ? `$${(currentPrice * 0.85).toFixed(2)}` : result.technicalAnalysis.timingVerdict.stopLoss;
      const takeProfit = currentPrice > 0 ? `$${(currentPrice * 1.4).toFixed(2)}` : result.technicalAnalysis.timingVerdict.takeProfit;
      const buyZoneStr = result.technicalAnalysis.chartData.buyZone
        ? `$${result.technicalAnalysis.chartData.buyZone.low.toFixed(2)} - $${result.technicalAnalysis.chartData.buyZone.high.toFixed(2)}`
        : result.technicalAnalysis.timingVerdict.buyZone;

      result.technicalAnalysis = {
        ...result.technicalAnalysis,
        timingScore,
        timingVerdict: {
          recommendation,
          buyZone: buyZoneStr,
          stopLoss,
          takeProfit,
        },
      };
    }
  }

  return result;
}


// --- Gemini AI result mapping ---

/**
 * Maps Gemini AI analysis results into AnalysisResult, overriding scores and verdicts.
 * Preserves price/quote data from raw API data but uses Gemini for all analysis fields.
 */
export function applyGeminiToAnalysisResult(
  result: AnalysisResult,
  gemini: GeminiAnalysisResult
): AnalysisResult {
  return {
    ...result,
    verdict: gemini.verdict,
    overallScore: gemini.overallScore,
    positionSize: gemini.positionSize,
    entryStrategy: gemini.entryStrategy,
    riskLevel: gemini.riskLevel,
    timeHorizon: gemini.timeHorizon,
    masterScores: {
      buffett: gemini.masterScores.buffett,
      munger: gemini.masterScores.munger,
      lynch: gemini.masterScores.lynch,
      rothschild: gemini.masterScores.rothschild,
    },
  };
}

/**
 * Maps Gemini AI analysis results into DetailedAnalysis, overriding analysis sections.
 * Preserves technical analysis from real indicators (does not override technicalAnalysis).
 */
export function applyGeminiToDetailedAnalysis(
  result: DetailedAnalysis,
  gemini: GeminiAnalysisResult
): DetailedAnalysis {
  return {
    ...result,
    buffettAnalysis: {
      ...result.buffettAnalysis,
      businessUnderstanding: {
        sector: gemini.buffettAnalysis.sector,
        description: gemini.buffettAnalysis.description,
        complexity: gemini.buffettAnalysis.complexity as 'Simple' | 'Moderate' | 'Complex',
      },
      competitiveMoat: {
        moatScore: gemini.buffettAnalysis.moatScore,
        factors: gemini.buffettAnalysis.moatFactors,
      },
      // Preserve financialQuality from real Alpha Vantage data — do NOT override with Gemini
      financialQuality: result.buffettAnalysis.financialQuality,
      managementQuality: gemini.buffettAnalysis.managementQuality,
      valuation: {
        ...result.buffettAnalysis.valuation,
        intrinsicValue: gemini.buffettAnalysis.intrinsicValue,
        marginOfSafety: gemini.buffettAnalysis.marginOfSafety,
      },
      verdict: gemini.buffettAnalysis.verdict,
    },
    mungerAnalysis: {
      ...result.mungerAnalysis,
      failureScenarios: gemini.mungerAnalysis.failureScenarios,
      mentalModels: gemini.mungerAnalysis.mentalModels,
      verdict: gemini.mungerAnalysis.verdict,
    },
    lynchAnalysis: {
      ...result.lynchAnalysis,
      knowWhatYouOwn: gemini.lynchAnalysis.knowWhatYouOwn,
      industryGrowth: {
        tam: gemini.lynchAnalysis.industryGrowth.tam,
        growthRate: gemini.lynchAnalysis.industryGrowth.growthRate,
        trend: gemini.lynchAnalysis.industryGrowth.trend as 'Accelerating' | 'Stable' | 'Decelerating',
      },
      tenBaggerPotential: gemini.lynchAnalysis.tenBaggerPotential,
      verdict: gemini.lynchAnalysis.verdict,
    },
    rothschildAnalysis: {
      ...result.rothschildAnalysis,
      bloodInStreets: {
        bloodLevel: gemini.rothschildAnalysis.bloodLevel,
        vix: gemini.rothschildAnalysis.vix,
        sectorPerformance: gemini.rothschildAnalysis.sectorPerformance,
        socialSentiment: gemini.rothschildAnalysis.socialSentiment,
        shortInterest: gemini.rothschildAnalysis.shortInterest,
      },
      contrarianSignals: gemini.rothschildAnalysis.contrarianSignals,
      contrarianScore: gemini.rothschildAnalysis.contrarianScore,
      verdict: gemini.rothschildAnalysis.verdict,
    },
    // Keep technicalAnalysis from real indicators — don't override with Gemini
    technicalAnalysis: result.technicalAnalysis,
  };
}
