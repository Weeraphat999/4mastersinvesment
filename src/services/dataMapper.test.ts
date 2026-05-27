import { describe, it, expect } from 'vitest';
import { mapToAnalysisResult, mapToDetailedAnalysis, RawApiData } from './dataMapper';
import type { YahooQuoteResponse, YahooHistoricalPoint } from './yahooFinanceService';
import type { AlphaVantageFinancials, AlphaVantageOverview } from './alphaVantageService';
import type { IndicatorResults } from './technicalIndicatorEngine';

// --- Test fixtures ---

const mockQuote: YahooQuoteResponse = {
  symbol: 'AAPL',
  shortName: 'Apple Inc.',
  longName: 'Apple Inc.',
  regularMarketPrice: 175.50,
  regularMarketChangePercent: 1.25,
  marketCap: 2_800_000_000_000,
  fiftyTwoWeekLow: 124.17,
  fiftyTwoWeekHigh: 198.23,
  regularMarketVolume: 55_000_000,
  sector: 'Technology',
};

const mockOverview: AlphaVantageOverview = {
  Symbol: 'AAPL',
  Name: 'Apple Inc',
  Sector: 'Technology',
  MarketCapitalization: '2800000000000',
  PERatio: '28.5',
  ProfitMargin: '0.253',
  DebtToEquityRatio: '1.87',
  PEGRatio: '2.1',
  PriceToSalesRatioTTM: '7.5',
};

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
    {
      fiscalDateEnding: '2022-09-30',
      totalRevenue: '394328000000',
      netIncome: '99803000000',
      totalAssets: '352755000000',
      totalLiabilities: '302083000000',
      operatingCashflow: '122151000000',
      capitalExpenditures: '10708000000',
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

const mockHistorical: YahooHistoricalPoint[] = [
  { date: '2023-01-03', close: 125.07 },
  { date: '2023-02-01', close: 145.43 },
  { date: '2023-03-01', close: 148.50 },
  { date: '2023-04-03', close: 164.90 },
  { date: '2023-05-01', close: 169.59 },
  { date: '2023-06-01', close: 180.95 },
  { date: '2023-07-03', close: 193.97 },
  { date: '2023-08-01', close: 195.60 },
  { date: '2023-09-01', close: 171.21 },
  { date: '2023-10-02', close: 171.00 },
  { date: '2023-11-01', close: 176.65 },
  { date: '2023-12-01', close: 175.50 },
];

const mockIndicators: IndicatorResults = {
  ema12: [150, 155, 160, 165, 170, 172, 174, 175],
  ema26: [145, 148, 152, 156, 160, 163, 166, 168],
  rsi14: [45, 50, 55, 60, 58, 62, 55, 53],
  macd: {
    macdLine: [5, 7, 8, 9, 10, 9, 8, 7],
    signalLine: [4, 5, 6, 7, 8, 8, 8, 7.5],
    histogram: [1, 2, 2, 2, 2, 1, 0, -0.5],
  },
};

// --- Tests ---

describe('dataMapper', () => {
  describe('mapToAnalysisResult', () => {
    it('returns a complete AnalysisResult with all API data available', () => {
      const raw: RawApiData = {
        quote: mockQuote,
        historical: mockHistorical,
        financials: mockFinancials,
        overview: mockOverview,
        indicators: mockIndicators,
      };

      const result = mapToAnalysisResult('AAPL', raw);

      expect(result.ticker).toBe('AAPL');
      expect(result.companyName).toBe('Apple Inc.');
      expect(result.price).toBe(175.50);
      expect(result.priceChange).toBe(1.25);
      expect(result.quickFacts.marketCap).toBe('$2.8T');
      expect(result.quickFacts.weekRange52).toBe('$124.17 - $198.23');
      expect(result.quickFacts.sector).toBe('Technology');
      expect(result.quickFacts.profitMargin).toBe('25.3%');
      expect(result.quickFacts.debtEquity).toBe('1.9');
      expect(result.quickFacts.priceSales).toBe('7.5x');
    });

    it('maps Yahoo quote → price, priceChange, companyName', () => {
      const raw: RawApiData = {
        quote: mockQuote,
        historical: null,
        financials: null,
        overview: null,
        indicators: null,
      };

      const result = mapToAnalysisResult('AAPL', raw);

      expect(result.price).toBe(175.50);
      expect(result.priceChange).toBe(1.25);
      expect(result.companyName).toBe('Apple Inc.');
    });

    it('maps Alpha overview → quickFacts (profitMargin, debtEquity, priceSales)', () => {
      const raw: RawApiData = {
        quote: null,
        historical: null,
        financials: null,
        overview: mockOverview,
        indicators: null,
      };

      const result = mapToAnalysisResult('AAPL', raw);

      expect(result.quickFacts.profitMargin).toBe('25.3%');
      expect(result.quickFacts.debtEquity).toBe('1.9');
      expect(result.quickFacts.priceSales).toBe('7.5x');
    });

    it('falls back to getAnalysis() when all API data is null', () => {
      const raw: RawApiData = {
        quote: null,
        historical: null,
        financials: null,
        overview: null,
        indicators: null,
      };

      const result = mapToAnalysisResult('AAPL', raw);

      // Should still return a complete object
      expect(result.ticker).toBe('AAPL');
      expect(result.companyName).toBeDefined();
      expect(result.price).toBeGreaterThan(0);
      expect(result.masterScores).toBeDefined();
      expect(result.masterScores.buffett).toBeGreaterThanOrEqual(0);
      expect(result.masterScores.munger).toBeGreaterThanOrEqual(0);
      expect(result.masterScores.lynch).toBeGreaterThanOrEqual(0);
      expect(result.masterScores.rothschild).toBeGreaterThanOrEqual(0);
      expect(result.quickFacts.marketCap).toBeDefined();
      expect(result.quickFacts.sector).toBeDefined();
    });

    it('preserves existing rule-based scoring logic from fallback', () => {
      const raw: RawApiData = {
        quote: mockQuote,
        historical: null,
        financials: null,
        overview: null,
        indicators: null,
      };

      const result = mapToAnalysisResult('AAPL', raw);

      // Scores should come from fallback (existing scoring logic)
      expect(result.masterScores.buffett).toBeGreaterThanOrEqual(0);
      expect(result.masterScores.buffett).toBeLessThanOrEqual(10);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(10);
      expect(result.verdict).toBeDefined();
      expect(result.verdict.length).toBeGreaterThan(0);
    });

    it('no field is undefined or null in the result', () => {
      const raw: RawApiData = {
        quote: mockQuote,
        historical: mockHistorical,
        financials: mockFinancials,
        overview: mockOverview,
        indicators: mockIndicators,
      };

      const result = mapToAnalysisResult('AAPL', raw);

      expect(result.ticker).not.toBeNull();
      expect(result.companyName).not.toBeNull();
      expect(result.price).not.toBeNull();
      expect(result.priceChange).not.toBeNull();
      expect(result.verdict).not.toBeNull();
      expect(result.positionSize).not.toBeNull();
      expect(result.entryStrategy).not.toBeNull();
      expect(result.riskLevel).not.toBeNull();
      expect(result.timeHorizon).not.toBeNull();
      expect(result.masterScores).not.toBeNull();
      expect(result.overallScore).not.toBeNull();
      expect(result.quickFacts).not.toBeNull();
      expect(result.quickFacts.marketCap).not.toBeNull();
      expect(result.quickFacts.priceSales).not.toBeNull();
      expect(result.quickFacts.cashRunway).not.toBeNull();
      expect(result.quickFacts.sector).not.toBeNull();
      expect(result.quickFacts.weekRange52).not.toBeNull();
      expect(result.quickFacts.moat).not.toBeNull();
      expect(result.quickFacts.profitMargin).not.toBeNull();
      expect(result.quickFacts.debtEquity).not.toBeNull();
    });

    it('uses overview market cap when quote market cap is 0', () => {
      const quoteNoMarketCap: YahooQuoteResponse = {
        ...mockQuote,
        marketCap: 0,
      };
      const raw: RawApiData = {
        quote: quoteNoMarketCap,
        historical: null,
        financials: null,
        overview: mockOverview,
        indicators: null,
      };

      const result = mapToAnalysisResult('AAPL', raw);

      expect(result.quickFacts.marketCap).toBe('$2.8T');
    });
  });

  describe('mapToDetailedAnalysis', () => {
    it('returns a complete DetailedAnalysis with all API data available', () => {
      const raw: RawApiData = {
        quote: mockQuote,
        historical: mockHistorical,
        financials: mockFinancials,
        overview: mockOverview,
        indicators: mockIndicators,
      };

      const result = mapToDetailedAnalysis('AAPL', raw);

      expect(result.buffettAnalysis).toBeDefined();
      expect(result.mungerAnalysis).toBeDefined();
      expect(result.lynchAnalysis).toBeDefined();
      expect(result.rothschildAnalysis).toBeDefined();
      expect(result.technicalAnalysis).toBeDefined();
    });

    it('maps Alpha financials → BuffettAnalysis.financialQuality', () => {
      const raw: RawApiData = {
        quote: null,
        historical: null,
        financials: mockFinancials,
        overview: null,
        indicators: null,
      };

      const result = mapToDetailedAnalysis('AAPL', raw);

      expect(result.buffettAnalysis.financialQuality.length).toBeGreaterThan(0);
      const metricNames = result.buffettAnalysis.financialQuality.map((m) => m.name);
      expect(metricNames).toContain('Revenue Growth');
      expect(metricNames).toContain('Free Cash Flow');
    });

    it('maps Alpha overview → LynchAnalysis.pegAnalysis', () => {
      const raw: RawApiData = {
        quote: null,
        historical: null,
        financials: null,
        overview: mockOverview,
        indicators: null,
      };

      const result = mapToDetailedAnalysis('AAPL', raw);

      expect(result.lynchAnalysis.pegAnalysis.pe).toBe(29); // rounded from 28.5
      expect(result.lynchAnalysis.pegAnalysis.peg).toBe(2.1);
      expect(result.lynchAnalysis.pegAnalysis.growthRate).toBeGreaterThan(0);
      expect(result.lynchAnalysis.pegAnalysis.assessment).toContain('PEG above 2.0');
    });

    it('maps historical prices → TechnicalAnalysis.chartData.pricePoints', () => {
      const raw: RawApiData = {
        quote: null,
        historical: mockHistorical,
        financials: null,
        overview: null,
        indicators: null,
      };

      const result = mapToDetailedAnalysis('AAPL', raw);

      expect(result.technicalAnalysis.chartData.pricePoints.length).toBe(mockHistorical.length);
      expect(result.technicalAnalysis.chartData.pricePoints[0]).toBe(125.07);
      // Support is 20th percentile of sorted prices, resistance is 80th percentile
      const sortedPrices = [...mockHistorical.map(p => p.close)].sort((a, b) => a - b);
      const p20Index = Math.floor(sortedPrices.length * 0.2);
      const p80Index = Math.floor(sortedPrices.length * 0.8);
      expect(result.technicalAnalysis.chartData.supportLevel).toBeCloseTo(sortedPrices[p20Index], 1);
      expect(result.technicalAnalysis.chartData.resistanceLevel).toBeCloseTo(sortedPrices[p80Index], 1);
    });

    it('maps indicators → TechnicalAnalysis.signals', () => {
      const raw: RawApiData = {
        quote: null,
        historical: null,
        financials: null,
        overview: null,
        indicators: mockIndicators,
      };

      const result = mapToDetailedAnalysis('AAPL', raw);

      expect(result.technicalAnalysis.signals.length).toBeGreaterThan(0);
      const signalNames = result.technicalAnalysis.signals.map((s) => s.name);
      expect(signalNames).toContain('EMA Crossover');
      expect(signalNames).toContain('RSI (14)');
      expect(signalNames).toContain('MACD');
    });

    it('falls back to getDetailedAnalysis() when all API data is null', () => {
      const raw: RawApiData = {
        quote: null,
        historical: null,
        financials: null,
        overview: null,
        indicators: null,
      };

      const result = mapToDetailedAnalysis('AAPL', raw);

      // Should still return a complete object with all sub-analyses
      expect(result.buffettAnalysis).toBeDefined();
      expect(result.buffettAnalysis.businessUnderstanding).toBeDefined();
      expect(result.buffettAnalysis.competitiveMoat).toBeDefined();
      expect(result.buffettAnalysis.financialQuality).toBeDefined();
      expect(result.buffettAnalysis.managementQuality).toBeDefined();
      expect(result.buffettAnalysis.valuation).toBeDefined();
      expect(result.mungerAnalysis.failureScenarios).toBeDefined();
      expect(result.mungerAnalysis.mentalModels).toBeDefined();
      expect(result.lynchAnalysis.pegAnalysis).toBeDefined();
      expect(result.rothschildAnalysis.bloodInStreets).toBeDefined();
      expect(result.technicalAnalysis.signals).toBeDefined();
      expect(result.technicalAnalysis.chartData).toBeDefined();
    });

    it('preserves existing rule-based scoring logic', () => {
      const raw: RawApiData = {
        quote: mockQuote,
        historical: mockHistorical,
        financials: mockFinancials,
        overview: mockOverview,
        indicators: mockIndicators,
      };

      const result = mapToDetailedAnalysis('AAPL', raw);

      // Munger and Rothschild analyses should be preserved from fallback
      expect(result.mungerAnalysis.failureScenarios.length).toBeGreaterThan(0);
      expect(result.mungerAnalysis.mentalModels.length).toBeGreaterThan(0);
      expect(result.rothschildAnalysis.contrarianSignals.length).toBeGreaterThan(0);
      expect(result.rothschildAnalysis.bloodInStreets.bloodLevel).toBeGreaterThanOrEqual(0);
    });

    it('updates timing score based on computed indicators', () => {
      const raw: RawApiData = {
        quote: null,
        historical: null,
        financials: null,
        overview: null,
        indicators: mockIndicators,
      };

      const result = mapToDetailedAnalysis('AAPL', raw);

      // Timing score should be derived from indicator signals
      expect(result.technicalAnalysis.timingScore).toBeGreaterThanOrEqual(0);
      expect(result.technicalAnalysis.timingScore).toBeLessThanOrEqual(16);
      expect(['BUY NOW', 'WAIT', 'AVOID']).toContain(
        result.technicalAnalysis.timingVerdict.recommendation
      );
    });
  });
});
