import type { DecisionEntry } from '../../data/types';
import { computePnlPercent, computePnlDollar } from '../../utils/journalCalculations';

interface OverviewTabProps {
  entry: DecisionEntry;
}

export default function OverviewTab({ entry }: OverviewTabProps) {
  const pnlPercent = computePnlPercent(entry);
  const pnlDollar = computePnlDollar(entry);
  const pnlColorClass = pnlPercent >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase">Overview</h3>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded p-3">
          <p className="text-xs text-gray-400">Entry Price</p>
          <p className="text-white font-bold">${entry.entryPriceTarget.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-xs text-gray-400">Current Price</p>
          <p className="text-white font-bold">${entry.currentPrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-xs text-gray-400">P&L</p>
          <p className={`font-bold ${pnlColorClass}`}>
            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}% ({pnlDollar >= 0 ? '+' : ''}${pnlDollar.toFixed(2)})
          </p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-xs text-gray-400">Position Size</p>
          <p className="text-white font-bold">
            {entry.positionSizePercent}% (${entry.positionSizeAmount.toLocaleString()})
          </p>
        </div>
        <div className="bg-gray-800 rounded p-3 col-span-2">
          <p className="text-xs text-gray-400">Status</p>
          <p className="text-white font-bold capitalize">{entry.status}</p>
        </div>
      </div>

      {/* Review Dates Timeline */}
      {entry.reviewDates.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Review Timeline</h3>
          <div className="flex flex-wrap gap-2">
            {entry.reviewDates.map((date) => (
              <span
                key={date}
                className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
              >
                {new Date(date).toLocaleDateString()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
