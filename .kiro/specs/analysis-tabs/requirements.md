# Requirements Document

## Introduction

"Analysis Tabs" is Step 2 of the "4 Masters Investor" stock analysis application. This feature adds a horizontal tab navigation system below the Quick Facts card in the results section, providing detailed analysis content for each of the four investment masters (Buffett, Munger, Lynch, Rothschild) plus a Technical Analysis tab. Each tab displays structured analysis data including scores, checklists, verdicts, and visual indicators. The feature extends the existing React + TypeScript + Vite + Tailwind CSS application without modifying the existing search and verdict sections.

## Glossary

- **Tab_Bar**: The horizontal navigation bar containing five clickable tabs positioned below the Quick_Facts_Card
- **Tab_Content_Area**: The content region below the Tab_Bar that displays analysis content for the currently active tab
- **Active_Tab**: The currently selected tab, visually distinguished with blue background and bold text
- **Buffett_Tab**: The tab displaying Warren Buffett's value investing analysis
- **Munger_Tab**: The tab displaying Charlie Munger's mental models and failure analysis
- **Lynch_Tab**: The tab displaying Peter Lynch's growth-at-a-reasonable-price analysis
- **Rothschild_Tab**: The tab displaying Rothschild contrarian timing analysis
- **Technical_Tab**: The tab displaying technical analysis signals and chart data
- **Moat_Checklist**: A list of competitive advantage indicators (network effects, switching costs, cost advantages, brand/patents, scale advantages) with status icons
- **Pre_Mortem_Card**: A scenario card in the Munger tab showing a potential failure mode with probability and mitigation
- **Mental_Model**: A thinking framework from a specific discipline used to evaluate a stock
- **Blood_Level_Indicator**: A visual gauge in the Rothschild tab showing the degree of market fear/panic
- **Contrarian_Signal**: A yes/no indicator measuring whether market conditions favor contrarian buying
- **Entry_Zone**: A price range with associated position sizing recommendation
- **Signal_Row**: A row in the Technical tab signals table showing an indicator name, status, and score
- **Analysis_Data**: The mock data structure containing all fields required to populate the five analysis tabs
- **Expandable_Section**: A content section that can be toggled between collapsed and expanded states on click
- **Score_Indicator**: An emoji-based status icon (✅, ⚠️, or ❌) representing pass, caution, or fail

## Requirements

### Requirement 1: Tab Bar Navigation

**User Story:** As a user, I want a horizontal tab bar below the Quick Facts card, so that I can navigate between detailed analysis views for each investment master.

#### Acceptance Criteria

1. THE Tab_Bar SHALL render five tabs labeled "Buffett", "Munger", "Lynch", "Rothschild", and "Technical" in that order below the Quick_Facts_Card.
2. THE Tab_Bar SHALL use sticky positioning (sticky top-0) so that the tabs remain visible when the user scrolls through tab content.
3. THE Tab_Bar SHALL use bg-gray-800 background styling.
4. WHEN the page loads with results displayed, THE Tab_Bar SHALL set the Buffett_Tab as the Active_Tab by default.
5. WHEN a tab is active, THE Tab_Bar SHALL style the Active_Tab with bg-blue-500, text-white, font-bold, and border-b-4 border-blue-400.
6. WHEN a tab is inactive, THE Tab_Bar SHALL style the tab with text-gray-400, hover:text-white, and hover:bg-gray-700.
7. THE Tab_Bar SHALL apply px-6 py-3 padding and cursor-pointer to each tab.
8. THE Tab_Bar SHALL apply transition-all duration-200 to each tab for smooth hover and active state changes.
9. WHEN the viewport width is below the mobile breakpoint, THE Tab_Bar SHALL enable horizontal scrolling (overflow-x-auto) so all tabs remain accessible.

### Requirement 2: Tab Content Switching

**User Story:** As a user, I want to click a tab and see the corresponding analysis content, so that I can explore each master's detailed perspective on the stock.

#### Acceptance Criteria

1. WHEN the user clicks a tab, THE Tab_Content_Area SHALL display the content corresponding to the selected tab.
2. WHEN the user clicks a tab, THE Tab_Content_Area SHALL animate the new content with a fade-in transition (300ms duration).
3. WHEN the user clicks a tab, THE App SHALL scroll to the top of the Tab_Content_Area.
4. THE Tab_Content_Area SHALL display only one tab's content at a time.
5. WHEN the user clicks the already-active tab, THE Tab_Content_Area SHALL remain unchanged.

### Requirement 3: Buffett Tab Content

**User Story:** As a user, I want to see Warren Buffett's detailed value investing analysis, so that I can evaluate the stock through his investment philosophy of buying wonderful companies at fair prices.

#### Acceptance Criteria

1. THE Buffett_Tab SHALL display the title "🎩 Warren Buffett Analysis" styled with text-3xl and font-bold.
2. THE Buffett_Tab SHALL display the Buffett score as "Score: {buffett_score}/10" in text-xl text-blue-400 styling.
3. THE Buffett_Tab SHALL display a "Business Understanding" section containing the stock's sector, business model description, and complexity assessment in a card styled with bg-gray-800, rounded-lg, p-6, and mb-4.
4. THE Buffett_Tab SHALL display a "Competitive Moat" section containing a moat score with a progress bar and a checklist of five moat factors (network effects, switching costs, cost advantages, brand/patents, scale advantages) each with a Score_Indicator.
5. THE Buffett_Tab SHALL display a "Financial Quality" section with a 2-column grid showing Revenue Growth, Free Cash Flow, Return on Equity, Profit Margin, and Debt/Equity each with a Score_Indicator.
6. THE Buffett_Tab SHALL display a "Management Quality" section containing CEO track record, insider buying activity, stock compensation assessment, and capital allocation score.
7. THE Buffett_Tab SHALL display a "Valuation" section containing intrinsic value estimate, current price, margin of safety percentage, P/E ratio, and P/S ratio.
8. THE Buffett_Tab SHALL display a "Buffett's Verdict" section as a quote box styled with border-l-4 border-blue-500, bg-blue-900/20, and italic text.

### Requirement 4: Munger Tab Content

**User Story:** As a user, I want to see Charlie Munger's mental models analysis, so that I can evaluate the stock through multi-disciplinary thinking and identify potential failure scenarios.

#### Acceptance Criteria

1. THE Munger_Tab SHALL display the title "🧠 Charlie Munger Analysis" styled with text-3xl and font-bold.
2. THE Munger_Tab SHALL display the Munger score as "Score: {munger_score}/10" in text-xl text-purple-400 styling.
3. THE Munger_Tab SHALL display a "Pre-Mortem / Failure Scenarios" section containing 4-5 Pre_Mortem_Cards, each showing a scenario name, probability bar, description, and mitigation strategy, styled with border-l-4 using red, yellow, or green based on severity.
4. THE Munger_Tab SHALL display a "Mental Models Checklist" section with a 2-column grid containing 6-8 mental models, each with a Score_Indicator and explanation text.
5. THE Munger_Tab SHALL display a "Multi-Disciplinary Analysis" section with sub-tabs for Physics, Biology, Psychology, Economics, History, and Math, each containing analysis content through that disciplinary lens.
6. THE Munger_Tab SHALL display a "Munger's Verdict" section as a quote box styled with border-l-4 border-purple-500, bg-purple-900/20, and italic text.

### Requirement 5: Lynch Tab Content

**User Story:** As a user, I want to see Peter Lynch's growth analysis, so that I can evaluate the stock's potential as a growth investment using his "invest in what you know" philosophy.

#### Acceptance Criteria

1. THE Lynch_Tab SHALL display the title "🔍 Peter Lynch Analysis" styled with text-3xl and font-bold.
2. THE Lynch_Tab SHALL display the Lynch score as "Score: {lynch_score}/10" in text-xl text-green-400 styling.
3. THE Lynch_Tab SHALL display a "Know What You Own" section containing a plain-language explanation of the business that passes the "explain to a 10-year-old" test.
4. THE Lynch_Tab SHALL display an "Industry Growth" section containing Total Addressable Market size, industry growth rate, and growth trend assessment.
5. THE Lynch_Tab SHALL display a "PEG Ratio / GARP Analysis" section containing the P/E ratio, earnings growth rate, calculated PEG ratio, and a qualitative assessment of the PEG value.
6. THE Lynch_Tab SHALL display a "10-Bagger Potential" section containing a checklist of growth criteria, a narrative path to 10x returns, and a probability assessment.
7. THE Lynch_Tab SHALL display a "Lynch's Verdict" section as a quote box styled with border-l-4 border-green-500, bg-green-900/20, and italic text.

### Requirement 6: Rothschild Tab Content

**User Story:** As a user, I want to see Rothschild's contrarian timing analysis, so that I can evaluate whether market fear creates a buying opportunity for this stock.

#### Acceptance Criteria

1. THE Rothschild_Tab SHALL display the title "🌍 Rothschild Timing Analysis" styled with text-3xl and font-bold.
2. THE Rothschild_Tab SHALL display the Rothschild score as "Score: {rothschild_score}/10" in text-xl text-yellow-400 styling.
3. THE Rothschild_Tab SHALL display a "Blood in the Streets Detector" section containing a Blood_Level_Indicator visual, VIX level, sector performance metric, social sentiment score, and short interest percentage.
4. THE Rothschild_Tab SHALL display a "Contrarian Signals" section containing four yes/no indicators with an aggregate contrarian score.
5. THE Rothschild_Tab SHALL display a "Position Sizing" section containing recommended portfolio percentage, maximum loss amount, and Kelly criterion calculation.
6. THE Rothschild_Tab SHALL display an "Entry Zones" section containing a table with Best, Good, and OK entry zones showing price ranges and recommended position percentages.
7. THE Rothschild_Tab SHALL display a "Rothschild's Verdict" section as a quote box styled with border-l-4 border-yellow-500, bg-yellow-900/20, and italic text.

### Requirement 7: Technical Tab Content

**User Story:** As a user, I want to see technical analysis signals and chart data, so that I can evaluate the stock's price action and identify optimal entry timing.

#### Acceptance Criteria

1. THE Technical_Tab SHALL display the title "📈 Technical Analysis" styled with text-3xl and font-bold.
2. THE Technical_Tab SHALL display the timing score as "{technical_score}/16" in text-xl styling.
3. THE Technical_Tab SHALL display a "Timing Verdict" section as a large card showing a BUY NOW, WAIT, or AVOID recommendation with buy zone price, stop loss price, and take profit target.
4. THE Technical_Tab SHALL display a "Signals Summary" section as a table with rows for Trend, EMA, RSI, MACD, Volume, and Wyckoff indicators, each showing the indicator status and individual score.
5. THE Technical_Tab SHALL display a "Simple Chart" section containing an SVG-based price chart with support and resistance levels marked and buy zone highlighted.
6. THE Technical_Tab SHALL display an "Entry Strategy" section containing entry zone cards with price ranges and recommended actions.

### Requirement 8: Analysis Data Structure

**User Story:** As a developer, I want a well-defined data structure for all tab content, so that the UI components can render analysis data consistently.

#### Acceptance Criteria

1. THE Analysis_Data SHALL include a buffettAnalysis object containing fields for businessUnderstanding, competitiveMoat (with moatScore and five factor assessments), financialQuality (with five metric assessments), managementQuality, valuation (with intrinsicValue, currentPrice, marginOfSafety, peRatio, psRatio), and verdict quote.
2. THE Analysis_Data SHALL include a mungerAnalysis object containing fields for failureScenarios (array of 4-5 scenarios with name, probability, description, mitigation, severity), mentalModels (array of 6-8 models with name, status, explanation), multiDisciplinary (object with six discipline keys), and verdict quote.
3. THE Analysis_Data SHALL include a lynchAnalysis object containing fields for knowWhatYouOwn explanation, industryGrowth (TAM, growthRate, trend), pegAnalysis (pe, growthRate, peg, assessment), tenBaggerPotential (checklist, path, probability), and verdict quote.
4. THE Analysis_Data SHALL include a rothschildAnalysis object containing fields for bloodInStreets (bloodLevel, vix, sectorPerformance, socialSentiment, shortInterest), contrarianSignals (array of 4 indicators with score), positionSizing (portfolioPercent, maxLoss, kellyCriterion), entryZones (array of 3 zones with label, priceRange, positionPercent), and verdict quote.
5. THE Analysis_Data SHALL include a technicalAnalysis object containing fields for timingScore (out of 16), timingVerdict (recommendation, buyZone, stopLoss, takeProfit), signals (array of 6 indicators with name, status, score), chartData (pricePoints, supportLevel, resistanceLevel, buyZone), and entryStrategy (array of zone cards).
6. WHEN a ticker is not found in predefined mock data, THE App SHALL generate deterministic placeholder Analysis_Data using the same approach as the existing placeholder generation for basic analysis data.

### Requirement 9: Card and Section Styling

**User Story:** As a user, I want consistent and visually appealing card styling across all tabs, so that the analysis content is easy to read and navigate.

#### Acceptance Criteria

1. THE Tab_Content_Area SHALL style all content cards with bg-gray-800, rounded-lg, and p-6.
2. THE Tab_Content_Area SHALL apply mb-4 spacing between cards within a tab and mb-8 between major content blocks.
3. THE Tab_Content_Area SHALL style section headers with text-xl or text-2xl and font-semibold.
4. THE Tab_Content_Area SHALL use emoji characters (✅, ❌, ⚠️, 🎯) as Score_Indicators rather than icon libraries.
5. THE Tab_Content_Area SHALL style verdict quote boxes with border-l-4 using the master's theme color, a semi-transparent background (bg-{color}-900/20), and italic text.
6. THE Tab_Content_Area SHALL style progress bars with bg-gray-700 background track and colored fill proportional to the value.

### Requirement 10: Expandable Sections

**User Story:** As a user, I want to expand and collapse analysis sections, so that I can focus on the information most relevant to me without being overwhelmed.

#### Acceptance Criteria

1. WHEN the user clicks an Expandable_Section header, THE Tab_Content_Area SHALL toggle the section between collapsed and expanded states.
2. WHEN an Expandable_Section is collapsed, THE Tab_Content_Area SHALL hide the section body content and display only the header.
3. WHEN an Expandable_Section transitions between states, THE Tab_Content_Area SHALL animate the transition smoothly.
4. WHEN a tab is first displayed, THE Tab_Content_Area SHALL render all sections in the expanded state by default.

### Requirement 11: Mobile Responsiveness

**User Story:** As a user on a mobile device, I want the analysis tabs and content to be fully usable, so that I can review stock analysis on my phone.

#### Acceptance Criteria

1. WHEN the viewport width is below the mobile breakpoint, THE Tab_Bar SHALL allow horizontal scrolling to access all five tabs.
2. WHEN the viewport width is below the mobile breakpoint, THE Tab_Content_Area SHALL display content cards at full width.
3. WHEN the viewport width is below the mobile breakpoint, THE Tab_Content_Area SHALL stack multi-column grids into a single column layout.
4. WHEN the viewport width is below the mobile breakpoint, THE Tab_Content_Area SHALL maintain readable text sizes and adequate touch target sizes for interactive elements.

### Requirement 12: Integration with Existing Results Section

**User Story:** As a user, I want the analysis tabs to appear seamlessly within the existing results page, so that the experience feels cohesive with the search, verdict, and quick facts sections.

#### Acceptance Criteria

1. THE Tab_Bar SHALL render below the Quick_Facts_Card section and above the "New Search" button in the existing results layout.
2. THE Tab_Bar SHALL use styling consistent with the existing dark mode theme (bg-gray-800, text-white, Tailwind CSS utilities).
3. WHEN the user performs a new search, THE App SHALL reset the Active_Tab to the Buffett_Tab default.
4. THE Tab_Content_Area SHALL not modify or interfere with the rendering of the existing Company Header, Verdict_Card, Master_Scores_Card, or Quick_Facts_Card components.
