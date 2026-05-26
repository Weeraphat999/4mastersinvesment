import { PortfolioHolding } from '../../data/types';
import { getTopPerformers, getBottomPerformers, computeGainLoss, computeGainLossPercent } from '../../utils/portfolioCalculations';

interface PerformanceRankingsProps {
  holdings: PortfolioHolding[];
}

export default function PerformanceRankings({ holdings }: PerformanceRankingsProps) {
  const topPerformers = getTopPerformers(holdings, 5);
  const bottomPerformers = getBottomPerformers(holdings, 3);

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">📈 Performance Rankings</h3>

      {/* Top Performers */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">🏆 Top 5 Performers</h4>
        <div className="space-y-2">
          {topPerformers.map((holding) => {
            const gainPercent = computeGainLossPercent(holding);
            const gainDollar = computeGainLoss(holding);
            return (
              <div key={holding.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💚</span>
                  <span className="text-white font-medium text-sm">{holding.ticker}</span>
                </div>
                <div className="text-right">
                  <span className="text-green-400 text-sm font-medium">
                    +{gainPercent.toFixed(1)}%
                  </span>
                  <span className="text-gray-400 text-xs ml-2">
                    +${gainDollar.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
          {topPerformers.length === 0 && (
            <p className="text-gray-500 text-sm">No data</p>
          )}
        </div>
      </div>

      {/* Bottom Performers */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">📉 Bottom 3 Performers</h4>
        <div className="space-y-2">
          {bottomPerformers.map((holding) => {
            const gainPercent = computeGainLossPercent(holding);
            const gainDollar = computeGainLoss(holding);
            return (
              <div key={holding.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔴</span>
                  <span className="text-white font-medium text-sm">{holding.ticker}</span>
                </div>
                <div className="text-right">
                  <span className="text-red-400 text-sm font-medium">
                    {gainPercent.toFixed(1)}%
                  </span>
                  <span className="text-gray-400 text-xs ml-2">
                    ${gainDollar.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
          {bottomPerformers.length === 0 && (
            <p className="text-gray-500 text-sm">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
