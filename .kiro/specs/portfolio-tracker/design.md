# Design Document: Portfolio Tracker

## Architecture Overview

The Portfolio Tracker introduces a multi-page architecture using React Router (`react-router-dom`). The existing single-page app becomes the `/` (Analyze) route, while new routes are added for `/portfolio` and `/journal`. A shared `NavigationBar` component provides consistent navigation across all pages.

### Routing Structure

```
App (BrowserRouter)
├── NavigationBar (always visible, fixed top)
├── Route "/" → AnalyzePage (existing App content)
├── Route "/portfolio" → PortfolioPage
└── Route "/journal" → JournalPage (placeholder)
```

### State Management

Portfolio state is managed locally within `PortfolioPage` using React `useState` and `useEffect`. Holdings are loaded from localStorage on mount and persisted on every mutation. All derived metrics (totals, percentages, rankings) are computed inline or via `useMemo` from the holdings array — no separate state for computed values.

---

## Data Models

### PortfolioHolding

```typescript
export interface PortfolioHolding {
  id: string;                // UUID generated on creation
  ticker: string;            // e.g., "AAPL"
  companyName: string;       // e.g., "Apple Inc."
  shares: number;            // number of shares held
  avgCost: number;           // average cost per share
  currentPrice: number;      // current market price per share
  purchaseDate: string;      // ISO date string "YYYY-MM-DD"
  category: string;          // e.g., "Technology", "Healthcare"
  riskLevel: 'low' | 'medium' | 'high';
  notes: string;             // optional user notes
}
```

### Computed Values (not stored, derived from holdings)

```typescript
// Per-holding computations
interface HoldingMetrics {
  value: number;              // shares × currentPrice
  gainLoss: number;           // (currentPrice - avgCost) × shares
  gainLossPercent: number;    // ((currentPrice - avgCost) / avgCost) × 100
  portfolioPercent: number;   // (value / totalPortfolioValue) × 100
}

// Portfolio-level computations
interface PortfolioSummary {
  totalValue: number;         // sum of all holding values
  totalPnL: number;           // sum of all gain/loss amounts
  holdingsCount: number;      // holdings.length
  highRiskExposure: number;   // (sum of high-risk values / totalValue) × 100
}
```

### localStorage Key

```typescript
const PORTFOLIO_STORAGE_KEY = 'portfolio-holdings';
```

---

## Component Hierarchy

```
App.tsx (BrowserRouter wrapper)
├── NavigationBar
│   └── NavLink × 3 (Analyze, Portfolio, Journal)
│
├── AnalyzePage (existing content extracted from App.tsx)
│
└── PortfolioPage
    ├── PageHeader ("💼 Portfolio Tracker")
    ├── OverLimitAlerts
    ├── SummaryCards
    │   └── SummaryCard × 4
    ├── FloatingActionButtons
    ├── AddHoldingForm (collapsible)
    ├── LayoutContainer (responsive 60/40 grid)
    │   ├── LeftColumn
    │   │   └── HoldingsTable
    │   │       ├── SearchInput
    │   │       ├── SortableHeader
    │   │       └── HoldingRow × N (with inline edit)
    │   └── RightColumn
    │       ├── AllocationChart (SVG pie)
    │       │   └── ChartLegend
    │       ├── RiskBreakdown
    │       │   └── RiskBar × 3
    │       └── PerformanceRankings
    │           ├── TopPerformers (top 5)
    │           └── BottomPerformers (bottom 3)
    └── EmptyState (shown when holdings.length === 0)
```

---

## Component Interfaces

### NavigationBar

```typescript
// No props — reads current route from useLocation()
const NavigationBar: React.FC = () => { ... }
```

### PortfolioPage

```typescript
// No props — top-level route component
// Internal state: holdings: PortfolioHolding[]
const PortfolioPage: React.FC = () => { ... }
```

### SummaryCards

```typescript
interface SummaryCardsProps {
  totalValue: number;
  totalPnL: number;
  holdingsCount: number;
  highRiskExposure: number;
}
```

### AddHoldingForm

```typescript
interface AddHoldingFormProps {
  onAdd: (holding: Omit<PortfolioHolding, 'id' | 'currentPrice'>) => void;
  prefill?: Partial<PortfolioHolding>;  // for Decision Journal integration
}
```

### HoldingsTable

```typescript
interface HoldingsTableProps {
  holdings: PortfolioHolding[];
  totalValue: number;
  onEdit: (id: string, updates: Partial<PortfolioHolding>) => void;
  onDelete: (id: string) => void;
}
```

### AllocationChart

```typescript
interface AllocationChartProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}
```

### RiskBreakdown

```typescript
interface RiskBreakdownProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}
```

### PerformanceRankings

```typescript
interface PerformanceRankingsProps {
  holdings: PortfolioHolding[];
}
```

### OverLimitAlerts

```typescript
interface OverLimitAlertsProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}
```

### FloatingActionButtons

```typescript
interface FloatingActionButtonsProps {
  onExportCSV: () => void;
  onRefreshPrices: () => void;
  onSettings: () => void;
}
```

---

## Key Implementation Details

### SVG Pie Chart Approach

The `AllocationChart` renders a pure SVG element with `<path>` elements for each slice. Each slice is computed using arc geometry:

```typescript
function computeSlices(holdings: PortfolioHolding[], totalValue: number): PieSlice[] {
  let cumulativeAngle = 0;
  return holdings.map((h, i) => {
    const percent = (h.shares * h.currentPrice) / totalValue;
    const angle = percent * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ticker: h.ticker,
      percent,
      startAngle,
      endAngle: cumulativeAngle,
      color: COLORS[i % COLORS.length],
    };
  });
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}
```

A predefined color palette of 12+ distinct colors ensures visual differentiation.

### Simulated Price Refresh

```typescript
function refreshPrices(holdings: PortfolioHolding[]): PortfolioHolding[] {
  return holdings.map(h => {
    const changePercent = (Math.random() * 10 - 5) / 100; // -5% to +5%
    const newPrice = h.currentPrice * (1 + changePercent);
    return { ...h, currentPrice: Math.round(newPrice * 100) / 100 };
  });
}
```

### Portfolio Calculations Module

All pure computation functions are extracted into `src/utils/portfolioCalculations.ts`:

```typescript
export function computeTotalValue(holdings: PortfolioHolding[]): number;
export function computeTotalPnL(holdings: PortfolioHolding[]): number;
export function computeHighRiskExposure(holdings: PortfolioHolding[], totalValue: number): number;
export function computeGainLoss(holding: PortfolioHolding): number;
export function computeGainLossPercent(holding: PortfolioHolding): number;
export function computePortfolioPercent(holding: PortfolioHolding, totalValue: number): number;
export function computeRiskBreakdown(holdings: PortfolioHolding[], totalValue: number): Record<string, number>;
export function getTopPerformers(holdings: PortfolioHolding[], count: number): PortfolioHolding[];
export function getBottomPerformers(holdings: PortfolioHolding[], count: number): PortfolioHolding[];
export function getOverLimitHoldings(holdings: PortfolioHolding[], totalValue: number, threshold?: number): PortfolioHolding[];
export function computePieSlices(holdings: PortfolioHolding[], totalValue: number): PieSlice[];
```

### CSV Export

Leverages existing `csvUtils.ts` pattern and `downloadFile.ts`:

```typescript
export function generatePortfolioCSV(holdings: PortfolioHolding[], totalValue: number): string {
  const header = 'Ticker,Company,Shares,Avg Cost,Current Price,Gain/Loss,Portfolio %,Purchase Date,Category,Risk Level';
  const rows = holdings.map(h => {
    const gainLoss = computeGainLoss(h);
    const pct = computePortfolioPercent(h, totalValue);
    return `${h.ticker},${h.companyName},${h.shares},${h.avgCost},${h.currentPrice},${gainLoss.toFixed(2)},${pct.toFixed(2)},${h.purchaseDate},${h.category},${h.riskLevel}`;
  });
  return [header, ...rows].join('\n');
}
```

### Persistence via storageUtils

```typescript
import { loadFromStorage, saveToStorage } from '../utils/storageUtils';

// Load on mount
const holdings = loadFromStorage<PortfolioHolding[]>(PORTFOLIO_STORAGE_KEY, []);

// Save on mutation
saveToStorage(PORTFOLIO_STORAGE_KEY, updatedHoldings);
```

### Decision Journal Integration

When a BUY decision is saved in the Decision Journal, a custom event or callback triggers a prompt. The pre-fill computation:

```typescript
function computePrefillFromDecision(entry: DecisionEntry): Partial<PortfolioHolding> {
  return {
    ticker: entry.ticker,
    companyName: entry.companyName,
    avgCost: entry.entryPriceTarget,
    shares: Math.floor(entry.positionSizeAmount / entry.entryPriceTarget),
    purchaseDate: new Date().toISOString().split('T')[0],
  };
}
```

---

## Sorting Implementation

```typescript
type SortColumn = 'ticker' | 'companyName' | 'shares' | 'avgCost' | 'currentPrice' | 'gainLoss' | 'portfolioPercent';
type SortDirection = 'asc' | 'desc';

export function sortHoldings(
  holdings: PortfolioHolding[],
  column: SortColumn,
  direction: SortDirection,
  totalValue: number
): PortfolioHolding[];
```

### Search/Filter

```typescript
export function filterHoldings(holdings: PortfolioHolding[], query: string): PortfolioHolding[] {
  const lower = query.toLowerCase();
  return holdings.filter(h =>
    h.ticker.toLowerCase().includes(lower) ||
    h.companyName.toLowerCase().includes(lower)
  );
}
```

---

## Error Handling

- **Invalid localStorage data**: `loadFromStorage` already returns the fallback (empty array) on parse errors.
- **Division by zero**: When `totalValue === 0`, portfolio percentages default to 0. The pie chart renders an empty state.
- **Empty holdings**: Components check `holdings.length === 0` and render the empty state instead of tables/charts.
- **Form validation**: Required fields (ticker, shares, avgCost) are validated before submission. Shares and avgCost must be positive numbers.

---

## Integration Points

| Integration Point | Mechanism |
|---|---|
| Existing `storageUtils.ts` | `loadFromStorage` / `saveToStorage` for holdings persistence |
| Existing `csvUtils.ts` pattern | New `generatePortfolioCSV` function following same pattern |
| Existing `downloadFile.ts` | Used to trigger CSV download |
| Existing `types.ts` | `DecisionEntry` type used for Journal integration |
| React Router | New dependency; wraps entire app in `BrowserRouter` |
| Existing Header | Replaced by `NavigationBar` on all pages |

---

## File Structure (New Files)

```
src/
├── pages/
│   ├── AnalyzePage.tsx          # Extracted from current App.tsx
│   ├── PortfolioPage.tsx        # New portfolio page
│   └── JournalPage.tsx          # Placeholder for journal route
├── components/
│   ├── NavigationBar.tsx        # Shared navigation
│   ├── portfolio/
│   │   ├── SummaryCards.tsx
│   │   ├── AddHoldingForm.tsx
│   │   ├── HoldingsTable.tsx
│   │   ├── AllocationChart.tsx
│   │   ├── RiskBreakdown.tsx
│   │   ├── PerformanceRankings.tsx
│   │   ├── OverLimitAlerts.tsx
│   │   ├── FloatingActionButtons.tsx
│   │   └── EmptyState.tsx
├── utils/
│   ├── portfolioCalculations.ts  # Pure computation functions
│   ├── portfolioCSV.ts           # CSV generation for portfolio
│   └── priceRefresh.ts           # Simulated price refresh logic
├── data/
│   └── types.ts                  # Extended with PortfolioHolding
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Total Value computation

*For any* non-empty array of holdings, the computed total value SHALL equal the sum of `shares × currentPrice` for each holding in the array.

**Validates: Requirements 3.2**

### Property 2: Total P&L computation

*For any* non-empty array of holdings, the computed total P&L SHALL equal the sum of `(currentPrice - avgCost) × shares` for each holding in the array.

**Validates: Requirements 3.3, 5.9**

### Property 3: High-Risk Exposure computation

*For any* array of holdings with at least one holding, the computed high-risk exposure percentage SHALL equal `(sum of values where riskLevel === 'high') / totalValue × 100`. Additionally, the result SHALL always be between 0 and 100 inclusive.

**Validates: Requirements 3.5**

### Property 4: Portfolio percentage invariant

*For any* non-empty array of holdings, the sum of all individual portfolio percentages SHALL equal 100 (within floating-point tolerance), where each holding's percentage is `(shares × currentPrice) / totalValue × 100`.

**Validates: Requirements 5.10, 6.2**

### Property 5: Sorting correctness

*For any* array of holdings, any valid sort column, and any sort direction, the sorted result SHALL contain exactly the same elements as the input, and adjacent elements SHALL satisfy the ordering constraint for the chosen column and direction.

**Validates: Requirements 5.2**

### Property 6: Search filter correctness

*For any* array of holdings and any search query string, every holding in the filtered result SHALL contain the query (case-insensitive) in either its ticker or companyName field. Additionally, no holding excluded from the result shall match the query.

**Validates: Requirements 5.3**

### Property 7: Performance rankings ordering

*For any* array of holdings with at least 5 elements, the top 5 performers SHALL be ordered by gain/loss percentage in descending order, and the bottom 3 performers SHALL be ordered by gain/loss percentage in ascending order. The gain/loss percentage for each holding is `((currentPrice - avgCost) / avgCost) × 100`.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 8: Over-limit alert threshold

*For any* array of holdings and any holding in that array, an over-limit alert SHALL be present for that holding if and only if its portfolio percentage exceeds 15%.

**Validates: Requirements 9.1, 9.3**

### Property 9: Risk breakdown percentages sum to 100

*For any* non-empty array of holdings, the sum of risk breakdown percentages across all risk levels (low, medium, high) SHALL equal 100 (within floating-point tolerance).

**Validates: Requirements 7.2**

### Property 10: CSV export data preservation

*For any* array of holdings, the generated CSV string SHALL contain exactly one data row per holding, and parsing each row SHALL recover the original ticker, shares, avgCost, currentPrice, purchaseDate, category, and riskLevel values.

**Validates: Requirements 10.1**

### Property 11: Price refresh bounds

*For any* holding with a positive currentPrice, after a simulated price refresh, the new currentPrice SHALL be within the range `[originalPrice × 0.95, originalPrice × 1.05]`.

**Validates: Requirements 11.1**

### Property 12: Persistence round-trip

*For any* valid array of PortfolioHolding objects, saving to localStorage and then loading SHALL produce an array equal to the original.

**Validates: Requirements 12.3, 12.2**

### Property 13: New holding initialization

*For any* valid form submission (with ticker, shares > 0, avgCost > 0), the created holding SHALL have `currentPrice` equal to `avgCost` and a non-empty unique `id`.

**Validates: Requirements 4.4**
