# Implementation Plan: Portfolio Tracker

## Overview

Implement a multi-page Portfolio Tracker feature using React Router, adding a `/portfolio` route with holdings management, summary metrics, allocation visualization, risk breakdown, performance rankings, CSV export, and simulated price refresh. The existing single-page app is refactored into route-based pages with a shared navigation bar.

## Tasks

- [x] 1. Install dependency and add PortfolioHolding type
  - [x] 1.1 Install react-router-dom and add PortfolioHolding interface to types.ts
    - Run `npm install react-router-dom` to add the routing dependency
    - Add `PortfolioHolding` interface to `src/data/types.ts` with fields: id, ticker, companyName, shares, avgCost, currentPrice, purchaseDate, category, riskLevel, notes
    - _Requirements: 1.5, 12.1_

- [x] 2. Create utility modules
  - [x] 2.1 Create `src/utils/portfolioCalculations.ts` with pure computation functions
    - Implement `computeTotalValue`, `computeTotalPnL`, `computeHighRiskExposure`, `computeGainLoss`, `computeGainLossPercent`, `computePortfolioPercent`, `computeRiskBreakdown`, `getTopPerformers`, `getBottomPerformers`, `getOverLimitHoldings`, `computePieSlices`, `sortHoldings`, `filterHoldings`
    - _Requirements: 3.2, 3.3, 3.5, 5.2, 5.3, 5.9, 5.10, 7.2, 8.1, 8.2, 8.3, 9.1_

  - [ ]* 2.2 Write property tests for Total Value computation
    - **Property 1: Total Value computation**
    - **Validates: Requirements 3.2**

  - [ ]* 2.3 Write property tests for Total P&L computation
    - **Property 2: Total P&L computation**
    - **Validates: Requirements 3.3, 5.9**

  - [ ]* 2.4 Write property tests for High-Risk Exposure computation
    - **Property 3: High-Risk Exposure computation**
    - **Validates: Requirements 3.5**

  - [ ]* 2.5 Write property tests for portfolio percentage invariant
    - **Property 4: Portfolio percentage invariant**
    - **Validates: Requirements 5.10, 6.2**

  - [ ]* 2.6 Write property tests for sorting correctness
    - **Property 5: Sorting correctness**
    - **Validates: Requirements 5.2**

  - [ ]* 2.7 Write property tests for search filter correctness
    - **Property 6: Search filter correctness**
    - **Validates: Requirements 5.3**

  - [ ]* 2.8 Write property tests for performance rankings ordering
    - **Property 7: Performance rankings ordering**
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [ ]* 2.9 Write property tests for over-limit alert threshold
    - **Property 8: Over-limit alert threshold**
    - **Validates: Requirements 9.1, 9.3**

  - [ ]* 2.10 Write property tests for risk breakdown percentages sum to 100
    - **Property 9: Risk breakdown percentages sum to 100**
    - **Validates: Requirements 7.2**

  - [x] 2.11 Create `src/utils/portfolioCSV.ts` with CSV generation function
    - Implement `generatePortfolioCSV` that produces a CSV string with header row and one data row per holding
    - _Requirements: 10.1_

  - [ ]* 2.12 Write property tests for CSV export data preservation
    - **Property 10: CSV export data preservation**
    - **Validates: Requirements 10.1**

  - [x] 2.13 Create `src/utils/priceRefresh.ts` with simulated price refresh logic
    - Implement `refreshPrices` that applies random ±5% change to each holding's currentPrice
    - _Requirements: 11.1_

  - [ ]* 2.14 Write property tests for price refresh bounds
    - **Property 11: Price refresh bounds**
    - **Validates: Requirements 11.1**

- [x] 3. Checkpoint - Ensure utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create NavigationBar and refactor App.tsx for routing
  - [x] 4.1 Create `src/components/NavigationBar.tsx`
    - Implement fixed top navigation bar with logo and NavLink components for Analyze (`/`), Portfolio (`/portfolio`), and Journal (`/journal`)
    - Highlight active route using NavLink's active class
    - Style with Tailwind CSS (fixed position, dark theme consistent with existing app)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.2 Create `src/pages/AnalyzePage.tsx` by extracting existing App.tsx content
    - Move all current App.tsx logic (search, results, state) into AnalyzePage component
    - Remove the existing Header component usage (replaced by NavigationBar)
    - _Requirements: 1.5_

  - [x] 4.3 Refactor `src/App.tsx` to use BrowserRouter with route definitions
    - Wrap app in BrowserRouter, render NavigationBar, define Routes for `/`, `/portfolio`, `/journal`
    - _Requirements: 1.2, 1.5_

- [x] 5. Create portfolio page components
  - [x] 5.1 Create `src/components/portfolio/EmptyState.tsx`
    - Display helpful message when holdings array is empty with guidance on adding first holding
    - _Requirements: 13.1, 13.2_

  - [x] 5.2 Create `src/components/portfolio/SummaryCards.tsx`
    - Render four metric cards: Total Value, Total P&L, Holdings Count, High-Risk Exposure
    - Format values with currency symbols and color coding (green/red for P&L)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 5.3 Create `src/components/portfolio/AddHoldingForm.tsx`
    - Implement collapsible form with fields: ticker, shares, avgCost, purchaseDate, category, riskLevel, notes
    - Add form validation for required fields (ticker, shares, avgCost must be positive)
    - Support prefill prop for Decision Journal integration
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 5.4 Write property test for new holding initialization
    - **Property 13: New holding initialization**
    - **Validates: Requirements 4.4**

  - [x] 5.5 Create `src/components/portfolio/HoldingsTable.tsx`
    - Render sortable table with columns: ticker, company, shares, avg cost, current price, gain/loss, portfolio %, actions
    - Implement sortable column headers, search input, inline editing, delete functionality
    - Color-code gain/loss (green positive, red negative), show portfolio % as progress bar
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [x] 5.6 Create `src/components/portfolio/AllocationChart.tsx`
    - Implement custom SVG pie chart using arc path geometry (no external charting libraries)
    - Render legend mapping colors to ticker symbols
    - Use predefined color palette of 12+ distinct colors
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.7 Create `src/components/portfolio/RiskBreakdown.tsx`
    - Display progress bars for low, medium, high risk levels
    - Compute each risk level percentage from holdings values
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 5.8 Create `src/components/portfolio/PerformanceRankings.tsx`
    - Display Top 5 Performers (descending gain/loss %) and Bottom 3 Performers (ascending gain/loss %)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 5.9 Create `src/components/portfolio/OverLimitAlerts.tsx`
    - Display warning alerts for holdings exceeding 15% of total portfolio value
    - Show ticker and current portfolio percentage in alert
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 5.10 Create `src/components/portfolio/FloatingActionButtons.tsx`
    - Render fixed-position buttons for Export CSV, Refresh Prices, and Settings
    - Wire onClick handlers to props callbacks
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 6. Checkpoint - Ensure component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create page containers and wire routes
  - [x] 7.1 Create `src/pages/PortfolioPage.tsx` container
    - Manage holdings state with useState, load from localStorage on mount, persist on mutations
    - Compute derived metrics (totalValue, totalPnL, holdingsCount, highRiskExposure) via useMemo
    - Wire add, edit, delete handlers; wire CSV export using downloadFile utility; wire price refresh
    - Compose all portfolio sub-components with responsive two-column layout (60/40 grid on desktop, stacked on tablet/mobile)
    - Show EmptyState when holdings array is empty, hide table/chart/risk/rankings
    - _Requirements: 2.1, 3.6, 5.8, 10.2, 11.2, 11.3, 12.1, 12.2, 12.3, 12.4, 13.1, 13.2, 15.1, 15.2, 15.3_

  - [ ]* 7.2 Write property test for persistence round-trip
    - **Property 12: Persistence round-trip**
    - **Validates: Requirements 12.3, 12.2**

  - [x] 7.3 Create `src/pages/JournalPage.tsx` placeholder
    - Render a placeholder page for the `/journal` route with a heading and coming-soon message
    - _Requirements: 1.2_

  - [x] 7.4 Wire Decision Journal integration
    - After a BUY decision is saved, display prompt offering to add holding to portfolio
    - Pre-fill AddHoldingForm with ticker, companyName, entryPriceTarget as avgCost, computed shares, current date
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- The project uses React + TypeScript + Vite + Tailwind CSS + Vitest + fast-check
- All utility functions are pure and testable in isolation
- The existing `storageUtils.ts` and `downloadFile.ts` utilities are reused

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.11", "2.13"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10", "2.12", "2.14", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "5.1", "5.2", "5.3"] },
    { "id": 4, "tasks": ["5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10"] },
    { "id": 5, "tasks": ["7.1", "7.3"] },
    { "id": 6, "tasks": ["7.2", "7.4"] }
  ]
}
```
