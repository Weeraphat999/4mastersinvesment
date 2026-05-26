# Requirements Document

## Introduction

"Action Items Tab" adds a sixth tab to the existing tab navigation in the 4 Masters Investor application. The tab order becomes: Buffett, Munger, Lynch, Rothschild, Technical, and Actions. This tab provides actionable investment recommendations based on the analysis verdict. When the verdict indicates a BUY opportunity, the tab displays position sizing, entry strategy (DCA schedule), alerts to set, review schedule, exit criteria, and next-step action buttons. When the verdict indicates HOLD, SELL, PASS, or WAIT, the tab displays watchlist actions including price alerts, catalyst tracking, and a revisit timeline. A Decision Journal at the bottom of the tab allows users to record and persist their investment decisions to localStorage. Interactive features include a portfolio calculator modal, CSV export of DCA schedules, ICS calendar file generation, and localStorage-based alert preferences.

## Glossary

- **Action_Items_Tab**: The sixth tab in the Tab_Bar labeled "⚡ Actions" that displays actionable investment recommendations
- **Tab_Bar**: The horizontal navigation bar containing six clickable tabs (extended from the existing five-tab implementation)
- **Verdict**: The overall investment recommendation string from the AnalysisResult (e.g., "STRONG BUY", "BUY", "SPECULATIVE BUY", "HOLD", "PASS", "WAIT", "AVOID", "SELL")
- **BUY_Layout**: The tab content layout displayed when the Verdict contains "BUY" (including "STRONG BUY" and "SPECULATIVE BUY")
- **Watchlist_Layout**: The tab content layout displayed when the Verdict contains "HOLD", "PASS", "WAIT", or "AVOID"
- **Position_Sizing_Card**: A card in the BUY_Layout showing recommended portfolio allocation percentage and maximum position size
- **Portfolio_Calculator_Modal**: A modal dialog triggered by the "Calculate for My Portfolio" button that computes position size based on user-entered portfolio value
- **DCA_Schedule_Card**: A card in the BUY_Layout displaying a Dollar-Cost Averaging table with monthly entries for amount, estimated price, and estimated shares
- **Alerts_Checklist**: A clickable checklist of price and event alerts the user should set for the analyzed stock
- **Review_Schedule_Card**: A card displaying a timeline visual with 3-month, 6-month, and 12-month review checkpoints
- **Exit_Criteria_Card**: A warning-styled card in the BUY_Layout listing conditions under which the user should sell the position
- **Watchlist_Card**: A card in the Watchlist_Layout for adding the stock to a watchlist
- **Catalyst_Checklist**: A checklist of events to watch for before reconsidering the stock
- **Decision_Journal**: A form at the bottom of the Action_Items_Tab for recording investment decisions persisted to localStorage
- **Decision_Entry**: A single saved decision record stored as JSON in localStorage
- **DCA_CSV**: A comma-separated values file generated from the DCA schedule for download
- **ICS_File**: An iCalendar file generated for review date calendar events
- **Overall_Score**: The aggregate score (0-10) from the AnalysisResult used to adjust recommendations
- **Risk_Level**: The risk assessment string from the AnalysisResult used to adjust position sizing recommendations
- **Technical_Score**: The timing score from the TechnicalAnalysis used to adjust entry strategy recommendations

## Requirements

### Requirement 1: Tab Bar Extension

**User Story:** As a user, I want a sixth "Actions" tab in the tab navigation, so that I can access actionable investment recommendations after reviewing the analysis.

#### Acceptance Criteria

1. THE Tab_Bar SHALL render six tabs labeled "Buffett", "Munger", "Lynch", "Rothschild", "Technical", and "⚡ Actions" in that order.
2. WHEN the Action_Items_Tab is active, THE Tab_Bar SHALL style the tab with a red accent color (bg-red-500, border-red-400) instead of the blue used by other tabs.
3. WHEN the Action_Items_Tab is inactive, THE Tab_Bar SHALL style the tab with text-gray-400, hover:text-white, and hover:bg-gray-700 consistent with other inactive tabs.
4. THE Tab_Bar SHALL maintain all existing tab behavior (sticky positioning, horizontal scroll on mobile, transition animations) after adding the sixth tab.

### Requirement 2: Conditional Layout Selection

**User Story:** As a user, I want the Action Items tab to show different content based on the analysis verdict, so that I receive relevant recommendations whether the stock is a buy opportunity or a watchlist candidate.

#### Acceptance Criteria

1. WHEN the Verdict contains "BUY", "STRONG BUY", or "SPECULATIVE BUY", THE Action_Items_Tab SHALL display the BUY_Layout with the title "⚡ RECOMMENDED ACTIONS".
2. WHEN the Verdict contains "HOLD", "PASS", "WAIT", or "AVOID", THE Action_Items_Tab SHALL display the Watchlist_Layout with the title "⏸️ WATCHLIST ACTIONS".
3. THE Action_Items_Tab SHALL perform case-insensitive matching when evaluating the Verdict string.
4. WHEN the Verdict does not match any recognized pattern, THE Action_Items_Tab SHALL default to the Watchlist_Layout.

### Requirement 3: Position Sizing Card (BUY Layout)

**User Story:** As a user viewing a BUY recommendation, I want to see position sizing guidance, so that I can determine how much of my portfolio to allocate to this stock.

#### Acceptance Criteria

1. WHEN the BUY_Layout is displayed, THE Position_Sizing_Card SHALL show the recommended portfolio allocation percentage derived from the Risk_Level and Overall_Score.
2. WHEN the BUY_Layout is displayed, THE Position_Sizing_Card SHALL show the maximum position size as a dollar amount placeholder.
3. THE Position_Sizing_Card SHALL display a "Calculate for My Portfolio" button styled as a primary action button.
4. WHEN the user clicks "Calculate for My Portfolio", THE Action_Items_Tab SHALL open the Portfolio_Calculator_Modal.
5. WHEN the Risk_Level is "High", THE Position_Sizing_Card SHALL recommend a lower portfolio allocation percentage (1-3%) compared to "Medium" (3-5%) or "Low" (5-8%) risk levels.

### Requirement 4: Portfolio Calculator Modal

**User Story:** As a user, I want to enter my total portfolio value and see the calculated position size, so that I can determine the exact dollar amount to invest.

#### Acceptance Criteria

1. WHEN the Portfolio_Calculator_Modal is open, THE Modal SHALL display a text input field for the user to enter their total portfolio value.
2. WHEN the user enters a portfolio value, THE Modal SHALL calculate and display the recommended position size in dollars based on the recommended allocation percentage.
3. WHEN the user clicks outside the modal or clicks a close button, THE Modal SHALL close without saving any data.
4. THE Portfolio_Calculator_Modal SHALL validate that the entered value is a positive number before performing the calculation.
5. IF the user enters an invalid value, THEN THE Modal SHALL display an inline error message indicating the value must be a positive number.

### Requirement 5: DCA Schedule Card (BUY Layout)

**User Story:** As a user viewing a BUY recommendation, I want to see a Dollar-Cost Averaging schedule, so that I can plan my entry into the position over time.

#### Acceptance Criteria

1. WHEN the BUY_Layout is displayed, THE DCA_Schedule_Card SHALL display a table with columns: Month, Amount, Price Estimate, and Shares Estimate.
2. THE DCA_Schedule_Card SHALL generate a 4-month DCA schedule based on the recommended position size divided equally across months.
3. THE DCA_Schedule_Card SHALL estimate future prices using the current price with a variance based on the Technical_Score.
4. THE DCA_Schedule_Card SHALL display a "Create DCA Schedule" button.
5. WHEN the user clicks "Create DCA Schedule", THE Action_Items_Tab SHALL generate and download a DCA_CSV file containing the schedule data.

### Requirement 6: Alerts Checklist (BUY Layout)

**User Story:** As a user viewing a BUY recommendation, I want a checklist of alerts to set, so that I can monitor important price levels and events for this stock.

#### Acceptance Criteria

1. WHEN the BUY_Layout is displayed, THE Alerts_Checklist SHALL display five clickable alert items: "Price drops below buy zone", "Price rises above resistance", "First revenue milestone", "Insider selling detected", and "Share dilution event".
2. WHEN the user clicks an alert item, THE Alerts_Checklist SHALL toggle the item between checked and unchecked states.
3. THE Alerts_Checklist SHALL persist checked/unchecked states to localStorage keyed by the stock ticker.
4. THE Alerts_Checklist SHALL display an "Enable All Alerts" button that checks all items simultaneously.
5. WHEN the page loads, THE Alerts_Checklist SHALL restore previously saved alert states from localStorage for the current ticker.

### Requirement 7: Review Schedule Card (BUY Layout)

**User Story:** As a user viewing a BUY recommendation, I want a review schedule with calendar integration, so that I can plan periodic check-ins on my investment thesis.

#### Acceptance Criteria

1. WHEN the BUY_Layout is displayed, THE Review_Schedule_Card SHALL display a timeline visual with three checkpoints at 3 months, 6 months, and 12 months from the current date.
2. THE Review_Schedule_Card SHALL display an "Add to Calendar" button next to each checkpoint.
3. WHEN the user clicks "Add to Calendar", THE Action_Items_Tab SHALL generate and download an ICS_File containing a calendar event for the selected review date with the stock ticker and "Investment Review" as the event title.
4. THE Review_Schedule_Card SHALL display the actual calendar dates for each checkpoint based on the current date.

### Requirement 8: Exit Criteria Card (BUY Layout)

**User Story:** As a user viewing a BUY recommendation, I want to see clear exit criteria, so that I know under what conditions I should sell the position.

#### Acceptance Criteria

1. WHEN the BUY_Layout is displayed, THE Exit_Criteria_Card SHALL display a list of sell conditions relevant to the analyzed stock.
2. THE Exit_Criteria_Card SHALL be styled as a warning card with red/yellow accent colors (border-l-4 border-red-500, bg-red-900/20).
3. THE Exit_Criteria_Card SHALL include conditions such as: thesis broken, price drops below stop-loss, better opportunity found, position exceeds target allocation, and fundamental deterioration.

### Requirement 9: Next Steps Buttons (BUY Layout)

**User Story:** As a user viewing a BUY recommendation, I want prominent action buttons, so that I can quickly save my analysis, export my plan, or configure alerts.

#### Acceptance Criteria

1. WHEN the BUY_Layout is displayed, THE Action_Items_Tab SHALL display three large action buttons: "Save to Journal", "Export Plan", and "Set Alerts".
2. WHEN the user clicks "Save to Journal", THE Action_Items_Tab SHALL scroll to the Decision_Journal form section.
3. WHEN the user clicks "Export Plan", THE Action_Items_Tab SHALL generate and download a text summary of the action plan including position sizing, DCA schedule, alerts, and exit criteria.
4. WHEN the user clicks "Set Alerts", THE Action_Items_Tab SHALL scroll to the Alerts_Checklist section and enable all alerts.

### Requirement 10: Watchlist Layout Content

**User Story:** As a user viewing a HOLD/PASS/WAIT verdict, I want watchlist-oriented actions, so that I can track the stock and revisit it when conditions improve.

#### Acceptance Criteria

1. WHEN the Watchlist_Layout is displayed, THE Action_Items_Tab SHALL display an "Add to Watchlist" card with a button to save the ticker to a localStorage watchlist array.
2. WHEN the Watchlist_Layout is displayed, THE Action_Items_Tab SHALL display a "Price Alerts" card with an input field for the user to enter a target buy price.
3. WHEN the user enters a target price, THE Action_Items_Tab SHALL save the target price to localStorage keyed by the stock ticker.
4. WHEN the Watchlist_Layout is displayed, THE Action_Items_Tab SHALL display a "Wait for Catalysts" checklist with items relevant to the stock's situation.
5. WHEN the Watchlist_Layout is displayed, THE Action_Items_Tab SHALL display a "Revisit Date" card showing a date 6 months from the current date.
6. WHEN the Watchlist_Layout is displayed, THE Action_Items_Tab SHALL display a "Why Waiting is Smart" card containing an investment wisdom quote styled as a quote box.

### Requirement 11: Decision Journal Form

**User Story:** As a user, I want to record my investment decision with reasoning, so that I can review my decision-making process later and learn from outcomes.

#### Acceptance Criteria

1. THE Decision_Journal SHALL display a form at the bottom of the Action_Items_Tab with the following fields: Decision (radio buttons: BUY, PASS, WATCHLIST), Position Size (percentage input), Reasoning (textarea), Expected Outcome (text input), Entry Price Target (number input), Exit Plan (textarea), and Review Dates (date inputs for 3-month and 6-month reviews).
2. WHEN the user submits the Decision_Journal form, THE Action_Items_Tab SHALL save the Decision_Entry to localStorage as a JSON object.
3. THE Decision_Entry SHALL include the following fields: id (unique identifier), date (ISO timestamp), ticker, company name, decision, position_size_percent, position_size_amount, entry_price_target, current_price, reasoning, expected_outcome, exit_plan, review_dates (array), scores (object with master scores and overall), alerts_set (array of enabled alerts), status ("active"), actual_outcome (empty string), and lessons_learned (empty string).
4. WHEN the form is submitted successfully, THE Action_Items_Tab SHALL display a success message as a toast notification or modal confirming the decision was saved.
5. THE Decision_Journal SHALL validate that the Decision radio selection and Reasoning textarea are filled before allowing submission.
6. IF required fields are empty on submission, THEN THE Decision_Journal SHALL display inline validation error messages on the empty fields.

### Requirement 12: Decision Journal Persistence

**User Story:** As a user, I want my saved decisions to persist across browser sessions, so that I can build a history of my investment decisions over time.

#### Acceptance Criteria

1. THE Action_Items_Tab SHALL store all Decision_Entry records in localStorage under a single key "investment_decisions" as a JSON array.
2. WHEN a new Decision_Entry is saved, THE Action_Items_Tab SHALL append the entry to the existing array without overwriting previous entries.
3. THE Decision_Entry id field SHALL be generated as a unique string using a combination of timestamp and random characters.
4. WHEN localStorage is unavailable or full, THE Action_Items_Tab SHALL display an error message informing the user that the decision could not be saved.

### Requirement 13: DCA CSV Generation

**User Story:** As a user, I want to download my DCA schedule as a CSV file, so that I can import it into a spreadsheet or trading tool.

#### Acceptance Criteria

1. WHEN the user clicks "Create DCA Schedule", THE Action_Items_Tab SHALL generate a CSV file with headers: Month, Date, Amount, Estimated Price, Estimated Shares.
2. THE DCA_CSV SHALL contain one row per month in the DCA schedule with calculated values.
3. THE Action_Items_Tab SHALL trigger a browser file download with the filename format "{TICKER}_dca_schedule.csv".
4. THE DCA_CSV SHALL use comma delimiters and include a header row.

### Requirement 14: ICS Calendar File Generation

**User Story:** As a user, I want to download calendar events for my review dates, so that I can add investment review reminders to my calendar application.

#### Acceptance Criteria

1. WHEN the user clicks "Add to Calendar" for a review checkpoint, THE Action_Items_Tab SHALL generate a valid ICS file containing a VEVENT.
2. THE ICS_File SHALL include the event summary as "{TICKER} Investment Review - {checkpoint label}" (e.g., "AAPL Investment Review - 3 Month").
3. THE ICS_File SHALL set the event date to the calculated checkpoint date (3, 6, or 12 months from current date).
4. THE Action_Items_Tab SHALL trigger a browser file download with the filename format "{TICKER}_review_{months}mo.ics".

### Requirement 15: Adaptive Recommendations

**User Story:** As a user, I want the action items to adjust based on the stock's risk profile and scores, so that the recommendations are tailored to the specific investment opportunity.

#### Acceptance Criteria

1. WHEN the Overall_Score is 8 or above, THE Position_Sizing_Card SHALL label the recommendation as "High Conviction" and suggest the upper range of the position size.
2. WHEN the Overall_Score is below 5, THE Position_Sizing_Card SHALL label the recommendation as "Speculative" and suggest the lower range of the position size.
3. WHEN the Technical_Score indicates "WAIT", THE DCA_Schedule_Card SHALL extend the DCA timeline from 4 months to 6 months to allow for better entry prices.
4. WHEN the Risk_Level is "High", THE Exit_Criteria_Card SHALL include tighter stop-loss conditions compared to "Low" risk stocks.

### Requirement 16: Styling and Visual Design

**User Story:** As a user, I want the Action Items tab to follow the existing dark mode design system, so that the experience is visually consistent with the rest of the application.

#### Acceptance Criteria

1. THE Action_Items_Tab SHALL style all content cards with bg-gray-800, rounded-lg, and p-6 consistent with other tabs.
2. THE Action_Items_Tab SHALL use green accent colors for success states and positive actions.
3. THE Action_Items_Tab SHALL use red and yellow accent colors for warning states and exit criteria.
4. THE Action_Items_Tab SHALL apply smooth transitions (transition-all duration-300) to interactive elements.
5. THE Action_Items_Tab SHALL style action buttons as large clickable elements with min-height of 48px and full-width on mobile viewports.
6. WHEN the viewport width is below the mobile breakpoint, THE Action_Items_Tab SHALL stack all cards vertically and render buttons at full width.

### Requirement 17: LocalStorage Data Management

**User Story:** As a user, I want my alert preferences and watchlist data to persist, so that I do not lose my configurations when I close the browser.

#### Acceptance Criteria

1. THE Action_Items_Tab SHALL store alert preferences in localStorage under the key "alert_preferences_{TICKER}" as a JSON object.
2. THE Action_Items_Tab SHALL store the watchlist in localStorage under the key "watchlist" as a JSON array of ticker strings.
3. WHEN the user adds a ticker to the watchlist, THE Action_Items_Tab SHALL append the ticker only if it is not already present in the array.
4. WHEN localStorage data is loaded, THE Action_Items_Tab SHALL handle missing or malformed data gracefully by falling back to default empty states.
