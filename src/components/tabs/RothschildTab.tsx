import React from 'react';
import ExpandableSection from '../ExpandableSection';
import { RothschildAnalysis } from '../../data/types';

interface RothschildTabProps {
  data: RothschildAnalysis;
  score: number;
}

const bloodLevelToCircles = (bloodLevel: number) => {
  // Map 0-100 to 5 levels
  const filled = Math.round((bloodLevel / 100) * 5);
  const circles = [];
  for (let i = 0; i < 5; i++) {
    circles.push(i < filled ? '🔴' : '⚪');
  }
  return circles;
};

const entryEmoji = (label: 'Best' | 'Good' | 'OK') => {
  switch (label) {
    case 'Best': return '🥇';
    case 'Good': return '🥈';
    case 'OK': return '🥉';
  }
};

const RothschildTab: React.FC<RothschildTabProps> = ({ data, score }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">🌍 Rothschild Timing Analysis</h2>
      <p className="text-xl text-yellow-400 mb-4">Score: {score}/10</p>

      <ExpandableSection title="🩸 Market Sentiment">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="mb-4">
            <span className="text-gray-400">Blood Level:</span>{' '}
            <span className="text-2xl ml-2">
              {bloodLevelToCircles(data.bloodInStreets.bloodLevel).join(' ')}
            </span>
            <span className="text-gray-400 ml-2 text-sm">({data.bloodInStreets.bloodLevel}/100)</span>
          </div>
          <div className="space-y-3 leading-relaxed">
            <div>
              <span className="text-gray-400">VIX:</span>{' '}
              <span className="text-white">{data.bloodInStreets.vix}</span>
            </div>
            <div>
              <span className="text-gray-400">Sector Performance:</span>{' '}
              <span className="text-white">{data.bloodInStreets.sectorPerformance}</span>
            </div>
            <div>
              <span className="text-gray-400">Social Sentiment:</span>{' '}
              <span className="text-white">{data.bloodInStreets.socialSentiment}/100</span>
            </div>
            <div>
              <span className="text-gray-400">Short Interest:</span>{' '}
              <span className="text-white">{data.bloodInStreets.shortInterest}%</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="🎯 Contrarian Opportunity?">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="space-y-2 mb-4">
            {data.contrarianSignals.map((signal, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{signal.triggered ? '✅' : '❌'}</span>
                <span className="text-white">{signal.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <span className="text-gray-400">Aggregate Score:</span>{' '}
            <span className="text-white font-bold">{data.contrarianScore}/4</span>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="💰 Risk Management">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="space-y-3 leading-relaxed">
            <div>
              <span className="text-gray-400">Portfolio %:</span>{' '}
              <span className="text-white">{data.positionSizing.portfolioPercent}</span>
            </div>
            <div>
              <span className="text-gray-400">Max Loss:</span>{' '}
              <span className="text-white">{data.positionSizing.maxLoss}</span>
            </div>
            <div>
              <span className="text-gray-400">Kelly Criterion:</span>{' '}
              <span className="text-white">{data.positionSizing.kellyCriterion}</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="🎯 Optimal Entry Levels">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-left">
                <th className="pb-3">Level</th>
                <th className="pb-3">Price Range</th>
                <th className="pb-3">Position %</th>
              </tr>
            </thead>
            <tbody>
              {data.entryZones.map((zone, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="py-3 text-white">
                    {entryEmoji(zone.label)} {zone.label}
                  </td>
                  <td className="py-3 text-white">{zone.priceRange}</td>
                  <td className="py-3 text-white">{zone.positionPercent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExpandableSection>

      {/* Enhanced Quote Box */}
      <div className="relative border-l-4 border-yellow-500 bg-yellow-900/20 p-5 rounded-r-xl">
        <span className="absolute top-2 left-4 text-8xl text-yellow-500/10 font-serif leading-none">"</span>
        <p className="text-white font-serif italic text-lg leading-relaxed relative z-10">{data.verdict}</p>
        <p className="text-yellow-400 text-sm mt-4 font-medium">— Baron Rothschild</p>
      </div>
    </div>
  );
};

export default RothschildTab;
