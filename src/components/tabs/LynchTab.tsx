import React from 'react';
import ExpandableSection from '../ExpandableSection';
import { LynchAnalysis } from '../../data/types';

interface LynchTabProps {
  data: LynchAnalysis;
  score: number;
}

const pegColor = (peg: number) => {
  if (peg < 1) return 'text-green-400';
  if (peg <= 1.5) return 'text-yellow-400';
  return 'text-red-400';
};

const LynchTab: React.FC<LynchTabProps> = ({ data, score }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">🔍 Peter Lynch Analysis</h2>
      <p className="text-xl text-green-400 mb-4">Score: {score}/10</p>

      <ExpandableSection title="📝 Do You Understand This Business?">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <p className="text-gray-300 leading-relaxed">{data.knowWhatYouOwn}</p>
        </div>
      </ExpandableSection>

      <ExpandableSection title="🌊 Is the Tide Rising?">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="space-y-3 leading-relaxed">
            <div>
              <span className="text-gray-400">Total Addressable Market:</span>{' '}
              <span className="text-white">{data.industryGrowth.tam}</span>
            </div>
            <div>
              <span className="text-gray-400">Growth Rate:</span>{' '}
              <span className="text-white">{data.industryGrowth.growthRate}</span>
            </div>
            <div>
              <span className="text-gray-400">Trend:</span>{' '}
              <span className="text-white">{data.industryGrowth.trend}</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="💹 GARP Analysis">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="space-y-3 leading-relaxed">
            <div>
              <span className="text-gray-400">P/E Ratio:</span>{' '}
              <span className="text-white">{data.pegAnalysis.pe}</span>
            </div>
            <div>
              <span className="text-gray-400">Growth Rate:</span>{' '}
              <span className="text-white">{data.pegAnalysis.growthRate}%</span>
            </div>
            <div>
              <span className="text-gray-400">PEG Ratio:</span>{' '}
              <span className={`font-bold ${pegColor(data.pegAnalysis.peg)}`}>
                {data.pegAnalysis.peg.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Assessment:</span>{' '}
              <span className={`leading-relaxed ${pegColor(data.pegAnalysis.peg)}`}>{data.pegAnalysis.assessment}</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="🎯 Can This 10x?">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="space-y-2 mb-4">
            {data.tenBaggerPotential.checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{item.met ? '☑️' : '☐'}</span>
                <span className="text-white">{item.item}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3 leading-relaxed">
            <div>
              <span className="text-gray-400">Path to 10x:</span>{' '}
              <span className="text-gray-300">{data.tenBaggerPotential.path}</span>
            </div>
            <div>
              <span className="text-gray-400">Probability:</span>{' '}
              <span className="text-white">{data.tenBaggerPotential.probability}</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Enhanced Quote Box */}
      <div className="relative border-l-4 border-green-500 bg-green-900/20 p-5 rounded-r-xl">
        <span className="absolute top-2 left-4 text-8xl text-green-500/10 font-serif leading-none">"</span>
        <p className="text-white font-serif italic text-lg leading-relaxed relative z-10">{data.verdict}</p>
        <p className="text-green-400 text-sm mt-4 font-medium">— Peter Lynch</p>
      </div>
    </div>
  );
};

export default LynchTab;
