import { useState, useMemo, useEffect, useCallback } from 'react';
import type { DecisionEntry } from '../data/types';
import { useAuth } from '../contexts/AuthContext';
import {
  getJournalEntries,
  updateJournalEntry,
} from '../services/journalService';
import { applyFilters, getLosingDecisions } from '../utils/journalFilters';
import type { JournalFilters } from '../utils/journalFilters';
import {
  computeJournalMetrics,
  computePerformanceMetrics,
  computeMistakeStats,
} from '../utils/journalCalculations';
import SummaryCards from '../components/journal/SummaryCards';
import FilterBar from '../components/journal/FilterBar';
import ExportButton from '../components/journal/ExportButton';
import DecisionTable from '../components/journal/DecisionTable';
import DecisionCardGrid from '../components/journal/DecisionCardGrid';
import DecisionDetailModal from '../components/journal/DecisionDetailModal';
import type { DecisionUpdate } from '../components/journal/DecisionDetailModal';
import MistakesAutopsy from '../components/journal/MistakesAutopsy';
import PerformanceAnalytics from '../components/journal/PerformanceAnalytics';
import EmptyState from '../components/journal/EmptyState';

interface ModalState {
  isOpen: boolean;
  entry: DecisionEntry | null;
  activeTab: 'overview' | 'reasoning' | 'analysis' | 'updates';
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

const defaultFilters: JournalFilters = {
  search: '',
  decisionType: 'ALL',
  status: 'ALL',
  dateRange: { start: null, end: null },
  sortBy: 'NEWEST',
  viewMode: 'table',
};

export default function JournalPage() {
  const { user } = useAuth();

  // Core data
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });

  // Filter state
  const [filters, setFilters] = useState<JournalFilters>(defaultFilters);

  // Modal state
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    entry: null,
    activeTab: 'overview',
  });

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  // Load decisions from Supabase on mount
  useEffect(() => {
    async function fetchEntries() {
      setLoading(true);
      setError(null);
      try {
        const entries = await getJournalEntries();
        setDecisions(entries);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load journal entries';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, [showToast]);

  // Derived data (computed via useMemo)
  const filteredDecisions = useMemo(() => applyFilters(decisions, filters), [decisions, filters]);
  const metrics = useMemo(() => computeJournalMetrics(decisions), [decisions]);
  const performanceMetrics = useMemo(() => computePerformanceMetrics(decisions), [decisions]);
  const losingDecisions = useMemo(() => getLosingDecisions(decisions), [decisions]);
  const mistakeStats = useMemo(() => computeMistakeStats(losingDecisions), [losingDecisions]);
  const hasEnoughData = useMemo(
    () => decisions.filter((d) => d.status === 'closed').length >= 2,
    [decisions]
  );

  // Modal handlers
  const handleView = (entry: DecisionEntry) => {
    setModalState({ isOpen: true, entry, activeTab: 'overview' });
  };

  const handleEdit = (entry: DecisionEntry) => {
    setModalState({ isOpen: true, entry, activeTab: 'updates' });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, entry: null, activeTab: 'overview' });
  };

  const handleTabChange = (tab: 'overview' | 'reasoning' | 'analysis' | 'updates') => {
    setModalState((prev) => ({ ...prev, activeTab: tab }));
  };

  // Update submission handler
  const handleUpdate = async (id: string, update: DecisionUpdate) => {
    try {
      const updates: Partial<DecisionEntry> = {
        status: update.status,
        actualOutcome: update.actualOutcome,
        lessonsLearned: update.lessonsLearned,
      };
      if (update.exitPrice !== null) {
        updates.currentPrice = update.exitPrice;
      }

      const updatedEntry = await updateJournalEntry(id, updates);
      setDecisions((prev) =>
        prev.map((d) => (d.id === id ? updatedEntry : d))
      );
      handleCloseModal();
      showToast('Decision updated successfully', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update decision';
      showToast(message, 'error');
    }
  };

  // Reload data (used after seeding sample data)
  const reloadData = async () => {
    setLoading(true);
    try {
      const entries = await getJournalEntries();
      setDecisions(entries);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reload journal entries';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">📓 Decision Journal</h1>
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading journal entries...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (when initial load fails completely)
  if (error && decisions.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">📓 Decision Journal</h1>
          <div className="flex items-center justify-center py-16">
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center max-w-md">
              <p className="text-red-300 font-medium mb-2">Failed to load journal entries</p>
              <p className="text-red-200/70 text-sm mb-4">{error}</p>
              <button
                onClick={reloadData}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state: hide all other sections
  if (decisions.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">📓 Decision Journal</h1>
          <EmptyState onDataSeeded={reloadData} userId={user?.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Toast Notification */}
        {toast.visible && (
          <div
            className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-green-900/90 border border-green-700 text-green-200'
                : 'bg-red-900/90 border border-red-700 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{toast.type === 'success' ? '✓' : '✕'}</span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Page Header */}
        <h1 className="text-3xl font-bold text-white">📓 Decision Journal</h1>

        {/* Summary Cards */}
        <SummaryCards metrics={metrics} />

        {/* Filter Bar + Export Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            <FilterBar filters={filters} onFiltersChange={setFilters} />
          </div>
          <ExportButton decisions={decisions} />
        </div>

        {/* Decision Table or Card Grid */}
        {filters.viewMode === 'table' ? (
          <DecisionTable
            decisions={filteredDecisions}
            onView={handleView}
            onEdit={handleEdit}
          />
        ) : (
          <DecisionCardGrid
            decisions={filteredDecisions}
            onSelect={handleView}
          />
        )}

        {/* Mistakes Autopsy */}
        <MistakesAutopsy losingDecisions={losingDecisions} stats={mistakeStats} />

        {/* Performance Analytics */}
        <PerformanceAnalytics
          decisions={decisions}
          metrics={performanceMetrics}
          hasEnoughData={hasEnoughData}
        />

        {/* Decision Detail Modal */}
        {modalState.isOpen && modalState.entry && (
          <DecisionDetailModal
            entry={modalState.entry}
            activeTab={modalState.activeTab}
            onTabChange={handleTabChange}
            onClose={handleCloseModal}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}
