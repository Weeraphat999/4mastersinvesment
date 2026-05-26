# Requirements Document

## Introduction

The Portfolio Tracker is a new page within the Four Masters Investment Advisor application that allows users to manage and monitor their investment holdings. It provides summary metrics, a holdings table with sorting and search, allocation visualization via a custom SVG pie chart, risk breakdown, performance rankings, CSV export, simulated price refresh, and integration with the existing Decision Journal. The page persists data in localStorage and follows a responsive two-column layout.

## Glossary

- **Portfolio_Tracker**: The portfolio management page accessible at the `/portfolio` route
- **Holding**: A single investment position stored in the holdings array, containing ticker, shares, average cost, current price, purchase date, category, risk level, and notes
- **Holdings_Table**: The sortable, searchable table displaying all holdings with computed metrics
- **Summary_Cards**: The row of four metric cards showing Total Value, Total P&L, Holdings Count, and High-Risk Exposure
- **Allocation_Chart**: The custom SVG pie chart showing portfolio allocation by holding
- **Risk_Breakdown**: The section displaying risk level distribution using progress bars
- **Add_Holding_Form**: The collapsible form for creating new holdings
- **Navigation_Bar**: The fixed top navigation bar present on all pages
- **Price_Refresh**: The simulated price update mechanism applying random ±1–5% changes to current prices
- **CSV_Export**: The functionality to download holdings data as a CSV file
- **Decision_Journal_Integration**: The prompt shown after a BUY decision offering to add the holding to the portfolio with pre-filled data
- **Over_Limit_Alert**: A warning displayed when a single holding exceeds 15% of total portfolio value

## Requirements

### Requirement 1: Navigation Bar

**User Story:** As a user, I want a fixed top navigation bar on all pages, so that I can navigate between Analyze, Portfolio, and Journal pages from anywhere in the application.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL display a logo on the left side and navigation links on the right side.
2. THE Navigation_Bar SHALL include links to Analyze (`/`), Portfolio (`/portfolio`), and Journal (`/journal`).
3. THE Navigation_Bar SHALL remain fixed at the top of the viewport during scrolling.
4. THE Navigation_Bar SHALL highlight the currently active route link.
5. THE Navigation_Bar SHALL use react-router-dom for client-side navigation between routes.

### Requirement 2: Portfolio Page Header

**User Story:** As a user, I want a clear page header, so that I can identify the Portfolio Tracker page.

#### Acceptance Criteria

1. WHEN the user navigates to `/portfolio`, THE Portfolio_Tracker SHALL display the heading "💼 Portfolio Tracker" at the top of the page content.

### Requirement 3: Summary Cards

**User Story:** As a user, I want to see key portfolio metrics at a glance, so that I can quickly assess my portfolio health.

#### Acceptance Criteria

1. THE Summary_Cards SHALL display four cards: Total Value, Total P&L, Holdings Count, and High-Risk Exposure.
2. THE Summary_Cards SHALL compute Total Value as the sum of (shares × current_price) for all holdings.
3. THE Summary_Cards SHALL compute Total P&L as the sum of ((current_price − avg_cost) × shares) for all holdings.
4. THE Summary_Cards SHALL compute Holdings Count as the total number of holdings in the portfolio.
5. THE Summary_Cards SHALL compute High-Risk Exposure as the percentage of total portfolio value held in holdings with risk_level "high".
6. WHEN a holding is added, edited, or deleted, THE Summary_Cards SHALL recalculate all metrics immediately.

### Requirement 4: Add Holding Form

**User Story:** As a user, I want to add new holdings to my portfolio, so that I can track my investments.

#### Acceptance Criteria

1. THE Add_Holding_Form SHALL be collapsible, defaulting to a collapsed state.
2. WHEN expanded, THE Add_Holding_Form SHALL display input fields for: ticker, shares, average cost (price), purchase date, category, risk level, and notes.
3. THE Add_Holding_Form SHALL require ticker, shares, and average cost fields before submission.
4. WHEN the user submits a valid form, THE Portfolio_Tracker SHALL create a new holding with a unique ID, set current_price equal to avg_cost, and persist the holding to localStorage.
5. WHEN the user submits a valid form, THE Add_Holding_Form SHALL clear all input fields and collapse.
6. IF the user submits the form with missing required fields, THEN THE Add_Holding_Form SHALL display validation error messages next to the invalid fields.

### Requirement 5: Holdings Table

**User Story:** As a user, I want to view, sort, search, edit, and delete my holdings, so that I can manage my portfolio effectively.

#### Acceptance Criteria

1. THE Holdings_Table SHALL display columns for: ticker, company, shares, avg cost, current price, gain/loss, portfolio %, and actions.
2. THE Holdings_Table SHALL allow sorting by any column in ascending and descending order.
3. THE Holdings_Table SHALL provide a search input that filters holdings by ticker or company name.
4. THE Holdings_Table SHALL display gain/loss values with green color for positive values and red color for negative values.
5. THE Holdings_Table SHALL display portfolio percentage as a visual progress bar within the cell.
6. THE Holdings_Table SHALL provide edit and delete action buttons for each holding row.
7. WHEN the user clicks the edit button, THE Holdings_Table SHALL allow inline editing of the holding fields.
8. WHEN the user clicks the delete button, THE Portfolio_Tracker SHALL remove the holding from the array and persist the change to localStorage.
9. THE Holdings_Table SHALL compute gain/loss as (current_price − avg_cost) × shares for each holding.
10. THE Holdings_Table SHALL compute portfolio percentage as (holding_value / total_portfolio_value) × 100 for each holding.

### Requirement 6: Allocation Chart

**User Story:** As a user, I want to see a visual breakdown of my portfolio allocation, so that I can understand my diversification.

#### Acceptance Criteria

1. THE Allocation_Chart SHALL render as a custom SVG pie chart without external charting libraries.
2. THE Allocation_Chart SHALL display each holding as a proportional slice based on its portfolio percentage.
3. THE Allocation_Chart SHALL assign a distinct color to each slice.
4. THE Allocation_Chart SHALL display a legend mapping colors to ticker symbols.
5. WHEN holdings change, THE Allocation_Chart SHALL re-render to reflect the updated allocation.

### Requirement 7: Risk Breakdown

**User Story:** As a user, I want to see my portfolio risk distribution, so that I can assess my exposure to different risk levels.

#### Acceptance Criteria

1. THE Risk_Breakdown SHALL display progress bars for each risk level category (low, medium, high).
2. THE Risk_Breakdown SHALL compute each risk level percentage as (sum of values in that risk level / total portfolio value) × 100.
3. WHEN holdings change, THE Risk_Breakdown SHALL recalculate and re-render the progress bars.

### Requirement 8: Performance Rankings

**User Story:** As a user, I want to see my top and bottom performers, so that I can identify winners and losers in my portfolio.

#### Acceptance Criteria

1. THE Portfolio_Tracker SHALL display a "Top 5 Performers" list ranked by gain/loss percentage in descending order.
2. THE Portfolio_Tracker SHALL display a "Bottom 3 Performers" list ranked by gain/loss percentage in ascending order.
3. THE Portfolio_Tracker SHALL compute gain/loss percentage as ((current_price − avg_cost) / avg_cost) × 100 for each holding.
4. WHEN holdings change, THE Portfolio_Tracker SHALL recalculate and re-render the performance rankings.

### Requirement 9: Over-Limit Alerts

**User Story:** As a user, I want to be warned when a single holding exceeds 15% of my portfolio, so that I can manage concentration risk.

#### Acceptance Criteria

1. WHEN a holding's portfolio percentage exceeds 15%, THE Portfolio_Tracker SHALL display an Over_Limit_Alert for that holding.
2. THE Over_Limit_Alert SHALL identify the ticker and its current portfolio percentage.
3. WHEN the holding's portfolio percentage drops to 15% or below, THE Portfolio_Tracker SHALL remove the Over_Limit_Alert for that holding.

### Requirement 10: CSV Export

**User Story:** As a user, I want to export my holdings as a CSV file, so that I can analyze my portfolio in external tools.

#### Acceptance Criteria

1. WHEN the user clicks the Export CSV button, THE Portfolio_Tracker SHALL generate a CSV file containing all holdings with columns: ticker, company, shares, avg_cost, current_price, gain_loss, portfolio_percent, purchase_date, category, risk_level.
2. WHEN the user clicks the Export CSV button, THE Portfolio_Tracker SHALL trigger a browser file download with the filename "portfolio_export.csv".

### Requirement 11: Simulated Price Refresh

**User Story:** As a user, I want to simulate price changes, so that I can see how my portfolio metrics respond to market movements.

#### Acceptance Criteria

1. WHEN the user clicks the Refresh Prices button, THE Price_Refresh SHALL apply a random change between −5% and +5% to the current_price of each holding.
2. WHEN the Price_Refresh completes, THE Portfolio_Tracker SHALL persist the updated prices to localStorage.
3. WHEN the Price_Refresh completes, THE Portfolio_Tracker SHALL recalculate all derived metrics (summary cards, gain/loss, portfolio percentages, rankings, alerts).

### Requirement 12: localStorage Persistence

**User Story:** As a user, I want my portfolio data to persist across browser sessions, so that I do not lose my holdings data.

#### Acceptance Criteria

1. THE Portfolio_Tracker SHALL store the holdings array in localStorage under a defined key.
2. WHEN the Portfolio page loads, THE Portfolio_Tracker SHALL load holdings from localStorage.
3. WHEN a holding is added, edited, or deleted, THE Portfolio_Tracker SHALL save the updated holdings array to localStorage.
4. IF localStorage contains invalid or corrupted data, THEN THE Portfolio_Tracker SHALL fall back to an empty holdings array.

### Requirement 13: Empty State

**User Story:** As a user, I want to see a helpful message when I have no holdings, so that I know how to get started.

#### Acceptance Criteria

1. WHILE the holdings array is empty, THE Portfolio_Tracker SHALL display an empty state message with guidance on how to add a first holding.
2. WHILE the holdings array is empty, THE Portfolio_Tracker SHALL hide the Holdings_Table, Allocation_Chart, Risk_Breakdown, Performance Rankings, and Over_Limit_Alerts.

### Requirement 14: Decision Journal Integration

**User Story:** As a user, I want to add a holding to my portfolio directly after making a BUY decision in the Decision Journal, so that I can streamline my workflow.

#### Acceptance Criteria

1. WHEN the user saves a BUY decision in the Decision Journal, THE Decision_Journal_Integration SHALL display a prompt offering to add the holding to the portfolio.
2. THE Decision_Journal_Integration SHALL pre-fill the Add_Holding_Form with ticker, company name, entry price target as avg_cost, position size as shares (computed from amount / price), and the current date as purchase_date.
3. WHEN the user confirms the prompt, THE Portfolio_Tracker SHALL create a new holding with the pre-filled data and persist the holding to localStorage.
4. WHEN the user dismisses the prompt, THE Decision_Journal_Integration SHALL close without adding a holding.

### Requirement 15: Responsive Layout

**User Story:** As a user, I want the portfolio page to work well on different screen sizes, so that I can use it on desktop, tablet, and mobile devices.

#### Acceptance Criteria

1. WHILE the viewport width is at desktop size (1024px or wider), THE Portfolio_Tracker SHALL display a two-column layout with 60% width for the left column (summary, form, table) and 40% width for the right column (chart, risk, performers).
2. WHILE the viewport width is at tablet size (768px to 1023px), THE Portfolio_Tracker SHALL stack the columns vertically.
3. WHILE the viewport width is at mobile size (below 768px), THE Portfolio_Tracker SHALL display a condensed single-column layout with reduced padding and font sizes.

### Requirement 16: Floating Action Buttons

**User Story:** As a user, I want quick access to Export CSV, Refresh Prices, and Settings actions, so that I can perform common tasks without scrolling.

#### Acceptance Criteria

1. THE Portfolio_Tracker SHALL display floating action buttons for Export CSV, Refresh Prices, and Settings.
2. THE floating action buttons SHALL remain visible in a fixed position regardless of scroll position.
3. WHEN the user clicks the Export CSV floating button, THE Portfolio_Tracker SHALL trigger the CSV export functionality.
4. WHEN the user clicks the Refresh Prices floating button, THE Portfolio_Tracker SHALL trigger the simulated price refresh functionality.
