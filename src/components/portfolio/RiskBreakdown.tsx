import { PortfolioHolding } from '../../data/types';
import { computeRiskBreakdown } from '../../utils/portfolioCalculations';

interface RiskBreakdownProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}

export default function RiskBreakdown({ holdings, totalValue }: RiskBreakdownProps) {
  const breakdown = computeRiskBreakdown(holdings, totalValue);

  const levels = [
    { key: 'low', label: 'Low Risk', color: 'bg-green-500', textColor: 'text-green-400' },
    { key: 'medium', label: 'Medium Risk', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
    { key: 'high', label: 'High Risk', color: 'bg-red-500', textColor: 'text-red-400' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">🛡️ Risk Breakdown</h3>

      <div className="space-y-4">
        {levels.map(({ key, label, color, textColor }) => {
          const percent = breakdown[key] || 0;
          const dollarAmount = (percent / 100) * totalValue;

          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium ${textColor}`}>{label}</span>
                <span className="text-sm text-gray-400">
                  {percent.toFixed(1)}% · ${dollarAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {breakdown.high > 15 && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm font-medium">
            ⚠️ High-risk exposure exceeds 15%. Consider rebalancing your portfolio.
          </p>
        </div>
      )}
    </div>
  );
}
