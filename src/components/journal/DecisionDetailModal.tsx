import type { DecisionEntry } from '../../data/types';
import UpdatesTab from './UpdatesTab';
import AnalysisTab from './AnalysisTab';
import OverviewTab from './OverviewTab';
import ReasoningTab from './ReasoningTab';

export interface DecisionUpdate {
  status: 'active' | 'closed';
  exitPrice: number | null;
  actualOutcome: string;
  lessonsLearned: string;
  tags: string[];
}

type TabId = 'overview' | 'reasoning' | 'analysis' | 'updates';

interface DecisionDetailModalProps {
  entry: DecisionEntry;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onClose: () => void;
  onUpdate: (id: string, update: DecisionUpdate) => void;
}

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'updates', label: 'Updates' },
];

export default function DecisionDetailModal({
  entry,
  activeTab,
  onTabChange,
  onClose,
  onUpdate,
}: DecisionDetailModalProps) {
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Decision detail for ${entry.ticker}`}
    >
      {/* Modal content */}
      <div className="bg-gray-900 border border-gray-700 text-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-lg md:mx-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">
            {entry.ticker} — {entry.companyName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && <OverviewTab entry={entry} />}
          {activeTab === 'reasoning' && <ReasoningTab entry={entry} />}
          {activeTab === 'analysis' && <AnalysisTab entry={entry} />}
          {activeTab === 'updates' && (
            <UpdatesTab entry={entry} onSubmit={(update) => onUpdate(entry.id, update)} />
          )}
        </div>
      </div>
    </div>
  );
}

/* Placeholder tab content components — will be replaced by full implementations in tasks 7.2-7.5 */






