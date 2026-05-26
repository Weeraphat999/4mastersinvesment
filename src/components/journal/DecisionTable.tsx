import type { DecisionEntry } from '../../data/types';
import { computePnlPercent, computePnlDollar } from '../../utils/journalCalculations';

interface DecisionTableProps {
  decisions: DecisionEntry[];
  onView: (entry: DecisionEntry) => void;
  onEdit: (entry: DecisionEntry) => void;
}

function getDecisionBadgeClasses(decision: DecisionEntry['decision']): string {
  switch (decision) {
    case 'BUY':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'PASS':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'WATCHLIST':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function getStatusBadgeClasses(entry: DecisionEntry): string {
  if (entry.status === 'closed') {
    return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
  }
  if (entry.decision === 'WATCHLIST' && entry.status === 'active') {
    return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  }
  return 'bg-green-500/20 text-green-400 border border-green-500/30';
}

function getStatusLabel(entry: DecisionEntry): string {
  if (entry.status === 'closed') return 'Closed';
  if (entry.decision === 'WATCHLIST' && entry.status === 'active') return 'Watching';
  return 'Active';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export default function DecisionTable({ decisions, onView, onEdit }: DecisionTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 whitespace-nowrap">Date</th>
            <th className="px-4 py-3 whitespace-nowrap">Ticker / Company</th>
            <th className="px-4 py-3 whitespace-nowrap">Decision</th>
            <th className="px-4 py-3 whitespace-nowrap">Entry Price</th>
            <th className="px-4 py-3 whitespace-nowrap">Current Price</th>
            <th className="px-4 py-3 whitespace-nowrap">P&L</th>
            <th className="px-4 py-3 whitespace-nowrap">Status</th>
            <th className="px-4 py-3 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {decisions.map((entry) => {
            const pnlPercent = computePnlPercent(entry);
            const pnlDollar = computePnlDollar(entry);
            const pnlColorClass = pnlPercent >= 0 ? 'text-green-400' : 'text-red-400';

            return (
              <tr key={entry.id} className="bg-gray-800 hover:bg-gray-750 transition-colors">
                <td className="px-4 py-3 text-white whitespace-nowrap">
                  {formatDate(entry.date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-white font-medium">{entry.ticker}</div>
                  <div className="text-gray-400 text-xs">{entry.companyName}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDecisionBadgeClasses(entry.decision)}`}
                  >
                    {entry.decision}
                  </span>
                </td>
                <td className="px-4 py-3 text-white whitespace-nowrap">
                  {formatCurrency(entry.entryPriceTarget)}
                </td>
                <td className="px-4 py-3 text-white whitespace-nowrap">
                  {formatCurrency(entry.currentPrice)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`font-medium ${pnlColorClass}`}>
                    {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </div>
                  <div className={`text-xs ${pnlColorClass}`}>
                    {pnlDollar >= 0 ? '+' : ''}{formatCurrency(pnlDollar)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadgeClasses(entry)}`}
                  >
                    {getStatusLabel(entry)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(entry)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-gray-700"
                      title="View details"
                      aria-label={`View ${entry.ticker} decision`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(entry)}
                      className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                      title="Edit decision"
                      aria-label={`Edit ${entry.ticker} decision`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
