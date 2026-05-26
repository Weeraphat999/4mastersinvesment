/**
 * Determines whether a verdict string indicates a BUY recommendation.
 * Performs case-insensitive matching for "BUY" anywhere in the verdict string.
 * Covers "BUY", "STRONG BUY", "SPECULATIVE BUY", "buy", etc.
 *
 * @param verdict - The verdict string from the analysis result
 * @returns true if the verdict contains "BUY" (case-insensitive), false otherwise
 */
export function isBuyVerdict(verdict: string): boolean {
  return verdict.toUpperCase().includes('BUY');
}
