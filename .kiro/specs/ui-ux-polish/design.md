# Design Document: UI/UX Polish

## Overview

This design establishes a unified design system for the 4 Masters Investment Advisor application and applies page-specific visual enhancements. The system defines reusable tokens for typography, spacing, colors, shadows, animations, buttons, loading states, and notifications — then applies them consistently across the Search, Results, Portfolio, and Journal pages.

The current codebase uses ad-hoc Tailwind classes with inconsistent sizing, spacing, and interaction patterns. This design introduces a centralized design token layer (via Tailwind config extensions and shared CSS utility classes) and refactors existing components to consume these tokens.

### Design Decisions

1. **Tailwind-first approach**: All design tokens are expressed as Tailwind config extensions or `@layer components` utilities rather than a separate CSS-in-JS system. This aligns with the existing stack.
2. **No new dependencies**: The design uses only existing libraries (React 18, Tailwind CSS, Recharts). Animations use CSS keyframes via Tailwind config.
3. **Progressive enhancement**: Animations and hover effects degrade gracefully with `prefers-reduced-motion` media query support.
4. **Component composition**: Shared UI primitives (Button, Toast, Skeleton, Modal) are extracted into a `src/components/ui/` directory for reuse.

## Architecture

```mermaid
graph TD
    subgraph "Design System Layer"
        TC[tailwind.config.ts<br/>Theme Extensions]
        CSS[src/index.css<br/>@layer components]
    end

    subgraph "UI Primitives (src/components/ui/)"
        BTN[Button]
        TOAST[Toast / ToastProvider]
        SKEL[Skeleton]
        MODAL[Modal]
        SPINNER[Spinner]
    end

    subgraph "Page Components"
        SP[Search Page]
        RP[Results Page]
        PP[Portfolio Page]
        JP[Journal Page]
    end

    subgraph "Layout Components"
        NAV[NavigationBar]
        LAYOUT[PageLayout]
    end

    TC --> CSS
    CSS --> BTN
    CSS --> TOAST
    CSS --> SKEL
    CSS --> MODAL
    CSS --> SPINNER
    BTN --> SP
    BTN --> RP
    BTN --> PP
    BTN --> JP
    TOAST --> SP
    TOAST --> PP
    TOAST --> JP
    SKEL --> RP
    MODAL --> JP
    MODAL --> PP
    NAV --> LAYOUT
    LAYOUT --> SP
    LAYOUT --> RP
    LAYOUT --> PP
    LAYOUT --> JP
```

### File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Unified button component (primary, secondary, success, danger)
│   │   ├── Toast.tsx           # Toast notification component
│   │   ├── ToastProvider.tsx   # Context provider for toast state
│   │   ├── Skeleton.tsx        # Skeleton loader component
│   │   ├── Modal.tsx           # Modal/dialog component
│   │   ├── Spinner.tsx         # Spinning loader indicator
│   │   └── ProgressStepper.tsx # Multi-step progress indicator
│   ├── NavigationBar.tsx       # Enhanced with mobile hamburger menu
│   ├── SearchInput.tsx         # Enhanced with icon, sizing, backdrop-blur
│   ├── ExampleButtons.tsx      # Enhanced with icons, hover scale
│   ├── MasterScoresCard.tsx    # Enhanced with animated bars, brand colors
│   ├── QuickFactsCard.tsx      # Enhanced with icon grid, color-coding
│   ├── VerdictCard.tsx         # Enhanced with gradient, animations
│   └── ...
├── index.css                   # Extended with @layer components utilities
└── ...
tailwind.config.ts              # Extended with design tokens
```

## Components and Interfaces

### UI Primitives

#### Button Component

```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'danger';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
}
```

Variant class mappings:
- `primary`: `bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`
- `secondary`: `bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg`
- `success`: `bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg`
- `danger`: `bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg`

Size class mappings:
- `sm`: `px-4 py-2 text-sm`
- `md`: `px-6 py-3 text-base`
- `lg`: `px-8 py-4 text-lg`

#### Toast Component

```typescript
// src/components/ui/Toast.tsx
interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number; // default 3000ms
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}
```

```typescript
// src/components/ui/ToastProvider.tsx
interface ToastContextValue {
  showToast: (type: ToastMessage['type'], message: string) => void;
}
```

Toast type class mappings:
- `success`: `bg-green-900/90 border-l-4 border-green-500`
- `error`: `bg-red-900/90 border-l-4 border-red-500`
- `info`: `bg-blue-900/90 border-l-4 border-blue-500`

Position: fixed top-right (`fixed top-4 right-4 z-50`). Animate in with `slideInRight` keyframe.

#### Skeleton Component

```typescript
// src/components/ui/Skeleton.tsx
interface SkeletonProps {
  width?: string;   // Tailwind width class, e.g. 'w-full'
  height?: string;  // Tailwind height class, e.g. 'h-6'
  rounded?: string; // Tailwind rounded class, e.g. 'rounded-lg'
  className?: string;
}
```

Base classes: `bg-gray-800 animate-pulse rounded`

#### Modal Component

```typescript
// src/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

Backdrop: `bg-black/70 backdrop-blur-sm` with fade-in animation.
Dialog: `rounded-2xl shadow-2xl bg-gray-800` with scale-in animation (0.95 → 1.0).
Header: `text-3xl font-bold` with close button.
Footer: `border-t border-gray-700` with right-aligned buttons.

#### Spinner Component

```typescript
// src/components/ui/Spinner.tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

Renders a blue spinning circle using `animate-spin border-2 border-blue-500 border-t-transparent rounded-full`.

#### ProgressStepper Component

```typescript
// src/components/ui/ProgressStepper.tsx
interface Step {
  name: string;
  status: 'complete' | 'loading' | 'pending';
}

interface ProgressStepperProps {
  steps: Step[];
}
```

Renders step names with icons: ✓ (green) for complete, spinner for loading, ○ (gray) for pending.

### Enhanced NavigationBar

```typescript
// Updated NavigationBar with mobile support
interface NavigationBarProps {}
// Internal state: mobileMenuOpen: boolean
```

Desktop: Current horizontal layout with enhanced styling.
Mobile (`md:hidden`): Hamburger icon button that toggles a slide-in drawer overlay with vertical nav links.

### Toast Provider Integration

The `ToastProvider` wraps the app in `App.tsx`, providing `showToast` via React Context. Components call `useToast()` to trigger notifications.

## Data Models

### Design Tokens (tailwind.config.ts extensions)

```typescript
// Theme extensions added to tailwind.config.ts
{
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.3s ease-out',
      'slide-in-right': 'slideInRight 0.3s ease-out',
      'scale-in': 'scaleIn 0.3s ease-out',
      'progress-fill': 'progressFill 1s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      slideInRight: {
        '0%': { opacity: '0', transform: 'translateX(100%)' },
        '100%': { opacity: '1', transform: 'translateX(0)' },
      },
      scaleIn: {
        '0%': { opacity: '0', transform: 'scale(0.95)' },
        '100%': { opacity: '1', transform: 'scale(1)' },
      },
      progressFill: {
        '0%': { width: '0%' },
        '100%': { width: 'var(--progress-width)' },
      },
    },
  },
}
```

### CSS Utility Layer (index.css additions)

```css
@layer components {
  /* Typography */
  .text-page-title { @apply text-5xl font-black tracking-tight; }
  .text-section-title { @apply text-3xl font-bold mb-6; }
  .text-card-title { @apply text-2xl font-semibold mb-4; }
  .text-subsection { @apply text-xl font-semibold mb-3; }
  .text-body { @apply text-base leading-relaxed; }
  .text-small { @apply text-sm text-gray-400; }
  .text-label { @apply text-xs uppercase tracking-wide text-gray-500; }

  /* Page containers */
  .page-container { @apply px-8 py-12 max-w-7xl mx-auto; }
  .page-container-mobile { @apply px-4 py-8; }

  /* Card base */
  .card { @apply bg-gray-800 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1; }
  .card-mobile { @apply p-6; }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .card { @apply transition-none hover:translate-y-0; }
  }
}
```

### Toast State Model

```typescript
interface ToastState {
  toasts: ToastMessage[];
}
// Max visible toasts: 3 (oldest dismissed when exceeded)
// Auto-dismiss timeout: 3000ms
```

### Master Brand Colors (constant)

```typescript
const MASTER_COLORS = {
  buffett: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
  munger: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500' },
  lynch: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' },
  rothschild: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' },
} as const;
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| Toast auto-dismiss timer cleanup | `useEffect` cleanup on unmount to clear timeouts |
| Modal escape key | `useEffect` keydown listener for Escape key, cleaned up on unmount |
| Animation on reduced-motion | CSS `prefers-reduced-motion: reduce` disables transforms and animations |
| Mobile menu outside click | Click-away listener on backdrop to close drawer |
| Missing toast context | `useToast()` throws descriptive error if used outside `ToastProvider` |
| Focus trap in modal | Tab key cycles through focusable elements within modal when open |

## Testing Strategy

### Why Property-Based Testing Does NOT Apply

This feature is primarily about **UI rendering, layout, and visual styling**. The requirements define:
- CSS class compositions (typography, spacing, colors, shadows)
- Animation keyframes and transitions
- Component visual states (hover, active, focus)
- Responsive breakpoint behavior
- Accessibility attributes

These are not pure functions with universal input/output properties. There is no meaningful "for all inputs X, property P(X) holds" statement for CSS class application or animation behavior. The correct testing approach is:

1. **Snapshot tests** — verify rendered component output matches expected structure
2. **Example-based unit tests** — verify specific class compositions and conditional rendering
3. **Accessibility tests** — verify ARIA attributes, focus management, keyboard navigation

### Test Approach

#### Unit Tests (Vitest + React Testing Library)

| Component | Test Focus |
|-----------|-----------|
| `Button` | Renders correct variant classes, size classes, handles click, disabled state, aria-label |
| `Toast` | Renders correct type classes, auto-dismisses after timeout, slide-in animation class present |
| `ToastProvider` | `showToast` adds toast to state, max 3 visible, cleanup on unmount |
| `Skeleton` | Renders with correct width/height/rounded classes, has `animate-pulse` |
| `Modal` | Backdrop renders with blur, dialog has scale-in class, Escape closes, focus trap works |
| `Spinner` | Renders with `animate-spin`, correct size classes |
| `ProgressStepper` | Renders correct icons per status, step names displayed |
| `NavigationBar` | Mobile menu toggles, hamburger visible on small screens, aria-labels present |
| `SearchInput` | Enhanced classes applied, search icon rendered, focus ring present |
| `ExampleButtons` | Chart icon rendered, hover:scale-110 class present |
| `MasterScoresCard` | Brand colors applied per master, animated bar class present, overall gradient |
| `QuickFactsCard` | Grid layout classes, icon rendered, color-coding logic |
| `VerdictCard` | Gradient background, confidence bar, detail mini-cards rendered |

#### Accessibility Tests

- All interactive elements have `aria-label`
- Focus indicators (`ring-2 ring-blue-500`) present on focusable elements
- Modal focus trap cycles correctly
- Skip-to-content link is first focusable element
- Color contrast ratios verified for text elements (manual + automated tooling)

#### Responsive Tests

- Navigation collapses to hamburger at mobile breakpoint
- Grid layouts stack to single column on mobile
- Text sizes reduce proportionally
- Tables enable horizontal scroll on mobile

#### Integration Tests

- Toast appears on portfolio add action and auto-dismisses
- Modal opens/closes with animation classes
- Page transitions apply `animate-fade-in`
- Progress stepper updates as analysis loads

### Test Configuration

- Framework: Vitest with `@testing-library/react`
- DOM: jsdom
- Run command: `npm run test` (vitest --run)
- No property-based tests for this feature (UI rendering is not suitable for PBT)
