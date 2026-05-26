import React from 'react';

interface MasterScore {
  name: string;
  score: number; // 0-10
  color: string; // Tailwind color class like 'bg-blue-500'
}

interface MasterScoresCardProps {
  scores: MasterScore[];
  overallScore: number;
}

const masterMeta: Record<string, { icon: string; gradient: string; shadow: string }> = {
  Buffett: { icon: '🎩', gradient: 'from-blue-400 to-blue-600', shadow: 'shadow-lg shadow-blue-500/50' },
  Munger: { icon: '🧠', gradient: 'from-purple-400 to-purple-600', shadow: 'shadow-lg shadow-purple-500/50' },
  Lynch: { icon: '🔍', gradient: 'from-green-400 to-green-600', shadow: 'shadow-lg shadow-green-500/50' },
  Rothschild: { icon: '🌍', gradient: 'from-yellow-400 to-yellow-600', shadow: 'shadow-lg shadow-yellow-500/50' },
};

const getInterpretation = (score: number): string => {
  if (score >= 8) return 'Excellent — Strong conviction investment';
  if (score >= 6) return 'Good — Solid opportunity with manageable risks';
  if (score >= 4) return 'Fair — Proceed with caution, position size accordingly';
  if (score >= 2) return 'Weak — Significant concerns, small position only';
  return 'Poor — Consider avoiding or waiting for better entry';
};

const MasterScoresCard: React.FC<MasterScoresCardProps> = ({ scores, overallScore }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-white mb-4">📊 MASTER SCORES</h3>
      <div className="space-y-3">
        {scores.map((master) => {
          const meta = masterMeta[master.name] || { icon: '📊', gradient: 'from-gray-400 to-gray-600', shadow: '' };
          return (
            <div key={master.name} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1 text-2xl">{meta.icon}</div>
              <div className="col-span-2 text-base text-white font-medium">{master.name}</div>
              <div className={`col-span-8 h-6 rounded-full bg-gray-700 overflow-hidden p-0.5 ${meta.shadow}`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
                  style={{ width: `${(master.score / 10) * 100}%` }}
                />
              </div>
              <div className="col-span-1 text-lg text-white font-bold text-right">{master.score.toFixed(1)}</div>
            </div>
          );
        })}

        {/* Overall Score */}
        <div className="pt-4 mt-4 border-t border-gray-600">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 text-2xl">⭐</div>
            <div className="col-span-2 text-base font-bold text-white">Overall</div>
            <div className="col-span-8 h-8 rounded-full bg-gray-700 overflow-hidden shadow-lg shadow-purple-500/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                style={{ width: `${(overallScore / 10) * 100}%` }}
              />
            </div>
            <div className="col-span-1 text-xl font-black text-white text-right">{overallScore.toFixed(1)}</div>
          </div>
          <p className="text-gray-400 text-sm mt-3 text-center">{getInterpretation(overallScore)}</p>
        </div>
      </div>
    </div>
  );
};

export default MasterScoresCard;
