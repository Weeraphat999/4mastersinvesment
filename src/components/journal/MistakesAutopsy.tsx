import { useState } from 'react';
import type { DecisionEntry } from '../../data/types';
import type { MistakeStats } from '../../utils/journalCalculations';
import { computePnlPercent, computePnlDollar } from '../../utils/journalCalculations';

interface MistakesAutopsyProps {
  losingDecisions: DecisionEntry[];
  stats: MistakeStats;
}

export default function MistakesAutopsy({ losingDecisions, stats }: MistakesAutopsyProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header with expand/collapse toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-750 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Mistakes Autopsy</h2>
          <span className="text-sm text-gray-400">
            ({stats.totalLosses} {stats.totalLosses === 1 ? 'loss' : 'losses'})
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="px-5 pb-5">
          {losingDecisions.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">
              No losses to review — keep up the good work!
            </p>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-xs font-medium">Total Losses</p>
                  <p className="text-xl font-bold text-red-400 mt-1">{stats.totalLosses}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-xs font-medium">Total Dollar Lost</p>
                  <p className="text-xl font-bold text-red-400 mt-1">
                    -${Math.abs(stats.totalDollarLost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-xs font-medium">Avg Loss %</p>
                  <p className="text-xl font-bold text-red-400 mt-1">
                    {stats.avgLossPercent.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Losing decisions list */}
              <div className="space-y-3">
                {losingDecisions.map((entry) => {
                  const pnlPercent = computePnlPercent(entry);
                  const pnlDollar = computePnlDollar(entry);

                  return (
                    <div
                      key={entry.id}
                      className="bg-gray-900 rounded-lg p-4 border-l-4 border-red-500"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{entry.ticker}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              entry.decision === 'BUY'
                                ? 'bg-green-900 text-green-300'
                                : entry.decision === 'PASS'
                                ? 'bg-yellow-900 text-yellow-300'
                                : 'bg-blue-900 text-blue-300'
                            }`}
                          >
                            {entry.decision}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-red-400 font-semibold text-sm">
                            {pnlPercent.toFixed(1)}%
                          </span>
                          <span className="text-red-400 text-sm ml-2">
                            (-${Math.abs(pnlDollar).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                          </span>
                        </div>
                      </div>
                      {entry.lessonsLearned && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-500 font-medium">Lesson: </span>
                          {entry.lessonsLearned}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
