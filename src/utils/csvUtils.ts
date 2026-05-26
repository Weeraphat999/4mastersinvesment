import { DCAScheduleRow } from '../data/types';

/**
 * Generates a CSV string from a DCA schedule.
 * @param ticker - The stock ticker symbol (used for context, not in CSV body)
 * @param schedule - Array of DCAScheduleRow entries
 * @returns CSV string with header and one row per schedule entry
 */
export function generateDCACSV(_ticker: string, schedule: DCAScheduleRow[]): string {
  const header = 'Month,Date,Amount,Estimated Price,Estimated Shares';
  const rows = schedule.map(
    (row) => `${row.month},${row.date},${row.amount},${row.estimatedPrice},${row.estimatedShares}`
  );
  return [header, ...rows].join('\n');
}
