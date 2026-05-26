import { seedJournalData } from '../../utils/seedJournalData';

interface EmptyStateProps {
  onDataSeeded?: () => void;
}

export default function EmptyState({ onDataSeeded }: EmptyStateProps) {
  const handleLoadSample = () => {
    seedJournalData();
    if (onDataSeeded) {
      onDataSeeded();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center justify-center py-16">
      <div className="bg-gray-800 rounded-xl p-10 text-center max-w-md shadow-lg">
        <div className="text-6xl mb-4">📓</div>
        <h3 className="text-2xl font-bold text-white mb-3">No Decisions Recorded</h3>
        <p className="text-gray-400 mb-6">
          Your decision journal is empty. Start by analyzing a stock on the{' '}
          <span className="text-blue-400 font-medium">Analyze</span> page to record your first
          investment decision.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go to Analyze
          </a>
          <button
            onClick={handleLoadSample}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Load Sample Data (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
