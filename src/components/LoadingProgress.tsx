import type { AnalysisStage } from '../services/types';

interface LoadingProgressProps {
  stages: AnalysisStage[];
  currentStageIndex: number;
}

function StatusIcon({ status }: { status: AnalysisStage['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-500 text-gray-500 text-sm transition-all duration-300">
          ○
        </span>
      );
    case 'loading':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-blue-400 text-blue-400 text-sm animate-spin transition-all duration-300">
          ◌
        </span>
      );
    case 'success':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-green-400 text-green-400 text-sm transition-all duration-300">
          ✓
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-yellow-400 text-yellow-400 text-sm transition-all duration-300">
          ⚠
        </span>
      );
  }
}

function labelColorClass(status: AnalysisStage['status'], isCurrent: boolean): string {
  if (isCurrent && status === 'loading') return 'text-blue-400 font-semibold';
  if (status === 'success') return 'text-green-400';
  if (status === 'warning') return 'text-yellow-400';
  return 'text-gray-400';
}

export default function LoadingProgress({ stages, currentStageIndex }: LoadingProgressProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 w-full max-w-sm">
      <ul className="flex flex-col gap-3">
        {stages.map((stage, index) => {
          const isCurrent = index === currentStageIndex;
          return (
            <li
              key={stage.id}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isCurrent ? 'scale-105 origin-left' : ''
              }`}
            >
              <StatusIcon status={stage.status} />
              <span className={`text-sm transition-colors duration-300 ${labelColorClass(stage.status, isCurrent)}`}>
                {stage.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
