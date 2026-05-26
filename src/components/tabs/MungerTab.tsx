import React, { useState } from 'react';
import ExpandableSection from '../ExpandableSection';
import { MungerAnalysis } from '../../data/types';

interface MungerTabProps {
  data: MungerAnalysis;
  score: number;
}

const statusIcon = (status: 'pass' | 'caution' | 'fail') => {
  switch (status) {
    case 'pass': return '✅';
    case 'caution': return '⚠️';
    case 'fail': return '❌';
  }
};

const severityColor = (severity: 'high' | 'medium' | 'low') => {
  switch (severity) {
    case 'high': return 'border-red-500';
    case 'medium': return 'border-yellow-500';
    case 'low': return 'border-green-500';
  }
};

type Discipline = 'physics' | 'biology' | 'psychology' | 'economics' | 'history' | 'math';

const disciplines: { key: Discipline; label: string }[] = [
  { key: 'physics', label: 'Physics' },
  { key: 'biology', label: 'Biology' },
  { key: 'psychology', label: 'Psychology' },
  { key: 'economics', label: 'Economics' },
  { key: 'history', label: 'History' },
  { key: 'math', label: 'Math' },
];

const MungerTab: React.FC<MungerTabProps> = ({ data, score }) => {
  const [activeDiscipline, setActiveDiscipline] = useState<Discipline>('physics');

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">🧠 Charlie Munger Analysis</h2>
      <p className="text-xl text-purple-400 mb-4">Score: {score}/10</p>

      <ExpandableSection title="⚠️ Failure Scenarios">
        <div className="space-y-4 mb-4">
          {data.failureScenarios.map((scenario, i) => (
            <div
              key={i}
              className={`bg-gray-800 rounded-lg p-5 border-l-4 ${severityColor(scenario.severity)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">{scenario.name}</h4>
                <span className="text-gray-400 text-sm capitalize">{scenario.severity}</span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-sm">Probability</span>
                  <span className="text-white text-sm">{scenario.probability}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scenario.probability}%` }}
                  />
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-2 leading-relaxed">{scenario.description}</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                <span className="text-green-400">Mitigation:</span> {scenario.mitigation}
              </p>
            </div>
          ))}
        </div>
      </ExpandableSection>

      <ExpandableSection title="🎯 Mental Models Applied">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.mentalModels.map((model, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1">{statusIcon(model.status)}</span>
                <div>
                  <span className="text-white font-medium">{model.name}</span>
                  <p className="text-gray-400 text-sm leading-relaxed">{model.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ExpandableSection>

      <ExpandableSection title="🔬 Six Lenses Analysis">
        <div className="bg-gray-800 rounded-lg p-5 mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {disciplines.map((d) => (
              <button
                key={d.key}
                type="button"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeDiscipline === d.key
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
                onClick={() => setActiveDiscipline(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="text-gray-300 leading-relaxed">
            {data.multiDisciplinary[activeDiscipline]}
          </div>
        </div>
      </ExpandableSection>

      {/* Enhanced Quote Box */}
      <div className="relative border-l-4 border-purple-500 bg-purple-900/20 p-5 rounded-r-xl">
        <span className="absolute top-2 left-4 text-8xl text-purple-500/10 font-serif leading-none">"</span>
        <p className="text-white font-serif italic text-lg leading-relaxed relative z-10">{data.verdict}</p>
        <p className="text-purple-400 text-sm mt-4 font-medium">— Charlie Munger</p>
      </div>
    </div>
  );
};

export default MungerTab;
