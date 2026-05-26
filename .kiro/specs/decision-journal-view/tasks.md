# Implementation Plan: Decision Journal View

## Overview

Replace the existing placeholder `JournalPage.tsx` with a full-featured decision journal interface. Implementation follows a bottom-up approach: install dependencies, build pure utility modules, create sub-components, then wire everything together in the page container.

## Tasks

- [x] 1. Install dependencies and set up project structure
  - [x] 1.1 Install recharts as a production dependency
    - Run `npm install recharts` to add charting library
    - Verify it appears in package.json dependencies
    - _Requirements: 7.1_

  - [x] 1.2 Create journal component directory and utility files
    - Create `src/components/journal/` directory
    - Create empty files for `src/utils/journalCalculations.ts`, `src/utils/journalFilters.ts`, `src/utils/journalExport.ts`
    - _Requirements: 1.2, 2.1, 8.2_

- [x] 2. Implement journal calculation utilities
  - [x] 2.1 Implement journalCalculations.ts with all pure computation functions
    - Implement `computePnlPercent`, `computePnlDollar` for individual entry P&L
    - Implement `computeJournalMetrics` returning totalDecisions, winRate, avgReturn, bestTrade
    - Implement `computePerformanceMetrics` returning winRate, avgWinPercent, avgLossPercent, profitFactor, currentStreak
    - Implement `computeMonthlyReturns`, `computeDecisionBreakdown`, `computeOutcomeDistribution`
    - Implement `computeMistakeStats` and `computeCurrentStreak`
    - Handle edge cases: empty arrays, zero entryPriceTarget, no closed decisions
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 6.4, 7.4_

  - [x] 2.2 Write property tests for journalCalculations (Properties 1-4)
    - **Property 1: Total Decisions equals array length**
    - **Property 2: Win Rate computation correctness**
    - **Property 3: Average Return computation correctness**
    - **Property 4: Best Trade identification**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5**

  - [x] 2.3 Write property tests for performance metrics (Properties 14-16)
    - **Property 14: Mistakes autopsy statistics correctness**
    - **Property 15: Decision breakdown proportions sum to total**
    - **Property 16: Performance metrics internal consistency**
    - **Validates: Requirements 6.4, 7.2, 7.3, 7.4**

- [x] 3. Implement journal filter utilities
  - [x] 3.1 Implement journalFilters.ts with all filter and sort functions
    - Implement `filterBySearch` with case-insensitive partial match on ticker
    - Implement `filterByDecisionType` with exact match or pass-through for ALL
    - Implement `filterByStatus` with ACTIVE/CLOSED/WATCHING logic
    - Implement `filterByDateRange` with ISO string comparison
    - Implement `sortDecisions` for NEWEST, OLDEST, BEST_PNL, WORST_PNL
    - Implement `applyFilters` composing all filters and sort
    - Implement `getLosingDecisions` for closed entries with negative P&L
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.2_

  - [x] 3.2 Write property tests for journalFilters (Properties 5-9, 13)
    - **Property 5: Ticker search filter correctness**
    - **Property 6: Decision type filter correctness**
    - **Property 7: Status filter correctness**
    - **Property 8: Date range filter correctness**
    - **Property 9: Sort ordering correctness**
    - **Property 13: Mistakes autopsy shows only closed losses**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 6.2**

- [x] 4. Implement journal export utilities
  - [x] 4.1 Implement journalExport.ts with CSV and JSON generation
    - Implement `generateCsvContent` with header row, flattened scores, semicolon-joined arrays, quoted commas
    - Implement `generateJsonContent` with JSON.stringify of decisions array
    - Implement `generateExportFilename` with pattern `decision-journal-YYYY-MM-DD.{format}`
    - _Requirements: 8.2, 8.3, 8.4_

  - [x] 4.2 Write property tests for journalExport (Properties 17-19)
    - **Property 17: CSV export contains all decision fields**
    - **Property 18: JSON export round-trip**
    - **Property 19: Export filename format**
    - **Validates: Requirements 8.2, 8.3, 8.4**

- [x] 5. Checkpoint - Verify utility modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement journal sub-components (static/presentational)
  - [x] 6.1 Implement EmptyState component
    - Display informative message when no decisions exist
    - Provide guidance directing user to Analyze page
    - Style with Tailwind dark mode classes (bg-gray-800, text-gray-400)
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 6.2 Implement SummaryCards component
    - Display four cards: Total Decisions, Win Rate, Avg Return, Best Trade
    - Accept `JournalMetrics` props
    - Show dash values when metrics are null (no closed decisions)
    - Responsive grid: 4 cols desktop, 2 cols tablet, 1 col mobile
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 11.3_

  - [x] 6.3 Implement FilterBar component
    - Text search input for ticker filtering
    - Decision type dropdown: All, BUY, PASS, WATCHLIST
    - Status dropdown: All, Active, Closed, Watching
    - Date range inputs (start/end)
    - Sort selector: Newest First, Oldest First, Best P&L, Worst P&L
    - View mode toggle (table/card)
    - Call `onFiltersChange` on every change for immediate filtering
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 6.4 Implement DecisionTable component
    - Table with columns: Date, Ticker/Company, Decision, Entry Price, Current Price, P&L, Status, Actions
    - Decision badge colors: green BUY, yellow PASS, blue WATCHLIST
    - P&L text color: green positive, red negative
    - Status badge styling
    - View and Edit action buttons per row
    - Horizontally scrollable on small screens
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 11.6_

  - [x] 6.5 Implement DecisionCardGrid component
    - Responsive grid: 3 cols desktop, 2 cols tablet, 1 col mobile
    - Cards with 4px left border colored by decision type
    - Display ticker, company, decision badge, date, prices, P&L, status, truncated reasoning
    - Click handler to open detail modal
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 11.4_

  - [x] 6.6 Implement ExportButton component with dropdown
    - Dropdown with CSV and JSON options
    - On selection, generate content via journalExport utilities
    - Trigger download via existing downloadFile utility
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Implement Detail Modal with tabs
  - [x] 7.1 Implement DecisionDetailModal container with tab navigation
    - Modal overlay with close on outside click and close button
    - Four tab buttons: Overview, Reasoning, Analysis, Updates
    - Responsive: full screen mobile, centered max-width desktop
    - _Requirements: 5.1, 5.2, 5.7, 11.5_

  - [x] 7.2 Implement OverviewTab component
    - Display entry price, current price, P&L, position size, status
    - Display timeline of review dates
    - _Requirements: 5.3_

  - [x] 7.3 Implement ReasoningTab component
    - Display full reasoning text and expected outcome
    - _Requirements: 5.4_

  - [x] 7.4 Implement AnalysisTab component
    - Display master scores: Buffett, Munger, Lynch, Rothschild, Overall
    - Visual score indicators
    - _Requirements: 5.5_

  - [x] 7.5 Implement UpdatesTab component with form
    - Status change dropdown (active/closed)
    - Exit price input
    - Actual outcome textarea
    - Lessons learned textarea
    - Tags input
    - Submit handler calling onUpdate prop
    - _Requirements: 5.6, 5.8_

- [x] 8. Implement analytics sections
  - [x] 8.1 Implement MistakesAutopsy component
    - Collapsible panel with expand/collapse toggle
    - List closed decisions with negative P&L
    - Display ticker, decision type, loss amount (% and $), lessons learned
    - Summary stats: total losses count, total dollar lost, avg loss %
    - Message when no losses exist
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.2 Implement PerformanceAnalytics component with Recharts
    - Monthly returns bar chart (green positive, red negative bars)
    - Decision breakdown pie chart (BUY green, PASS yellow, WATCHLIST blue)
    - Outcome distribution chart (wins green, losses red)
    - Key metrics display: win rate, avg win %, avg loss %, profit factor, current streak
    - "Insufficient data" message when fewer than 2 closed decisions
    - Use ResponsiveContainer for all charts, gray-400 axis labels
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. Checkpoint - Verify all sub-components compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Wire everything together in JournalPage
  - [x] 10.1 Replace JournalPage.tsx with full implementation
    - Load decisions from localStorage on mount via loadFromStorage
    - Manage filter state, modal state, and derived data with useMemo
    - Render SummaryCards, FilterBar, ExportButton, DecisionTable/DecisionCardGrid, MistakesAutopsy, PerformanceAnalytics
    - Render DecisionDetailModal when entry selected
    - Render EmptyState when no decisions exist (hide other sections)
    - Handle update submissions: update array, persist to localStorage
    - Full-width single-column layout with vertical stacking
    - Dark mode styling consistent with app theme
    - _Requirements: 1.1, 2.7, 5.1, 5.7, 5.8, 9.1, 10.1, 10.2, 10.3, 11.1, 11.2_

  - [x] 10.2 Write property test for update persistence round-trip (Property 12)
    - **Property 12: Update persistence round-trip**
    - **Validates: Requirements 5.8, 10.2**

  - [x] 10.3 Write property tests for display color mapping (Properties 10-11)
    - **Property 10: Decision type to color mapping consistency**
    - **Property 11: P&L sign determines display color**
    - **Validates: Requirements 3.2, 3.3, 3.4, 4.2**

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project already has fast-check and vitest configured for property-based testing
- Recharts is the only new dependency to install
- All utility modules are pure functions for easy testing without DOM

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "4.2"] },
    { "id": 3, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6"] },
    { "id": 4, "tasks": ["7.1", "8.1", "8.2"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4", "7.5"] },
    { "id": 6, "tasks": ["10.1"] },
    { "id": 7, "tasks": ["10.2", "10.3"] }
  ]
}
```
