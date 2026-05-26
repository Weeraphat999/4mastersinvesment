import { useState, useMemo, useEffect } from 'react';
import type { DecisionEntry } from '../data/types';
import { loadFromStorage, saveToStorage } from '../utils/storageUtils';
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

const defaultFilters: JournalFilters = {
  search: '',
  decisionType: 'ALL',
  status: 'ALL',
  dateRange: { start: null, end: null },
  sortBy: 'NEWEST',
  viewMode: 'table',
};

export default function JournalPage() {
  // Core data
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);

  // Filter state
  const [filters, setFilters] = useState<JournalFilters>(defaultFilters);

  // Modal state
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    entry: null,
    activeTab: 'overview',
  });

  // Load decisions from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage<DecisionEntry[]>('investment_decisions', []);
    setDecisions(saved);
  }, []);

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
  const handleUpdate = (id: string, update: DecisionUpdate) => {
    const updatedDecisions = decisions.map((d) => {
      if (d.id !== id) return d;
      return {
        ...d,
        status: update.status,
        currentPrice: update.exitPrice !== null ? update.exitPrice : d.currentPrice,
        actualOutcome: update.actualOutcome,
        lessonsLearned: update.lessonsLearned,
      };
    });
    saveToStorage('investment_decisions', updatedDecisions);
    setDecisions(updatedDecisions);
    handleCloseModal();
  };

  // Reload data (used after seeding sample data)
  const reloadData = () => {
    const saved = loadFromStorage<DecisionEntry[]>('investment_decisions', []);
    setDecisions(saved);
  };

  // Empty state: hide all other sections
  if (decisions.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">📓 Decision Journal</h1>
          <EmptyState onDataSeeded={reloadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
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
