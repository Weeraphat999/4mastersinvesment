interface SummaryCardsProps {
  totalValue: number;
  totalPnL: number;
  holdingsCount: number;
  highRiskExposure: number;
}

export default function SummaryCards({ totalValue, totalPnL, holdingsCount, highRiskExposure }: SummaryCardsProps) {
  const pnlColor = totalPnL >= 0 ? 'from-green-600 to-green-800' : 'from-red-600 to-red-800';
  const pnlSign = totalPnL >= 0 ? '+' : '';

  const riskIndicator = highRiskExposure > 15 ? '🔴' : highRiskExposure >= 13 ? '⚠️' : '✅';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 shadow-lg">
        <p className="text-blue-200 text-sm font-medium">Total Value</p>
        <p className="text-2xl font-bold text-white mt-1">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Total P&L */}
      <div className={`bg-gradient-to-br ${pnlColor} rounded-xl p-5 shadow-lg`}>
        <p className="text-gray-200 text-sm font-medium">Total P&L</p>
        <p className="text-2xl font-bold text-white mt-1">
          {pnlSign}${Math.abs(totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Holdings Count */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-5 shadow-lg">
        <p className="text-purple-200 text-sm font-medium">Holdings</p>
        <p className="text-2xl font-bold text-white mt-1">{holdingsCount}</p>
      </div>

      {/* High-Risk Exposure */}
      <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-5 shadow-lg">
        <p className="text-yellow-200 text-sm font-medium">High-Risk Exposure</p>
        <p className="text-2xl font-bold text-white mt-1">
          {riskIndicator} {highRiskExposure.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
