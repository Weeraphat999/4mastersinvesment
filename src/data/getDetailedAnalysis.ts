import { DetailedAnalysis } from './types';
import { PREDEFINED_DETAILED_DATA } from './detailedMockData';
import { generatePlaceholderDetailedAnalysis } from './generateDetailedPlaceholder';

/**
 * Looks up detailed analysis data for a given ticker symbol.
 *
 * - Normalizes the ticker to uppercase for case-insensitive matching
 * - Returns predefined data if available, otherwise generates placeholder data
 * - Always returns a complete DetailedAnalysis (never null, never throws)
 */
export function getDetailedAnalysis(ticker: string): DetailedAnalysis {
  const normalized = ticker.trim().toUpperCase();

  if (normalized in PREDEFINED_DETAILED_DATA) {
    return PREDEFINED_DETAILED_DATA[normalized];
  }

  return generatePlaceholderDetailedAnalysis(normalized);
}
