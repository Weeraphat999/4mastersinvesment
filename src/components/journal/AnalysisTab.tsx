import type { DecisionEntry } from '../../data/types';

interface AnalysisTabProps {
  entry: DecisionEntry;
}

const scoreConfig = [
  { key: 'buffett', label: 'Buffett' },
  { key: 'munger', label: 'Munger' },
  { key: 'lynch', label: 'Lynch' },
  { key: 'rothschild', label: 'Rothschild' },
  { key: 'overall', label: 'Overall' },
] as const;

function getScoreColor(value: number): string {
  if (value >= 7) return 'bg-green-500';
  if (value >= 4) return 'bg-blue-500';
  return 'bg-red-500';
}

export default function AnalysisTab({ entry }: AnalysisTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase">Master Scores</h3>
      <div className="space-y-3">
        {scoreConfig.map(({ key, label }) => {
          const value = entry.scores[key];
          return (
            <div key={key} className="bg-gray-800 rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">{label}</span>
                <span className="text-sm font-bold text-white">{value}/10</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`${getScoreColor(value)} h-2 rounded-full transition-all`}
                  style={{ width: `${(value / 10) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-label={`${label} score: ${value} out of 10`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
