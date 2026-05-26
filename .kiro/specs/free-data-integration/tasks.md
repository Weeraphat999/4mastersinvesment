# Implementation Plan: Free Data Integration

## Overview

Replace the mock-only data layer with real market data from Yahoo Finance (via corsproxy.io) and Alpha Vantage free tier. Implementation follows a bottom-up approach: install dependencies → service layer (cache, error handler, API clients, indicators, mapper, orchestrator) → UI components → wire into existing pages.

## Tasks

- [x] 1. Install dependencies and set up service layer foundation
  - [x] 1.1 Install `technicalindicators` npm package and create `src/services/types.ts` with shared service types
    - Install `technicalindicators` package
    - Create `src/services/types.ts` defining `CacheEntry<T>`, `DataSourceInfo`, `AnalysisStage`, `ApiErrorType`, `ApiError`, `AnalysisProgress`, `AnalysisOrchestratorResult`
    - Create `.env.example` file documenting `VITE_ALPHA_VANTAGE_KEY` with instructions
    - _Requirements: 9.4, 9.5_

  - [x] 1.2 Implement `src/services/cacheLayer.ts` — localStorage cache with TTL
    - Implement `buildCacheKey(ticker, dataType)` using `fdi:{TICKER}:{dataType}` format
    - Implement `get<T>(ticker, dataType)` that checks TTL expiration before returning
    - Implement `set<T>(ticker, dataType, data)` that stores data with `Date.now()` timestamp
    - Implement `isExpired(entry, dataType)` using TTL_CONFIG (quote: 1min, historical: 1hr, financials: 24hr, overview: 24hr)
    - Implement `clear(ticker?)` to remove cache entries
    - Add in-memory `Map` fallback when localStorage throws (quota exceeded, private browsing)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 1.3 Write property tests for CacheLayer
    - **Property 2: Cache TTL correctness** — Generate random timestamps and TTL offsets, verify cache hit/miss logic
    - **Property 3: Cache key uniqueness** — Generate pairs of (ticker, dataType), verify distinct inputs produce distinct keys
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

  - [x] 1.4 Implement `src/services/errorHandler.ts` — error classification
    - Implement `classifyError(error, context?)` returning `ApiError` with type, message, and technical fields
    - Implement `isNetworkError(error)`, `isTimeoutError(error)`, `isNotFoundError(status)` helpers
    - Map error types to user-facing messages per design table (NOT_FOUND, NETWORK, RATE_LIMIT, TIMEOUT, UNKNOWN)
    - Log technical details to `console.error`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 1.5 Write property test for ErrorHandler
    - **Property 4: Error handler structural consistency** — Generate various error inputs (Error objects, strings, numbers, unknown), verify output always has type, message (non-empty), and technical (non-empty)
    - **Validates: Requirements 8.2, 8.4**

- [x] 2. Implement API service clients
  - [x] 2.1 Implement `src/services/yahooFinanceService.ts` — Yahoo Finance API client
    - Define constants: `CORS_PROXY_BASE`, `YAHOO_BASE_URL`, `REQUEST_TIMEOUT_MS = 10000`
    - Implement `fetchQuote(ticker)` — normalize ticker to uppercase, construct proxy URL, fetch with AbortController timeout, parse response to `YahooQuoteResponse`
    - Implement `fetchHistorical(ticker)` — fetch 12 months of adjusted close prices, return `YahooHistoricalPoint[]` sorted ascending by date
    - Implement `searchTickers(query)` — search Yahoo Finance for matching tickers, return `YahooSearchResult[]`
    - All functions use `CORS_PROXY_BASE + encodeURIComponent(YAHOO_BASE_URL + path)` URL pattern
    - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 14.1, 14.2, 14.3_

  - [ ]* 2.2 Write property tests for YahooFinanceService
    - **Property 1: Ticker normalization idempotence** — Generate arbitrary strings, verify normalization is idempotent and produces uppercase
    - **Property 8: Historical data chronological ordering** — Generate random date-price arrays, verify output is sorted ascending
    - **Property 12: Proxy URL construction correctness** — Generate random path strings, verify URL construction and validity via `new URL()`
    - **Validates: Requirements 1.4, 2.2, 14.1, 14.2**

  - [x] 2.3 Implement `src/services/alphaVantageService.ts` — Alpha Vantage API client
    - Read API key from `import.meta.env.VITE_ALPHA_VANTAGE_KEY`
    - Implement `fetchFinancials(ticker)` — fetch income statement, balance sheet, cash flow for 4 annual periods; return `AlphaVantageFinancials | null`
    - Implement `fetchOverview(ticker)` — fetch company overview; return `AlphaVantageOverview | null`
    - Implement `isRateLimited(response)` — detect Alpha Vantage rate limit JSON note
    - Return `null` if API key is not configured (no error shown, log warning)
    - _Requirements: 4.1, 4.4, 4.5, 5.1, 6.1, 9.1, 9.3_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement technical indicators and data mapper
  - [x] 4.1 Implement `src/services/technicalIndicatorEngine.ts` — EMA, RSI, MACD computation
    - Import `EMA`, `RSI`, `MACD` from `technicalindicators`
    - Implement `computeIndicators(prices)` returning `IndicatorResults | null`
    - Return `null` if prices array has fewer than 26 data points
    - Compute EMA-12, EMA-26, RSI-14, MACD (fast=12, slow=26, signal=9)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 4.2 Write property tests for TechnicalIndicatorEngine
    - **Property 9: RSI range invariant** — Generate random price arrays (length >= 15), verify all RSI values ∈ [0, 100]
    - **Property 10: MACD histogram invariant** — Generate random price arrays (length >= 35), verify histogram[i] = macdLine[i] - signalLine[i] (±0.0001)
    - **Property 11: Insufficient data returns null** — Generate random price arrays (length < 26), verify null return
    - **Validates: Requirements 10.2, 10.3, 10.5**

  - [x] 4.3 Implement `src/services/dataMapper.ts` — API response to existing types
    - Implement `mapToAnalysisResult(ticker, raw)` — map Yahoo quote + Alpha overview to `AnalysisResult`, fill missing fields from `getAnalysis(ticker)` fallback
    - Implement `mapToDetailedAnalysis(ticker, raw)` — map financials + indicators to `DetailedAnalysis`, fill missing sub-analyses from `getDetailedAnalysis(ticker)` fallback
    - Map Yahoo quote → price, priceChange, companyName, quickFacts (marketCap, weekRange52, sector)
    - Map Alpha overview → quickFacts (profitMargin, debtEquity, priceSales)
    - Map Alpha financials → BuffettAnalysis.financialQuality, LynchAnalysis.pegAnalysis
    - Map historical prices → TechnicalAnalysis.chartData.pricePoints
    - Map indicators → TechnicalAnalysis.signals
    - Preserve existing rule-based 4 Masters scoring logic
    - _Requirements: 1.2, 2.5, 4.2, 4.6, 5.2, 10.6, 12.4, 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 4.4 Write property tests for DataMapper
    - **Property 6: Data mapper produces complete AnalysisResult** — Generate random partial API data (some sources null), verify all AnalysisResult fields are populated (no undefined/null)
    - **Property 7: Data mapper produces complete DetailedAnalysis** — Generate random partial API data, verify all five sub-analyses present with required fields
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**

- [x] 5. Implement analysis orchestrator
  - [x] 5.1 Implement `src/services/analysisOrchestrator.ts` — multi-step pipeline coordinator
    - Implement `analyzeStock(ticker, onProgress)` coordinating the full pipeline
    - Define 5 stages: Fetching Quote, Fetching Historical Data, Fetching Financials, Computing Indicators, Scoring Analysis
    - Check cache before each API call; update cache on success
    - Report progress via `onProgress` callback at each stage transition
    - Handle partial failures: mark stage as 'warning' and continue to next
    - Delegate to DataMapper for final result assembly
    - Return `AnalysisOrchestratorResult` with `dataSource` flags indicating live/cached/fallback per source
    - _Requirements: 1.1, 1.3, 2.1, 4.1, 5.1, 7.4, 8.5, 11.1, 11.4, 12.1, 12.3_

  - [ ]* 5.2 Write property test for AnalysisOrchestrator
    - **Property 5: Fallback completeness** — Generate random tickers with mocked failing services (all combinations of failures), verify a valid AnalysisResult is always produced with all required fields populated
    - **Validates: Requirements 1.3, 8.5, 12.1, 12.4**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement UI components
  - [x] 7.1 Implement `src/components/SearchAutocomplete.tsx` — enhanced search with dropdown
    - Accept `value`, `onChange`, `onSearch` props
    - Debounce Yahoo Finance search API calls by 300ms using `useRef` timer
    - Show dropdown when input has 2+ characters and results are available
    - Hide dropdown when input < 2 chars or user clicks outside (via `useEffect` click listener)
    - Display ticker symbol, company name, and exchange for each result
    - Show "No results found" when API returns empty array
    - Selecting an item populates input and triggers `onSearch`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 7.2 Implement `src/components/LoadingProgress.tsx` — multi-step progress indicator
    - Accept `stages` and `currentStageIndex` props
    - Render 5 stages vertically with status icons (gray circle=pending, spinning blue=loading, green checkmark=success, yellow warning=warning)
    - Animate transitions between stages
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 7.3 Implement `src/components/RateLimitBanner.tsx` — rate limit warning banner
    - Accept `visible` and `onDismiss` props
    - Fixed-position banner at top of page (below nav) with yellow/amber styling
    - Dismiss button (×) to close
    - Does NOT block interaction (no overlay, no pointer-events blocking)
    - Message: "Daily API limit reached (25 requests). Showing cached or estimated data."
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 7.4 Implement `src/components/FallbackIndicator.tsx` — data source indicator badge
    - Accept `dataSource: DataSourceInfo` prop
    - Show "Live data" (green), "Cached data" (blue), or "Estimated data" (gray) badge
    - Only visible when at least one source is not 'live'
    - _Requirements: 12.2_

  - [ ]* 7.5 Write unit tests for UI components
    - Test SearchAutocomplete: renders input, shows dropdown at 2+ chars, hides at <2 chars, debounces 300ms, selects item, shows "No results", closes on outside click
    - Test LoadingProgress: renders 5 stages, highlights current, shows success/warning icons
    - Test RateLimitBanner: shows when visible=true, hides on dismiss, doesn't block interaction
    - Test FallbackIndicator: shows correct badge per data source combination
    - _Requirements: 3.1–3.7, 6.1–6.4, 11.1–11.5, 12.2_

- [x] 8. Wire components into existing pages
  - [x] 8.1 Update `src/pages/AnalyzePage.tsx` to use AnalysisOrchestrator
    - Replace direct mock data calls with `analyzeStock()` from orchestrator
    - Add state for `AnalysisProgress`, `DataSourceInfo`, and `rateLimitVisible`
    - Show `LoadingProgress` during analysis
    - Show `RateLimitBanner` when rate limit detected
    - Show `FallbackIndicator` near results
    - Transition from loading to results when all stages complete
    - _Requirements: 1.1, 11.1, 11.5, 12.1, 12.2_

  - [x] 8.2 Replace `SearchInput` with `SearchAutocomplete` in AnalyzePage
    - Swap existing `SearchInput` component for `SearchAutocomplete`
    - Wire `onSearch` to trigger `analyzeStock()` with selected ticker
    - Ensure Enter key still triggers analysis (backward compatible)
    - _Requirements: 3.1, 3.3_

  - [ ]* 8.3 Write integration tests for the full analysis flow
    - Test end-to-end flow: search → loading → results with mocked fetch
    - Test rate limit banner appears when Alpha Vantage returns limit response
    - Test fallback indicator shows correct state for mixed data sources
    - Test cache persists across simulated page refreshes (localStorage mock)
    - _Requirements: 1.1, 6.1, 7.4, 12.1, 12.2_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `technicalindicators` package handles all indicator math — no custom implementations
- All API calls go through corsproxy.io — no backend required
- The app works without `VITE_ALPHA_VANTAGE_KEY` — Yahoo Finance + fallback data covers the core flow

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.4"] },
    { "id": 2, "tasks": ["1.3", "1.5", "2.1", "2.3"] },
    { "id": 3, "tasks": ["2.2", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["4.4", "5.1"] },
    { "id": 6, "tasks": ["5.2", "7.1", "7.2", "7.3", "7.4"] },
    { "id": 7, "tasks": ["7.5", "8.1"] },
    { "id": 8, "tasks": ["8.2"] },
    { "id": 9, "tasks": ["8.3"] }
  ]
}
```
