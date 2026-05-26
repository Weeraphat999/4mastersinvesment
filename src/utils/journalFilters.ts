// Journal filter utilities - pure functions for filtering and sorting decisions
// Implements filter logic for the Filter Bar and Mistakes Autopsy section

import type { DecisionEntry } from '../data/types';

export interface JournalFilters {
  search: string;
  decisionType: 'ALL' | 'BUY' | 'PASS' | 'WATCHLIST';
  status: 'ALL' | 'ACTIVE' | 'CLOSED' | 'WATCHING';
  dateRange: { start: string | null; end: string | null };
  sortBy: 'NEWEST' | 'OLDEST' | 'BEST_PNL' | 'WORST_PNL';
  viewMode: 'table' | 'card';
}

/**
 * Compute P&L percentage for sorting purposes.
 * Uses the same formula as journalCalculations: ((currentPrice - entryPriceTarget) / entryPriceTarget) * 100
 */
function computePnlPercent(entry: DecisionEntry): number {
  if (entry.entryPriceTarget === 0) return 0;
  return ((entry.currentPrice - entry.entryPriceTarget) / entry.entryPriceTarget) * 100;
}

/**
 * Filter by ticker search (case-insensitive partial match).
 * Returns all entries if search is empty.
 */
export function filterBySearch(
  decisions: DecisionEntry[],
  search: string
): DecisionEntry[] {
  if (!search) return decisions;
  const lowerSearch = search.toLowerCase();
  return decisions.filter((entry) =>
    entry.ticker.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Filter by decision type (exact match on entry.decision field).
 * Pass-through for 'ALL'.
 */
export function filterByDecisionType(
  decisions: DecisionEntry[],
  type: JournalFilters['decisionType']
): DecisionEntry[] {
  if (type === 'ALL') return decisions;
  return decisions.filter((entry) => entry.decision === type);
}

/**
 * Filter by status.
 * - 'ALL': pass-through
 * - 'ACTIVE': status === 'active' && decision !== 'WATCHLIST'
 * - 'CLOSED': status === 'closed'
 * - 'WATCHING': decision === 'WATCHLIST' && status === 'active'
 */
export function filterByStatus(
  decisions: DecisionEntry[],
  status: JournalFilters['status']
): DecisionEntry[] {
  if (status === 'ALL') return decisions;
  switch (status) {
    case 'ACTIVE':
      return decisions.filter(
        (entry) => entry.status === 'active' && entry.decision !== 'WATCHLIST'
      );
    case 'CLOSED':
      return decisions.filter((entry) => entry.status === 'closed');
    case 'WATCHING':
      return decisions.filter(
        (entry) => entry.decision === 'WATCHLIST' && entry.status === 'active'
      );
    default:
      return decisions;
  }
}

/**
 * Filter by date range using ISO string comparison.
 * If start is null, no lower bound. If end is null, no upper bound.
 */
export function filterByDateRange(
  decisions: DecisionEntry[],
  start: string | null,
  end: string | null
): DecisionEntry[] {
  if (!start && !end) return decisions;
  return decisions.filter((entry) => {
    if (start && entry.date < start) return false;
    if (end && entry.date > end) return false;
    return true;
  });
}

/**
 * Sort decisions by specified criterion.
 * - NEWEST: descending by date
 * - OLDEST: ascending by date
 * - BEST_PNL: descending by pnlPercent
 * - WORST_PNL: ascending by pnlPercent
 * Returns a new sorted array (does not mutate input).
 */
export function sortDecisions(
  decisions: DecisionEntry[],
  sortBy: JournalFilters['sortBy']
): DecisionEntry[] {
  const sorted = [...decisions];
  switch (sortBy) {
    case 'NEWEST':
      return sorted.sort((a, b) => (a.date >= b.date ? -1 : 1));
    case 'OLDEST':
      return sorted.sort((a, b) => (a.date <= b.date ? -1 : 1));
    case 'BEST_PNL':
      return sorted.sort((a, b) => computePnlPercent(b) - computePnlPercent(a));
    case 'WORST_PNL':
      return sorted.sort((a, b) => computePnlPercent(a) - computePnlPercent(b));
    default:
      return sorted;
  }
}

/**
 * Apply all filters to a decisions array, then sort.
 * Composes filterBySearch, filterByDecisionType, filterByStatus, filterByDateRange, and sortDecisions.
 */
export function applyFilters(
  decisions: DecisionEntry[],
  filters: JournalFilters
): DecisionEntry[] {
  let result = decisions;
  result = filterBySearch(result, filters.search);
  result = filterByDecisionType(result, filters.decisionType);
  result = filterByStatus(result, filters.status);
  result = filterByDateRange(result, filters.dateRange.start, filters.dateRange.end);
  result = sortDecisions(result, filters.sortBy);
  return result;
}

/**
 * Get losing decisions: closed entries with negative P&L.
 */
export function getLosingDecisions(decisions: DecisionEntry[]): DecisionEntry[] {
  return decisions.filter(
    (entry) => entry.status === 'closed' && computePnlPercent(entry) < 0
  );
}
