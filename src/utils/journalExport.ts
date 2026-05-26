// Journal export utilities - pure functions for generating CSV and JSON export content
// Implements export functionality for decision journal data

import type { DecisionEntry } from '../data/types';

/**
 * Wraps a value in double quotes if it contains commas.
 */
function csvEscape(value: string): string {
  if (value.includes(',')) {
    return `"${value}"`;
  }
  return value;
}

/**
 * Generate CSV string from decisions array.
 * - Header row with all DecisionEntry field names
 * - Scores object flattened to scores_buffett, scores_munger, etc.
 * - Arrays (reviewDates, alertsSet) joined with semicolons
 * - Values containing commas wrapped in double quotes
 */
export function generateCsvContent(decisions: DecisionEntry[]): string {
  const headers = [
    'id',
    'date',
    'ticker',
    'companyName',
    'decision',
    'positionSizePercent',
    'positionSizeAmount',
    'entryPriceTarget',
    'currentPrice',
    'reasoning',
    'expectedOutcome',
    'exitPlan',
    'reviewDates',
    'scores_buffett',
    'scores_munger',
    'scores_lynch',
    'scores_rothschild',
    'scores_overall',
    'alertsSet',
    'status',
    'actualOutcome',
    'lessonsLearned',
  ];

  const rows = decisions.map((entry) => {
    const values = [
      csvEscape(entry.id),
      csvEscape(entry.date),
      csvEscape(entry.ticker),
      csvEscape(entry.companyName),
      csvEscape(entry.decision),
      String(entry.positionSizePercent),
      String(entry.positionSizeAmount),
      String(entry.entryPriceTarget),
      String(entry.currentPrice),
      csvEscape(entry.reasoning),
      csvEscape(entry.expectedOutcome),
      csvEscape(entry.exitPlan),
      csvEscape(entry.reviewDates.join(';')),
      String(entry.scores.buffett),
      String(entry.scores.munger),
      String(entry.scores.lynch),
      String(entry.scores.rothschild),
      String(entry.scores.overall),
      csvEscape(entry.alertsSet.join(';')),
      csvEscape(entry.status),
      csvEscape(entry.actualOutcome),
      csvEscape(entry.lessonsLearned),
    ];
    return values.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate JSON string from decisions array.
 * Returns a pretty-printed JSON representation of the full decisions array.
 */
export function generateJsonContent(decisions: DecisionEntry[]): string {
  return JSON.stringify(decisions);
}

/**
 * Generate export filename with current date.
 * Pattern: decision-journal-YYYY-MM-DD.{format}
 */
export function generateExportFilename(format: 'csv' | 'json'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `decision-journal-${year}-${month}-${day}.${format}`;
}
