import { PositionSizingResult, DCAScheduleRow } from '../data/types';

export function generateExportPlan(
  ticker: string,
  companyName: string,
  positionSizing: PositionSizingResult,
  dcaSchedule: DCAScheduleRow[],
  alertsSet: string[],
  exitCriteria: string[]
): string {
  const date = new Date().toISOString().split('T')[0];

  const lines: string[] = [
    '=== INVESTMENT ACTION PLAN ===',
    `Ticker: ${ticker}`,
    `Company: ${companyName}`,
    `Date: ${date}`,
    '',
    '--- POSITION SIZING ---',
    `Allocation: ${positionSizing.allocationPercent}% of portfolio`,
    `Conviction: ${positionSizing.convictionLabel}`,
    '',
    '--- DCA SCHEDULE ---',
  ];

  // DCA table header
  lines.push('Month | Date       | Amount     | Price      | Shares');
  lines.push('------|------------|------------|------------|-------');

  for (const row of dcaSchedule) {
    const month = String(row.month).padEnd(5);
    const rowDate = row.date.padEnd(10);
    const amount = `$${row.amount.toFixed(2)}`.padEnd(10);
    const price = `$${row.estimatedPrice.toFixed(2)}`.padEnd(10);
    const shares = row.estimatedShares.toFixed(3);
    lines.push(`${month} | ${rowDate} | ${amount} | ${price} | ${shares}`);
  }

  lines.push('');
  lines.push('--- ALERTS SET ---');
  if (alertsSet.length === 0) {
    lines.push('No alerts configured.');
  } else {
    for (const alert of alertsSet) {
      lines.push(`• ${alert}`);
    }
  }

  lines.push('');
  lines.push('--- EXIT CRITERIA ---');
  if (exitCriteria.length === 0) {
    lines.push('No exit criteria defined.');
  } else {
    for (const criteria of exitCriteria) {
      lines.push(`• ${criteria}`);
    }
  }

  return lines.join('\n');
}
