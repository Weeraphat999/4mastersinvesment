# Implementation Plan: Action Items Tab

## Overview

Bottom-up implementation of the Action Items Tab feature: utility modules first, then UI components, then integration with existing AnalysisTabs and TabBar. The tab provides actionable investment recommendations with conditional BUY/Watchlist layouts, localStorage persistence, CSV/ICS file generation, and a Decision Journal.

## Tasks

- [x] 1. Create utility modules and data types
  - [x] 1.1 Add new types to src/data/types.ts
    - Add `DecisionEntry`, `AlertPreferences`, `DCAScheduleRow`, and `PositionSizingResult` interfaces
    - _Requirements: 11.3, 12.1, 5.1, 3.1_

  - [x] 1.2 Implement src/utils/storageUtils.ts
    - Implement `loadFromStorage<T>(key, fallback): T` with JSON parse error handling
    - Implement `saveToStorage<T>(key, value): boolean` with QuotaExceededError handling
    - Return `false` when localStorage is unavailable or full
    - _Requirements: 17.1, 17.4, 12.4, 6.3_

  - [x] 1.3 Implement src/utils/verdictUtils.ts
    - Implement `isBuyVerdict(verdict: string): boolean` with case-insensitive "BUY" check
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.4 Implement src/utils/positionSizing.ts
    - Implement `calculatePositionSizing(riskLevel, overallScore): PositionSizingResult`
    - Low risk: 5-8%, Medium: 3-5%, High: 1-3%
    - Conviction labels: ≥8 "High Conviction", <5 "Speculative", 5-7 "Standard"
    - _Requirements: 3.1, 3.5, 15.1, 15.2_

  - [x] 1.5 Implement src/utils/csvUtils.ts
    - Implement `generateDCACSV(ticker, schedule): string`
    - Header: "Month,Date,Amount,Estimated Price,Estimated Shares"
    - One row per DCAScheduleRow entry
    - _Requirements: 13.1, 13.2, 13.4_

  - [x] 1.6 Implement src/utils/icsUtils.ts
    - Implement `generateICSEvent(ticker, checkpointLabel, eventDate): string`
    - Generate valid VCALENDAR with VEVENT, SUMMARY, and DTSTART
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 1.7 Implement src/utils/downloadFile.ts
    - Implement `downloadFile(content, filename, mimeType): void`
    - Create Blob, generate object URL, trigger download via anchor click, revoke URL
    - _Requirements: 13.3, 14.4_

  - [x] 1.8 Implement src/utils/exportPlan.ts
    - Implement function to generate a text summary of the full action plan
    - Include position sizing, DCA schedule, alerts, and exit criteria sections
    - _Requirements: 9.3_

- [ ] 2. Property tests for utility modules
  - [ ]* 2.1 Write property test for verdictUtils (Property 1)
    - **Property 1: Verdict Classification is Exhaustive and Case-Insensitive**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ]* 2.2 Write property test for positionSizing (Property 2)
    - **Property 2: Position Sizing Respects Risk Level Bounds and Conviction Labels**
    - **Validates: Requirements 3.1, 3.5, 15.1, 15.2**

  - [ ]* 2.3 Write property test for portfolio calculator arithmetic (Property 3)
    - **Property 3: Portfolio Calculator Arithmetic**
    - **Validates: Requirements 4.2, 4.4**

  - [ ]* 2.4 Write property test for DCA schedule generation (Property 4)
    - **Property 4: DCA Schedule Generation Invariants**
    - **Validates: Requirements 5.2, 5.3, 15.3**

  - [ ]* 2.5 Write property test for storageUtils round-trip (Property 5)
    - **Property 5: Alert Preferences Round-Trip Persistence**
    - **Validates: Requirements 6.3, 6.5, 17.1**

  - [ ]* 2.6 Write property test for review checkpoint dates (Property 6)
    - **Property 6: Review Checkpoint Date Calculation**
    - **Validates: Requirements 7.1, 7.4**

  - [ ]* 2.7 Write property test for ICS generation (Property 7)
    - **Property 7: ICS File Generation Validity**
    - **Validates: Requirements 14.1, 14.2, 14.3**

  - [ ]* 2.8 Write property test for CSV generation (Property 8)
    - **Property 8: CSV File Generation Structure**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4**

  - [ ]* 2.9 Write property test for Decision Journal save/load (Property 9)
    - **Property 9: Decision Journal Save/Load Round-Trip**
    - **Validates: Requirements 11.2, 11.3**

  - [ ]* 2.10 Write property test for Decision Journal append-only (Property 10)
    - **Property 10: Decision Journal Append-Only Invariant**
    - **Validates: Requirements 12.2**

  - [ ]* 2.11 Write property test for Decision Journal validation (Property 11)
    - **Property 11: Decision Journal Validation Rejects Incomplete Forms**
    - **Validates: Requirements 11.5**

  - [ ]* 2.12 Write property test for unique ID generation (Property 12)
    - **Property 12: Unique ID Generation**
    - **Validates: Requirements 12.3**

  - [ ]* 2.13 Write property test for watchlist deduplication (Property 13)
    - **Property 13: Watchlist Deduplication (Idempotence)**
    - **Validates: Requirements 17.3**

  - [ ]* 2.14 Write property test for export plan sections (Property 14)
    - **Property 14: Export Plan Contains All Required Sections**
    - **Validates: Requirements 9.3**

  - [ ]* 2.15 Write property test for target price persistence (Property 15)
    - **Property 15: Target Price Persistence Round-Trip**
    - **Validates: Requirements 10.3**

- [x] 3. Checkpoint - Ensure all utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement BUY layout components
  - [x] 4.1 Implement PositionSizingCard component
    - Create `src/components/tabs/action-items/PositionSizingCard.tsx`
    - Display allocation %, conviction label, and "Calculate for My Portfolio" button
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.2 Implement PortfolioCalculatorModal component
    - Create `src/components/tabs/action-items/PortfolioCalculatorModal.tsx`
    - Input for portfolio value, calculate position size, inline validation
    - Close on outside click or close button
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.3 Implement DCAScheduleCard component
    - Create `src/components/tabs/action-items/DCAScheduleCard.tsx`
    - Generate DCA schedule table (4 or 6 months based on timing verdict)
    - "Create DCA Schedule" button triggers CSV download
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 15.3_

  - [x] 4.4 Implement AlertsChecklist component
    - Create `src/components/tabs/action-items/AlertsChecklist.tsx`
    - Render 5 alert items with toggle, "Enable All Alerts" button
    - Persist to localStorage via storageUtils, restore on mount
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.5 Implement ReviewScheduleCard component
    - Create `src/components/tabs/action-items/ReviewScheduleCard.tsx`
    - Timeline with 3, 6, 12 month checkpoints and "Add to Calendar" buttons
    - Generate ICS file on button click
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 4.6 Implement ExitCriteriaCard component
    - Create `src/components/tabs/action-items/ExitCriteriaCard.tsx`
    - Warning-styled card with sell conditions list
    - Tighter stop-loss for high risk
    - _Requirements: 8.1, 8.2, 8.3, 15.4_

  - [x] 4.7 Implement NextStepsButtons component
    - Create `src/components/tabs/action-items/NextStepsButtons.tsx`
    - Three large action buttons: Save to Journal, Export Plan, Set Alerts
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 4.8 Implement BuyLayout container component
    - Create `src/components/tabs/action-items/BuyLayout.tsx`
    - Compose all BUY layout cards with proper spacing and order
    - _Requirements: 2.1, 16.1, 16.4, 16.5, 16.6_

- [x] 5. Implement Watchlist layout components
  - [x] 5.1 Implement WatchlistCard component
    - Create `src/components/tabs/action-items/WatchlistCard.tsx`
    - "Add to Watchlist" button, deduplicate on add, persist to localStorage
    - _Requirements: 10.1, 17.2, 17.3_

  - [x] 5.2 Implement PriceAlertsCard component
    - Create `src/components/tabs/action-items/PriceAlertsCard.tsx`
    - Target price input with validation, persist to localStorage
    - _Requirements: 10.2, 10.3_

  - [x] 5.3 Implement CatalystChecklist component
    - Create `src/components/tabs/action-items/CatalystChecklist.tsx`
    - Checklist of events to watch for
    - _Requirements: 10.4_

  - [x] 5.4 Implement RevisitDateCard component
    - Create `src/components/tabs/action-items/RevisitDateCard.tsx`
    - Display date 6 months from current date
    - _Requirements: 10.5_

  - [x] 5.5 Implement WisdomQuoteCard component
    - Create `src/components/tabs/action-items/WisdomQuoteCard.tsx`
    - Investment wisdom quote styled as a quote box
    - _Requirements: 10.6_

  - [x] 5.6 Implement WatchlistLayout container component
    - Create `src/components/tabs/action-items/WatchlistLayout.tsx`
    - Compose all Watchlist layout cards with proper spacing
    - _Requirements: 2.2, 16.1, 16.4, 16.5, 16.6_

- [x] 6. Implement shared components
  - [x] 6.1 Implement DecisionJournal component
    - Create `src/components/tabs/action-items/DecisionJournal.tsx`
    - Form with Decision radio, Position Size, Reasoning, Expected Outcome, Entry Price, Exit Plan, Review Dates
    - Validate required fields, save to localStorage, show success toast
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 12.4_

  - [ ]* 6.2 Write unit tests for DecisionJournal component
    - Test form rendering, validation errors, successful submission, toast display
    - _Requirements: 11.4, 11.5, 11.6_

- [x] 7. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Integration with existing components
  - [x] 8.1 Implement ActionItemsTab root component
    - Create `src/components/tabs/ActionItemsTab.tsx`
    - Parse verdict via `isBuyVerdict`, render BuyLayout or WatchlistLayout
    - Pass required props from AnalysisResult and DetailedAnalysis
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 8.2 Extend TabBar with 'actions' tab
    - Add `'actions'` to `TabId` union type
    - Add `{ id: 'actions', label: '⚡ Actions' }` to tabs array
    - Add conditional red accent styling (bg-red-500, border-red-400) for active actions tab
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 8.3 Update AnalysisTabs to render ActionItemsTab
    - Import ActionItemsTab
    - Accept `analysisResult: AnalysisResult` as additional prop
    - Add `case 'actions'` to renderTabContent switch
    - _Requirements: 1.1, 2.1_

  - [x] 8.4 Update App.tsx to pass analysisResult to AnalysisTabs
    - Pass `analysisResult={analysisData}` prop to AnalysisTabs component
    - _Requirements: 1.1_

  - [ ]* 8.5 Write unit tests for TabBar with actions tab
    - Test 6 tabs render in correct order
    - Test red accent styling when actions tab is active
    - Test inactive styling matches other tabs
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 8.6 Write unit tests for ActionItemsTab layout selection
    - Test BUY verdict renders BuyLayout
    - Test HOLD/PASS/WAIT/AVOID renders WatchlistLayout
    - Test case-insensitive matching
    - Test unknown verdict defaults to WatchlistLayout
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- All components use Tailwind CSS dark mode classes consistent with existing design system
- localStorage operations use the storageUtils abstraction for error handling
- File downloads (CSV, ICS) use the downloadFile utility for consistent behavior

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10", "2.11", "2.12", "2.13", "2.14", "2.15"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 4, "tasks": ["4.8", "5.6", "6.1"] },
    { "id": 5, "tasks": ["6.2", "8.1"] },
    { "id": 6, "tasks": ["8.2"] },
    { "id": 7, "tasks": ["8.3", "8.4"] },
    { "id": 8, "tasks": ["8.5", "8.6"] }
  ]
}
```
