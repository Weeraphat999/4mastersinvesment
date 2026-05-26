# Implementation Plan: 4 Masters Investor

## Overview

Build a single-page React application with Tailwind CSS that provides stock analysis based on four legendary investors. The implementation follows a bottom-up approach: data layer first, then UI components, then integration and animations. This ensures each layer is testable before wiring together.

## Tasks

- [x] 1. Set up project structure and configuration
  - [x] 1.1 Initialize React + TypeScript + Vite project with Tailwind CSS
    - Create project with `npm create vite@latest` using React + TypeScript template
    - Install and configure Tailwind CSS v3 with PostCSS and Autoprefixer
    - Configure `tailwind.config.ts` with dark mode, custom animation keyframes for fade-in
    - Set up base styles in `index.css` with bg-gray-900 and text-white defaults
    - _Requirements: 1.2, 11.1, 12.1_

  - [x] 1.2 Set up testing framework
    - Install Vitest, React Testing Library, jsdom, @testing-library/jest-dom, and fast-check
    - Configure `vitest.config.ts` with jsdom environment and setup file
    - Create test setup file with @testing-library/jest-dom matchers
    - _Requirements: (testing infrastructure)_

- [x] 2. Implement data layer
  - [x] 2.1 Create TypeScript type definitions
    - Create `src/data/types.ts` with `AnalysisResult` interface
    - Include all fields: ticker, companyName, price, priceChange, verdict, positionSize, entryStrategy, riskLevel, timeHorizon, masterScores, overallScore, quickFacts
    - _Requirements: 10.1, 10.4_

  - [x] 2.2 Implement mock data module
    - Create `src/data/mockData.ts` with predefined data for QTUM, AAPL, NVDA, PTT, AOT, CPALL
    - Each entry must be a complete `AnalysisResult` with realistic financial data
    - Include both US and Thai (SET) tickers
    - _Requirements: 10.2, 10.4_

  - [x] 2.3 Implement deterministic placeholder generator
    - Create `src/data/generatePlaceholder.ts`
    - Implement a string hash function that produces consistent numeric seeds from ticker strings
    - Generate all `AnalysisResult` fields deterministically from the hash
    - Ensure scores are in range [0, 10], prices are positive, company name defaults to "{TICKER} Corp."
    - _Requirements: 10.4, 10.5_

  - [x] 2.4 Implement getAnalysis lookup function
    - Create `src/data/getAnalysis.ts`
    - Normalize ticker to uppercase for case-insensitive matching
    - Look up in predefined data first, fall back to placeholder generator
    - Never return null or throw — always return a complete AnalysisResult
    - _Requirements: 10.1, 10.3, 10.4, 10.5_

  - [x] 2.5 Write property test: Totality of analysis lookup (Property 1)
    - **Property 1: Totality of analysis lookup**
    - Generate arbitrary non-empty strings, verify `getAnalysis` always returns a complete `AnalysisResult` with all required fields populated
    - **Validates: Requirements 10.1, 10.4, 10.5**

  - [x] 2.6 Write property test: Case-insensitive equivalence (Property 2)
    - **Property 2: Case-insensitive equivalence**
    - Generate arbitrary strings, verify `getAnalysis(ticker.toLowerCase())` produces identical result to `getAnalysis(ticker.toUpperCase())`
    - **Validates: Requirements 10.3**

  - [x] 2.7 Write property test: Deterministic placeholder generation (Property 3)
    - **Property 3: Deterministic placeholder generation**
    - Generate arbitrary strings not in predefined set, verify `generatePlaceholderAnalysis` returns same result on repeated calls
    - **Validates: Requirements 10.4, 10.5**

  - [x] 2.8 Write property test: Score values within valid range (Property 4)
    - **Property 4: Score values within valid range**
    - Generate arbitrary tickers, verify all scores (buffett, munger, lynch, rothschild, overallScore) are in [0, 10]
    - **Validates: Requirements 7.4, 7.5**

- [x] 3. Checkpoint - Data layer verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement UI components - Header and Search
  - [x] 4.1 Implement Header component
    - Create `src/components/Header.tsx`
    - Render "🎯 4 Masters Investment Advisor" with text-2xl, font-bold, text-left
    - Style with full-width, bg-gray-900, text-white, p-6
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 4.2 Implement SearchInput component
    - Create `src/components/SearchInput.tsx`
    - Controlled input with value, onChange, and onSearch props
    - Placeholder text: "Enter stock ticker (e.g., QTUM, AAPL, NVDA)"
    - Styled with text-xl, rounded-lg, p-4, border-2 border-blue-500
    - Handle Enter key press to trigger onSearch (only when non-empty)
    - Add focus ring glow effect (focus:ring-2 focus:ring-blue-400, transition-all duration-300)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 12.3_

  - [x] 4.3 Implement ExampleButtons component
    - Create `src/components/ExampleButtons.tsx`
    - Render three buttons: QTUM, AAPL, NVDA
    - Style with bg-gray-800, hover:bg-gray-700, px-4, py-2, rounded, transition-all duration-300
    - Call onSelect prop with ticker value on click
    - _Requirements: 3.1, 3.2, 3.3, 11.4_

  - [x] 4.4 Write unit tests for Header, SearchInput, and ExampleButtons
    - Test Header renders title with correct text and styling
    - Test SearchInput displays placeholder, triggers onSearch on Enter, ignores Enter when empty
    - Test ExampleButtons renders three buttons and calls onSelect with correct ticker
    - _Requirements: 1.1, 2.2, 2.4, 3.1, 3.3_

- [x] 5. Implement UI components - Results cards
  - [x] 5.1 Implement CompanyHeader component
    - Create `src/components/CompanyHeader.tsx`
    - Display ticker + company name (e.g., "QTUM - IonQ Inc.")
    - Show price in large text format
    - Render green ▲ with text-green-500 for positive priceChange
    - Render red ▼ with text-red-500 for negative priceChange
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 5.2 Implement VerdictCard component
    - Create `src/components/VerdictCard.tsx`
    - Style with border-2, rounded-xl, p-8, bg-gradient-to-br from-blue-900 to-purple-900
    - Display "🎯 FINAL VERDICT" title in text-3xl font-bold
    - Display verdict text in text-4xl font-black text-green-400
    - List strategy details: Position Size, Entry Strategy, Risk Level (with ⚠️ for high risk), Time Horizon
    - Style details with text-lg, text-gray-300, mt-2
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.3 Implement MasterScoresCard component
    - Create `src/components/MasterScoresCard.tsx`
    - Style container with bg-gray-800, rounded-lg, p-6
    - Display "📊 MASTER SCORES" title in text-2xl font-bold mb-4
    - Render four score bars: Buffett (blue-500), Munger (purple-500), Lynch (green-500), Rothschild (yellow-500)
    - Each bar: master name (text-lg, w-32), progress bar (h-6, rounded-full, bg-gray-700 with colored fill), numeric score (text-lg, ml-4)
    - Bar width percentage = (score / 10) * 100
    - Overall score at bottom with gradient bar (from-blue-500 to-purple-500)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 5.4 Implement QuickFactsCard component
    - Create `src/components/QuickFactsCard.tsx`
    - Display "📋 QUICK FACTS" title
    - Grid layout: grid-cols-1 md:grid-cols-2
    - Render 8 facts: Market Cap, Price/Sales, Cash Runway, Sector, 52-Week Range, Moat, Profit Margin, Debt/Equity
    - Label in text-gray-400, value in text-white font-semibold
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 5.5 Implement NewSearchButton component
    - Create `src/components/NewSearchButton.tsx`
    - Style with bg-blue-500, hover:bg-blue-600, px-6, py-3, rounded-lg, transition-all duration-300
    - Call onClick prop when clicked
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 5.6 Write property test: Price change indicator correctness (Property 5)
    - **Property 5: Price change indicator correctness**
    - Generate arbitrary numbers for priceChange, verify CompanyHeader renders ▼ with text-red-500 when negative, ▲ with text-green-500 when positive
    - **Validates: Requirements 5.3, 5.4**

  - [x] 5.7 Write property test: Score bar proportionality (Property 6)
    - **Property 6: Score bar proportionality**
    - Generate scores in [0, 10], verify rendered bar width equals `(score / 10) * 100` percent
    - **Validates: Requirements 7.4, 7.5**

  - [x] 5.8 Write unit tests for results card components
    - Test CompanyHeader displays ticker, company name, formatted price, and correct arrow/color
    - Test VerdictCard displays verdict text and all strategy details
    - Test MasterScoresCard renders four bars with correct colors and overall score
    - Test QuickFactsCard renders all 8 facts in grid
    - Test NewSearchButton calls onClick handler
    - _Requirements: 5.1-5.4, 6.1-6.5, 7.1-7.5, 8.1-8.4, 9.1-9.3_

- [x] 6. Checkpoint - Components verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integrate App component and wire everything together
  - [x] 7.1 Implement App component with state management
    - Create/update `src/App.tsx` with view state ('search' | 'results'), ticker state, and analysisData state
    - Render Header always
    - Conditionally render SearchView (SearchInput + ExampleButtons) or ResultsView based on view state
    - Implement handleSearch: normalize ticker, call getAnalysis, set results state, switch to results view
    - Implement handleNewSearch: clear results, switch to search view
    - _Requirements: 2.1, 4.1, 9.3, 10.1, 10.3_

  - [x] 7.2 Add animations and scroll behavior
    - Apply animate-fade-in class to ResultsView container when it appears
    - Implement smooth scroll to results section using `scrollIntoView({ behavior: 'smooth' })`
    - Ensure transition-all duration-300 is applied to interactive elements
    - Center SearchInput with max-w-2xl when in search view
    - Apply p-6 and mb-8 spacing between major sections
    - _Requirements: 4.2, 4.3, 11.2, 11.3, 12.1, 12.2, 12.3, 12.4_

  - [x] 7.3 Write integration tests for App state transitions
    - Test search flow: enter ticker → press Enter → results appear with correct data
    - Test example button flow: click QTUM → results appear
    - Test new search flow: click New Search → returns to search view
    - Test case-insensitive search: "qtum" and "QTUM" produce same results
    - Test fade-in animation class is applied to results container
    - Test scrollIntoView is called when results appear
    - _Requirements: 2.4, 3.3, 4.1, 4.2, 4.3, 9.3, 10.3, 12.1, 12.4_

- [x] 8. Final checkpoint - Full application verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The data layer is implemented first so components can be tested with real data functions
- All code uses TypeScript with React and Tailwind CSS as specified in the design
