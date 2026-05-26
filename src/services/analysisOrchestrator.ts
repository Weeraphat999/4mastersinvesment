/**
 * AnalysisOrchestrator — multi-step pipeline coordinator.
 * Coordinates the full analysis pipeline: fetching quote, historical data,
 * financials, computing indicators, and scoring analysis.
 * Reports progress via callback, handles partial failures gracefully,
 * and delegates final result assembly to DataMapper.
 */

import * as cacheLayer from './cacheLayer';
import { fetchQuote, fetchHistorical, fetchProfile } from './yahooFinanceService';
import type { YahooQuoteResponse, YahooHistoricalPoint, YahooProfileData } from './yahooFinanceService';
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
  let yahooProfileData: YahooProfileData | null = null;

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
      // Try Yahoo Profile via serverless proxy first (most reliable)
      yahooProfileData = await fetchProfile(normalizedTicker);

      if (yahooProfileData && yahooProfileData.marketCap > 0) {
        // Map Yahoo profile to AlphaVantageOverview format
        overviewData = {
          Symbol: yahooProfileData.symbol,
          Name: yahooProfileData.longName || yahooProfileData.shortName,
          Sector: yahooProfileData.sector,
          MarketCapitalization: String(yahooProfileData.marketCap),
          PERatio: String(yahooProfileData.trailingPE || yahooProfileData.forwardPE || 0),
          ProfitMargin: String(yahooProfileData.profitMargins || 0),
          DebtToEquityRatio: String(yahooProfileData.debtToEquity || 0),
          PEGRatio: String(yahooProfileData.pegRatio || 0),
          PriceToSalesRatioTTM: yahooProfileData.totalRevenue > 0
            ? String(yahooProfileData.marketCap / yahooProfileData.totalRevenue)
            : '0',
        };

        // Also update quoteData with more accurate info from profile
        if (quoteData) {
          quoteData.marketCap = yahooProfileData.marketCap;
          quoteData.sector = yahooProfileData.sector;
          if (yahooProfileData.regularMarketPrice > 0) {
            quoteData.regularMarketPrice = yahooProfileData.regularMarketPrice;
            quoteData.regularMarketChangePercent = yahooProfileData.regularMarketChangePercent;
          }
          if (yahooProfileData.fiftyTwoWeekLow > 0) {
            quoteData.fiftyTwoWeekLow = yahooProfileData.fiftyTwoWeekLow;
            quoteData.fiftyTwoWeekHigh = yahooProfileData.fiftyTwoWeekHigh;
          }
          quoteData.longName = yahooProfileData.longName;
          quoteData.shortName = yahooProfileData.shortName || quoteData.shortName;
        }

        cacheLayer.set(normalizedTicker, 'overview', overviewData);
        dataSource.financialsSource = 'live';
        stages[2].status = 'success';
      } else {
        // Fallback: Try FMP then Alpha Vantage
        let fmpSuccess = false;

        if (isFmpConfigured()) {
          const [fmpProfile, fmpFinancials] = await Promise.all([
            fetchFmpProfile(normalizedTicker),
            fetchFmpFinancials(normalizedTicker),
          ]);

          if (fmpProfile || fmpFinancials) {
            const mapped = mapFmpToRawApiData(fmpProfile, fmpFinancials);
            fmpProfileData = fmpProfile;

            if (fmpFinancials) {
              financialsData = mapped.financials;
              overviewData = mapped.overview;
              fmpSuccess = true;
              dataSource.financialsSource = 'live';
            } else if (fmpProfile) {
              // FMP gave us profile only — use it for overview (sector, market cap)
              overviewData = {
                Symbol: fmpProfile.symbol,
                Name: fmpProfile.companyName,
                Sector: fmpProfile.sector || '',
                MarketCapitalization: String(fmpProfile.mktCap || 0),
                PERatio: '0',
                ProfitMargin: '0',
                DebtToEquityRatio: '0',
                PEGRatio: '0',
                PriceToSalesRatioTTM: '0',
              };

              // Update quoteData with FMP profile info
              if (quoteData && fmpProfile.mktCap > 0) {
                quoteData.marketCap = fmpProfile.mktCap;
              }
              if (quoteData && fmpProfile.sector) {
                quoteData.sector = fmpProfile.sector;
              }

              cacheLayer.set(normalizedTicker, 'overview', overviewData);
              cacheLayer.set(normalizedTicker, 'fmpProfile', fmpProfileData);
              dataSource.financialsSource = 'live';
              fmpSuccess = true;
            }

            if (financialsData) cacheLayer.set(normalizedTicker, 'financials', financialsData);
            if (overviewData && fmpFinancials) cacheLayer.set(normalizedTicker, 'overview', overviewData);
            if (fmpProfileData) cacheLayer.set(normalizedTicker, 'fmpProfile', fmpProfileData);
          }
        }

        if (!fmpSuccess) {
          const [fetchedFinancials, fetchedOverview] = await Promise.all([
            fetchFinancials(normalizedTicker),
            fetchOverview(normalizedTicker),
          ]);

          if (fetchedFinancials === null && fetchedOverview === null) {
            dataSource.financialsSource = 'fallback';
            stages[2].status = 'warning';
          } else {
            financialsData = fetchedFinancials;
            overviewData = fetchedOverview;
            dataSource.financialsSource = 'live';
            if (financialsData) cacheLayer.set(normalizedTicker, 'financials', financialsData);
            if (overviewData) cacheLayer.set(normalizedTicker, 'overview', overviewData);
            stages[2].status = 'success';
          }
        } else {
          stages[2].status = 'success';
        }
      }
    }

    if (stages[2].status === 'loading') {
      stages[2].status = 'success';
    }
  } catch (error: unknown) {
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
