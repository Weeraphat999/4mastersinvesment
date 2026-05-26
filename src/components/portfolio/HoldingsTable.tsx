import { useState } from 'react';
import { PortfolioHolding } from '../../data/types';
import {
  computeGainLoss,
  computeGainLossPercent,
  computePortfolioPercent,
  sortHoldings,
  filterHoldings,
} from '../../utils/portfolioCalculations';

interface HoldingsTableProps {
  holdings: PortfolioHolding[];
  totalValue: number;
  onEdit: (id: string, updates: Partial<PortfolioHolding>) => void;
  onDelete: (id: string) => void;
}

type SortColumn = 'ticker' | 'shares' | 'avgCost' | 'currentPrice' | 'gainLoss' | 'gainLossPercent' | 'portfolioPercent';

export default function HoldingsTable({ holdings, totalValue, onEdit, onDelete }: HoldingsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('ticker');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<PortfolioHolding>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = filterHoldings(holdings, searchQuery);
  const sorted = sortHoldings(filtered, sortColumn, sortDirection, totalValue);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const startEdit = (holding: PortfolioHolding) => {
    setEditingId(holding.id);
    setEditValues({ shares: holding.shares, avgCost: holding.avgCost, currentPrice: holding.currentPrice });
  };

  const saveEdit = () => {
    if (editingId && editValues) {
      onEdit(editingId, editValues);
      setEditingId(null);
      setEditValues({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  const sortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return ' ↕';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Compute totals for footer
  const totalGainLoss = sorted.reduce((sum, h) => sum + computeGainLoss(h), 0);
  const totalCost = sorted.reduce((sum, h) => sum + h.avgCost * h.shares, 0);
  const totalGainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-700">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search by ticker or company..."
          className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-750">
            <tr className="border-b border-gray-700">
              <th
                className="px-4 py-3 text-left text-gray-400 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort('ticker')}
              >
                Ticker{sortIndicator('ticker')}
              </th>
              <th
                className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort('shares')}
              >
                Shares{sortIndicator('shares')}
              </th>
              <th
                className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort('avgCost')}
              >
                Avg Cost{sortIndicator('avgCost')}
              </th>
              <th
                className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort('currentPrice')}
              >
                Current{sortIndicator('currentPrice')}
              </th>
              <th
                className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort('gainLoss')}
              >
                Gain/Loss ($){sortIndicator('gainLoss')}
              </th>
              <th
                className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort('gainLossPercent')}
              >
                Gain/Loss (%){sortIndicator('gainLossPercent')}
              </th>
              <th
                className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort('portfolioPercent')}
              >
                Portfolio %{sortIndicator('portfolioPercent')}
              </th>
              <th className="px-4 py-3 text-center text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((holding) => {
              const gainLoss = computeGainLoss(holding);
              const gainLossPercent = computeGainLossPercent(holding);
              const portfolioPercent = computePortfolioPercent(holding, totalValue);
              const isEditing = editingId === holding.id;
              const isPositive = gainLoss >= 0;

              const barColor = portfolioPercent > 15 ? 'bg-red-500' : portfolioPercent > 10 ? 'bg-yellow-500' : 'bg-green-500';

              return (
                <tr key={holding.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{holding.ticker}</div>
                    <div className="text-xs text-gray-400">{holding.companyName}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.shares ?? ''}
                        onChange={(e) => setEditValues({ ...editValues, shares: parseFloat(e.target.value) })}
                        className="w-20 bg-gray-700 border border-gray-500 rounded px-2 py-1 text-white text-right"
                      />
                    ) : (
                      holding.shares
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.avgCost ?? ''}
                        onChange={(e) => setEditValues({ ...editValues, avgCost: parseFloat(e.target.value) })}
                        className="w-24 bg-gray-700 border border-gray-500 rounded px-2 py-1 text-white text-right"
                      />
                    ) : (
                      `$${holding.avgCost.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.currentPrice ?? ''}
                        onChange={(e) => setEditValues({ ...editValues, currentPrice: parseFloat(e.target.value) })}
                        className="w-24 bg-gray-700 border border-gray-500 rounded px-2 py-1 text-white text-right"
                      />
                    ) : (
                      `$${holding.currentPrice.toFixed(2)}`
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}${gainLoss.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-white text-xs">{portfolioPercent.toFixed(1)}%</span>
                      <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full`}
                          style={{ width: `${Math.min(portfolioPercent * 3, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <div className="flex gap-1 justify-center">
                        <button onClick={saveEdit} className="text-green-400 hover:text-green-300 text-xs px-2 py-1">✓</button>
                        <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1">✗</button>
                      </div>
                    ) : deleteConfirmId === holding.id ? (
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => confirmDelete(holding.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1">Yes</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1">No</button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => startEdit(holding)} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1">✏️</button>
                        <button onClick={() => setDeleteConfirmId(holding.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1">🗑️</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Footer totals */}
          <tfoot>
            <tr className="border-t-2 border-gray-600 bg-gray-750">
              <td className="px-4 py-3 font-bold text-white">Total</td>
              <td className="px-4 py-3 text-right text-white font-medium">{sorted.reduce((s, h) => s + h.shares, 0)}</td>
              <td className="px-4 py-3 text-right text-gray-400">—</td>
              <td className="px-4 py-3 text-right text-gray-400">—</td>
              <td className={`px-4 py-3 text-right font-bold ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
              </td>
              <td className={`px-4 py-3 text-right font-bold ${totalGainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-right text-white font-medium">100%</td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
