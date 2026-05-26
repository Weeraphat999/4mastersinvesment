/**
 * Generates a valid ICS calendar event string for investment review reminders.
 *
 * @param ticker - The stock ticker symbol (e.g., "AAPL")
 * @param checkpointLabel - The review checkpoint label (e.g., "3-Month Review")
 * @param eventDate - The date for the calendar event
 * @returns A valid ICS file content string
 */
export function generateICSEvent(
  ticker: string,
  checkpointLabel: string,
  eventDate: Date
): string {
  const year = eventDate.getUTCFullYear();
  const month = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(eventDate.getUTCDate()).padStart(2, '0');
  const dtstart = `${year}${month}${day}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//4 Masters Investor//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dtstart}`,
    `SUMMARY:${ticker} Investment Review - ${checkpointLabel}`,
    `DESCRIPTION:Review your investment thesis for ${ticker}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
