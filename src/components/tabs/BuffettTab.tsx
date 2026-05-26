import React from 'react';
import ExpandableSection from '../ExpandableSection';
import StatusIndicator from '../StatusIndicator';
import { BuffettAnalysis } from '../../data/types';

interface BuffettTabProps {
  data: BuffettAnalysis;
  score: number;
}

const statusIcon = (status: 'pass' | 'caution' | 'fail') => {
  switch (status) {
    case 'pass': return '✅';
    case 'caution': return '⚠️';
    case 'fail': return '❌';
  }
};

const BuffettTab: React.FC<BuffettTabProps> = ({ data, score }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">🎩 Warren Buffett Analysis</h2>
      <p className="text-xl text-blue-400 mb-4">Score: {score}/10</p>

      <ExpandableSection title="✅ Business Understanding">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="space-y-3 leading-relaxed">
            <div>
              <span className="text-gray-400">Sector:</span>{' '}
              <span className="text-white">{data.businessUnderstanding.sector}</span>
            </div>
            <div>
              <span className="text-gray-400">Description:</span>{' '}
              <span className="text-white">{data.businessUnderstanding.description}</span>
            </div>
            <div>
              <span className="text-gray-400">Complexity:</span>{' '}
              <span className="text-white">{data.businessUnderstanding.complexity}</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="🏰 Competitive Moat">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Moat Score</span>
              <span className="text-white font-semibold">{data.competitiveMoat.moatScore}/10</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(data.competitiveMoat.moatScore / 10) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            {data.competitiveMoat.factors.map((factor, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{statusIcon(factor.status)}</span>
                <span className="text-white">{factor.name}</span>
                <span className="text-gray-400 text-sm ml-auto leading-relaxed">{factor.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="💰 Financial Quality">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.financialQuality.map((metric, i) => (
              <div key={i} className="flex items-center gap-2">
                <StatusIndicator type={metric.status === 'pass' ? 'success' : metric.status === 'caution' ? 'warning' : 'error'}>
                  <span className="text-white">{metric.name}:</span>{' '}
                  <span className="text-gray-300">{metric.value}</span>
                </StatusIndicator>
              </div>
            ))}
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="👔 Management Quality">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="space-y-3 leading-relaxed">
            <div>
              <span className="text-gray-400">CEO Track Record:</span>{' '}
              <span className="text-white">{data.managementQuality.ceoTrackRecord}</span>
            </div>
            <div>
              <span className="text-gray-400">Insider Buying:</span>{' '}
              <span className="text-white">{data.managementQuality.insiderBuying}</span>
            </div>
            <div>
              <span className="text-gray-400">Stock Compensation:</span>{' '}
              <span className="text-white">{data.managementQuality.stockCompensation}</span>
            </div>
            <div>
              <span className="text-gray-400">Capital Allocation Score:</span>{' '}
              <span className="text-white">{data.managementQuality.capitalAllocation}/10</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="💵 Valuation">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="space-y-3 leading-relaxed">
            <div>
              <span className="text-gray-400">Intrinsic Value:</span>{' '}
              <span className="text-white">${data.valuation.intrinsicValue.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">Current Price:</span>{' '}
              <span className="text-white">${data.valuation.currentPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">Margin of Safety:</span>{' '}
              <span className="text-white">{data.valuation.marginOfSafety}%</span>
            </div>
            <div>
              <span className="text-gray-400">P/E Ratio:</span>{' '}
              <span className="text-white">{data.valuation.peRatio}</span>
            </div>
            <div>
              <span className="text-gray-400">P/S Ratio:</span>{' '}
              <span className="text-white">{data.valuation.psRatio}</span>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Enhanced Quote Box */}
      <div className="relative border-l-4 border-blue-500 bg-blue-900/20 p-5 rounded-r-xl">
        <span className="absolute top-2 left-4 text-8xl text-blue-500/10 font-serif leading-none">"</span>
        <p className="text-white font-serif italic text-lg leading-relaxed relative z-10">{data.verdict}</p>
        <p className="text-blue-400 text-sm mt-4 font-medium">— Warren Buffett</p>
      </div>
    </div>
  );
};

export default BuffettTab;
