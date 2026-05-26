# Requirements Document

## Introduction

The Decision Journal View replaces the existing placeholder JournalPage with a full-featured journal interface for reviewing, filtering, analyzing, and exporting past investment decisions. The page displays performance summary cards, a filterable decision list (table or card view), a detail modal with tabbed content, a Mistakes Autopsy section, Performance Analytics charts (using Recharts), and CSV/JSON export. Data is sourced from localStorage under the key "investment_decisions" using the existing DecisionEntry type. The layout is full-width single column, stacked vertically, responsive, and styled with Tailwind CSS in dark mode.

## Glossary

- **Journal_Page**: The full-width single-column page at the /journal route that displays all decision journal content
- **Decision_Entry**: A single investment decision record stored in localStorage conforming to the DecisionEntry type
- **Summary_Cards**: A row of performance metric cards displayed at the top of the Journal_Page
- **Filter_Bar**: The section containing search, decision filter, status filter, date range, sort, and view mode controls
- **Table_View**: A tabular display of decision entries with columns for date, ticker, decision, prices, P&L, status, and actions
- **Card_View**: A grid display of decision entries as individual cards with colored left borders
- **Detail_Modal**: A modal overlay displaying full details of a single decision entry with tabbed navigation
- **Overview_Tab**: The first tab in the Detail_Modal showing key metrics and a timeline
- **Reasoning_Tab**: The second tab in the Detail_Modal showing the original reasoning text
- **Analysis_Tab**: The third tab in the Detail_Modal showing master scores at time of decision
- **Updates_Tab**: The fourth tab in the Detail_Modal showing a status change form with exit info, lessons learned, and tags
- **Mistakes_Autopsy**: A collapsible section showing closed decisions with losses, their lessons, and summary statistics
- **Performance_Analytics**: A section displaying charts and key metrics about decision performance over time
- **Export_Utility**: The functionality that generates and downloads decision data as CSV or JSON files
- **Empty_State**: The placeholder UI displayed when no decision entries exist in storage

## Requirements

### Requirement 1: Performance Summary Cards

**User Story:** As an investor, I want to see high-level performance metrics at a glance, so that I can quickly assess my overall decision-making track record.

#### Acceptance Criteria

1. THE Journal_Page SHALL display four Summary_Cards in a horizontal row: Total Decisions, Win Rate, Avg Return, and Best Trade.
2. WHEN Decision_Entry records exist in localStorage, THE Summary_Cards SHALL compute Total Decisions as the count of all Decision_Entry records.
3. WHEN closed Decision_Entry records exist, THE Summary_Cards SHALL compute Win Rate as the percentage of closed decisions with positive P&L.
4. WHEN closed Decision_Entry records exist, THE Summary_Cards SHALL compute Avg Return as the mean percentage return across all closed decisions.
5. WHEN closed Decision_Entry records exist, THE Summary_Cards SHALL compute Best Trade as the ticker and percentage return of the highest-performing closed decision.
6. WHEN no closed Decision_Entry records exist, THE Summary_Cards SHALL display zero or dash values for Win Rate, Avg Return, and Best Trade.

### Requirement 2: Filter and Search Controls

**User Story:** As an investor, I want to filter and search my decisions by various criteria, so that I can find specific entries and analyze subsets of my history.

#### Acceptance Criteria

1. THE Filter_Bar SHALL provide a text search input that filters Decision_Entry records by ticker symbol (case-insensitive partial match).
2. THE Filter_Bar SHALL provide a decision type filter with options: All, BUY, PASS, WATCHLIST.
3. THE Filter_Bar SHALL provide a status filter with options: All, Active, Closed, Watching.
4. THE Filter_Bar SHALL provide a date range filter with start date and end date inputs.
5. THE Filter_Bar SHALL provide a sort selector with options: Newest First, Oldest First, Best P&L, Worst P&L.
6. THE Filter_Bar SHALL provide a view mode toggle to switch between Table_View and Card_View.
7. WHEN the user changes any filter value, THE Journal_Page SHALL immediately update the displayed decision list without requiring a submit action.

### Requirement 3: Table View Display

**User Story:** As an investor, I want to see my decisions in a structured table format, so that I can compare entries side by side efficiently.

#### Acceptance Criteria

1. WHEN Table_View is selected, THE Journal_Page SHALL display a table with columns: Date, Ticker and Company Name, Decision, Entry Price, Current Price, P&L (percentage and dollar amount), Status, and Actions.
2. THE Table_View SHALL display the Decision column value with a colored badge: green for BUY, yellow for PASS, blue for WATCHLIST.
3. WHEN P&L is positive, THE Table_View SHALL display the P&L value in green text.
4. WHEN P&L is negative, THE Table_View SHALL display the P&L value in red text.
5. THE Table_View SHALL display the Status column as a styled badge indicating active, closed, or watching state.
6. THE Table_View SHALL provide action buttons for each row: a view button that opens the Detail_Modal and an edit button that opens the Detail_Modal on the Updates_Tab.

### Requirement 4: Card View Display

**User Story:** As an investor, I want an alternative card-based layout for browsing decisions, so that I can see more context per entry in a visual format.

#### Acceptance Criteria

1. WHEN Card_View is selected, THE Journal_Page SHALL display Decision_Entry records as a responsive grid of cards.
2. THE Card_View SHALL style each card with a 4-pixel left border colored by decision type: green for BUY, yellow for PASS, blue for WATCHLIST.
3. THE Card_View SHALL display on each card: ticker, company name, decision badge, date, entry price, current price, P&L, status badge, and a truncated reasoning excerpt.
4. WHEN the user clicks a card in Card_View, THE Journal_Page SHALL open the Detail_Modal for that Decision_Entry.

### Requirement 5: Detail Modal with Tabs

**User Story:** As an investor, I want to view full details of a decision in a modal overlay with organized tabs, so that I can review all aspects without leaving the journal page.

#### Acceptance Criteria

1. WHEN the user triggers a view action on a Decision_Entry, THE Journal_Page SHALL display the Detail_Modal as an overlay on top of the page content.
2. THE Detail_Modal SHALL provide four tabs: Overview, Reasoning, Analysis, and Updates.
3. THE Overview_Tab SHALL display key metrics (entry price, current price, P&L, position size, status) and a timeline of review dates.
4. THE Reasoning_Tab SHALL display the full original reasoning text and expected outcome from the Decision_Entry.
5. THE Analysis_Tab SHALL display the master scores (Buffett, Munger, Lynch, Rothschild, Overall) recorded at the time of the decision.
6. THE Updates_Tab SHALL provide a form to change the decision status, enter exit price, record actual outcome, add lessons learned, and assign tags.
7. WHEN the user clicks outside the Detail_Modal or clicks a close button, THE Detail_Modal SHALL close and return focus to the Journal_Page.
8. WHEN the user submits changes on the Updates_Tab, THE Journal_Page SHALL save the updated Decision_Entry to localStorage and refresh the displayed data.

### Requirement 6: Mistakes Autopsy Section

**User Story:** As an investor, I want to review my losing decisions with their lessons in a dedicated section, so that I can learn from past mistakes and improve my process.

#### Acceptance Criteria

1. THE Journal_Page SHALL display a Mistakes_Autopsy section as a collapsible panel below the decision list.
2. THE Mistakes_Autopsy SHALL display only closed Decision_Entry records that have negative P&L.
3. THE Mistakes_Autopsy SHALL display for each losing decision: ticker, decision type, loss amount (percentage and dollar), and the lessons learned text.
4. THE Mistakes_Autopsy SHALL display summary statistics: total number of losses, total dollar amount lost, and average loss percentage.
5. WHEN no closed losing decisions exist, THE Mistakes_Autopsy SHALL display a message indicating no losses to review.

### Requirement 7: Performance Analytics

**User Story:** As an investor, I want to see visual charts and statistics about my decision performance, so that I can identify patterns and track improvement over time.

#### Acceptance Criteria

1. THE Performance_Analytics section SHALL display a monthly returns bar chart rendered using the Recharts library.
2. THE Performance_Analytics section SHALL display a decision breakdown pie chart showing the proportion of BUY, PASS, and WATCHLIST decisions.
3. THE Performance_Analytics section SHALL display an outcome distribution chart showing wins versus losses for closed decisions.
4. THE Performance_Analytics section SHALL display key metrics: win rate percentage, average win percentage, average loss percentage, profit factor (total wins divided by total losses), and current streak (consecutive wins or losses).
5. WHEN fewer than two closed Decision_Entry records exist, THE Performance_Analytics section SHALL display a message indicating insufficient data for charts.

### Requirement 8: Export Functionality

**User Story:** As an investor, I want to export my decision journal data as CSV or JSON, so that I can back up my data or analyze it in external tools.

#### Acceptance Criteria

1. THE Journal_Page SHALL provide an export button with options for CSV and JSON formats.
2. WHEN the user selects CSV export, THE Export_Utility SHALL generate a CSV file containing all Decision_Entry fields with appropriate column headers and trigger a browser download using the downloadFile utility.
3. WHEN the user selects JSON export, THE Export_Utility SHALL generate a JSON file containing the full array of Decision_Entry records and trigger a browser download using the downloadFile utility.
4. THE Export_Utility SHALL name exported files with the pattern "decision-journal-{date}" where date is the current date in YYYY-MM-DD format.

### Requirement 9: Empty State

**User Story:** As a new user, I want to see a helpful empty state when I have no decisions, so that I understand how to get started with the journal.

#### Acceptance Criteria

1. WHEN no Decision_Entry records exist in localStorage, THE Journal_Page SHALL display the Empty_State instead of the filter bar, decision list, analytics, and autopsy sections.
2. THE Empty_State SHALL display an informative message explaining that no decisions have been recorded.
3. THE Empty_State SHALL provide guidance directing the user to the Analyze page to create their first investment decision.

### Requirement 10: Data Loading and Persistence

**User Story:** As an investor, I want my decisions to load from localStorage on page visit and persist changes immediately, so that my data is always current and available.

#### Acceptance Criteria

1. WHEN the Journal_Page mounts, THE Journal_Page SHALL load Decision_Entry records from localStorage using the key "investment_decisions" via the loadFromStorage utility.
2. WHEN the user updates a Decision_Entry via the Updates_Tab, THE Journal_Page SHALL persist the updated array to localStorage using the saveToStorage utility.
3. IF localStorage is unavailable or contains malformed data, THEN THE Journal_Page SHALL gracefully fall back to an empty array and display the Empty_State.

### Requirement 11: Responsive Layout and Dark Mode

**User Story:** As an investor, I want the journal page to work well on all screen sizes and match the application dark theme, so that I have a consistent experience across devices.

#### Acceptance Criteria

1. THE Journal_Page SHALL use a full-width single-column layout with content stacked vertically.
2. THE Journal_Page SHALL use Tailwind CSS dark mode classes consistent with the existing application theme (bg-gray-900, bg-gray-800, text-white, text-gray-400).
3. THE Summary_Cards SHALL display in a responsive grid: four columns on desktop, two columns on tablet, one column on mobile.
4. THE Card_View grid SHALL adapt from three columns on desktop to two on tablet to one on mobile.
5. THE Detail_Modal SHALL be responsive, occupying full screen on mobile and a centered overlay with max-width on desktop.
6. THE Table_View SHALL be horizontally scrollable on small screens to prevent content overflow.
