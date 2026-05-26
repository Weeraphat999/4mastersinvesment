import React from 'react';
import type { JournalFilters } from '../../utils/journalFilters';

interface FilterBarProps {
  filters: JournalFilters;
  onFiltersChange: (filters: JournalFilters) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleDecisionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      decisionType: e.target.value as JournalFilters['decisionType'],
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      status: e.target.value as JournalFilters['status'],
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dateRange: { ...filters.dateRange, start: e.target.value || null },
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dateRange: { ...filters.dateRange, end: e.target.value || null },
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortBy: e.target.value as JournalFilters['sortBy'],
    });
  };

  const handleViewModeChange = (mode: JournalFilters['viewMode']) => {
    onFiltersChange({ ...filters, viewMode: mode });
  };

  const inputClasses =
    'bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500';

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-800 rounded-lg">
      {/* Ticker search */}
      <input
        type="text"
        placeholder="Search by ticker..."
        value={filters.search}
        onChange={handleSearchChange}
        className={inputClasses}
        aria-label="Search by ticker"
      />

      {/* Decision type dropdown */}
      <select
        value={filters.decisionType}
        onChange={handleDecisionTypeChange}
        className={inputClasses}
        aria-label="Filter by decision type"
      >
        <option value="ALL">All</option>
        <option value="BUY">BUY</option>
        <option value="PASS">PASS</option>
        <option value="WATCHLIST">WATCHLIST</option>
      </select>

      {/* Status dropdown */}
      <select
        value={filters.status}
        onChange={handleStatusChange}
        className={inputClasses}
        aria-label="Filter by status"
      >
        <option value="ALL">All</option>
        <option value="ACTIVE">Active</option>
        <option value="CLOSED">Closed</option>
        <option value="WATCHING">Watching</option>
      </select>

      {/* Date range inputs */}
      <input
        type="date"
        value={filters.dateRange.start || ''}
        onChange={handleStartDateChange}
        className={inputClasses}
        aria-label="Start date"
      />
      <input
        type="date"
        value={filters.dateRange.end || ''}
        onChange={handleEndDateChange}
        className={inputClasses}
        aria-label="End date"
      />

      {/* Sort selector */}
      <select
        value={filters.sortBy}
        onChange={handleSortChange}
        className={inputClasses}
        aria-label="Sort by"
      >
        <option value="NEWEST">Newest First</option>
        <option value="OLDEST">Oldest First</option>
        <option value="BEST_PNL">Best P&amp;L</option>
        <option value="WORST_PNL">Worst P&amp;L</option>
      </select>

      {/* View mode toggle */}
      <div className="flex items-center border border-gray-600 rounded overflow-hidden">
        <button
          type="button"
          onClick={() => handleViewModeChange('table')}
          className={`px-3 py-2 text-sm ${
            filters.viewMode === 'table'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
          aria-label="Table view"
          aria-pressed={filters.viewMode === 'table'}
        >
          {/* Table icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18M3 6h18M3 18h18"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleViewModeChange('card')}
          className={`px-3 py-2 text-sm ${
            filters.viewMode === 'card'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
          aria-label="Card view"
          aria-pressed={filters.viewMode === 'card'}
        >
          {/* Card/grid icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
