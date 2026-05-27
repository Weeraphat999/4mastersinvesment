import { useState, useMemo, useEffect, useCallback } from 'react';
import { PortfolioHolding } from '../data/types';
import { loadFromStorage } from '../utils/storageUtils';
import { computeTotalValue, computeTotalPnL, computeHighRiskExposure } from '../utils/portfolioCalculations';
import { generatePortfolioCSV } from '../utils/portfolioCSV';
import { downloadFile } from '../utils/downloadFile';
import { refreshPrices } from '../utils/priceRefresh';
import { getHoldings, addHolding as addHoldingService, updateHolding as updateHoldingService, deleteHolding as deleteHoldingService } from '../services/portfolioService';

import SummaryCards from '../components/portfolio/SummaryCards';
import AddHoldingForm from '../components/portfolio/AddHoldingForm';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import AllocationChart from '../components/portfolio/AllocationChart';
import RiskBreakdown from '../components/portfolio/RiskBreakdown';
import PerformanceRankings from '../components/portfolio/PerformanceRankings';
import OverLimitAlerts from '../components/portfolio/OverLimitAlerts';
import FloatingActionButtons from '../components/portfolio/FloatingActionButtons';
import EmptyState from '../components/portfolio/EmptyState';

const PENDING_ADD_KEY = 'pending_portfolio_add';

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [prefill, setPrefill] = useState<Partial<PortfolioHolding> | undefined>(undefined);
  const [pendingAdd, setPendingAdd] = useState<{ ticker: string; companyName: string; price: number; shares: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Load holdings from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchHoldings() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getHoldings();
        if (!cancelled) {
          setHoldings(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load holdings';
          setError(message);
          showToast(message, 'error');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    fetchHoldings();
    return () => { cancelled = true; };
  }, [showToast]);

  // Check for pending portfolio add from Decision Journal
  useEffect(() => {
    const pending = loadFromStorage<{ ticker: string; companyName: string; price: number; shares: number } | null>(PENDING_ADD_KEY, null);
    if (pending) {
      setPendingAdd(pending);
    }
  }, []);

  // Auto-refresh prices on page load (after holdings are loaded)
  useEffect(() => {
    if (!isLoading && holdings.length > 0) {
      refreshPrices(holdings).then(async (updated) => {
        setHoldings(updated);
        // Update prices in the database for each holding that changed
        for (const holding of updated) {
          const original = holdings.find(h => h.id === holding.id);
          if (original && original.currentPrice !== holding.currentPrice) {
            try {
              await updateHoldingService(holding.id, { currentPrice: holding.currentPrice });
            } catch {
              // Silently fail price updates - not critical
            }
          }
        }
      }).catch((err) => {
        console.error('Auto-refresh failed:', err);
      });
    }
    // Only run once after initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Computed values
  const totalValue = useMemo(() => computeTotalValue(holdings), [holdings]);
  const totalPnL = useMemo(() => computeTotalPnL(holdings), [holdings]);
  const holdingsCount = holdings.length;
  const highRiskExposure = useMemo(() => computeHighRiskExposure(holdings, totalValue), [holdings, totalValue]);

  // Handlers
  const handleAddHolding = useCallback(async (holdingData: Omit<PortfolioHolding, 'id' | 'currentPrice'>) => {
    try {
      const newHolding = await addHoldingService({
        ...holdingData,
        currentPrice: holdingData.avgCost, // Initialize currentPrice to avgCost
      });
      setHoldings((prev) => [newHolding, ...prev]);
      showToast(`${holdingData.ticker} added to portfolio`, 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add holding';
      showToast(message, 'error');
    }
  }, [showToast]);

  const handleEditHolding = useCallback(async (id: string, updates: Partial<PortfolioHolding>) => {
    try {
      const updated = await updateHoldingService(id, updates);
      setHoldings((prev) =>
        prev.map((h) => (h.id === id ? updated : h))
      );
      showToast('Holding updated', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update holding';
      showToast(message, 'error');
    }
  }, [showToast]);

  const handleDeleteHolding = useCallback(async (id: string) => {
    const holdingToDelete = holdings.find(h => h.id === id);
    try {
      await deleteHoldingService(id);
      setHoldings((prev) => prev.filter((h) => h.id !== id));
      showToast(`${holdingToDelete?.ticker || 'Holding'} removed`, 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete holding';
      showToast(message, 'error');
    }
  }, [holdings, showToast]);

  const handleRefreshPrices = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await refreshPrices(holdings);
      setHoldings(updated);
      // Persist updated prices to database
      for (const holding of updated) {
        const original = holdings.find(h => h.id === holding.id);
        if (original && original.currentPrice !== holding.currentPrice) {
          try {
            await updateHoldingService(holding.id, { currentPrice: holding.currentPrice });
          } catch {
            // Silently fail individual price updates
          }
        }
      }
      showToast('Prices refreshed', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh prices';
      showToast(message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [holdings, showToast]);

  const handleExportCSV = useCallback(() => {
    const csv = generatePortfolioCSV(holdings, totalValue);
    downloadFile(csv, `portfolio_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }, [holdings, totalValue]);

  const handleSettings = useCallback(() => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isEmpty = holdings.length === 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">💼 Portfolio Tracker</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  // Error state (full page error only if no holdings loaded)
  if (error && holdings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">💼 Portfolio Tracker</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <p className="text-red-400 text-lg mb-2">Failed to load portfolio</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? '✓' : '✗'} {toast.message}
        </div>
      )}

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
        <AddHoldingForm onAdd={handleAddHolding} prefill={prefill} />
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
              onEdit={handleEditHolding}
              onDelete={handleDeleteHolding}
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
