import React from 'react';

interface VerdictCardProps {
  verdict: string;
  positionSize: string;
  entryStrategy: string;
  riskLevel: string;
  timeHorizon: string;
  overallScore?: number;
}

const VerdictCard: React.FC<VerdictCardProps> = ({ verdict, positionSize, entryStrategy, riskLevel, timeHorizon, overallScore }) => {
  const confidence = overallScore != null ? Math.round((overallScore / 10) * 100) : 50;

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 ring-4 ring-blue-500/20 shadow-2xl">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white/80 uppercase tracking-wider mt-2">🎯 FINAL VERDICT</h3>
        <p className="text-4xl font-black text-white mt-4">{verdict}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
          <span className="text-xs text-white/60 mb-1 uppercase tracking-wide block">Position Size</span>
          <p className="text-white font-semibold text-sm">{positionSize}</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
          <span className="text-xs text-white/60 mb-1 uppercase tracking-wide block">Entry Strategy</span>
          <p className="text-white font-semibold text-sm">{entryStrategy}</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
          <span className="text-xs text-white/60 mb-1 uppercase tracking-wide block">Risk Level</span>
          <p className="text-white font-semibold text-sm">⚠️ {riskLevel}</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
          <span className="text-xs text-white/60 mb-1 uppercase tracking-wide block">Time Horizon</span>
          <p className="text-white font-semibold text-sm">{timeHorizon}</p>
        </div>
      </div>

      {/* Confidence Level Bar */}
      <div className="my-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm font-medium">Confidence Level</span>
          <span className="text-white font-bold">{confidence}%</span>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-white/60 to-white transition-all duration-500"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VerdictCard;
