import { useState } from 'react';
import { createJournalEntry } from '../../services/journalService';
import { sampleDecisions } from '../../utils/seedJournalData';

interface EmptyStateProps {
  onDataSeeded?: () => void;
  userId?: string;
}

export default function EmptyState({ onDataSeeded, userId }: EmptyStateProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const handleLoadSample = async () => {
    if (!userId) {
      setSeedError('You must be signed in to load sample data.');
      return;
    }

    setIsSeeding(true);
    setSeedError(null);

    try {
      for (const decision of sampleDecisions) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...entryWithoutId } = decision;
        await createJournalEntry(entryWithoutId, userId);
      }
      if (onDataSeeded) {
        onDataSeeded();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to seed sample data';
      setSeedError(message);
    } finally {
      setIsSeeding(false);
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
        {seedError && (
          <p className="text-red-400 text-sm mb-4">{seedError}</p>
        )}
        <div className="flex flex-col gap-3">
          <a
            href="/analyze"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go to Analyze
          </a>
          <button
            onClick={handleLoadSample}
            disabled={isSeeding}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 font-medium px-6 py-3 rounded-lg transition-colors text-sm"
          >
            {isSeeding ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Seeding data...
              </span>
            ) : (
              'Load Sample Data (Demo)'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
