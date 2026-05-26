import React from 'react';
import ExpandableSection from '../ExpandableSection';
import PriceChart from '../PriceChart';
import { TechnicalAnalysis } from '../../data/types';

interface TechnicalTabProps {
  data: TechnicalAnalysis;
}

const recommendationColor = (rec: 'BUY NOW' | 'WAIT' | 'AVOID') => {
  switch (rec) {
    case 'BUY NOW': return 'border-green-500 text-green-400';
    case 'WAIT': return 'border-yellow-500 text-yellow-400';
    case 'AVOID': return 'border-red-500 text-red-400';
  }
};

const scoreCircle = (score: number) => {
  if (score === 0) return '🔴';
  if (score === 1) return '🟡';
  return '🟢';
};

const TechnicalTab: React.FC<TechnicalTabProps> = ({ data }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">📈 Technical Analysis</h2>
      <p className="text-xl text-white mb-4">Timing Score: {data.timingScore}/16</p>

      <ExpandableSection title="⏱️ Timing Verdict">
        <div className={`border-2 rounded-xl p-5 mb-4 ${recommendationColor(data.timingVerdict.recommendation)}`}>
          <div className="text-center mb-4">
            <span className="text-3xl font-bold">{data.timingVerdict.recommendation}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-gray-400 block text-sm">Buy Zone</span>
              <span className="text-white font-semibold">{data.timingVerdict.buyZone}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-sm">Stop Loss</span>
              <span className="text-white font-semibold">{data.timingVerdict.stopLoss}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-sm">Take Profit</span>
              <span className="text-white font-semibold">{data.timingVerdict.takeProfit}</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="📊 Signals Summary">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-left">
                <th className="pb-3">Indicator</th>
                <th className="pb-3">Signal</th>
                <th className="pb-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.signals.map((signal, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="py-3 text-white">{signal.name}</td>
                  <td className="py-3 text-gray-300">{signal.status}</td>
                  <td className="py-3">{scoreCircle(signal.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExpandableSection>

      <ExpandableSection title="📈 Price Chart">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <PriceChart
            pricePoints={data.chartData.pricePoints}
            supportLevel={data.chartData.supportLevel}
            resistanceLevel={data.chartData.resistanceLevel}
            buyZone={data.chartData.buyZone}
          />
        </div>
      </ExpandableSection>

      <ExpandableSection title="🎯 Entry Strategy">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="space-y-3">
            {data.entryStrategy.map((entry, i) => (
              <div key={i} className="bg-gray-700 rounded-lg p-4">
                <span className="text-gray-400">Zone:</span>{' '}
                <span className="text-white font-medium">{entry.zone}</span>
                <p className="text-gray-300 mt-1 leading-relaxed">{entry.action}</p>
              </div>
            ))}
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
};

export default TechnicalTab;
