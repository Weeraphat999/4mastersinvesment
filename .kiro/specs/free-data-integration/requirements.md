# Requirements Document

## Introduction

This feature integrates real market data into the 4 Masters Investor app using exclusively free APIs: Yahoo Finance (via CORS proxy, no API key) for stock quotes, historical prices, company info, and ticker search; and Alpha Vantage free tier (25 requests/day, requires VITE_ALPHA_VANTAGE_KEY) for financial statements and company overview. The integration includes localStorage-based persistent caching with TTLs to maximize the limited API budget, centralized error handling with graceful fallback to existing mock data, client-side technical indicator computation, a multi-step loading progress UI, and search autocomplete. No Claude AI is used — the existing rule-based 4 Masters scoring logic is preserved.

## Glossary

- **Yahoo_Finance_Service**: The client-side service module responsible for fetching stock quotes, historical price data, company information, and ticker search results from the Yahoo Finance API via a CORS proxy (corsproxy.io)
- **Alpha_Vantage_Service**: The client-side service module responsible for fetching financial statements (income statement, balance sheet, cash flow) and company overview data from the Alpha Vantage free tier API
- **Cache_Layer**: The localStorage-based persistent caching system that stores API responses with configurable time-to-live (TTL) values to reduce redundant API calls and preserve data across browser sessions
- **Error_Handler**: The centralized module that intercepts API failures and provides user-facing feedback with appropriate fallback behavior
- **Technical_Indicator_Engine**: The client-side module that computes technical indicators (EMA, RSI, MACD) from historical price data using the `technicalindicators` npm package
- **Loading_Progress_UI**: The multi-step loading interface that displays sequential progress through data fetching stages
- **Search_Autocomplete**: The enhanced search component that provides real-time ticker suggestions from the Yahoo Finance search API as the user types
- **TTL**: Time-to-live; the duration a cached entry remains valid before requiring a fresh API call
- **Fallback_Data**: The existing mock/placeholder data returned when an API call fails, ensuring the app remains functional
- **Rate_Limit_Banner**: A warning banner displayed when Alpha Vantage daily request limit is reached, informing the user that cached or mock data is being used
- **Data_Mapper**: The module responsible for transforming raw API responses into the existing AnalysisResult and DetailedAnalysis TypeScript types

## Requirements

### Requirement 1: Yahoo Finance Quote Fetching

**User Story:** As an investor, I want to see real-time stock price data, so that I can make informed investment decisions based on current market conditions.

#### Acceptance Criteria

1. WHEN a user initiates analysis for a valid ticker symbol, THE Yahoo_Finance_Service SHALL fetch the current stock quote including price, price change percentage, market cap, 52-week range, and volume via the corsproxy.io CORS proxy
2. WHEN the Yahoo Finance API returns a successful response, THE Data_Mapper SHALL map the response data to the existing AnalysisResult fields including price, priceChange, and quickFacts (marketCap, weekRange52, sector)
3. IF the Yahoo Finance API returns an error or the request times out after 10 seconds, THEN THE Yahoo_Finance_Service SHALL return Fallback_Data for the requested ticker
4. THE Yahoo_Finance_Service SHALL normalize ticker symbols to uppercase before making API requests
5. THE Yahoo_Finance_Service SHALL operate without requiring any API key or environment variable

### Requirement 2: Yahoo Finance Historical Data

**User Story:** As an investor, I want to view historical price data for stocks, so that I can analyze price trends and patterns over time.

#### Acceptance Criteria

1. WHEN a ticker analysis is requested, THE Yahoo_Finance_Service SHALL fetch historical daily price data for the past 12 months via the corsproxy.io CORS proxy
2. WHEN historical data is successfully retrieved, THE Yahoo_Finance_Service SHALL provide an array of date-price pairs sorted chronologically from oldest to newest
3. IF the historical data request fails, THEN THE Yahoo_Finance_Service SHALL return an empty array and log the error to the browser console
4. THE Yahoo_Finance_Service SHALL request adjusted close prices to account for stock splits and dividends
5. WHEN historical data is successfully retrieved, THE Data_Mapper SHALL map the price points to the TechnicalAnalysis.chartData.pricePoints field in the DetailedAnalysis type

### Requirement 3: Yahoo Finance Ticker Search and Autocomplete

**User Story:** As an investor, I want to search for stocks by name or partial ticker, so that I can quickly find the company I want to analyze.

#### Acceptance Criteria

1. WHEN a user types at least 2 characters in the search input, THE Search_Autocomplete SHALL query the Yahoo Finance search API via the CORS proxy for matching tickers and company names
2. WHEN search results are returned, THE Search_Autocomplete SHALL display a dropdown list showing ticker symbol, company name, and exchange for each match
3. WHEN a user selects an item from the autocomplete dropdown, THE Search_Autocomplete SHALL populate the search input with the selected ticker and trigger analysis
4. WHILE the user is typing, THE Search_Autocomplete SHALL debounce API requests by 300 milliseconds to avoid excessive calls
5. IF the search API returns no results, THEN THE Search_Autocomplete SHALL display a "No results found" message in the dropdown
6. WHEN the search input has fewer than 2 characters, THE Search_Autocomplete SHALL hide the autocomplete dropdown
7. WHEN the user clicks outside the autocomplete dropdown, THE Search_Autocomplete SHALL close the dropdown

### Requirement 4: Alpha Vantage Financial Statements

**User Story:** As an investor, I want to see real financial statements, so that I can evaluate a company's financial health using actual reported data.

#### Acceptance Criteria

1. WHEN a ticker analysis is requested, THE Alpha_Vantage_Service SHALL fetch the income statement, balance sheet, and cash flow statement for the most recent 4 annual periods
2. WHEN financial data is successfully retrieved, THE Data_Mapper SHALL extract key metrics including revenue, net income, total assets, total liabilities, operating cash flow, and free cash flow
3. IF the Alpha Vantage API returns a rate limit error or daily limit exceeded message, THEN THE Error_Handler SHALL display the Rate_Limit_Banner and THE Alpha_Vantage_Service SHALL return cached data if available or Fallback_Data otherwise
4. THE Alpha_Vantage_Service SHALL authenticate requests using the VITE_ALPHA_VANTAGE_KEY environment variable
5. IF the VITE_ALPHA_VANTAGE_KEY environment variable is not configured, THEN THE Alpha_Vantage_Service SHALL skip financial data fetching and return Fallback_Data without displaying an error to the user
6. WHEN financial data is successfully retrieved, THE Data_Mapper SHALL map the metrics to the BuffettAnalysis.financialQuality and LynchAnalysis.pegAnalysis fields in the DetailedAnalysis type

### Requirement 5: Alpha Vantage Company Overview

**User Story:** As an investor, I want to see company overview data such as P/E ratio, profit margin, and sector classification, so that I can quickly assess fundamental metrics.

#### Acceptance Criteria

1. WHEN a ticker analysis is requested, THE Alpha_Vantage_Service SHALL fetch the company overview including sector, market capitalization, P/E ratio, profit margin, debt-to-equity ratio, and PEG ratio
2. WHEN company overview data is successfully retrieved, THE Data_Mapper SHALL map the data to the AnalysisResult.quickFacts fields (marketCap, sector, profitMargin, debtEquity, priceSales)
3. IF the company overview request fails due to rate limiting, THEN THE Alpha_Vantage_Service SHALL use data from the Yahoo Finance quote response as a partial fallback
4. IF the company overview request fails for a non-rate-limit reason, THEN THE Alpha_Vantage_Service SHALL return Fallback_Data for the overview fields

### Requirement 6: Alpha Vantage Rate Limit Handling

**User Story:** As a user, I want to be informed when the daily API limit is reached, so that I understand why some data may be cached or estimated.

#### Acceptance Criteria

1. WHEN the Alpha Vantage API returns a rate limit response, THE Rate_Limit_Banner SHALL display a warning message indicating that the daily limit of 25 requests has been reached
2. WHILE the Rate_Limit_Banner is displayed, THE application SHALL continue to function using cached data from localStorage or Fallback_Data
3. THE Rate_Limit_Banner SHALL provide a dismiss action allowing the user to close the banner
4. THE Rate_Limit_Banner SHALL not block user interaction with the rest of the application

### Requirement 7: localStorage Caching Layer

**User Story:** As a user, I want the app to cache API responses persistently, so that repeated lookups are fast, data survives page refreshes, and the limited 25 requests/day budget is preserved.

#### Acceptance Criteria

1. THE Cache_Layer SHALL store Yahoo Finance quote responses in localStorage with a TTL of 1 minute
2. THE Cache_Layer SHALL store Yahoo Finance historical data responses in localStorage with a TTL of 1 hour
3. THE Cache_Layer SHALL store Alpha Vantage financial statement and company overview responses in localStorage with a TTL of 24 hours
4. WHEN a cached entry exists in localStorage and has not expired, THE Cache_Layer SHALL return the cached data without making an API call
5. WHEN a cached entry has expired, THE Cache_Layer SHALL remove the entry from localStorage and allow a fresh API call
6. THE Cache_Layer SHALL use the ticker symbol combined with the data type as the cache key to prevent collisions
7. THE Cache_Layer SHALL store the timestamp of each cache entry alongside the data to enable TTL expiration checks
8. IF localStorage is full or unavailable, THEN THE Cache_Layer SHALL fall back to in-memory caching for the current session and log a warning to the console

### Requirement 8: Centralized Error Handling

**User Story:** As a user, I want clear and helpful error messages when something goes wrong, so that I understand what happened and what I can do about it.

#### Acceptance Criteria

1. IF an API returns a "not found" response (HTTP 404 or equivalent), THEN THE Error_Handler SHALL display a message indicating the ticker symbol was not recognized
2. IF a network error occurs (timeout, DNS failure, connection refused, CORS proxy failure), THEN THE Error_Handler SHALL display a message indicating a network connectivity issue
3. IF an unexpected API error occurs, THEN THE Error_Handler SHALL display a generic error message and log the full error details to the browser console
4. THE Error_Handler SHALL provide a consistent error object structure containing error type, user-facing message, and technical details
5. WHEN any API call fails, THE Error_Handler SHALL trigger fallback to Fallback_Data so the user can still view analysis results

### Requirement 9: Environment Variable Configuration

**User Story:** As a developer, I want the Alpha Vantage API key stored in an environment variable, so that the secret is not committed to version control.

#### Acceptance Criteria

1. THE Alpha_Vantage_Service SHALL read the API key from the VITE_ALPHA_VANTAGE_KEY environment variable
2. THE Yahoo_Finance_Service SHALL operate without any API key
3. IF the VITE_ALPHA_VANTAGE_KEY environment variable is missing, THEN THE Alpha_Vantage_Service SHALL log a warning to the console indicating the API key is not configured and proceed with Fallback_Data for financial endpoints
4. THE application SHALL include a `.env.example` file documenting the VITE_ALPHA_VANTAGE_KEY variable with instructions for obtaining a free key
5. THE application SHALL not require any other environment variables for the free data integration feature

### Requirement 10: Client-Side Technical Indicators

**User Story:** As an investor, I want to see technical indicators computed from real price data, so that I can assess timing and momentum for potential trades.

#### Acceptance Criteria

1. WHEN historical price data is available, THE Technical_Indicator_Engine SHALL compute the Exponential Moving Average (EMA) for 12-day and 26-day periods
2. WHEN historical price data is available, THE Technical_Indicator_Engine SHALL compute the Relative Strength Index (RSI) for a 14-day period
3. WHEN historical price data is available, THE Technical_Indicator_Engine SHALL compute the MACD line (12-day EMA minus 26-day EMA), signal line (9-day EMA of MACD), and histogram (MACD minus signal)
4. THE Technical_Indicator_Engine SHALL use the `technicalindicators` npm package for all indicator computations
5. IF historical price data is unavailable or contains fewer than 26 data points, THEN THE Technical_Indicator_Engine SHALL return null for indicators that cannot be computed
6. WHEN technical indicators are computed, THE Data_Mapper SHALL map the results to the TechnicalAnalysis.signals array in the DetailedAnalysis type

### Requirement 11: Multi-Step Loading Progress UI

**User Story:** As a user, I want to see which step of the analysis is currently in progress, so that I understand the app is working and how long it might take.

#### Acceptance Criteria

1. WHEN an analysis is initiated, THE Loading_Progress_UI SHALL display a multi-step progress indicator showing the stages: Fetching Quote, Fetching Historical Data, Fetching Financials, Computing Indicators, and Scoring Analysis
2. WHILE a stage is in progress, THE Loading_Progress_UI SHALL highlight the current stage and show a loading animation
3. WHEN a stage completes successfully, THE Loading_Progress_UI SHALL mark the stage as complete with a success indicator
4. IF a stage fails, THEN THE Loading_Progress_UI SHALL mark the stage with a warning indicator and continue to the next stage
5. WHEN all stages are complete, THE Loading_Progress_UI SHALL transition to displaying the analysis results

### Requirement 12: Graceful Fallback to Mock Data

**User Story:** As a user, I want the app to still work even if APIs are unavailable, so that I can always access analysis functionality.

#### Acceptance Criteria

1. IF all API calls for a ticker fail, THEN THE application SHALL fall back to the existing mock data generation using the getAnalysis and getDetailedAnalysis functions from the src/data directory
2. WHEN Fallback_Data is used for any portion of the analysis, THE application SHALL display a subtle indicator informing the user that some data is estimated or from mock sources
3. THE application SHALL attempt real API calls first and only use Fallback_Data when the API call fails or the cache is empty
4. WHEN partial data is available (Yahoo Finance succeeds but Alpha Vantage fails), THE Data_Mapper SHALL merge real data with Fallback_Data to produce a complete AnalysisResult and DetailedAnalysis

### Requirement 13: Data Mapping to Existing Types

**User Story:** As a developer, I want API responses mapped to existing TypeScript types, so that the rest of the application continues to work without modification.

#### Acceptance Criteria

1. THE Data_Mapper SHALL produce a complete AnalysisResult object from combined Yahoo Finance and Alpha Vantage data, filling all required fields
2. THE Data_Mapper SHALL produce a complete DetailedAnalysis object including BuffettAnalysis, MungerAnalysis, LynchAnalysis, RothschildAnalysis, and TechnicalAnalysis using the existing rule-based 4 Masters scoring logic
3. THE Data_Mapper SHALL preserve the existing rule-based scoring algorithms for masterScores (buffett, munger, lynch, rothschild) without introducing AI-based analysis
4. IF any required field cannot be determined from API data, THEN THE Data_Mapper SHALL use a sensible default value or data from the Fallback_Data source
5. THE Data_Mapper SHALL populate the AnalysisResult.companyName field from the Yahoo Finance quote or search response

### Requirement 14: CORS Proxy Configuration

**User Story:** As a developer, I want Yahoo Finance API calls routed through a CORS proxy, so that the app works client-side without a backend server.

#### Acceptance Criteria

1. THE Yahoo_Finance_Service SHALL route all API requests through the corsproxy.io CORS proxy to bypass browser same-origin restrictions
2. THE Yahoo_Finance_Service SHALL construct proxy URLs by prepending the CORS proxy base URL to the Yahoo Finance API endpoint
3. IF the CORS proxy is unavailable or returns an error, THEN THE Yahoo_Finance_Service SHALL treat the request as failed and trigger the Error_Handler fallback flow
