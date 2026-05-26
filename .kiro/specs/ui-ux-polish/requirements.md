# Requirements Document

## Introduction

This document defines the requirements for a comprehensive UI/UX polish and enhancement of the 4 Masters Investment Advisor application. The goal is to establish a consistent design system (typography, spacing, colors, shadows, animations, buttons, loading states, and notifications) and apply page-specific visual improvements across the Search page, Results page, Portfolio Tracker, and Decision Journal. The application is built with React 18, TypeScript, Tailwind CSS, Vite, and Recharts.

## Glossary

- **Application**: The 4 Masters Investment Advisor web application
- **Design_System**: The unified set of reusable visual tokens (typography, spacing, colors, shadows, animations, buttons) applied globally
- **Search_Page**: The home/landing page where users enter stock tickers for analysis
- **Results_Page**: The page displaying analysis results including verdict, master scores, quick facts, and tabbed analysis
- **Portfolio_Page**: The page for tracking portfolio holdings, allocations, and performance
- **Journal_Page**: The Decision Journal page for recording and reviewing investment decisions
- **Verdict_Card**: The hero element on the Results_Page displaying the final investment recommendation
- **Master_Scores_Section**: The section displaying individual scores from each of the four investment masters
- **Quick_Facts_Section**: The section displaying key financial metrics as visual cards
- **Analysis_Tabs**: The tabbed interface for detailed analysis from each master and technical/action views
- **Toast_Notification**: A temporary message overlay providing feedback on user actions
- **Skeleton_Loader**: A placeholder animation displayed while content is loading
- **Modal**: A dialog overlay used for forms and detailed views
- **Navigation_Bar**: The fixed top navigation component for page routing
- **Floating_Action_Button**: A persistent button positioned at the bottom-right for quick actions

## Requirements

### Requirement 1: Global Typography System

**User Story:** As a user, I want consistent and readable typography across all pages, so that the interface feels polished and information hierarchy is clear.

#### Acceptance Criteria

1. THE Design_System SHALL define page titles (H1) with text-5xl, font-black, and tracking-tight classes
2. THE Design_System SHALL define section titles (H2) with text-3xl, font-bold, and mb-6 classes
3. THE Design_System SHALL define card titles (H3) with text-2xl, font-semibold, and mb-4 classes
4. THE Design_System SHALL define subsection headings (H4) with text-xl, font-semibold, and mb-3 classes
5. THE Design_System SHALL define body text with text-base and leading-relaxed classes
6. THE Design_System SHALL define small text with text-sm and text-gray-400 classes
7. THE Design_System SHALL define label text with text-xs, uppercase, tracking-wide, and text-gray-500 classes

### Requirement 2: Global Spacing System

**User Story:** As a user, I want consistent spacing throughout the application, so that the layout feels balanced and organized.

#### Acceptance Criteria

1. THE Application SHALL apply px-8 py-12 padding to page containers on desktop viewports
2. THE Application SHALL apply px-4 py-8 padding to page containers on mobile viewports
3. THE Application SHALL apply space-y-12 gaps between page sections
4. THE Application SHALL apply gap-6 spacing between cards within a section
5. THE Application SHALL apply p-8 padding inside cards on desktop viewports and p-6 on mobile viewports
6. THE Design_System SHALL define button padding as px-8 py-4 for large, px-6 py-3 for medium, and px-4 py-2 for small variants

### Requirement 3: Global Color System

**User Story:** As a user, I want consistent color usage for status indicators and master-specific branding, so that I can quickly interpret information visually.

#### Acceptance Criteria

1. THE Design_System SHALL use text-green-400 and bg-green-500 for success and gain indicators
2. THE Design_System SHALL use text-yellow-400 and bg-yellow-500 for warning indicators
3. THE Design_System SHALL use text-red-400 and bg-red-500 for error and loss indicators
4. THE Design_System SHALL use text-blue-400 and bg-blue-500 for informational indicators
5. THE Design_System SHALL assign blue-500 as the brand color for Buffett analysis
6. THE Design_System SHALL assign purple-500 as the brand color for Munger analysis
7. THE Design_System SHALL assign green-500 as the brand color for Lynch analysis
8. THE Design_System SHALL assign yellow-500 as the brand color for Rothschild analysis

### Requirement 4: Shadow and Depth System

**User Story:** As a user, I want visual depth cues on interactive elements, so that I can perceive the interface hierarchy and interactivity.

#### Acceptance Criteria

1. THE Design_System SHALL apply shadow-xl to cards with hover:shadow-2xl on interaction
2. THE Design_System SHALL apply shadow-2xl to modals
3. THE Design_System SHALL apply shadow-lg to floating buttons
4. THE Design_System SHALL apply shadow-xl to dropdown menus
5. THE Application SHALL apply transition-shadow duration-300 to all elements with shadow changes

### Requirement 5: Global Animation System

**User Story:** As a user, I want smooth animations and transitions, so that the interface feels responsive and modern.

#### Acceptance Criteria

1. THE Application SHALL apply hover:scale-105 and active:scale-95 with transition-transform duration-200 to buttons
2. THE Application SHALL apply hover:shadow-2xl and hover:-translate-y-1 with transition-all duration-300 to cards
3. THE Application SHALL apply transition-all duration-200 to tab switches
4. THE Application SHALL apply a fadeIn animation (opacity 0 to 1, translateY 10px to 0, 300ms ease-out) to page transitions
5. THE Application SHALL apply a pulse animation to loading skeleton elements
6. WHILE the user has prefers-reduced-motion enabled, THE Application SHALL disable all non-essential animations

### Requirement 6: Global Button System

**User Story:** As a user, I want visually distinct and responsive buttons, so that I can identify actions and receive tactile feedback.

#### Acceptance Criteria

1. THE Design_System SHALL style primary buttons with bg-blue-600, hover:bg-blue-700, text-white, font-semibold, rounded-lg, px-6 py-3, shadow-lg, hover:shadow-xl, hover:scale-105, and active:scale-95
2. THE Design_System SHALL style secondary buttons with bg-gray-700 and hover:bg-gray-600
3. THE Design_System SHALL style success buttons with bg-green-600 and hover:bg-green-700
4. THE Design_System SHALL style danger buttons with bg-red-600 and hover:bg-red-700

### Requirement 7: Loading States

**User Story:** As a user, I want clear loading indicators, so that I know the application is processing my request.

#### Acceptance Criteria

1. WHILE content is loading, THE Application SHALL display skeleton loaders with bg-gray-800, animate-pulse, and rounded classes
2. WHILE an analysis is in progress, THE Application SHALL display a progress stepper showing step names with completion status icons (checkmark for complete, spinner for loading, circle for pending)
3. WHILE a short operation is in progress, THE Application SHALL display a blue spinning circle indicator

### Requirement 8: Toast Notification System

**User Story:** As a user, I want non-intrusive feedback messages for my actions, so that I know whether operations succeeded or failed.

#### Acceptance Criteria

1. WHEN an operation succeeds, THE Application SHALL display a toast with bg-green-900/90 background and border-l-4 border-green-500
2. WHEN an operation fails, THE Application SHALL display a toast with bg-red-900/90 background and border-l-4 border-red-500
3. WHEN informational feedback is needed, THE Application SHALL display a toast with bg-blue-900/90 background and border-l-4 border-blue-500
4. THE Toast_Notification SHALL appear in the top-right corner of the viewport
5. THE Toast_Notification SHALL auto-dismiss after 3 seconds
6. THE Toast_Notification SHALL animate in by sliding from the right

### Requirement 9: Search Page Enhancement

**User Story:** As a user, I want an inviting and clear search experience, so that I can quickly start analyzing stocks.

#### Acceptance Criteria

1. THE Search_Page SHALL display the "4 Masters" logo with a tagline reading "Analyze stocks like legendary investors"
2. THE Search_Page SHALL display a subtitle reading "Enter any stock ticker to get comprehensive analysis"
3. THE Search_Page SHALL render the search input with max-w-3xl width, h-16 height, text-xl font size, border-2 border-blue-500, focus ring-4 ring-blue-500/20, bg-gray-800/50 backdrop-blur, and a search icon inside the input
4. THE Search_Page SHALL render example ticker buttons with px-6 py-3 padding, text-lg font-semibold, bg-gray-800 hover:bg-gray-700, border border-gray-700, shadow-md hover:shadow-lg, hover:scale-110, and a chart icon (📊)

### Requirement 10: Verdict Card Enhancement

**User Story:** As a user, I want the final verdict to be visually prominent and celebratory, so that the investment recommendation is immediately clear.

#### Acceptance Criteria

1. THE Verdict_Card SHALL use p-12 padding, rounded-2xl corners, shadow-2xl, ring-4 ring-blue-500/20, and a bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 background
2. THE Verdict_Card SHALL display a target icon (🎯) at text-6xl size with "FINAL VERDICT" text in text-2xl, tracking-widest, and uppercase
3. THE Verdict_Card SHALL display the verdict text in text-6xl font-black with a text gradient and a scale-in animation
4. THE Verdict_Card SHALL display a horizontal separator using border-t border-white/20 with w-2/3 mx-auto
5. THE Verdict_Card SHALL display detail items (Position Size, Entry Strategy, Risk Level, Time Horizon) as mini cards with bg-white/10 backdrop-blur, px-6 py-4, rounded-xl, and corresponding icons (💰, 📊, ⚠️, ⏱️)
6. THE Verdict_Card SHALL display a confidence indicator as a progress bar based on the overall analysis score

### Requirement 11: Master Scores Enhancement

**User Story:** As a user, I want to see each master's score with visual impact and brand identity, so that I can compare their assessments at a glance.

#### Acceptance Criteria

1. THE Master_Scores_Section SHALL use a bg-gray-800 rounded-2xl p-8 shadow-xl container
2. THE Master_Scores_Section SHALL display each score as a grid row containing the master icon, name, progress bar, and numeric score
3. THE Master_Scores_Section SHALL color each master's progress bar with the corresponding master brand color (blue-500 for Buffett, purple-500 for Munger, green-500 for Lynch, yellow-500 for Rothschild)
4. WHEN the Results_Page loads, THE Master_Scores_Section SHALL animate progress bars from 0% to the actual percentage over 1000ms with 150ms stagger between each bar
5. THE Master_Scores_Section SHALL display the overall score with a larger bar (h-12) using a gradient from-blue-500 via-purple-500 to-pink-500
6. THE Master_Scores_Section SHALL display score interpretation text below the overall score bar

### Requirement 12: Quick Facts Card Grid

**User Story:** As a user, I want key financial metrics displayed as visual cards, so that I can scan important data points quickly.

#### Acceptance Criteria

1. THE Quick_Facts_Section SHALL display metrics in a grid layout with 4 columns on desktop, 2 columns on tablet, and 1 column on mobile
2. THE Quick_Facts_Section SHALL render each metric card with a large icon (text-4xl), a label (text-xs uppercase), and a value (text-2xl font-bold)
3. THE Quick_Facts_Section SHALL apply hover:scale-105 and shadow transitions to each metric card
4. THE Quick_Facts_Section SHALL color-code metric values based on their interpretation (green for strong metrics, yellow for moderate, red for weak)

### Requirement 13: Analysis Tabs Enhancement

**User Story:** As a user, I want a polished tabbed interface for detailed analysis, so that I can navigate between masters' insights smoothly.

#### Acceptance Criteria

1. THE Analysis_Tabs SHALL render tab navigation as sticky with backdrop-blur, icons before text labels, and a sliding active indicator
2. WHEN a tab is switched, THE Analysis_Tabs SHALL apply the fadeIn animation to the new tab content
3. THE Analysis_Tabs SHALL render section cards with colored left borders matching the active master's brand color
4. THE Analysis_Tabs SHALL render status indicators as styled components (green checkmark for positive, yellow warning for caution, red cross for negative)
5. THE Analysis_Tabs SHALL render financial metrics within each tab as a mini card grid
6. THE Analysis_Tabs SHALL render quote boxes with colored backgrounds, large decorative quote marks, and serif italic font styling

### Requirement 14: Portfolio Tracker Enhancement

**User Story:** As a user, I want a visually rich portfolio view, so that I can monitor my investments with clarity and delight.

#### Acceptance Criteria

1. THE Portfolio_Page SHALL display summary card values in text-6xl size with change indicators using directional arrows and mini sparkline charts
2. THE Portfolio_Page SHALL render the add-position form with h-12 height inputs and a gradient submit button
3. THE Portfolio_Page SHALL render the holdings table with a sticky header, color-coded P&L cells (green for gains, red for losses), progress bars for allocation percentage, and icon-based action buttons
4. THE Portfolio_Page SHALL render the allocation pie chart at 300x300 pixels with hover effects and a donut hole displaying the total portfolio value
5. THE Portfolio_Page SHALL render floating action buttons at w-14 h-14 size with tooltips displayed on hover

### Requirement 15: Decision Journal Enhancement

**User Story:** As a user, I want a visually engaging journal experience, so that I can review my investment decisions with clear feedback.

#### Acceptance Criteria

1. WHEN the win rate exceeds 70%, THE Journal_Page SHALL display celebration elements (trophy icon and confetti styling) on the summary cards
2. THE Journal_Page SHALL render the filter bar in a compact layout with removable filter chips
3. THE Journal_Page SHALL render decision entries with visual decision badges, prominent P&L values with contextual emojis, and animated status dots
4. THE Journal_Page SHALL render the Mistakes Autopsy section with red border styling and lesson cards with yellow left borders
5. THE Journal_Page SHALL render performance analytics with animated chart bars
6. WHEN no journal entries exist, THE Journal_Page SHALL display an enhanced empty state with illustration and call-to-action

### Requirement 16: Modal and Overlay System

**User Story:** As a user, I want modals that feel smooth and focused, so that I can complete forms without distraction.

#### Acceptance Criteria

1. THE Modal SHALL render a backdrop with bg-black/70 and backdrop-blur-sm with a fade-in animation
2. THE Modal SHALL render the dialog container with rounded-2xl, shadow-2xl, and a scale-in animation from 0.95 to 1.0
3. THE Modal SHALL render the header with text-3xl font size and a large close button
4. THE Modal SHALL render the footer with a border-top separator and right-aligned action buttons

### Requirement 17: Responsive Design

**User Story:** As a user, I want the application to work well on all screen sizes, so that I can use it on mobile devices and tablets.

#### Acceptance Criteria

1. WHILE the viewport is mobile-sized, THE Navigation_Bar SHALL display a hamburger menu icon that opens a slide-in navigation drawer
2. WHILE the viewport is mobile-sized, THE Application SHALL reduce text sizes and padding proportionally
3. WHILE the viewport is mobile-sized, THE Application SHALL stack multi-column layouts into single columns
4. WHILE the viewport is mobile-sized, THE Application SHALL enable horizontal scrolling for data tables
5. WHILE the viewport is mobile-sized, THE Application SHALL reduce chart dimensions and floating button sizes

### Requirement 18: Accessibility

**User Story:** As a user with accessibility needs, I want the application to be navigable and perceivable, so that I can use it with assistive technologies.

#### Acceptance Criteria

1. THE Application SHALL provide aria-label attributes on all interactive elements (buttons, links, inputs, tabs)
2. THE Application SHALL display a visible focus indicator (ring-2 ring-blue-500) on all focusable elements during keyboard navigation
3. THE Application SHALL support full keyboard navigation for all interactive features including tabs, modals, and menus
4. THE Application SHALL provide a "Skip to content" link as the first focusable element on each page
5. THE Application SHALL maintain WCAG AA color contrast ratios (4.5:1 for normal text, 3:1 for large text) for all text elements
6. WHILE the user has prefers-reduced-motion enabled, THE Application SHALL replace animations with instant state changes
