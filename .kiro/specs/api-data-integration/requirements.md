# Requirements Document

## Introduction

This feature replaces the mock/placeholder data layer in the 4 Masters Investor app with real data from three external APIs: Yahoo Finance (stock quotes, historical prices, company info, ticker search), Alpha Vantage (financial statements and company overview), and Claude AI (AI-powered stock analysis from 4 master investor perspectives). It includes a caching layer with configurable TTLs, centralized error handling, client-side technical indicator computation, a multi-step loading UI, and search autocomplete integration.

## Glossary

- **Yahoo_Finance_Service**: The client-side service module responsible for fetching stock quotes, historical price data, company information, and ticker search results from the Yahoo Finance API
- **Alpha_Vantage_Service**: The client-side service module responsible for fetching financial statements (income statement, balance sheet, cash flow) and company overview data from the Alpha Vantage API
- **Cache_Layer**: The in-memory caching system that stores API responses with configurable time-to-live (TTL) values to reduce redundant API calls
- **Error_Handler**: The centralized module that intercepts API failures and transforms them into user-friendly error messages with appropriate recovery actions
- **Technical_Indicator_Engine**: The client-side module that computes technical indicators (EMA, RSI, MACD) from historical price data using the `technicalindicators` npm package
- **Loading_Progress_UI**: The multi-step loading interface that displays sequential progress through data fetching stages
- **Search_Autocomplete**: The enhanced search component that provides real-time ticker suggestions from the Yahoo Finance search API as the user types
- **TTL**: Time-to-live; the duration a cached entry remains valid before requiring a fresh API call
- **Fallback_Data**: The existing mock/placeholder data returned when an API call fails, ensuring the app remains functional
- **Claude_Analysis_Service**: The client-side service module responsible for sending stock data and financial metrics to the Claude API and receiving structured investment analysis from 4 master investor perspectives

## Requirements

### Requirement 1: Yahoo Finance Quote Fetching

**User Story:** As an investor, I want to see real-time stock price data, so that I can make informed investment decisions based on current market conditions.

#### Acceptance Criteria

1. WHEN a user searches for a valid ticker symbol, THE Yahoo_Finance_Service SHALL fetch the current stock quote including price, price change percentage, market cap, 52-week range, and volume
2. WHEN the Yahoo Finance API returns a successful response, THE Yahoo_Finance_Service SHALL map the response data to the existing AnalysisResult price and quickFacts fields
3. IF the Yahoo Finance API returns an error or times out, THEN THE Yahoo_Finance_Service SHALL return Fallback_Data for the requested ticker
4. THE Yahoo_Finance_Service SHALL normalize ticker symbols to uppercase before making API requests

### Requirement 2: Yahoo Finance Historical Data

**User Story:** As an investor, I want to view historical price data for stocks, so that I can analyze price trends and patterns over time.

#### Acceptance Criteria

1. WHEN a ticker analysis is requested, THE Yahoo_Finance_Service SHALL fetch historical daily price data for the past 12 months
2. WHEN historical data is successfully retrieved, THE Yahoo_Finance_Service SHALL provide an array of date-price pairs sorted chronologically from oldest to newest
3. IF the historical data request fails, THEN THE Yahoo_Finance_Service SHALL return an empty array and log the error
4. THE Yahoo_Finance_Service SHALL request adjusted close prices to account for stock splits and dividends

### Requirement 3: Yahoo Finance Ticker Search and Autocomplete

**User Story:** As an investor, I want to search for stocks by name or partial ticker, so that I can quickly find the company I want to analyze.

#### Acceptance Criteria

1. WHEN a user types at least 2 characters in the search input, THE Search_Autocomplete SHALL query the Yahoo Finance search API for matching tickers and company names
2. WHEN search results are returned, THE Search_Autocomplete SHALL display a dropdown list showing ticker symbol, company name, and exchange for each match
3. WHEN a user selects an item from the autocomplete dropdown, THE Search_Autocomplete SHALL populate the search input with the selected ticker and trigger analysis
4. WHILE the user is typing, THE Search_Autocomplete SHALL debounce API requests by 300 milliseconds to avoid excessive calls
5. IF the search API returns no results, THEN THE Search_Autocomplete SHALL display a "No results found" message in the dropdown

### Requirement 4: Alpha Vantage Financial Statements

**User Story:** As an investor, I want to see real financial statements, so that I can evaluate a company's financial health using actual reported data.

#### Acceptance Criteria

1. WHEN a ticker analysis is requested, THE Alpha_Vantage_Service SHALL fetch the income statement, balance sheet, and cash flow statement for the most recent 4 annual periods
2. WHEN financial data is successfully retrieved, THE Alpha_Vantage_Service SHALL extract key metrics including revenue, net income, total assets, total liabilities, operating cash flow, and free cash flow
3. IF the Alpha Vantage API returns a rate limit error (HTTP 429 or rate limit message), THEN THE Error_Handler SHALL display a message indicating the user should wait before retrying and SHALL return cached data if available
4. THE Alpha_Vantage_Service SHALL authenticate requests using the VITE_ALPHA_VANTAGE_KEY environment variable
5. IF the VITE_ALPHA_VANTAGE_KEY environment variable is not configured, THEN THE Alpha_Vantage_Service SHALL skip financial data fetching and return Fallback_Data

### Requirement 5: Alpha Vantage Company Overview

**User Story:** As an investor, I want to see company overview data such as P/E ratio, profit margin, and sector classification, so that I can quickly assess fundamental metrics.

#### Acceptance Criteria

1. WHEN a ticker analysis is requested, THE Alpha_Vantage_Service SHALL fetch the company overview including sector, market capitalization, P/E ratio, profit margin, and debt-to-equity ratio
2. WHEN company overview data is successfully retrieved, THE Alpha_Vantage_Service SHALL map the data to the AnalysisResult quickFacts fields
3. IF the company overview request fails, THEN THE Alpha_Vantage_Service SHALL use data from the Yahoo Finance quote response as a partial fallback

### Requirement 6: Claude AI Analysis

**User Story:** As an investor, I want AI-powered analysis from 4 master investor perspectives, so that I can get comprehensive investment recommendations based on real financial data.

#### Acceptance Criteria

1. WHEN stock quote data and financial data have been fetched, THE Claude_Analysis_Service SHALL send a structured prompt to the Claude API requesting analysis from Buffett, Munger, Lynch, and Rothschild perspectives
2. THE Claude_Analysis_Service SHALL authenticate requests using the VITE_ANTHROPIC_API_KEY environment variable
3. WHEN the Claude API returns a successful response, THE Claude_Analysis_Service SHALL parse the JSON response and map it to the existing AnalysisResult and DetailedAnalysis types
4. IF the Claude API returns an error or times out, THEN THE Claude_Analysis_Service SHALL return Fallback_Data generated from the existing mock data functions
5. IF the VITE_ANTHROPIC_API_KEY environment variable is not configured, THEN THE Claude_Analysis_Service SHALL skip AI analysis and return Fallback_Data
6. THE Claude_Analysis_Service SHALL include real stock price, financial metrics, and company overview data in the analysis prompt to produce data-driven recommendations
7. THE Claude_Analysis_Service SHALL request the response in valid JSON format matching the AnalysisResult structure including masterScores, verdict, positionSize, riskLevel, and quickFacts

### Requirement 7: Caching Layer

**User Story:** As a user, I want the app to cache API responses, so that repeated lookups are fast and API rate limits are not exceeded.

#### Acceptance Criteria

1. THE Cache_Layer SHALL store Yahoo Finance quote responses with a TTL of 1 minute
2. THE Cache_Layer SHALL store Yahoo Finance historical data responses with a TTL of 1 hour
3. THE Cache_Layer SHALL store Alpha Vantage financial statement and company overview responses with a TTL of 24 hours
4. THE Cache_Layer SHALL store Claude AI analysis responses with a TTL of 1 hour
5. WHEN a cached entry exists and has not expired, THE Cache_Layer SHALL return the cached data without making an API call
6. WHEN a cached entry has expired, THE Cache_Layer SHALL discard the entry and allow a fresh API call
7. THE Cache_Layer SHALL use the ticker symbol combined with the data type as the cache key to prevent collisions

### Requirement 8: Centralized Error Handling

**User Story:** As a user, I want clear and helpful error messages when something goes wrong, so that I understand what happened and what I can do about it.

#### Acceptance Criteria

1. IF an API returns a "not found" response (HTTP 404 or equivalent), THEN THE Error_Handler SHALL display a message indicating the ticker symbol was not recognized
2. IF an API returns a rate limit response (HTTP 429), THEN THE Error_Handler SHALL display a message indicating the user should wait before making additional requests
3. IF a network error occurs (timeout, DNS failure, connection refused), THEN THE Error_Handler SHALL display a message indicating a network connectivity issue
4. IF an unexpected API error occurs, THEN THE Error_Handler SHALL display a generic error message and log the full error details to the browser console
5. THE Error_Handler SHALL provide a consistent error object structure containing error type, user-facing message, and technical details

### Requirement 9: Environment Variable Configuration

**User Story:** As a developer, I want API keys stored in environment variables, so that secrets are not committed to version control.

#### Acceptance Criteria

1. THE Alpha_Vantage_Service SHALL read the API key from the VITE_ALPHA_VANTAGE_KEY environment variable
2. THE Claude_Analysis_Service SHALL read the API key from the VITE_ANTHROPIC_API_KEY environment variable
3. THE Yahoo_Finance_Service SHALL operate without an API key
4. IF the VITE_ALPHA_VANTAGE_KEY environment variable is missing, THEN THE Error_Handler SHALL log a warning to the console indicating the API key is not configured
5. IF the VITE_ANTHROPIC_API_KEY environment variable is missing, THEN THE Error_Handler SHALL log a warning to the console indicating the Claude API key is not configured
6. THE application SHALL include a `.env.example` file documenting all required and optional environment variables

### Requirement 10: Client-Side Technical Indicators

**User Story:** As an investor, I want to see technical indicators computed from real price data, so that I can assess timing and momentum for potential trades.

#### Acceptance Criteria

1. WHEN historical price data is available, THE Technical_Indicator_Engine SHALL compute the Exponential Moving Average (EMA) for 12-day and 26-day periods
2. WHEN historical price data is available, THE Technical_Indicator_Engine SHALL compute the Relative Strength Index (RSI) for a 14-day period
3. WHEN historical price data is available, THE Technical_Indicator_Engine SHALL compute the MACD line, signal line, and histogram
4. THE Technical_Indicator_Engine SHALL use the `technicalindicators` npm package for all indicator computations
5. IF historical price data is unavailable or contains fewer than 26 data points, THEN THE Technical_Indicator_Engine SHALL return null for indicators that cannot be computed

### Requirement 11: Multi-Step Loading Progress UI

**User Story:** As a user, I want to see which step of the analysis is currently in progress, so that I understand the app is working and how long it might take.

#### Acceptance Criteria

1. WHEN an analysis is initiated, THE Loading_Progress_UI SHALL display a multi-step progress indicator showing the stages: Fetching Quote, Fetching Historical Data, Fetching Financials, and Analyzing with AI
2. WHILE a stage is in progress, THE Loading_Progress_UI SHALL highlight the current stage and show a loading animation
3. WHEN a stage completes successfully, THE Loading_Progress_UI SHALL mark the stage as complete with a success indicator
4. IF a stage fails, THEN THE Loading_Progress_UI SHALL mark the stage with an error indicator and continue to the next stage
5. WHEN all stages are complete, THE Loading_Progress_UI SHALL transition to displaying the analysis results

### Requirement 12: Graceful Fallback to Mock Data

**User Story:** As a user, I want the app to still work even if APIs are unavailable, so that I can always access analysis functionality.

#### Acceptance Criteria

1. IF all API calls for a ticker fail, THEN THE application SHALL fall back to the existing mock data generation using the getAnalysis and getDetailedAnalysis functions
2. WHEN Fallback_Data is used, THE application SHALL display a subtle indicator informing the user that mock data is being shown
3. THE application SHALL attempt real API calls first and only use Fallback_Data as a last resort
