import type { JournalMetrics } from '../../utils/journalCalculations';

interface SummaryCardsProps {
  metrics: JournalMetrics;
}

export default function SummaryCards({ metrics }: SummaryCardsProps) {
  const { totalDecisions, winRate, avgReturn, bestTrade } = metrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Decisions */}
      <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
        <p className="text-gray-400 text-sm font-medium">Total Decisions</p>
        <p className="text-2xl font-bold text-white mt-1">{totalDecisions}</p>
      </div>

      {/* Win Rate */}
      <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
        <p className="text-gray-400 text-sm font-medium">Win Rate</p>
        <p className="text-2xl font-bold text-white mt-1">
          {winRate !== null ? `${winRate.toFixed(1)}%` : '—'}
        </p>
      </div>

      {/* Avg Return */}
      <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
        <p className="text-gray-400 text-sm font-medium">Avg Return</p>
        <p className="text-2xl font-bold text-white mt-1">
          {avgReturn !== null ? `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%` : '—'}
        </p>
      </div>

      {/* Best Trade */}
      <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
        <p className="text-gray-400 text-sm font-medium">Best Trade</p>
        <p className="text-2xl font-bold text-white mt-1">
          {bestTrade !== null
            ? `${bestTrade.ticker} +${bestTrade.returnPct.toFixed(1)}%`
            : '—'}
        </p>
      </div>
    </div>
  );
}
