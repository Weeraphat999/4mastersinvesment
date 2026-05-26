/**
 * AnalysisOrchestrator — multi-step pipeline coordinator.
 * Coordinates the full analysis pipeline: fetching quote, historical data,
 * financials, computing indicators, and scoring analysis.
 * Reports progress via callback, handles partial failures gracefully,
 * and delegates final result assembly to DataMapper.
 */

import * as cacheLayer from './cacheLayer';
import { fetchQuote, fetchHistorical } from './yahooFinanceService';
import type { YahooQuoteResponse, YahooHistoricalPoint } from './yahooFinanceService';
import { fetchFinancials, fetchOverview, isRateLimited } from './alphaVantageService';
import type { AlphaVantageFinancials, AlphaVantageOverview } from './alphaVantageService';
import { fetchFmpProfile, fetchFmpFinancials, fetchFmpQuote, fetchFmpHistorical, isFmpConfigured } from './fmpService';
import type { FmpProfile } from './fmpService';
import { computeIndicators } from './technicalIndicatorEngine';
import type { IndicatorResults } from './technicalIndicatorEngine';
import { mapToAnalysisResult, mapToDetailedAnalysis, applyGeminiToAnalysisResult, applyGeminiToDetailedAnalysis, mapFmpToRawApiData } from './dataMapper';
import type { RawApiData } from './dataMapper';
import { analyzeWithGemini } from './geminiService';
import type { GeminiAnalysisResult } from './geminiService';
import type {
  AnalysisStage,
  AnalysisProgress,
  AnalysisOrchestratorResult,
  DataSourceInfo,
} from './types';

/**
 * Creates the initial 5 stages for the analysis pipeline.
 */
function createInitialStages(): AnalysisStage[] {
  return [
    { id: 'quote', label: 'Fetching Quote', status: 'pending' },
    { id: 'historical', label: 'Fetching Historical Data', status: 'pending' },
    { id: 'financials', label: 'Fetching Financials', status: 'pending' },
    { id: 'indicators', label: 'Computing Indicators', status: 'pending' },
    { id: 'scoring', label: 'Scoring Analysis', status: 'pending' },
  ];
}

/**
 * Analyzes a stock by coordinating the full multi-step pipeline.
 *
 * - Checks cache before each API call; updates cache on success.
 * - Reports progress via onProgress callback at each stage transition.
 * - Handles partial failures: marks stage as 'warning' and continues.
 * - Delegates to DataMapper for final result assembly.
 * - Returns AnalysisOrchestratorResult with dataSource flags indicating
 *   live/cached/fallback per source.
 *
 * @param ticker - The stock ticker symbol to analyze
 * @param onProgress - Callback invoked at each stage transition
 * @returns The complete analysis result with data source metadata
 */
export async function analyzeStock(
  ticker: string,
  onProgress: (progress: AnalysisProgress) => void
): Promise<AnalysisOrchestratorResult> {
  const normalizedTicker = ticker.trim().toUpperCase();
  const stages = createInitialStages();

  const dataSource: DataSourceInfo = {
    quoteSource: 'fallback',
    historicalSource: 'fallback',
    financialsSource: 'fallback',
    indicatorsComputed: false,
  };

  let _rateLimitDetected = false;

  // Collected raw data for DataMapper
  let quoteData: YahooQuoteResponse | null = null;
  let historicalData: YahooHistoricalPoint[] | null = null;
  let financialsData: AlphaVantageFinancials | null = null;
  let overviewData: AlphaVantageOverview | null = null;
  let indicatorsData: IndicatorResults | null = null;
  let fmpProfileData: FmpProfile | null = null;

  // Helper to report progress
  function reportProgress(currentStageIndex: number): void {
    onProgress({
      stages: [...stages.map((s) => ({ ...s }))],
      currentStageIndex,
    });
  }

  // --- Stage 1: Fetching Quote ---
  stages[0].status = 'loading';
  reportProgress(0);

  try {
    const cached = cacheLayer.get<YahooQuoteResponse>(normalizedTicker, 'quote');
    if (cached) {
      quoteData = cached;
      dataSource.quoteSource = 'cached';
    } else {
      // Try FMP first (no CORS issues)
      if (isFmpConfigured()) {
        const fmpQuote = await fetchFmpQuote(normalizedTicker);
        if (fmpQuote && fmpQuote.price > 0) {
          quoteData = {
            symbol: fmpQuote.symbol,
            shortName: fmpQuote.name,
            regularMarketPrice: fmpQuote.price,
            regularMarketChangePercent: fmpQuote.changesPercentage,
            marketCap: fmpQuote.marketCap,
            fiftyTwoWeekLow: fmpQuote.yearLow,
            fiftyTwoWeekHigh: fmpQuote.yearHigh,
            regularMarketVolume: fmpQuote.volume,
          };
          cacheLayer.set(normalizedTicker, 'quote', quoteData);
          dataSource.quoteSource = 'live';
        }
      }

      // Fallback to Yahoo if FMP failed
      if (!quoteData) {
        try {
          quoteData = await fetchQuote(normalizedTicker);
          cacheLayer.set(normalizedTicker, 'quote', quoteData);
          dataSource.quoteSource = 'live';
        } catch {
          // Yahoo also failed
          dataSource.quoteSource = 'fallback';
        }
      }
    }
    stages[0].status = quoteData ? 'success' : 'warning';
  } catch {
    stages[0].status = 'warning';
    dataSource.quoteSource = 'fallback';
  }
  reportProgress(0);

  // --- Stage 2: Fetching Historical Data ---
  stages[1].status = 'loading';
  reportProgress(1);

  try {
    const cached = cacheLayer.get<YahooHistoricalPoint[]>(normalizedTicker, 'historical');
    if (cached) {
      historicalData = cached;
      dataSource.historicalSource = 'cached';
    } else {
      // Try FMP first (no CORS issues)
      if (isFmpConfigured()) {
        const fmpHistorical = await fetchFmpHistorical(normalizedTicker);
        if (fmpHistorical.length > 0) {
          historicalData = fmpHistorical.map(p => ({ date: p.date, close: p.close }));
          cacheLayer.set(normalizedTicker, 'historical', historicalData);
          dataSource.historicalSource = 'live';
        }
      }

      // Fallback to Yahoo if FMP failed
      if (!historicalData) {
        try {
          historicalData = await fetchHistorical(normalizedTicker);
          cacheLayer.set(normalizedTicker, 'historical', historicalData);
          dataSource.historicalSource = 'live';
        } catch {
          dataSource.historicalSource = 'fallback';
        }
      }
    }
    stages[1].status = historicalData && historicalData.length > 0 ? 'success' : 'warning';
  } catch {
    stages[1].status = 'warning';
    dataSource.historicalSource = 'fallback';
  }
  reportProgress(1);

  // --- Stage 3: Fetching Financials ---
  stages[2].status = 'loading';
  reportProgress(2);

  try {
    // Check cache for both financials and overview
    const cachedFinancials = cacheLayer.get<AlphaVantageFinancials>(normalizedTicker, 'financials');
    const cachedOverview = cacheLayer.get<AlphaVantageOverview>(normalizedTicker, 'overview');
    const cachedFmpProfile = cacheLayer.get<FmpProfile>(normalizedTicker, 'fmpProfile');

    if (cachedFinancials && cachedOverview) {
      financialsData = cachedFinancials;
      overviewData = cachedOverview;
      fmpProfileData = cachedFmpProfile;
      dataSource.financialsSource = 'cached';
    } else {
      // Try FMP first (primary source — 250 requests/day)
      let fmpSuccess = false;

      if (isFmpConfigured()) {
        const [fmpProfile, fmpFinancials] = await Promise.all([
          fetchFmpProfile(normalizedTicker),
          fetchFmpFinancials(normalizedTicker),
        ]);

        if (fmpProfile || fmpFinancials) {
          // Map FMP data to Alpha Vantage format for the existing pipeline
          const mapped = mapFmpToRawApiData(fmpProfile, fmpFinancials);
          fmpProfileData = fmpProfile;

          // Only mark FMP as fully successful if we got actual financials
          // FMP free tier only provides profile, not financial statements
          if (fmpFinancials) {
            financialsData = mapped.financials;
            overviewData = mapped.overview;
            fmpSuccess = true;
            dataSource.financialsSource = 'live';
          } else {
            // FMP gave us profile only — still need Alpha Vantage for financials
            // Keep fmpProfileData for supplementary info but don't skip AV
            fmpSuccess = false;
          }

          // Cache successful results
          if (financialsData) {
            cacheLayer.set(normalizedTicker, 'financials', financialsData);
          }
          if (overviewData) {
            cacheLayer.set(normalizedTicker, 'overview', overviewData);
          }
          if (fmpProfileData) {
            cacheLayer.set(normalizedTicker, 'fmpProfile', fmpProfileData);
          }
        }
      }

      // Fall back to Alpha Vantage if FMP failed, had no financials, or key is missing
      if (!fmpSuccess) {
        const [fetchedFinancials, fetchedOverview] = await Promise.all([
          fetchFinancials(normalizedTicker),
          fetchOverview(normalizedTicker),
        ]);

        // Check for rate limiting in the responses
        if (fetchedFinancials === null && fetchedOverview === null) {
          // Both returned null — could be rate limited or no API key
          dataSource.financialsSource = 'fallback';
          stages[2].status = 'warning';
        } else {
          financialsData = fetchedFinancials;
          overviewData = fetchedOverview;
          dataSource.financialsSource = 'live';

          // Cache successful results
          if (financialsData) {
            cacheLayer.set(normalizedTicker, 'financials', financialsData);
          }
          if (overviewData) {
            cacheLayer.set(normalizedTicker, 'overview', overviewData);
          }

          stages[2].status = 'success';
        }
      } else {
        stages[2].status = 'success';
      }
    }

    // If we didn't already set status above
    if (stages[2].status === 'loading') {
      stages[2].status = 'success';
    }
  } catch (error: unknown) {
    // Detect rate limiting from the error
    if (isRateLimited(error)) {
      _rateLimitDetected = true;
    }
    stages[2].status = 'warning';
    dataSource.financialsSource = 'fallback';
  }
  reportProgress(2);

  // --- Stage 4: Computing Indicators ---
  stages[3].status = 'loading';
  reportProgress(3);

  try {
    if (historicalData && historicalData.length > 0) {
      const prices = historicalData.map((point) => point.close);
      indicatorsData = computeIndicators(prices);
      dataSource.indicatorsComputed = indicatorsData !== null;
    } else {
      dataSource.indicatorsComputed = false;
    }
    stages[3].status = indicatorsData !== null ? 'success' : 'warning';
  } catch {
    stages[3].status = 'warning';
    dataSource.indicatorsComputed = false;
  }
  reportProgress(3);

  // --- Stage 5: Scoring Analysis ---
  stages[4].status = 'loading';
  reportProgress(4);

  try {
    const rawApiData: RawApiData = {
      quote: quoteData,
      historical: historicalData,
      financials: financialsData,
      overview: overviewData,
      indicators: indicatorsData,
    };

    let analysisResult = mapToAnalysisResult(normalizedTicker, rawApiData);
    let detailedAnalysis = mapToDetailedAnalysis(normalizedTicker, rawApiData);

    // Attempt Gemini AI analysis
    let geminiResult: GeminiAnalysisResult | null = null;

    // Check cache first
    const cachedGemini = cacheLayer.get<GeminiAnalysisResult>(normalizedTicker, 'gemini');
    if (cachedGemini) {
      geminiResult = cachedGemini;
      dataSource.aiSource = 'gemini';
    } else {
      // Prepare data for Gemini
      const financialDataForGemini = financialsData && financialsData.incomeStatement.length > 0
        ? {
            revenue: financialsData.incomeStatement[0].totalRevenue,
            netIncome: financialsData.incomeStatement[0].netIncome,
            totalAssets: financialsData.balanceSheet[0]?.totalAssets,
            totalLiabilities: financialsData.balanceSheet[0]?.totalLiabilities,
            operatingCashflow: financialsData.cashFlow[0]?.operatingCashflow,
          }
        : null;

      const overviewDataForGemini = overviewData
        ? {
            sector: overviewData.Sector,
            peRatio: overviewData.PERatio,
            profitMargin: overviewData.ProfitMargin,
            pegRatio: overviewData.PEGRatio,
            debtToEquity: overviewData.DebtToEquityRatio,
            marketCap: overviewData.MarketCapitalization,
          }
        : null;

      const historicalPricesForGemini = historicalData
        ? historicalData.map((p) => p.close)
        : null;

      const currentPrice = quoteData?.regularMarketPrice ?? analysisResult.price;
      const currentPriceChange = quoteData?.regularMarketChangePercent ?? analysisResult.priceChange;
      const currentCompanyName = quoteData?.longName ?? quoteData?.shortName ?? analysisResult.companyName;

      geminiResult = await analyzeWithGemini(
        normalizedTicker,
        currentCompanyName,
        currentPrice,
        currentPriceChange,
        financialDataForGemini,
        overviewDataForGemini,
        historicalPricesForGemini,
        fmpProfileData?.description ?? undefined
      );

      if (geminiResult) {
        // Cache the successful result
        cacheLayer.set(normalizedTicker, 'gemini', geminiResult);
        dataSource.aiSource = 'gemini';
      } else {
        dataSource.aiSource = 'fallback';
      }
    }

    // Apply Gemini results if available
    if (geminiResult) {
      analysisResult = applyGeminiToAnalysisResult(analysisResult, geminiResult);
      detailedAnalysis = applyGeminiToDetailedAnalysis(detailedAnalysis, geminiResult);
    }

    stages[4].status = 'success';
    reportProgress(4);

    return {
      analysisResult,
      detailedAnalysis,
      dataSource,
    };
  } catch {
    // Even if scoring fails, we should never throw — use fallback
    stages[4].status = 'warning';
    reportProgress(4);

    dataSource.aiSource = 'fallback';

    // Last resort: use DataMapper with all-null data (will use full fallback)
    const rawApiData: RawApiData = {
      quote: null,
      historical: null,
      financials: null,
      overview: null,
      indicators: null,
    };

    const analysisResult = mapToAnalysisResult(normalizedTicker, rawApiData);
    const detailedAnalysis = mapToDetailedAnalysis(normalizedTicker, rawApiData);

    return {
      analysisResult,
      detailedAnalysis,
      dataSource: {
        quoteSource: 'fallback',
        historicalSource: 'fallback',
        financialsSource: 'fallback',
        indicatorsComputed: false,
        aiSource: 'fallback',
      },
    };
  }
}
