import type { DecisionEntry } from '../../data/types';

interface ReasoningTabProps {
  entry: DecisionEntry;
}

export default function ReasoningTab({ entry }: ReasoningTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase">Reasoning</h3>
      <div className="bg-gray-800 rounded p-4">
        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
          {entry.reasoning}
        </p>
      </div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase">Expected Outcome</h3>
      <div className="bg-gray-800 rounded p-4">
        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
          {entry.expectedOutcome}
        </p>
      </div>
    </div>
  );
}
