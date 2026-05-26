import { calculatePositionSizing } from '../../../utils/positionSizing';

interface PositionSizingCardProps {
  riskLevel: string;
  overallScore: number;
  currentPrice: number;
  onOpenCalculator: () => void;
}

export function PositionSizingCard({
  riskLevel,
  overallScore,
  currentPrice: _currentPrice,
  onOpenCalculator,
}: PositionSizingCardProps) {
  const { allocationPercent, convictionLabel } = calculatePositionSizing(
    riskLevel,
    overallScore
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-semibold mb-4">💰 Position Size</h2>

      <p className="mb-2">
        Recommended: {allocationPercent}% of portfolio{' '}
        <span className="inline-block bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full ml-2">
          {convictionLabel}
        </span>
      </p>

      <p className="text-gray-400 text-sm mb-4">
        Max position: Never exceed 15% in high-risk assets
      </p>

      <button
        onClick={onOpenCalculator}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition-all duration-300"
      >
        Calculate for My Portfolio
      </button>
    </div>
  );
}
