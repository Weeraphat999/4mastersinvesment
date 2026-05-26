import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeStock } from './analysisOrchestrator';
import * as cacheLayer from './cacheLayer';
import * as yahooFinanceService from './yahooFinanceService';
import * as alphaVantageService from './alphaVantageService';
import * as fmpService from './fmpService';
import * as technicalIndicatorEngine from './technicalIndicatorEngine';
import type { AnalysisProgress } from './types';
import type { YahooQuoteResponse, YahooHistoricalPoint } from './yahooFinanceService';
import type { AlphaVantageFinancials, AlphaVantageOverview } from './alphaVantageService';

// Mock all dependencies
vi.mock('./cacheLayer');
vi.mock('./yahooFinanceService');
vi.mock('./alphaVantageService');
vi.mock('./fmpService');
vi.mock('./technicalIndicatorEngine');

// Mock dataMapper — let it use real fallback logic
vi.mock('./dataMapper', () => ({
  mapToAnalysisResult: vi.fn((_ticker: string) => ({
    ticker: _ticker,
    companyName: 'Test Company',
    price: 150,
    priceChange: 1.5,
    masterScores: { buffett: 75, munger: 70, lynch: 80, rothschild: 65 },
    quickFacts: {
      marketCap: '$2.5T',
      weekRange52: '$120 - $180',
      sector: 'Technology',
      profitMargin: '25%',
      debtEquity: '1.2',
      priceSales: '8.5x',
    },
  })),
  mapToDetailedAnalysis: vi.fn((_ticker: string) => ({
    buffettAnalysis: { financialQuality: [] },
    mungerAnalysis: {},
    lynchAnalysis: { pegAnalysis: null },
    rothschildAnalysis: {},
    technicalAnalysis: { signals: [], chartData: { pricePoints: [] } },
  })),
}));

const mockQuote: YahooQuoteResponse = {
  symbol: 'AAPL',
  shortName: 'Apple Inc.',
  longName: 'Apple Inc.',
  regularMarketPrice: 175.5,
  regularMarketChangePercent: 1.2,
  marketCap: 2800000000000,
  fiftyTwoWeekLow: 124.17,
  fiftyTwoWeekHigh: 198.23,
  regularMarketVolume: 55000000,
  sector: 'Technology',
};

const mockHistorical: YahooHistoricalPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: `2024-01-${String(i + 1).padStart(2, '0')}`,
  close: 150 + i,
}));

const mockFinancials: AlphaVantageFinancials = {
  incomeStatement: [
    {
      fiscalDateEnding: '2023-09-30',
      totalRevenue: '383285000000',
      netIncome: '96995000000',
      totalAssets: '352583000000',
      totalLiabilities: '290437000000',
      operatingCashflow: '110543000000',
      capitalExpenditures: '11000000000',
    },
  ],
  balanceSheet: [
    {
      fiscalDateEnding: '2023-09-30',
      totalRevenue: '0',
      netIncome: '0',
      totalAssets: '352583000000',
      totalLiabilities: '290437000000',
      operatingCashflow: '0',
      capitalExpenditures: '0',
    },
  ],
  cashFlow: [
    {
      fiscalDateEnding: '2023-09-30',
      totalRevenue: '0',
      netIncome: '0',
      totalAssets: '0',
      totalLiabilities: '0',
      operatingCashflow: '110543000000',
      capitalExpenditures: '11000000000',
    },
  ],
};

const mockOverview: AlphaVantageOverview = {
  Symbol: 'AAPL',
  Name: 'Apple Inc.',
  Sector: 'Technology',
  MarketCapitalization: '2800000000000',
  PERatio: '29.5',
  ProfitMargin: '0.253',
  DebtToEquityRatio: '1.8',
  PEGRatio: '2.1',
  PriceToSalesRatioTTM: '7.5',
};

describe('analysisOrchestrator', () => {
  let progressUpdates: AnalysisProgress[];

  beforeEach(() => {
    vi.clearAllMocks();
    progressUpdates = [];

    // Default: cache misses
    vi.mocked(cacheLayer.get).mockReturnValue(null);
    vi.mocked(cacheLayer.set).mockImplementation(() => {});

    // Default: successful API calls
    vi.mocked(yahooFinanceService.fetchQuote).mockResolvedValue(mockQuote);
    vi.mocked(yahooFinanceService.fetchHistorical).mockResolvedValue(mockHistorical);
    vi.mocked(alphaVantageService.fetchFinancials).mockResolvedValue(mockFinancials);
    vi.mocked(alphaVantageService.fetchOverview).mockResolvedValue(mockOverview);
    vi.mocked(alphaVantageService.isRateLimited).mockReturnValue(false);
    vi.mocked(fmpService.isFmpConfigured).mockReturnValue(false);
    vi.mocked(fmpService.fetchFmpProfile).mockResolvedValue(null);
    vi.mocked(fmpService.fetchFmpFinancials).mockResolvedValue(null);
    vi.mocked(technicalIndicatorEngine.computeIndicators).mockReturnValue({
      ema12: [150, 151],
      ema26: [149, 150],
      rsi14: [55, 60],
      macd: { macdLine: [1, 2], signalLine: [0.5, 1], histogram: [0.5, 1] },
    });
  });

  function onProgress(progress: AnalysisProgress): void {
    progressUpdates.push(JSON.parse(JSON.stringify(progress)));
  }

  describe('analyzeStock — full pipeline', () => {
    it('returns a complete AnalysisOrchestratorResult', async () => {
      const result = await analyzeStock('AAPL', onProgress);

      expect(result).toHaveProperty('analysisResult');
      expect(result).toHaveProperty('detailedAnalysis');
      expect(result).toHaveProperty('dataSource');
    });

    it('normalizes ticker to uppercase', async () => {
      await analyzeStock('aapl', onProgress);

      expect(yahooFinanceService.fetchQuote).toHaveBeenCalledWith('AAPL');
      expect(yahooFinanceService.fetchHistorical).toHaveBeenCalledWith('AAPL');
    });

    it('reports progress through all 5 stages', async () => {
      await analyzeStock('AAPL', onProgress);

      // Each stage reports at least twice (loading + success/warning)
      expect(progressUpdates.length).toBeGreaterThanOrEqual(10);

      // Verify all stages end in success
      const finalProgress = progressUpdates[progressUpdates.length - 1];
      expect(finalProgress.stages).toHaveLength(5);
      finalProgress.stages.forEach((stage) => {
        expect(['success', 'warning']).toContain(stage.status);
      });
    });

    it('defines 5 stages with correct labels', async () => {
      await analyzeStock('AAPL', onProgress);

      const firstProgress = progressUpdates[0];
      expect(firstProgress.stages[0].label).toBe('Fetching Quote');
      expect(firstProgress.stages[1].label).toBe('Fetching Historical Data');
      expect(firstProgress.stages[2].label).toBe('Fetching Financials');
      expect(firstProgress.stages[3].label).toBe('Computing Indicators');
      expect(firstProgress.stages[4].label).toBe('Scoring Analysis');
    });
  });

  describe('cache behavior', () => {
    it('uses cached quote data when available', async () => {
      vi.mocked(cacheLayer.get).mockImplementation((ticker, dataType) => {
        if (dataType === 'quote') return mockQuote;
        return null;
      });

      const result = await analyzeStock('AAPL', onProgress);

      expect(yahooFinanceService.fetchQuote).not.toHaveBeenCalled();
      expect(result.dataSource.quoteSource).toBe('cached');
    });

    it('uses cached historical data when available', async () => {
      vi.mocked(cacheLayer.get).mockImplementation((ticker, dataType) => {
        if (dataType === 'historical') return mockHistorical;
        return null;
      });

      const result = await analyzeStock('AAPL', onProgress);

      expect(yahooFinanceService.fetchHistorical).not.toHaveBeenCalled();
      expect(result.dataSource.historicalSource).toBe('cached');
    });

    it('uses cached financials and overview when available', async () => {
      vi.mocked(cacheLayer.get).mockImplementation((_ticker, dataType) => {
        if (dataType === 'financials') return mockFinancials;
        if (dataType === 'overview') return mockOverview;
        return null;
      });

      const result = await analyzeStock('AAPL', onProgress);

      expect(alphaVantageService.fetchFinancials).not.toHaveBeenCalled();
      expect(alphaVantageService.fetchOverview).not.toHaveBeenCalled();
      expect(result.dataSource.financialsSource).toBe('cached');
    });

    it('caches quote data on successful fetch', async () => {
      await analyzeStock('AAPL', onProgress);

      expect(cacheLayer.set).toHaveBeenCalledWith('AAPL', 'quote', mockQuote);
    });

    it('caches historical data on successful fetch', async () => {
      await analyzeStock('AAPL', onProgress);

      expect(cacheLayer.set).toHaveBeenCalledWith('AAPL', 'historical', mockHistorical);
    });

    it('caches financials and overview on successful fetch', async () => {
      await analyzeStock('AAPL', onProgress);

      expect(cacheLayer.set).toHaveBeenCalledWith('AAPL', 'financials', mockFinancials);
      expect(cacheLayer.set).toHaveBeenCalledWith('AAPL', 'overview', mockOverview);
    });
  });

  describe('dataSource flags', () => {
    it('marks quoteSource as live when fetched fresh', async () => {
      const result = await analyzeStock('AAPL', onProgress);
      expect(result.dataSource.quoteSource).toBe('live');
    });

    it('marks historicalSource as live when fetched fresh', async () => {
      const result = await analyzeStock('AAPL', onProgress);
      expect(result.dataSource.historicalSource).toBe('live');
    });

    it('marks financialsSource as live when fetched fresh', async () => {
      const result = await analyzeStock('AAPL', onProgress);
      expect(result.dataSource.financialsSource).toBe('live');
    });

    it('marks indicatorsComputed as true when indicators are computed', async () => {
      const result = await analyzeStock('AAPL', onProgress);
      expect(result.dataSource.indicatorsComputed).toBe(true);
    });

    it('marks indicatorsComputed as false when no historical data', async () => {
      vi.mocked(yahooFinanceService.fetchHistorical).mockRejectedValue(new Error('fail'));

      const result = await analyzeStock('AAPL', onProgress);
      expect(result.dataSource.indicatorsComputed).toBe(false);
    });
  });

  describe('partial failure handling', () => {
    it('continues when quote fetch fails', async () => {
      vi.mocked(yahooFinanceService.fetchQuote).mockRejectedValue(new Error('Network error'));

      const result = await analyzeStock('AAPL', onProgress);

      expect(result.dataSource.quoteSource).toBe('fallback');
      expect(result).toHaveProperty('analysisResult');
      expect(result).toHaveProperty('detailedAnalysis');
    });

    it('continues when historical fetch fails', async () => {
      vi.mocked(yahooFinanceService.fetchHistorical).mockRejectedValue(new Error('Timeout'));

      const result = await analyzeStock('AAPL', onProgress);

      expect(result.dataSource.historicalSource).toBe('fallback');
      expect(result).toHaveProperty('analysisResult');
    });

    it('continues when financials fetch fails', async () => {
      vi.mocked(alphaVantageService.fetchFinancials).mockRejectedValue(new Error('Rate limit'));
      vi.mocked(alphaVantageService.fetchOverview).mockRejectedValue(new Error('Rate limit'));

      const result = await analyzeStock('AAPL', onProgress);

      expect(result.dataSource.financialsSource).toBe('fallback');
      expect(result).toHaveProperty('analysisResult');
    });

    it('marks failed stages as warning in progress', async () => {
      vi.mocked(yahooFinanceService.fetchQuote).mockRejectedValue(new Error('fail'));
      vi.mocked(yahooFinanceService.fetchHistorical).mockRejectedValue(new Error('fail'));

      await analyzeStock('AAPL', onProgress);

      // Find the progress update after quote stage completes
      const quoteCompleted = progressUpdates.find(
        (p) => p.stages[0].status === 'warning' && p.currentStageIndex === 0
      );
      expect(quoteCompleted).toBeDefined();

      // Find the progress update after historical stage completes
      const historicalCompleted = progressUpdates.find(
        (p) => p.stages[1].status === 'warning' && p.currentStageIndex === 1
      );
      expect(historicalCompleted).toBeDefined();
    });

    it('never throws even when all stages fail', async () => {
      vi.mocked(yahooFinanceService.fetchQuote).mockRejectedValue(new Error('fail'));
      vi.mocked(yahooFinanceService.fetchHistorical).mockRejectedValue(new Error('fail'));
      vi.mocked(alphaVantageService.fetchFinancials).mockRejectedValue(new Error('fail'));
      vi.mocked(alphaVantageService.fetchOverview).mockRejectedValue(new Error('fail'));
      vi.mocked(technicalIndicatorEngine.computeIndicators).mockReturnValue(null);

      const result = await analyzeStock('AAPL', onProgress);

      expect(result).toHaveProperty('analysisResult');
      expect(result).toHaveProperty('detailedAnalysis');
      expect(result).toHaveProperty('dataSource');
    });
  });

  describe('stage transitions', () => {
    it('sets each stage to loading before executing', async () => {
      await analyzeStock('AAPL', onProgress);

      // Stage 0 should have been set to loading
      const stage0Loading = progressUpdates.find(
        (p) => p.stages[0].status === 'loading' && p.currentStageIndex === 0
      );
      expect(stage0Loading).toBeDefined();

      // Stage 1 should have been set to loading
      const stage1Loading = progressUpdates.find(
        (p) => p.stages[1].status === 'loading' && p.currentStageIndex === 1
      );
      expect(stage1Loading).toBeDefined();
    });

    it('sets stages to success on successful completion', async () => {
      await analyzeStock('AAPL', onProgress);

      const finalProgress = progressUpdates[progressUpdates.length - 1];
      expect(finalProgress.stages[0].status).toBe('success');
      expect(finalProgress.stages[1].status).toBe('success');
      expect(finalProgress.stages[4].status).toBe('success');
    });
  });

  describe('indicators computation', () => {
    it('passes historical prices to computeIndicators', async () => {
      await analyzeStock('AAPL', onProgress);

      const expectedPrices = mockHistorical.map((p) => p.close);
      expect(technicalIndicatorEngine.computeIndicators).toHaveBeenCalledWith(expectedPrices);
    });

    it('marks indicators stage as warning when computeIndicators returns null', async () => {
      vi.mocked(technicalIndicatorEngine.computeIndicators).mockReturnValue(null);

      const result = await analyzeStock('AAPL', onProgress);

      expect(result.dataSource.indicatorsComputed).toBe(false);
      // Find the indicators stage warning
      const indicatorsWarning = progressUpdates.find(
        (p) => p.stages[3].status === 'warning' && p.currentStageIndex === 3
      );
      expect(indicatorsWarning).toBeDefined();
    });

    it('skips indicators when no historical data available', async () => {
      vi.mocked(yahooFinanceService.fetchHistorical).mockRejectedValue(new Error('fail'));

      await analyzeStock('AAPL', onProgress);

      // computeIndicators should not be called since historical data is null
      expect(technicalIndicatorEngine.computeIndicators).not.toHaveBeenCalled();
    });
  });
});
