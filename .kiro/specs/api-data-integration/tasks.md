# Implementation Plan: API Data Integration

## Overview

Replace the mock data layer with real API integrations (Yahoo Finance, Alpha Vantage, Claude AI), adding a caching layer, centralized error handling, client-side technical indicators, multi-step loading UI, and search autocomplete. The implementation follows a bottom-up approach: infrastructure services first, then API services, then orchestration, and finally UI integration.

## Tasks

- [ ] 1. Set up infrastructure services
  - [ ] 1.1 Create ConfigService module
    - Create `src/services/configService.ts`
    - Implement `getApiConfig()` reading from `import.meta.env` for `VITE_ALPHA_VANTAGE_KEY` and `VITE_ANTHROPIC_API_KEY`
    - Implement `isAlphaVantageConfigured()` and `isClaudeConfigured()` helper functions
    - Log `console.warn` when API keys are missing
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 1.2 Create CacheLayer module
    - Create `src/services/cacheLayer.ts`
    - Implement in-memory cache with `get`, `set`, `has`, `invalidate`, `clear` methods
    - Implement TTL-based expiry logic using `Date.now()` comparison
    - Define TTL constants: `QUOTE_TTL=60_000`, `HISTORICAL_TTL=3_600_000`, `FINANCIALS_TTL=86_400_000`, `ANALYSIS_TTL=3_600_000`
    - Use cache key format `${ticker}:${dataType}`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 1.3 Write property tests for CacheLayer
    - **Property 4: Cache round-trip preserves data before TTL expiry**
    - **Property 5: Cache returns null after TTL expiry**
    - **Property 6: Cache key uniqueness**
    - **Validates: Requirements 7.5, 7.6, 7.7**

  - [ ] 1.4 Create ErrorHandler module
    - Create `src/services/errorHandler.ts`
    - Implement `classify(error, context)` that maps HTTP status codes and error types to `ApiError` objects
    - Classify 404 as `NOT_FOUND`, 429 as `RATE_LIMIT`, network/timeout as `NETWORK`, others as `UNKNOWN`
    - Implement `toUserMessage(apiError)` returning user-friendly messages
    - Ensure all `ApiError` objects have non-empty `type`, `message`, and `technicalDetails`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 1.5 Write property tests for ErrorHandler
    - **Property 7: Error classification by HTTP status**
    - **Property 8: Error object structural invariant**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

  - [ ] 1.6 Create `.env.example` file
    - Create `.env.example` at project root documenting `VITE_ALPHA_VANTAGE_KEY` and `VITE_ANTHROPIC_API_KEY`
    - Add comments explaining each variable is optional and the app degrades gracefully without them
    - _Requirements: 9.6_

- [ ] 2. Checkpoint - Ensure infrastructure services compile and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Implement Yahoo Finance Service
  - [ ] 3.1 Create YahooFinanceService module
    - Create `src/services/yahooFinanceService.ts`
    - Implement `fetchQuote(ticker)` that normalizes ticker to uppercase, checks cache, fetches from Yahoo Finance API, maps response to `StockQuote` interface, stores in cache with `QUOTE_TTL`
    - Implement `fetchHistoricalData(ticker, months=12)` that fetches daily adjusted close prices, sorts chronologically, caches with `HISTORICAL_TTL`
    - Implement `searchTickers(query)` that queries Yahoo Finance search API and returns `SearchResult[]`
    - On failure, return fallback data from existing `getAnalysis` function
    - Use 15-second request timeout
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1_

  - [ ]* 3.2 Write property tests for YahooFinanceService
    - **Property 1: Ticker normalization is idempotent and produces uppercase**
    - **Property 2: Yahoo Finance response mapping produces valid AnalysisResult fields**
    - **Property 3: Historical data output is sorted chronologically**
    - **Validates: Requirements 1.4, 1.2, 2.2**

  - [ ]* 3.3 Write unit tests for YahooFinanceService
    - Test quote fetching with mocked API responses
    - Test fallback behavior when API returns errors
    - Test ticker normalization edge cases (lowercase, whitespace, special characters)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4. Implement Alpha Vantage Service
  - [ ] 4.1 Create AlphaVantageService module
    - Create `src/services/alphaVantageService.ts`
    - Implement `fetchFinancialStatements(ticker)` that fetches income statement, balance sheet, and cash flow for 4 annual periods
    - Implement `fetchCompanyOverview(ticker)` that fetches sector, market cap, P/E ratio, profit margin, debt-to-equity
    - Authenticate using `VITE_ALPHA_VANTAGE_KEY` from ConfigService
    - Skip fetching and return fallback data if API key is not configured
    - Handle rate limit errors (HTTP 429) by returning cached data if available
    - Cache financials with `FINANCIALS_TTL` (24 hours)
    - Use 15-second request timeout
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3_

  - [ ]* 4.2 Write unit tests for AlphaVantageService
    - Test financial statement parsing with sample API responses
    - Test behavior when API key is missing
    - Test rate limit handling and cached data fallback
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Implement Technical Indicator Engine
  - [ ] 5.1 Create TechnicalIndicatorEngine module
    - Create `src/services/technicalIndicatorEngine.ts`
    - Install `technicalindicators` npm package
    - Implement `compute(prices)` that calculates EMA-12, EMA-26, RSI-14, and MACD (line, signal, histogram)
    - Return null for indicators that cannot be computed due to insufficient data (< 26 points for EMA-26/MACD, < 14 for RSI)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 5.2 Write property tests for TechnicalIndicatorEngine
    - **Property 9: RSI is bounded between 0 and 100**
    - **Property 10: MACD histogram equals MACD line minus signal line**
    - **Property 11: Insufficient data returns null indicators**
    - **Validates: Requirements 10.2, 10.3, 10.5**

  - [ ]* 5.3 Write unit tests for TechnicalIndicatorEngine
    - Test with known price data and expected indicator values
    - Test edge cases: empty array, single value, exactly 14 values, exactly 26 values
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 6. Implement Claude Analysis Service
  - [ ] 6.1 Create ClaudeAnalysisService module
    - Create `src/services/claudeAnalysisService.ts`
    - Implement `analyze(input: AnalysisInput)` that constructs a structured prompt including ticker, price, financials, and technical indicators
    - Request analysis from Buffett, Munger, Lynch, and Rothschild perspectives
    - Request JSON response matching `AnalysisResult` structure (masterScores, verdict, positionSize, riskLevel, quickFacts)
    - Authenticate using `VITE_ANTHROPIC_API_KEY` from ConfigService
    - Skip analysis and return fallback data if API key is not configured
    - Parse JSON response and map to `AnalysisResult` and `DetailedAnalysis` types
    - On failure, return fallback data from `getAnalysis` + `getDetailedAnalysis`
    - Use 30-second request timeout
    - Cache analysis with `ANALYSIS_TTL` (1 hour)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 6.2 Write property tests for ClaudeAnalysisService
    - **Property 14: Claude prompt includes all provided data**
    - **Validates: Requirements 6.6**

  - [ ]* 6.3 Write unit tests for ClaudeAnalysisService
    - Test prompt construction includes ticker, price, and financial metrics
    - Test JSON response parsing to AnalysisResult structure
    - Test fallback behavior when API key is missing or API fails
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Checkpoint - Ensure all service modules compile and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement Analysis Orchestrator
  - [ ] 8.1 Create AnalysisOrchestrator module
    - Create `src/services/analysisOrchestrator.ts`
    - Implement `analyze(ticker, onProgress)` that coordinates the multi-step fetch sequence:
      1. Fetch quote from Yahoo Finance
      2. Fetch historical data from Yahoo Finance
      3. Compute technical indicators from historical data
      4. Fetch financials and company overview from Alpha Vantage
      5. Send all data to Claude for AI analysis
    - Report progress via `onProgress` callback with stage statuses (pending, loading, complete, error)
    - On individual stage failure, mark stage as error and continue to next stage
    - If all API calls fail, fall back to `getAnalysis` + `getDetailedAnalysis` mock data with `isFallback: true`
    - Return `{ analysisResult, detailedAnalysis, isFallback }` 
    - _Requirements: 11.1, 11.3, 11.4, 12.1, 12.3_

  - [ ]* 8.2 Write property tests for AnalysisOrchestrator
    - **Property 13: Complete fallback on total API failure**
    - **Validates: Requirements 12.1**

  - [ ]* 8.3 Write unit tests for AnalysisOrchestrator
    - Test successful multi-step flow with mocked services
    - Test partial failure (some stages fail, others succeed)
    - Test complete failure triggers full fallback
    - Test progress callback receives correct stage transitions
    - _Requirements: 11.1, 11.3, 11.4, 12.1, 12.3_

- [ ] 9. Implement UI components
  - [ ] 9.1 Create LoadingProgress component
    - Create `src/components/LoadingProgress.tsx`
    - Render a vertical stepper showing stages: Fetching Quote, Fetching Historical Data, Fetching Financials, Analyzing with AI
    - Show spinner for loading stage, checkmark for complete, error icon for failed
    - Highlight current active stage
    - Transition to results display when all stages complete
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 9.2 Create SearchAutocomplete component
    - Create `src/components/SearchAutocomplete.tsx`
    - Implement debounced search (300ms) that triggers after 2+ characters typed
    - Display dropdown with ticker symbol, company name, and exchange for each result
    - On item selection, populate search input and trigger analysis
    - Show "No results found" when search returns empty
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 9.3 Write property tests for SearchAutocomplete threshold
    - **Property 12: Search autocomplete threshold**
    - **Validates: Requirements 3.1**

  - [ ] 9.4 Add fallback data indicator to results display
    - When `isFallback` is true, display a subtle banner/badge informing the user that mock data is being shown
    - _Requirements: 12.2_

- [ ] 10. Integrate orchestrator with AnalyzePage
  - [ ] 10.1 Wire AnalyzePage to use AnalysisOrchestrator
    - Update `src/pages/AnalyzePage.tsx` to call `analysisOrchestrator.analyze()` instead of synchronous mock data functions
    - Pass `onProgress` callback to drive `LoadingProgress` component
    - Display `LoadingProgress` while analysis is in progress
    - Display results (existing components) when analysis completes
    - Show fallback indicator when `isFallback` is true
    - _Requirements: 11.5, 12.2, 12.3_

  - [ ] 10.2 Replace SearchInput with SearchAutocomplete
    - Update `src/pages/AnalyzePage.tsx` to use the new `SearchAutocomplete` component
    - Wire `onSearch` to trigger the orchestrator analysis flow
    - Ensure existing search-by-enter behavior still works
    - _Requirements: 3.3_

- [ ] 11. Final checkpoint - Ensure all tests pass and app compiles
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `technicalindicators` npm package needs to be installed as a dependency in task 5.1
- Yahoo Finance and Alpha Vantage may require a CORS proxy in production; the service layer abstracts this so it's a single-point configuration change
- All services degrade gracefully — the app never breaks even if all APIs are unavailable

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4", "1.6"] },
    { "id": 1, "tasks": ["1.2", "1.5"] },
    { "id": 2, "tasks": ["1.3", "3.1", "5.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "4.1", "5.2", "5.3"] },
    { "id": 4, "tasks": ["4.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "9.1", "9.2"] },
    { "id": 7, "tasks": ["9.3", "9.4", "10.1"] },
    { "id": 8, "tasks": ["10.2"] }
  ]
}
```
