import type { DecisionEntry } from '../../data/types';
import { computePnlPercent, computePnlDollar } from '../../utils/journalCalculations';

interface DecisionCardGridProps {
  decisions: DecisionEntry[];
  onSelect: (entry: DecisionEntry) => void;
}

const borderColorMap: Record<DecisionEntry['decision'], string> = {
  BUY: 'border-green-500',
  PASS: 'border-yellow-500',
  WATCHLIST: 'border-blue-500',
};

const badgeColorMap: Record<DecisionEntry['decision'], string> = {
  BUY: 'bg-green-500/20 text-green-400',
  PASS: 'bg-yellow-500/20 text-yellow-400',
  WATCHLIST: 'bg-blue-500/20 text-blue-400',
};

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export default function DecisionCardGrid({ decisions, onSelect }: DecisionCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decisions.map((entry) => {
        const pnlPercent = computePnlPercent(entry);
        const pnlDollar = computePnlDollar(entry);
        const pnlColor = pnlPercent >= 0 ? 'text-green-400' : 'text-red-400';
        const pnlSign = pnlPercent >= 0 ? '+' : '';

        return (
          <div
            key={entry.id}
            onClick={() => onSelect(entry)}
            className={`bg-gray-800 rounded-lg border-l-4 ${borderColorMap[entry.decision]} p-4 cursor-pointer hover:bg-gray-700 transition-colors`}
          >
            {/* Header: Ticker + Decision Badge */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-white font-bold text-lg">{entry.ticker}</span>
                <span className="text-gray-400 text-sm ml-2">{entry.companyName}</span>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeColorMap[entry.decision]}`}
              >
                {entry.decision}
              </span>
            </div>

            {/* Date */}
            <p className="text-gray-400 text-xs mb-3">
              {new Date(entry.date).toLocaleDateString()}
            </p>

            {/* Prices */}
            <div className="flex items-center justify-between text-sm mb-2">
              <div>
                <span className="text-gray-400">Entry:</span>{' '}
                <span className="text-white">${entry.entryPriceTarget.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">Current:</span>{' '}
                <span className="text-white">${entry.currentPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* P&L */}
            <div className={`text-sm font-semibold mb-2 ${pnlColor}`}>
              {pnlSign}{pnlPercent.toFixed(2)}% ({pnlSign}${Math.abs(pnlDollar).toFixed(2)})
            </div>

            {/* Status Badge */}
            <div className="mb-2">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  entry.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-600/40 text-gray-300'
                }`}
              >
                {entry.status.toUpperCase()}
              </span>
            </div>

            {/* Truncated Reasoning */}
            <p className="text-gray-400 text-xs leading-relaxed">
              {truncateText(entry.reasoning, 100)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
