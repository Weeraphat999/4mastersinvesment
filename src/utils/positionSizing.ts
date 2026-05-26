import { PositionSizingResult } from '../data/types';

/**
 * Calculate position sizing based on risk level and overall analysis score.
 *
 * @param riskLevel - Risk level string (case-insensitive): "low", "medium", "high"
 * @param overallScore - Overall analysis score from 0 to 10
 * @returns Position sizing result with allocation percent, conviction label, and max position dollars
 */
export function calculatePositionSizing(
  riskLevel: string,
  overallScore: number
): PositionSizingResult {
  // Determine min/max percent based on risk level (case-insensitive)
  let minPercent: number;
  let maxPercent: number;

  switch (riskLevel.toLowerCase()) {
    case 'low':
      minPercent = 5;
      maxPercent = 8;
      break;
    case 'medium':
      minPercent = 3;
      maxPercent = 5;
      break;
    case 'high':
      minPercent = 1;
      maxPercent = 3;
      break;
    default:
      minPercent = 2;
      maxPercent = 4;
      break;
  }

  // Calculate allocation within range based on overallScore (0-10)
  const scoreRatio = overallScore / 10;
  const allocationPercent = minPercent + (maxPercent - minPercent) * scoreRatio;

  // Determine conviction label
  let convictionLabel: PositionSizingResult['convictionLabel'];
  if (overallScore >= 8) {
    convictionLabel = 'High Conviction';
  } else if (overallScore < 5) {
    convictionLabel = 'Speculative';
  } else {
    convictionLabel = 'Standard';
  }

  return {
    allocationPercent: Math.round(allocationPercent * 10) / 10,
    convictionLabel,
    maxPositionDollars: 0,
  };
}
