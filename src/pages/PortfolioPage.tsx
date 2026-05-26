import { useState, useMemo, useEffect, useCallback } from 'react';
import { PortfolioHolding } from '../data/types';
import { loadFromStorage, saveToStorage } from '../utils/storageUtils';
import { computeTotalValue, computeTotalPnL, computeHighRiskExposure } from '../utils/portfolioCalculations';
import { generatePortfolioCSV } from '../utils/portfolioCSV';
import { downloadFile } from '../utils/downloadFile';
import { refreshPrices } from '../utils/priceRefresh';

import SummaryCards from '../components/portfolio/SummaryCards';
import AddHoldingForm from '../components/portfolio/AddHoldingForm';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import AllocationChart from '../components/portfolio/AllocationChart';
import RiskBreakdown from '../components/portfolio/RiskBreakdown';
import PerformanceRankings from '../components/portfolio/PerformanceRankings';
import OverLimitAlerts from '../components/portfolio/OverLimitAlerts';
import FloatingActionButtons from '../components/portfolio/FloatingActionButtons';
import EmptyState from '../components/portfolio/EmptyState';

const PORTFOLIO_STORAGE_KEY = 'portfolio-holdings';
const PENDING_ADD_KEY = 'pending_portfolio_add';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(() =>
    loadFromStorage<PortfolioHolding[]>(PORTFOLIO_STORAGE_KEY, [])
  );
  const [prefill, setPrefill] = useState<Partial<PortfolioHolding> | undefined>(undefined);
  const [pendingAdd, setPendingAdd] = useState<{ ticker: string; companyName: string; price: number; shares: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check for pending portfolio add from Decision Journal
  useEffect(() => {
    const pending = loadFromStorage<{ ticker: string; companyName: string; price: number; shares: number } | null>(PENDING_ADD_KEY, null);
    if (pending) {
      setPendingAdd(pending);
    }
  }, []);

  // Persist holdings on every change
  useEffect(() => {
    saveToStorage(PORTFOLIO_STORAGE_KEY, holdings);
  }, [holdings]);

  // Auto-refresh prices on page load
  useEffect(() => {
    if (holdings.length > 0) {
      refreshPrices(holdings).then((updated) => {
        setHoldings(updated);
      }).catch((err) => {
        console.error('Auto-refresh failed:', err);
      });
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Computed values
  const totalValue = useMemo(() => computeTotalValue(holdings), [holdings]);
  const totalPnL = useMemo(() => computeTotalPnL(holdings), [holdings]);
  const holdingsCount = holdings.length;
  const highRiskExposure = useMemo(() => computeHighRiskExposure(holdings, totalValue), [holdings, totalValue]);

  // Handlers
  const addHolding = useCallback((holdingData: Omit<PortfolioHolding, 'id' | 'currentPrice'>) => {
    const newHolding: PortfolioHolding = {
      ...holdingData,
      id: generateId(),
      currentPrice: holdingData.avgCost, // Initialize currentPrice to avgCost
    };
    setHoldings((prev) => [...prev, newHolding]);
  }, []);

  const editHolding = useCallback((id: string, updates: Partial<PortfolioHolding>) => {
    setHoldings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  }, []);

  const deleteHolding = useCallback((id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const handleRefreshPrices = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await refreshPrices(holdings);
      setHoldings(updated);
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [holdings]);

  const handleExportCSV = useCallback(() => {
    const csv = generatePortfolioCSV(holdings, totalValue);
    downloadFile(csv, `portfolio_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }, [holdings, totalValue]);

  const handleSettings = useCallback(() => {
    // Placeholder for settings
    alert('Settings coming soon!');
  }, []);

  // Handle pending add from Decision Journal
  const acceptPendingAdd = () => {
    if (pendingAdd) {
      setPrefill({
        ticker: pendingAdd.ticker,
        companyName: pendingAdd.companyName,
        avgCost: pendingAdd.price,
        shares: pendingAdd.shares,
        purchaseDate: new Date().toISOString().split('T')[0],
      });
      localStorage.removeItem(PENDING_ADD_KEY);
      setPendingAdd(null);
    }
  };

  const dismissPendingAdd = () => {
    localStorage.removeItem(PENDING_ADD_KEY);
    setPendingAdd(null);
  };

  const handleAddFirst = () => {
    // Scroll to top where the form is and open it
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isEmpty = holdings.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <h1 className="text-4xl font-bold text-white mb-8">💼 Portfolio Tracker</h1>

      {/* Pending Add from Decision Journal */}
      {pendingAdd && (
        <div className="mb-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-300 font-medium">
              Add {pendingAdd.ticker} to portfolio?
            </p>
            <p className="text-blue-200/70 text-sm">
              {pendingAdd.shares} shares at ${pendingAdd.price.toFixed(2)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={acceptPendingAdd}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Yes
            </button>
            <button
              onClick={dismissPendingAdd}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Over Limit Alerts */}
      {!isEmpty && (
        <div className="mb-6">
          <OverLimitAlerts holdings={holdings} totalValue={totalValue} />
        </div>
      )}

      {/* Summary Cards */}
      {!isEmpty && (
        <div className="mb-6">
          <SummaryCards
            totalValue={totalValue}
            totalPnL={totalPnL}
            holdingsCount={holdingsCount}
            highRiskExposure={highRiskExposure}
          />
        </div>
      )}

      {/* Add Holding Form */}
      <div className="mb-6">
        <AddHoldingForm onAdd={addHolding} prefill={prefill} />
      </div>

      {isEmpty ? (
        <EmptyState onAddFirst={handleAddFirst} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - 3 cols */}
          <div className="lg:col-span-3">
            <HoldingsTable
              holdings={holdings}
              totalValue={totalValue}
              onEdit={editHolding}
              onDelete={deleteHolding}
            />
          </div>

          {/* Right Column - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <AllocationChart holdings={holdings} totalValue={totalValue} />
            <RiskBreakdown holdings={holdings} totalValue={totalValue} />
            <PerformanceRankings holdings={holdings} />
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <FloatingActionButtons
        onExportCSV={handleExportCSV}
        onRefreshPrices={handleRefreshPrices}
        onSettings={handleSettings}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
