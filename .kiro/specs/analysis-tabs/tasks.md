# Implementation Plan: Analysis Tabs

## Overview

This plan implements a tabbed analysis interface below the Quick Facts card, adding five detailed analysis views (Buffett, Munger, Lynch, Rothschild, Technical). The implementation proceeds bottom-up: data types and generation first, then shared UI primitives, then individual tab components, and finally integration into the existing App layout.

## Tasks

- [x] 1. Define DetailedAnalysis types and data layer
  - [x] 1.1 Add DetailedAnalysis types to src/data/types.ts
    - Add all interfaces: MoatFactor, FinancialMetric, BuffettAnalysis, FailureScenario, MentalModel, MungerAnalysis, LynchAnalysis, ContrarianSignal, EntryZone, RothschildAnalysis, TechnicalSignal, TechnicalAnalysis, DetailedAnalysis
    - Export all new types
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 1.2 Create predefined detailed mock data
    - Create `src/data/detailedMockData.ts` with `PREDEFINED_DETAILED_DATA: Record<string, DetailedAnalysis>`
    - Add complete detailed analysis entries for AAPL, NVDA, QTUM, PTT, AOT, CPALL
    - Each entry must populate all five analysis sub-objects with realistic investment data
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 1.3 Create placeholder generator for detailed analysis
    - Create `src/data/generateDetailedPlaceholder.ts`
    - Export `hashString` and `seededRandom` from `generatePlaceholder.ts` so they can be reused
    - Implement `generatePlaceholderDetailedAnalysis(ticker: string): DetailedAnalysis`
    - Use the same deterministic seeded-random approach: hash the ticker, consume random values in fixed order
    - Pick from predefined arrays of descriptions, model names, scenario templates
    - Generate all sub-objects: buffettAnalysis, mungerAnalysis, lynchAnalysis, rothschildAnalysis, technicalAnalysis
    - _Requirements: 8.6_

  - [x] 1.4 Create getDetailedAnalysis function
    - Create `src/data/getDetailedAnalysis.ts`
    - Implement `getDetailedAnalysis(ticker: string): DetailedAnalysis` following the same pattern as `getAnalysis`
    - Normalize ticker to uppercase, check predefined data first, fall back to placeholder generator
    - _Requirements: 8.6, 12.3_

  - [x] 1.5 Write unit tests for getDetailedAnalysis and placeholder generator
    - Create `src/data/getDetailedAnalysis.test.ts`
    - Test that predefined tickers return predefined data
    - Test that unknown tickers return deterministic placeholder data (same ticker → same result)
    - Test that all fields are populated with valid values
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 2. Checkpoint - Ensure data layer compiles and tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Build shared UI primitives
  - [x] 3.1 Create ExpandableSection component
    - Create `src/components/ExpandableSection.tsx`
    - Props: title (string), defaultExpanded (boolean, defaults to true), children (ReactNode)
    - Manage local `isExpanded` state
    - Render header with click handler to toggle state
    - Animate content show/hide with smooth transition
    - Style header with text-xl font-semibold, add chevron indicator for expand/collapse state
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 3.2 Create PriceChart SVG component
    - Create `src/components/PriceChart.tsx`
    - Props: pricePoints (number[]), supportLevel (number), resistanceLevel (number), buyZone ({ low, high })
    - Render an SVG element with viewBox for responsive sizing
    - Plot price points as a polyline/path
    - Draw horizontal dashed lines for support and resistance levels with labels
    - Highlight buy zone as a semi-transparent rectangle
    - Use Tailwind-compatible colors (blue for price line, green for support, red for resistance, green/20 for buy zone)
    - _Requirements: 7.5_

  - [x] 3.3 Write unit tests for ExpandableSection
    - Create `src/components/ExpandableSection.test.tsx`
    - Test default expanded state renders children
    - Test clicking header toggles visibility
    - Test defaultExpanded=false starts collapsed
    - _Requirements: 10.1, 10.2, 10.4_

- [x] 4. Build TabBar and AnalysisTabs container
  - [x] 4.1 Create TabBar component
    - Create `src/components/TabBar.tsx`
    - Define `TabId` type: 'buffett' | 'munger' | 'lynch' | 'rothschild' | 'technical'
    - Props: activeTab (TabId), onTabChange ((tab: TabId) => void)
    - Render five tab buttons in order: Buffett, Munger, Lynch, Rothschild, Technical
    - Apply sticky top-0 positioning, bg-gray-800 background, z-10
    - Active tab: bg-blue-500 text-white font-bold border-b-4 border-blue-400
    - Inactive tab: text-gray-400 hover:text-white hover:bg-gray-700
    - All tabs: px-6 py-3 cursor-pointer transition-all duration-200
    - Enable overflow-x-auto for mobile horizontal scrolling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [x] 4.2 Create AnalysisTabs container component
    - Create `src/components/AnalysisTabs.tsx`
    - Props: data (DetailedAnalysis), masterScores ({ buffett, munger, lynch, rothschild })
    - Manage local `activeTab` state (TabId), default to 'buffett'
    - Render TabBar and conditionally render the active tab component
    - Apply fade-in animation (300ms) when tab content changes
    - Scroll to top of tab content area on tab change
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 12.3_

  - [x] 4.3 Write unit tests for TabBar
    - Create `src/components/TabBar.test.tsx`
    - Test all five tabs render in correct order
    - Test active tab has correct styling classes
    - Test clicking a tab calls onTabChange with correct TabId
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

- [x] 5. Implement individual tab components
  - [x] 5.1 Create BuffettTab component
    - Create `src/components/tabs/BuffettTab.tsx`
    - Props: data (BuffettAnalysis), score (number)
    - Render title "🎩 Warren Buffett Analysis" with text-3xl font-bold
    - Render score "Score: {score}/10" in text-xl text-blue-400
    - Render Business Understanding section: sector, description, complexity in bg-gray-800 rounded-lg p-6 mb-4 card
    - Render Competitive Moat section: moat score progress bar + 5 factor checklist with ✅/⚠️/❌ indicators
    - Render Financial Quality section: 2-column grid of metrics with status indicators
    - Render Management Quality section: CEO track record, insider buying, stock compensation, capital allocation score
    - Render Valuation section: intrinsic value, current price, margin of safety %, P/E, P/S
    - Render Buffett's Verdict as quote box: border-l-4 border-blue-500 bg-blue-900/20 italic
    - Wrap each major section in ExpandableSection
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 5.2 Create MungerTab component
    - Create `src/components/tabs/MungerTab.tsx`
    - Props: data (MungerAnalysis), score (number)
    - Render title "🧠 Charlie Munger Analysis" with text-3xl font-bold
    - Render score "Score: {score}/10" in text-xl text-purple-400
    - Render Pre-Mortem / Failure Scenarios section: 4-5 cards with border-l-4 colored by severity (red=high, yellow=medium, green=low), probability bar, description, mitigation
    - Render Mental Models Checklist: 2-column grid, each model with ✅/⚠️/❌ and explanation
    - Render Multi-Disciplinary Analysis with local sub-tabs state (activeDiscipline): Physics, Biology, Psychology, Economics, History, Math
    - Render Munger's Verdict as quote box: border-l-4 border-purple-500 bg-purple-900/20 italic
    - Wrap each major section in ExpandableSection
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 5.3 Create LynchTab component
    - Create `src/components/tabs/LynchTab.tsx`
    - Props: data (LynchAnalysis), score (number)
    - Render title "🔍 Peter Lynch Analysis" with text-3xl font-bold
    - Render score "Score: {score}/10" in text-xl text-green-400
    - Render Know What You Own section: plain-language business explanation
    - Render Industry Growth section: TAM, growth rate, trend assessment
    - Render PEG Ratio / GARP Analysis section: P/E, growth rate, PEG, qualitative assessment
    - Render 10-Bagger Potential section: checklist with ✓/✗, narrative path, probability
    - Render Lynch's Verdict as quote box: border-l-4 border-green-500 bg-green-900/20 italic
    - Wrap each major section in ExpandableSection
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 5.4 Create RothschildTab component
    - Create `src/components/tabs/RothschildTab.tsx`
    - Props: data (RothschildAnalysis), score (number)
    - Render title "🌍 Rothschild Timing Analysis" with text-3xl font-bold
    - Render score "Score: {score}/10" in text-xl text-yellow-400
    - Render Blood in the Streets Detector: blood level visual gauge, VIX, sector performance, social sentiment, short interest
    - Render Contrarian Signals: 4 yes/no indicators with aggregate score
    - Render Position Sizing: portfolio %, max loss, Kelly criterion
    - Render Entry Zones: table with Best/Good/OK rows showing price range and position %
    - Render Rothschild's Verdict as quote box: border-l-4 border-yellow-500 bg-yellow-900/20 italic
    - Wrap each major section in ExpandableSection
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 5.5 Create TechnicalTab component
    - Create `src/components/tabs/TechnicalTab.tsx`
    - Props: data (TechnicalAnalysis)
    - Render title "📈 Technical Analysis" with text-3xl font-bold
    - Render timing score "{score}/16" in text-xl
    - Render Timing Verdict card: BUY NOW/WAIT/AVOID recommendation, buy zone, stop loss, take profit
    - Render Signals Summary table: rows for each signal with name, status, score
    - Render Simple Chart section using PriceChart component with chartData props
    - Render Entry Strategy section: zone cards with price ranges and actions
    - Wrap each major section in ExpandableSection
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.1, 9.2, 9.3_

- [x] 6. Checkpoint - Ensure all tab components compile without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integrate AnalysisTabs into App
  - [x] 7.1 Wire AnalysisTabs into App.tsx results section
    - Import `getDetailedAnalysis` and call it alongside `getAnalysis` in `handleSearch`
    - Store detailed analysis data in new state: `detailedAnalysisData`
    - Import and render `AnalysisTabs` component between QuickFactsCard and NewSearchButton sections
    - Pass `detailedAnalysisData` and `analysisData.masterScores` as props
    - Reset `detailedAnalysisData` in `handleNewSearch`
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 7.2 Write integration tests for tab navigation
    - Create `src/components/AnalysisTabs.test.tsx`
    - Test that Buffett tab is active by default
    - Test clicking each tab renders the corresponding content
    - Test that only one tab's content is visible at a time
    - Test that clicking the already-active tab does not change content
    - _Requirements: 2.1, 2.4, 2.5, 1.4_

- [x] 8. Mobile responsiveness and polish
  - [x] 8.1 Ensure mobile responsive layout
    - Verify TabBar has overflow-x-auto and whitespace-nowrap for horizontal scroll on mobile
    - Ensure tab content cards use full width on small screens
    - Convert multi-column grids (Financial Quality, Mental Models) to single column on mobile using responsive Tailwind classes (grid-cols-1 md:grid-cols-2)
    - Ensure adequate touch target sizes (min 44px height for tabs)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 9. Final checkpoint - Ensure all tests pass and app renders correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design has no Correctness Properties section, so property-based tests are not included
- The project uses TypeScript with React, Vite, Tailwind CSS, Vitest, and React Testing Library
- The existing `hashString` and `seededRandom` utilities in `generatePlaceholder.ts` should be exported and reused
- Checkpoints ensure incremental validation at key integration points
