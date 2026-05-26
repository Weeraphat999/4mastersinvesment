# Implementation Plan: UI/UX Polish

## Overview

This plan implements a unified design system and page-specific visual enhancements for the 4 Masters Investment Advisor application. The approach starts with foundational design tokens and shared UI primitives, then applies them across all pages (Search, Results, Portfolio, Journal), and finishes with responsive design, accessibility, and integration wiring.

## Tasks

- [ ] 1. Set up design tokens and CSS utility layer
  - [ ] 1.1 Extend tailwind.config.ts with animation keyframes and design tokens
    - Add `fadeIn`, `slideInRight`, `scaleIn`, and `progressFill` keyframes
    - Add corresponding animation utilities (`animate-fade-in`, `animate-slide-in-right`, `animate-scale-in`, `animate-progress-fill`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 1.2 Add @layer components utilities to src/index.css
    - Add typography classes: `.text-page-title`, `.text-section-title`, `.text-card-title`, `.text-subsection`, `.text-body`, `.text-small`, `.text-label`
    - Add layout classes: `.page-container`, `.page-container-mobile`
    - Add card classes: `.card`, `.card-mobile`
    - Add `prefers-reduced-motion` media query to disable transitions
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.5, 4.1, 5.6_

- [ ] 2. Create shared UI primitive components
  - [ ] 2.1 Create src/components/ui/Button.tsx
    - Implement `ButtonProps` interface with `variant` (primary, secondary, success, danger), `size` (sm, md, lg), and standard button props
    - Apply variant-specific classes, size classes, hover:scale-105, active:scale-95, shadow-lg, and transition styles
    - Support `disabled` state, `ariaLabel`, and `className` override
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 2.6, 5.1_

  - [ ] 2.2 Create src/components/ui/Spinner.tsx
    - Implement `SpinnerProps` with size variants (sm, md, lg)
    - Render spinning circle with `animate-spin border-2 border-blue-500 border-t-transparent rounded-full`
    - _Requirements: 7.3_

  - [ ] 2.3 Create src/components/ui/Skeleton.tsx
    - Implement `SkeletonProps` with width, height, rounded, and className props
    - Apply `bg-gray-800 animate-pulse rounded` base classes
    - _Requirements: 7.1_

  - [ ] 2.4 Create src/components/ui/Toast.tsx and src/components/ui/ToastProvider.tsx
    - Implement `ToastMessage` interface with id, type (success, error, info), message, and duration
    - Implement `ToastProvider` with React Context providing `showToast` function
    - Position toasts fixed top-right with `animate-slide-in-right`
    - Auto-dismiss after 3000ms, max 3 visible toasts
    - Apply type-specific border and background colors
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ] 2.5 Create src/components/ui/Modal.tsx
    - Implement `ModalProps` with isOpen, onClose, title, children, and footer
    - Render backdrop with `bg-black/70 backdrop-blur-sm` and fade-in animation
    - Render dialog with `rounded-2xl shadow-2xl bg-gray-800` and scale-in animation
    - Implement Escape key close handler and focus trap
    - Render header with `text-3xl font-bold` and close button
    - Render footer with `border-t border-gray-700` and right-aligned buttons
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 18.3_

  - [ ] 2.6 Create src/components/ui/ProgressStepper.tsx
    - Implement `Step` interface with name and status (complete, loading, pending)
    - Render step names with icons: ✓ (green) for complete, Spinner for loading, ○ (gray) for pending
    - _Requirements: 7.2_

  - [ ]* 2.7 Write unit tests for UI primitive components
    - Test Button renders correct variant/size classes, handles click, disabled state, aria-label
    - Test Toast renders correct type classes, auto-dismisses, animation class present
    - Test ToastProvider showToast adds toast, max 3 visible, cleanup on unmount
    - Test Skeleton renders with correct classes and animate-pulse
    - Test Modal backdrop blur, scale-in class, Escape closes, focus trap
    - Test Spinner renders with animate-spin and correct size
    - Test ProgressStepper renders correct icons per status
    - _Requirements: 18.1, 18.2_

- [ ] 3. Checkpoint - Ensure design system foundation works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Enhance Search Page
  - [ ] 4.1 Enhance src/components/SearchInput.tsx
    - Apply max-w-3xl, h-16, text-xl, border-2 border-blue-500, focus ring-4 ring-blue-500/20, bg-gray-800/50 backdrop-blur
    - Add search icon (🔍) inside the input
    - Add aria-label for accessibility
    - _Requirements: 9.3, 18.1, 18.2_

  - [ ] 4.2 Enhance src/components/ExampleButtons.tsx
    - Apply px-6 py-3, text-lg font-semibold, bg-gray-800 hover:bg-gray-700, border border-gray-700, shadow-md hover:shadow-lg, hover:scale-110
    - Add chart icon (📊) before ticker text
    - _Requirements: 9.4, 5.1_

  - [ ] 4.3 Enhance Search Page layout in App.tsx (search view)
    - Add "4 Masters" logo with tagline "Analyze stocks like legendary investors"
    - Add subtitle "Enter any stock ticker to get comprehensive analysis"
    - Apply page-container spacing and typography classes
    - _Requirements: 9.1, 9.2, 1.1, 2.1_

  - [ ]* 4.4 Write unit tests for Search Page enhancements
    - Test SearchInput has enhanced classes, search icon, focus ring, aria-label
    - Test ExampleButtons have chart icon, hover:scale-110 class
    - _Requirements: 9.3, 9.4_

- [ ] 5. Enhance Results Page components
  - [ ] 5.1 Create or enhance VerdictCard component
    - Apply p-12, rounded-2xl, shadow-2xl, ring-4 ring-blue-500/20, bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600
    - Add target icon (🎯) at text-6xl with "FINAL VERDICT" in text-2xl tracking-widest uppercase
    - Display verdict text in text-6xl font-black with text gradient and scale-in animation
    - Add horizontal separator with border-t border-white/20 w-2/3 mx-auto
    - Render detail mini cards (Position Size 💰, Entry Strategy 📊, Risk Level ⚠️, Time Horizon ⏱️) with bg-white/10 backdrop-blur px-6 py-4 rounded-xl
    - Add confidence progress bar based on overall score
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 5.2 Enhance src/components/MasterScoresCard.tsx
    - Apply bg-gray-800 rounded-2xl p-8 shadow-xl container
    - Render each score as grid row with master icon, name, progress bar, and numeric score
    - Apply master brand colors to progress bars (blue-500 Buffett, purple-500 Munger, green-500 Lynch, yellow-500 Rothschild)
    - Animate progress bars from 0% to actual percentage over 1000ms with 150ms stagger
    - Display overall score with h-12 bar using gradient from-blue-500 via-purple-500 to-pink-500
    - Add score interpretation text below overall bar
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 3.5, 3.6, 3.7, 3.8_

  - [ ] 5.3 Enhance src/components/QuickFactsCard.tsx
    - Apply grid layout: 4 columns desktop, 2 columns tablet, 1 column mobile
    - Render each metric with large icon (text-4xl), label (text-xs uppercase), value (text-2xl font-bold)
    - Apply hover:scale-105 and shadow transitions to metric cards
    - Color-code values: green for strong, yellow for moderate, red for weak
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 3.1, 3.2, 3.3_

  - [ ] 5.4 Enhance src/components/AnalysisTabs.tsx
    - Make tab navigation sticky with backdrop-blur, add icons before text labels
    - Add sliding active indicator
    - Apply fadeIn animation on tab content switch
    - Render section cards with colored left borders matching active master brand color
    - Render status indicators: green checkmark (positive), yellow warning (caution), red cross (negative)
    - Render financial metrics as mini card grid within tabs
    - Render quote boxes with colored backgrounds, large decorative quote marks, serif italic font
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 5.5 Write unit tests for Results Page enhancements
    - Test VerdictCard gradient, confidence bar, detail mini-cards
    - Test MasterScoresCard brand colors, animated bar class, overall gradient
    - Test QuickFactsCard grid layout, icon, color-coding logic
    - Test AnalysisTabs sticky nav, fadeIn animation, status indicators
    - _Requirements: 10.1, 11.3, 12.1, 13.1_

- [ ] 6. Checkpoint - Ensure Results Page enhancements work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Enhance Portfolio Page
  - [ ] 7.1 Enhance Portfolio summary cards
    - Display values in text-6xl with change indicators using directional arrows and mini sparkline charts
    - _Requirements: 14.1_

  - [ ] 7.2 Enhance Portfolio add-position form
    - Apply h-12 height inputs and gradient submit button
    - _Requirements: 14.2_

  - [ ] 7.3 Enhance Portfolio holdings table
    - Apply sticky header, color-coded P&L cells (green gains, red losses)
    - Add progress bars for allocation percentage
    - Add icon-based action buttons
    - _Requirements: 14.3, 3.1, 3.3_

  - [ ] 7.4 Enhance Portfolio allocation chart
    - Render at 300x300 pixels with hover effects
    - Add donut hole displaying total portfolio value
    - _Requirements: 14.4_

  - [ ] 7.5 Enhance Portfolio floating action buttons
    - Apply w-14 h-14 size with tooltips on hover
    - Apply shadow-lg
    - _Requirements: 14.5, 4.3_

  - [ ]* 7.6 Write unit tests for Portfolio Page enhancements
    - Test summary card text sizes and change indicators
    - Test holdings table sticky header, P&L color-coding
    - Test floating action button tooltips and sizing
    - _Requirements: 14.1, 14.3, 14.5_

- [ ] 8. Enhance Decision Journal Page
  - [ ] 8.1 Enhance Journal summary cards with celebration elements
    - Display trophy icon and confetti styling when win rate exceeds 70%
    - _Requirements: 15.1_

  - [ ] 8.2 Enhance Journal filter bar
    - Apply compact layout with removable filter chips
    - _Requirements: 15.2_

  - [ ] 8.3 Enhance Journal decision entries
    - Add visual decision badges, prominent P&L values with contextual emojis, animated status dots
    - _Requirements: 15.3_

  - [ ] 8.4 Enhance Journal Mistakes Autopsy section
    - Apply red border styling and lesson cards with yellow left borders
    - _Requirements: 15.4_

  - [ ] 8.5 Enhance Journal performance analytics
    - Add animated chart bars
    - _Requirements: 15.5_

  - [ ] 8.6 Enhance Journal empty state
    - Display enhanced empty state with illustration and call-to-action button
    - _Requirements: 15.6_

  - [ ]* 8.7 Write unit tests for Journal Page enhancements
    - Test celebration elements appear when win rate > 70%
    - Test filter chips are removable
    - Test Mistakes Autopsy red border and yellow lesson cards
    - Test empty state illustration and CTA
    - _Requirements: 15.1, 15.2, 15.4, 15.6_

- [ ] 9. Checkpoint - Ensure page-specific enhancements work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement responsive design and navigation
  - [ ] 10.1 Enhance src/components/NavigationBar.tsx with mobile support
    - Add hamburger icon button visible on mobile (`md:hidden`)
    - Implement slide-in drawer overlay with vertical nav links
    - Add click-away listener on backdrop to close drawer
    - Add aria-labels for hamburger button and navigation
    - _Requirements: 17.1, 18.1, 18.3_

  - [ ] 10.2 Apply responsive breakpoints across all pages
    - Stack multi-column layouts to single columns on mobile
    - Reduce text sizes and padding proportionally on mobile
    - Enable horizontal scrolling for data tables on mobile
    - Reduce chart dimensions and floating button sizes on mobile
    - _Requirements: 17.2, 17.3, 17.4, 17.5_

  - [ ]* 10.3 Write unit tests for responsive and navigation enhancements
    - Test NavigationBar mobile menu toggles, hamburger visible on small screens, aria-labels
    - Test responsive class application
    - _Requirements: 17.1, 18.1_

- [ ] 11. Implement accessibility enhancements
  - [ ] 11.1 Add aria-labels to all interactive elements across components
    - Audit and add aria-label to buttons, links, inputs, tabs across all pages
    - _Requirements: 18.1_

  - [ ] 11.2 Add visible focus indicators
    - Apply `ring-2 ring-blue-500` focus indicators on all focusable elements
    - Ensure focus is visible during keyboard navigation
    - _Requirements: 18.2_

  - [ ] 11.3 Add "Skip to content" link
    - Add as first focusable element on each page, visually hidden until focused
    - _Requirements: 18.4_

  - [ ] 11.4 Implement prefers-reduced-motion support
    - Ensure all animations respect `prefers-reduced-motion: reduce` media query
    - Replace animations with instant state changes when enabled
    - _Requirements: 5.6, 18.6_

  - [ ]* 11.5 Write accessibility tests
    - Test all interactive elements have aria-label
    - Test focus indicators are present on focusable elements
    - Test skip-to-content link is first focusable element
    - Test reduced-motion disables animations
    - _Requirements: 18.1, 18.2, 18.4, 18.6_

- [ ] 12. Integration and wiring
  - [ ] 12.1 Wrap App with ToastProvider and integrate toast notifications
    - Add `ToastProvider` wrapper in App.tsx
    - Wire `showToast` calls to portfolio add/remove actions
    - Wire `showToast` calls to journal entry actions
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 12.2 Apply page transition animations
    - Add `animate-fade-in` class to page content containers on route changes
    - _Requirements: 5.4_

  - [ ] 12.3 Apply consistent spacing between sections across all pages
    - Ensure space-y-12 between page sections and gap-6 between cards
    - Apply page-container class to all page wrappers
    - _Requirements: 2.3, 2.4_

  - [ ] 12.4 Apply shadow and depth system consistently
    - Ensure shadow-xl on cards with hover:shadow-2xl
    - Ensure shadow-2xl on modals
    - Ensure shadow-lg on floating buttons
    - Ensure transition-shadow duration-300 on all shadow elements
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 12.5 Write integration tests
    - Test toast appears on portfolio add action and auto-dismisses
    - Test modal opens/closes with animation classes
    - Test page transitions apply animate-fade-in
    - Test progress stepper updates as analysis loads
    - _Requirements: 8.1, 16.1, 5.4, 7.2_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- No property-based tests for this feature (UI rendering is not suitable for PBT)
- Unit tests use Vitest with @testing-library/react
- All components use TypeScript with the existing React 18 + Tailwind CSS stack
- No new dependencies are introduced; animations use CSS keyframes via Tailwind config

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.6"] },
    { "id": 2, "tasks": ["2.4", "2.5"] },
    { "id": 3, "tasks": ["2.7", "4.1", "4.2", "4.3"] },
    { "id": 4, "tasks": ["4.4", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 5, "tasks": ["5.5", "7.1", "7.2", "7.3", "7.4", "7.5"] },
    { "id": 6, "tasks": ["7.6", "8.1", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 7, "tasks": ["8.7", "10.1", "10.2"] },
    { "id": 8, "tasks": ["10.3", "11.1", "11.2", "11.3", "11.4"] },
    { "id": 9, "tasks": ["11.5", "12.1", "12.2", "12.3", "12.4"] },
    { "id": 10, "tasks": ["12.5"] }
  ]
}
```
