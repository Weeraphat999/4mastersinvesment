import React from 'react';
import { DCAScheduleRow } from '../../../data/types';
import { generateDCACSV } from '../../../utils/csvUtils';
import { downloadFile } from '../../../utils/downloadFile';

interface DCAScheduleCardProps {
  ticker: string;
  totalAmount: number;
  currentPrice: number;
  technicalScore: number;
  timingVerdict: string;
}

/**
 * Generates a deterministic price variance based on month index.
 * Uses a simple sine-based approach for reproducible results.
 */
function getDeterministicVariance(monthIndex: number, technicalScore: number): number {
  const maxVariance = ((16 - technicalScore) / 16) * 0.1; // 0-10% variance
  // Deterministic pattern using sine of month index
  const factor = Math.sin((monthIndex + 1) * 1.5) * 0.7 + Math.cos((monthIndex + 1) * 0.8) * 0.3;
  return factor * maxVariance;
}

function generateDCASchedule(
  totalAmount: number,
  currentPrice: number,
  technicalScore: number,
  timingVerdict: string
): DCAScheduleRow[] {
  const months = timingVerdict === 'WAIT' ? 6 : 4;
  const monthlyAmount = totalAmount / months;

  return Array.from({ length: months }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i + 1);
    const variance = getDeterministicVariance(i, technicalScore);
    const estimatedPrice = currentPrice * (1 + variance);
    const roundedPrice = Math.round(estimatedPrice * 100) / 100;
    const estimatedShares = Math.round((monthlyAmount / roundedPrice) * 1000) / 1000;

    return {
      month: i + 1,
      date: date.toISOString().split('T')[0],
      amount: Math.round(monthlyAmount * 100) / 100,
      estimatedPrice: roundedPrice,
      estimatedShares,
    };
  });
}

export const DCAScheduleCard: React.FC<DCAScheduleCardProps> = ({
  ticker,
  totalAmount,
  currentPrice,
  technicalScore,
  timingVerdict,
}) => {
  const schedule = generateDCASchedule(totalAmount, currentPrice, technicalScore, timingVerdict);

  const totalShares = schedule.reduce((sum, row) => sum + row.estimatedShares, 0);
  const totalInvested = schedule.reduce((sum, row) => sum + row.amount, 0);

  const handleDownloadCSV = () => {
    const csv = generateDCACSV(ticker, schedule);
    downloadFile(csv, `${ticker}_dca_schedule.csv`, 'text/csv');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-semibold mb-4">📊 Entry Strategy</h2>
      <p className="text-gray-300 mb-4">Recommended: Dollar Cost Averaging (DCA)</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="py-2 px-3">Month</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Price Est.</th>
              <th className="py-2 px-3">Shares Est.</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row) => (
              <tr key={row.month} className="border-b border-gray-700/50">
                <td className="py-2 px-3">{row.month}</td>
                <td className="py-2 px-3">${row.amount.toLocaleString()}</td>
                <td className="py-2 px-3">${row.estimatedPrice.toFixed(2)}</td>
                <td className="py-2 px-3">{row.estimatedShares.toFixed(3)}</td>
              </tr>
            ))}
            <tr className="font-semibold border-t border-gray-600">
              <td className="py-2 px-3">Total</td>
              <td className="py-2 px-3">${totalInvested.toLocaleString()}</td>
              <td className="py-2 px-3">—</td>
              <td className="py-2 px-3">{totalShares.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        onClick={handleDownloadCSV}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Create DCA Schedule
      </button>
    </div>
  );
};

export default DCAScheduleCard;
