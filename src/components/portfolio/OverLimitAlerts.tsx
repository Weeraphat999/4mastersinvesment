import { useState } from 'react';
import { PortfolioHolding } from '../../data/types';
import { getOverLimitHoldings, computePortfolioPercent } from '../../utils/portfolioCalculations';

interface OverLimitAlertsProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}

export default function OverLimitAlerts({ holdings, totalValue }: OverLimitAlertsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const overLimitHoldings = getOverLimitHoldings(holdings, totalValue);
  const visibleAlerts = overLimitHoldings.filter((h) => !dismissedIds.has(h.id));

  const dismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleAlerts.map((holding) => {
        const percent = computePortfolioPercent(holding, totalValue);
        return (
          <div
            key={holding.id}
            className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-300 font-medium">
                  {holding.ticker} is {percent.toFixed(1)}% of your portfolio
                </p>
                <p className="text-yellow-200/70 text-sm">
                  Consider reducing position to below 15% for better diversification.
                </p>
              </div>
            </div>
            <button
              onClick={() => dismiss(holding.id)}
              className="text-gray-400 hover:text-white text-xl px-2"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
