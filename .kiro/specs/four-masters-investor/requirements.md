# Requirements Document

## Introduction

"4 Masters Investor" is a single-page React application styled with Tailwind CSS that provides stock analysis based on the investment philosophies of four legendary investors: Warren Buffett, Charlie Munger, Peter Lynch, and Baron Rothschild. Users enter a stock ticker symbol and receive a comprehensive analysis including individual master scores, a final verdict, and quick facts about the stock. The application uses a dark theme and is fully responsive.

## Glossary

- **App**: The "4 Masters Investor" single-page React application
- **Search_Input**: The text input field where users enter stock ticker symbols
- **Ticker**: A stock ticker symbol (e.g., QTUM, AAPL, NVDA)
- **Results_Section**: The section displaying analysis results after a search is performed
- **Verdict_Card**: The prominent card displaying the final investment verdict and strategy details
- **Master_Scores_Card**: The card displaying individual scores from each of the four investment masters
- **Quick_Facts_Card**: The card displaying key financial metrics in a grid layout
- **Example_Buttons**: Clickable buttons showing sample ticker symbols (QTUM, AAPL, NVDA)
- **Score_Bar**: A horizontal progress bar representing a master's score out of 10
- **Mock_Data**: Hardcoded analysis data used for demonstration purposes
- **Supported_Markets**: US stocks and Thai stocks (SET - Stock Exchange of Thailand)

## Requirements

### Requirement 1: Application Layout and Header

**User Story:** As a user, I want to see a professional dark-themed header with the app title, so that I can identify the application and feel confident in its design.

#### Acceptance Criteria

1. THE App SHALL render a full-width header containing the logo/title "🎯 4 Masters Investment Advisor" aligned to the left with text-2xl and font-bold styling.
2. THE App SHALL use a dark mode color scheme with bg-gray-900 background and text-white text color as the default theme.
3. THE App SHALL apply p-6 padding to the header section.

### Requirement 2: Search Input

**User Story:** As a user, I want a prominent search input field, so that I can enter stock ticker symbols to analyze.

#### Acceptance Criteria

1. WHEN no search results are displayed, THE Search_Input SHALL appear centered on the page with max-w-2xl width.
2. THE Search_Input SHALL display placeholder text "Enter stock ticker (e.g., QTUM, AAPL, NVDA)".
3. THE Search_Input SHALL be styled with text-xl font size, rounded-lg corners, p-4 padding, and border-2 border-blue-500.
4. WHEN the user presses the Enter key with a non-empty value in the Search_Input, THE App SHALL trigger a search and display the Results_Section.
5. WHEN the Search_Input receives focus, THE Search_Input SHALL display a ring glow effect to indicate active state.

### Requirement 3: Example Buttons

**User Story:** As a user, I want to see example ticker buttons, so that I can quickly try the app without knowing a ticker symbol.

#### Acceptance Criteria

1. THE App SHALL display three Example_Buttons labeled "QTUM", "AAPL", and "NVDA" below the Search_Input.
2. THE Example_Buttons SHALL be styled with bg-gray-800 background, hover:bg-gray-700 hover state, px-4 horizontal padding, py-2 vertical padding, and rounded corners.
3. WHEN a user clicks an Example_Button, THE App SHALL populate the Search_Input with the button's ticker value and trigger a search.

### Requirement 4: Results Section Display

**User Story:** As a user, I want to see analysis results after searching, so that I can make informed investment decisions.

#### Acceptance Criteria

1. WHEN a search is triggered, THE App SHALL replace the centered search content with the Results_Section.
2. THE Results_Section SHALL display with a fade-in animation (animate-fade-in).
3. THE App SHALL smooth-scroll to the Results_Section when it appears.
4. THE Results_Section SHALL include a Company Header, Verdict_Card, Master_Scores_Card, and Quick_Facts_Card in vertical order.

### Requirement 5: Company Header

**User Story:** As a user, I want to see the company name, current price, and price change at the top of results, so that I have immediate context about the stock.

#### Acceptance Criteria

1. WHEN results are displayed for a supported ticker, THE Results_Section SHALL show the ticker symbol and company name (e.g., "QTUM - IonQ Inc.").
2. WHEN results are displayed for a supported ticker, THE Results_Section SHALL show the current stock price in large text (e.g., "$122.50").
3. WHEN the price change is negative, THE App SHALL display the change percentage in red (text-red-500) with a down arrow indicator (e.g., "▼ 2.3%").
4. WHEN the price change is positive, THE App SHALL display the change percentage in green (text-green-500) with an up arrow indicator.

### Requirement 6: Verdict Card

**User Story:** As a user, I want to see a prominent final verdict with investment strategy details, so that I can understand the overall recommendation.

#### Acceptance Criteria

1. THE Verdict_Card SHALL be styled with border-2, rounded-xl, p-8, and a gradient background (bg-gradient-to-br from-blue-900 to-purple-900).
2. THE Verdict_Card SHALL display the title "🎯 FINAL VERDICT" in text-3xl font-bold styling.
3. THE Verdict_Card SHALL display the verdict text (e.g., "SPECULATIVE BUY") in text-4xl font-black text-green-400 styling.
4. THE Verdict_Card SHALL display the following strategy details below the verdict: Position Size, Entry Strategy, Risk Level (with warning emoji for high risk), and Time Horizon.
5. THE Verdict_Card strategy details SHALL each be styled with text-lg, text-gray-300, and mt-2 spacing.

### Requirement 7: Master Scores Card

**User Story:** As a user, I want to see individual scores from each investment master, so that I can understand how the stock rates from different investment philosophies.

#### Acceptance Criteria

1. THE Master_Scores_Card SHALL be styled with bg-gray-800 background, rounded-lg corners, and p-6 padding.
2. THE Master_Scores_Card SHALL display the title "📊 MASTER SCORES" in text-2xl font-bold with mb-4 margin.
3. THE Master_Scores_Card SHALL display four Score_Bars for Buffett (blue-500), Munger (purple-500), Lynch (green-500), and Rothschild (yellow-500).
4. WHEN displaying a Score_Bar, THE Master_Scores_Card SHALL show the master name (text-lg, w-32), a progress bar (h-6, rounded-full, bg-gray-700 background) with colored fill proportional to the score, and the numeric score (text-lg, ml-4).
5. THE Master_Scores_Card SHALL display an overall score at the bottom (text-xl, font-bold) with a gradient progress bar (from-blue-500 to-purple-500).

### Requirement 8: Quick Facts Card

**User Story:** As a user, I want to see key financial metrics in an organized grid, so that I can quickly assess the stock's fundamentals.

#### Acceptance Criteria

1. THE Quick_Facts_Card SHALL display the title "📋 QUICK FACTS".
2. THE Quick_Facts_Card SHALL use a grid layout with 2 columns on desktop and 1 column on mobile.
3. THE Quick_Facts_Card SHALL display the following facts: Market Cap, Price/Sales, Cash Runway, Sector, 52-Week Range, Moat, Profit Margin, and Debt/Equity.
4. WHEN displaying a fact, THE Quick_Facts_Card SHALL show the label in gray-400 color and the value in white with font-semibold styling.

### Requirement 9: New Search Button

**User Story:** As a user, I want a button to start a new search, so that I can analyze a different stock without refreshing the page.

#### Acceptance Criteria

1. WHEN results are displayed, THE App SHALL show a "New Search" button below the Results_Section.
2. THE "New Search" button SHALL be styled with bg-blue-500 background, hover:bg-blue-600 hover state, px-6 horizontal padding, py-3 vertical padding, and rounded-lg corners.
3. WHEN the user clicks the "New Search" button, THE App SHALL clear the Results_Section and display the centered Search_Input again.

### Requirement 10: Data Handling and Market Support

**User Story:** As a user, I want to analyze any US or Thai stock ticker, so that I can get investment insights for stocks in both markets.

#### Acceptance Criteria

1. WHEN the user searches for any ticker, THE App SHALL display the full analysis with all cards (Company Header, Verdict_Card, Master_Scores_Card, Quick_Facts_Card).
2. THE App SHALL support US stock tickers (e.g., AAPL, NVDA, QTUM) and Thai stock tickers from the Stock Exchange of Thailand (e.g., PTT, AOT, CPALL).
3. THE App SHALL perform case-insensitive ticker matching so that "qtum", "Qtum", and "QTUM" all return the same results.
4. THE App SHALL use mock data to generate analysis results for any entered ticker (with predefined data for select tickers and generated placeholder data for others).
5. WHEN a ticker is not found in the predefined mock data set, THE App SHALL display generated placeholder analysis data rather than an error message.

### Requirement 11: Responsive Design and Styling

**User Story:** As a user, I want the app to work well on all screen sizes, so that I can use it on my phone or desktop.

#### Acceptance Criteria

1. THE App SHALL use a mobile-first responsive design that adapts to all screen sizes.
2. THE App SHALL apply smooth transitions (transition-all duration-300) to interactive elements.
3. THE App SHALL use generous spacing (p-6, mb-8) between major sections.
4. THE App SHALL apply hover effects to all clickable buttons.

### Requirement 12: Interaction Animations

**User Story:** As a user, I want smooth animations and transitions, so that the app feels polished and professional.

#### Acceptance Criteria

1. WHEN the Results_Section appears, THE App SHALL animate it with a fade-in effect.
2. WHEN the user hovers over a button, THE App SHALL display a visual hover state change with smooth transition.
3. WHEN the Search_Input receives focus, THE App SHALL display a border glow ring effect with smooth transition.
4. WHEN the Results_Section appears, THE App SHALL smooth-scroll the viewport to bring results into view.
