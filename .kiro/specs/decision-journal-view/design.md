# Design Document: Decision Journal View

## Architecture Overview

The Decision Journal View replaces the existing placeholder `JournalPage.tsx` with a full-featured journal interface. The architecture follows a container/presentational pattern where the top-level page component manages state and data flow, while sub-components handle rendering and user interaction. All computation logic is extracted into pure utility functions for testability.

### Technology Stack

- **React 18** with TypeScript for UI components
- **Recharts** (new dependency) for performance analytics charts
- **Tailwind CSS** for dark-mode styling
- **localStorage** for data persistence via existing `storageUtils.ts`
- **Existing `downloadFile.ts`** utility for export functionality

---

## File Structure

```
src/
├── pages/
│   └── JournalPage.tsx              # Main page container (replaces existing)
├── components/
│   └── journal/
│       ├── SummaryCards.tsx          # Performance summary cards row
│       ├── FilterBar.tsx            # Search, filters, sort, view toggle
│       ├── DecisionTable.tsx        # Table view of decisions
│       ├── DecisionCardGrid.tsx     # Card view of decisions
│       ├── DecisionDetailModal.tsx  # Modal overlay with tabs
│       ├── OverviewTab.tsx          # Modal tab: key metrics + timeline
│       ├── ReasoningTab.tsx         # Modal tab: reasoning text
│       ├── AnalysisTab.tsx          # Modal tab: master scores
│       ├── UpdatesTab.tsx           # Modal tab: status update form
│       ├── MistakesAutopsy.tsx      # Collapsible losses section
│       ├── PerformanceAnalytics.tsx # Charts and metrics section
│       ├── EmptyState.tsx           # No-data placeholder
│       └── ExportButton.tsx         # Export dropdown (CSV/JSON)
└── utils/
    ├── journalCalculations.ts       # Pure computation functions
    ├── journalFilters.ts            # Filter and sort logic
    ├── journalExport.ts             # CSV/JSON generation
    ├── storageUtils.ts              # (existing) localStorage helpers
    └── downloadFile.ts              # (existing) file download trigger
```

---

## Component Hierarchy

```
JournalPage
├── SummaryCards
├── FilterBar
├── ExportButton
├── DecisionTable (when viewMode === 'table')
│   └── (rows with action buttons)
├── DecisionCardGrid (when viewMode === 'card')
│   └── (clickable cards)
├── MistakesAutopsy
├── PerformanceAnalytics
├── DecisionDetailModal (when selectedEntry !== null)
│   ├── OverviewTab
│   ├── ReasoningTab
│   ├── AnalysisTab
│   └── UpdatesTab
└── EmptyState (when decisions.length === 0)
```

---

## Data Model

### Extended DecisionEntry Fields

The existing `DecisionEntry` type from `src/data/types.ts` is used as-is. For P&L calculations, we derive values from `entryPriceTarget` and `currentPrice`. The `status` field supports `'active' | 'closed'`. For "watching" status in filters, we use entries with `decision === 'WATCHLIST'` and `status === 'active'`.

### Filter State Interface

```typescript
interface JournalFilters {
  search: string;
  decisionType: 'ALL' | 'BUY' | 'PASS' | 'WATCHLIST';
  status: 'ALL' | 'ACTIVE' | 'CLOSED' | 'WATCHING';
  dateRange: { start: string | null; end: string | null };
  sortBy: 'NEWEST' | 'OLDEST' | 'BEST_PNL' | 'WORST_PNL';
  viewMode: 'table' | 'card';
}
```

### Modal State Interface

```typescript
interface ModalState {
  isOpen: boolean;
  entry: DecisionEntry | null;
  activeTab: 'overview' | 'reasoning' | 'analysis' | 'updates';
}
```

### Update Form Data

```typescript
interface DecisionUpdate {
  status: 'active' | 'closed';
  exitPrice: number | null;
  actualOutcome: string;
  lessonsLearned: string;
  tags: string[];
}
```

---

## Props Interfaces

### SummaryCards

```typescript
interface SummaryCardsProps {
  metrics: JournalMetrics;
}

interface JournalMetrics {
  totalDecisions: number;
  winRate: number | null;       // null when no closed decisions
  avgReturn: number | null;     // null when no closed decisions
  bestTrade: { ticker: string; returnPct: number } | null;
}
```

### FilterBar

```typescript
interface FilterBarProps {
  filters: JournalFilters;
  onFiltersChange: (filters: JournalFilters) => void;
}
```

### DecisionTable

```typescript
interface DecisionTableProps {
  decisions: DecisionEntry[];
  onView: (entry: DecisionEntry) => void;
  onEdit: (entry: DecisionEntry) => void;
}
```

### DecisionCardGrid

```typescript
interface DecisionCardGridProps {
  decisions: DecisionEntry[];
  onSelect: (entry: DecisionEntry) => void;
}
```

### DecisionDetailModal

```typescript
interface DecisionDetailModalProps {
  entry: DecisionEntry;
  activeTab: 'overview' | 'reasoning' | 'analysis' | 'updates';
  onTabChange: (tab: 'overview' | 'reasoning' | 'analysis' | 'updates') => void;
  onClose: () => void;
  onUpdate: (id: string, update: DecisionUpdate) => void;
}
```

### Tab Components

```typescript
interface OverviewTabProps {
  entry: DecisionEntry;
}

interface ReasoningTabProps {
  entry: DecisionEntry;
}

interface AnalysisTabProps {
  entry: DecisionEntry;
}

interface UpdatesTabProps {
  entry: DecisionEntry;
  onSubmit: (update: DecisionUpdate) => void;
}
```

### MistakesAutopsy

```typescript
interface MistakesAutopsyProps {
  losingDecisions: DecisionEntry[];
  stats: MistakeStats;
}

interface MistakeStats {
  totalLosses: number;
  totalDollarLost: number;
  avgLossPercent: number;
}
```

### PerformanceAnalytics

```typescript
interface PerformanceAnalyticsProps {
  decisions: DecisionEntry[];
  metrics: PerformanceMetrics;
  hasEnoughData: boolean;
}

interface PerformanceMetrics {
  winRate: number;
  avgWinPercent: number;
  avgLossPercent: number;
  profitFactor: number;
  currentStreak: { type: 'win' | 'loss'; count: number };
}

interface MonthlyReturn {
  month: string;  // "YYYY-MM"
  returnPct: number;
}

interface DecisionBreakdown {
  type: 'BUY' | 'PASS' | 'WATCHLIST';
  count: number;
  percentage: number;
}
```

### ExportButton

```typescript
interface ExportButtonProps {
  decisions: DecisionEntry[];
}
```

### EmptyState

```typescript
// No props needed - static content
```

---

## Utility Modules

### journalCalculations.ts

Pure functions for computing journal metrics:

```typescript
/** Compute P&L percentage for a decision entry */
export function computePnlPercent(entry: DecisionEntry): number;

/** Compute P&L dollar amount for a decision entry */
export function computePnlDollar(entry: DecisionEntry): number;

/** Compute summary metrics from all decisions */
export function computeJournalMetrics(decisions: DecisionEntry[]): JournalMetrics;

/** Compute performance analytics metrics from closed decisions */
export function computePerformanceMetrics(decisions: DecisionEntry[]): PerformanceMetrics;

/** Compute monthly returns for chart data */
export function computeMonthlyReturns(decisions: DecisionEntry[]): MonthlyReturn[];

/** Compute decision type breakdown */
export function computeDecisionBreakdown(decisions: DecisionEntry[]): DecisionBreakdown[];

/** Compute outcome distribution (wins vs losses) */
export function computeOutcomeDistribution(decisions: DecisionEntry[]): { wins: number; losses: number };

/** Compute mistake autopsy stats */
export function computeMistakeStats(losingDecisions: DecisionEntry[]): MistakeStats;

/** Get current streak (consecutive wins or losses, sorted by date) */
export function computeCurrentStreak(decisions: DecisionEntry[]): { type: 'win' | 'loss'; count: number };
```

**P&L Calculation Logic:**
- `pnlPercent = ((currentPrice - entryPriceTarget) / entryPriceTarget) * 100`
- `pnlDollar = (currentPrice - entryPriceTarget) * (positionSizeAmount / entryPriceTarget)`
- A decision is a "win" if `pnlPercent > 0` and status is `'closed'`
- Profit factor = `sum(positive pnl) / abs(sum(negative pnl))`, returns `Infinity` if no losses

### journalFilters.ts

Pure functions for filtering and sorting:

```typescript
/** Apply all filters to a decisions array */
export function applyFilters(
  decisions: DecisionEntry[],
  filters: JournalFilters
): DecisionEntry[];

/** Filter by ticker search (case-insensitive partial match) */
export function filterBySearch(
  decisions: DecisionEntry[],
  search: string
): DecisionEntry[];

/** Filter by decision type */
export function filterByDecisionType(
  decisions: DecisionEntry[],
  type: JournalFilters['decisionType']
): DecisionEntry[];

/** Filter by status */
export function filterByStatus(
  decisions: DecisionEntry[],
  status: JournalFilters['status']
): DecisionEntry[];

/** Filter by date range */
export function filterByDateRange(
  decisions: DecisionEntry[],
  start: string | null,
  end: string | null
): DecisionEntry[];

/** Sort decisions by specified criterion */
export function sortDecisions(
  decisions: DecisionEntry[],
  sortBy: JournalFilters['sortBy']
): DecisionEntry[];

/** Get losing decisions (closed with negative P&L) */
export function getLosingDecisions(decisions: DecisionEntry[]): DecisionEntry[];
```

**Filter Logic:**
- Search: `entry.ticker.toLowerCase().includes(search.toLowerCase())`
- Decision type: exact match on `entry.decision` field, or pass-through for 'ALL'
- Status: 'ACTIVE' matches `status === 'active' && decision !== 'WATCHLIST'`, 'CLOSED' matches `status === 'closed'`, 'WATCHING' matches `decision === 'WATCHLIST' && status === 'active'`
- Date range: `entry.date >= start && entry.date <= end` (ISO string comparison)
- Sort: `NEWEST` = descending by date, `OLDEST` = ascending by date, `BEST_PNL` = descending by pnlPercent, `WORST_PNL` = ascending by pnlPercent

### journalExport.ts

Pure functions for generating export content:

```typescript
/** Generate CSV string from decisions array */
export function generateCsvContent(decisions: DecisionEntry[]): string;

/** Generate JSON string from decisions array */
export function generateJsonContent(decisions: DecisionEntry[]): string;

/** Generate export filename with current date */
export function generateExportFilename(format: 'csv' | 'json'): string;
```

**CSV Format:**
- Header row with all DecisionEntry field names
- Scores object flattened to `scores_buffett`, `scores_munger`, etc.
- Arrays (reviewDates, alertsSet) joined with semicolons
- Values containing commas wrapped in double quotes

---

## State Management

The `JournalPage` component manages all state using React hooks:

```typescript
// Core data
const [decisions, setDecisions] = useState<DecisionEntry[]>([]);

// Filter state
const [filters, setFilters] = useState<JournalFilters>(defaultFilters);

// Modal state
const [modalState, setModalState] = useState<ModalState>({
  isOpen: false,
  entry: null,
  activeTab: 'overview',
});

// Derived data (computed via useMemo)
const filteredDecisions = useMemo(() => applyFilters(decisions, filters), [decisions, filters]);
const metrics = useMemo(() => computeJournalMetrics(decisions), [decisions]);
const performanceMetrics = useMemo(() => computePerformanceMetrics(decisions), [decisions]);
const losingDecisions = useMemo(() => getLosingDecisions(decisions), [decisions]);
const mistakeStats = useMemo(() => computeMistakeStats(losingDecisions), [losingDecisions]);
```

### Data Flow

1. On mount: `loadFromStorage('investment_decisions', [])` → `setDecisions`
2. Filter changes: `setFilters` → triggers `useMemo` recomputation of `filteredDecisions`
3. View/Edit action: `setModalState({ isOpen: true, entry, activeTab })` → renders modal
4. Update submission: update entry in array → `saveToStorage` → `setDecisions` with new array
5. Export: compute content from `decisions` → call `downloadFile`

### Modal Interaction

- **Open for view**: `setModalState({ isOpen: true, entry, activeTab: 'overview' })`
- **Open for edit**: `setModalState({ isOpen: true, entry, activeTab: 'updates' })`
- **Close**: `setModalState({ isOpen: false, entry: null, activeTab: 'overview' })`
- **Tab switch**: `setModalState(prev => ({ ...prev, activeTab }))`

---

## Recharts Integration

Install `recharts` as a production dependency. Charts are rendered in the `PerformanceAnalytics` component:

### Monthly Returns Bar Chart

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Data: MonthlyReturn[] mapped to { month: string, return: number }
// Positive bars: green fill (#10B981)
// Negative bars: red fill (#EF4444)
```

### Decision Breakdown Pie Chart

```typescript
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

// Data: DecisionBreakdown[]
// Colors: BUY=#10B981, PASS=#F59E0B, WATCHLIST=#3B82F6
```

### Outcome Distribution Bar Chart

```typescript
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// Data: [{ name: 'Wins', value: wins }, { name: 'Losses', value: losses }]
// Colors: Wins=#10B981, Losses=#EF4444
```

All charts use `ResponsiveContainer` with `width="100%"` and fixed height. Chart text colors use gray-400 (`#9CA3AF`) for axis labels to match dark theme.

---

## Error Handling

- **localStorage unavailable**: `loadFromStorage` returns fallback `[]`, page shows EmptyState
- **Malformed data**: `loadFromStorage` catches JSON parse errors, returns `[]`
- **Save failure**: `saveToStorage` returns `false`; UI could show a toast but for MVP we log to console
- **Division by zero**: Win rate and avg return return `null` when no closed decisions exist; components display "—"
- **Missing fields on DecisionEntry**: P&L calculations default to 0 if `entryPriceTarget` is 0

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Total Decisions equals array length

*For any* array of DecisionEntry records, the computed `totalDecisions` metric SHALL equal the length of the input array.

**Validates: Requirements 1.2**

### Property 2: Win Rate computation correctness

*For any* non-empty array of closed DecisionEntry records, the computed win rate SHALL equal `(count of entries with positive P&L / total closed entries) * 100`.

**Validates: Requirements 1.3**

### Property 3: Average Return computation correctness

*For any* non-empty array of closed DecisionEntry records, the computed average return SHALL equal the arithmetic mean of all individual P&L percentages.

**Validates: Requirements 1.4**

### Property 4: Best Trade identification

*For any* non-empty array of closed DecisionEntry records, the computed best trade SHALL have a P&L percentage greater than or equal to every other closed decision's P&L percentage.

**Validates: Requirements 1.5**

### Property 5: Ticker search filter correctness

*For any* search string and any array of DecisionEntry records, every entry in the filtered result SHALL have a ticker that contains the search string (case-insensitive), and no entry excluded from the result SHALL have a ticker containing the search string.

**Validates: Requirements 2.1**

### Property 6: Decision type filter correctness

*For any* decision type filter value (BUY, PASS, or WATCHLIST) and any array of DecisionEntry records, every entry in the filtered result SHALL have a `decision` field matching the filter value.

**Validates: Requirements 2.2**

### Property 7: Status filter correctness

*For any* status filter value and any array of DecisionEntry records, every entry in the filtered result SHALL match the status criteria (ACTIVE: status=active and decision≠WATCHLIST, CLOSED: status=closed, WATCHING: decision=WATCHLIST and status=active).

**Validates: Requirements 2.3**

### Property 8: Date range filter correctness

*For any* valid date range (start ≤ end) and any array of DecisionEntry records, every entry in the filtered result SHALL have a date within the specified range (inclusive), and no entry outside the range SHALL appear in the result.

**Validates: Requirements 2.4**

### Property 9: Sort ordering correctness

*For any* sort criterion and any array of DecisionEntry records, the sorted output SHALL be ordered such that for every consecutive pair (a, b), the ordering invariant holds: NEWEST → a.date ≥ b.date, OLDEST → a.date ≤ b.date, BEST_PNL → pnl(a) ≥ pnl(b), WORST_PNL → pnl(a) ≤ pnl(b).

**Validates: Requirements 2.5**

### Property 10: Decision type to color mapping consistency

*For any* DecisionEntry, the color assigned to its decision type SHALL always be: green for BUY, yellow for PASS, blue for WATCHLIST — regardless of other entry fields.

**Validates: Requirements 3.2, 4.2**

### Property 11: P&L sign determines display color

*For any* DecisionEntry with a computed P&L, positive P&L SHALL map to green and negative P&L SHALL map to red — regardless of the magnitude.

**Validates: Requirements 3.3, 3.4**

### Property 12: Update persistence round-trip

*For any* valid DecisionUpdate applied to any DecisionEntry, after saving to localStorage and reloading, the retrieved entry SHALL reflect all updated fields.

**Validates: Requirements 5.8, 10.2**

### Property 13: Mistakes autopsy shows only closed losses

*For any* array of DecisionEntry records, the mistakes autopsy list SHALL contain exactly those entries where `status === 'closed'` AND `pnlPercent < 0`, and no other entries.

**Validates: Requirements 6.2**

### Property 14: Mistakes autopsy statistics correctness

*For any* non-empty array of losing DecisionEntry records, the total losses count SHALL equal the array length, total dollar lost SHALL equal the sum of individual dollar losses, and average loss percentage SHALL equal the arithmetic mean of individual loss percentages.

**Validates: Requirements 6.4**

### Property 15: Decision breakdown proportions sum to total

*For any* array of DecisionEntry records, the sum of BUY count + PASS count + WATCHLIST count in the breakdown SHALL equal the total number of decisions, and each percentage SHALL equal `(count / total) * 100`.

**Validates: Requirements 7.2, 7.3**

### Property 16: Performance metrics internal consistency

*For any* array of closed DecisionEntry records, the profit factor SHALL equal `sum(positive returns) / abs(sum(negative returns))`, and wins + losses SHALL equal the total number of closed decisions.

**Validates: Requirements 7.4**

### Property 17: CSV export contains all decision fields

*For any* non-empty array of DecisionEntry records, the generated CSV SHALL have exactly `n + 1` lines (1 header + n data rows), and the header row SHALL contain column names for every DecisionEntry field.

**Validates: Requirements 8.2**

### Property 18: JSON export round-trip

*For any* array of DecisionEntry records, `JSON.parse(generateJsonContent(decisions))` SHALL be deeply equal to the original decisions array.

**Validates: Requirements 8.3**

### Property 19: Export filename format

*For any* export format and any current date, the generated filename SHALL match the regex pattern `^decision-journal-\d{4}-\d{2}-\d{2}\.(csv|json)$`.

**Validates: Requirements 8.4**
