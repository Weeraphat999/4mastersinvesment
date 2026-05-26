import { AnalysisResult } from './types';
import { PREDEFINED_DATA } from './mockData';
import { generatePlaceholderAnalysis } from './generatePlaceholder';

/**
 * Looks up analysis data for a given ticker symbol.
 *
 * - Normalizes the ticker to uppercase for case-insensitive matching
 * - Returns predefined data if available, otherwise generates placeholder data
 * - Always returns a complete AnalysisResult (never null, never throws)
 */
export function getAnalysis(ticker: string): AnalysisResult {
  const normalized = ticker.trim().toUpperCase();

  // If the ticker is empty after trimming, use a fallback symbol
  const effectiveTicker = normalized.length > 0 ? normalized : 'UNKNOWN';

  if (effectiveTicker in PREDEFINED_DATA) {
    return PREDEFINED_DATA[effectiveTicker];
  }

  return generatePlaceholderAnalysis(effectiveTicker);
}
