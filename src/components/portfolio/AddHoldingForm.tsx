import { useState, useEffect } from 'react';
import { PortfolioHolding } from '../../data/types';

interface AddHoldingFormProps {
  onAdd: (holding: Omit<PortfolioHolding, 'id' | 'currentPrice'>) => void;
  prefill?: Partial<PortfolioHolding>;
}

const CATEGORIES = ['Stock', 'ETF', 'Crypto', 'Bond', 'Other'];
const RISK_LEVELS: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

export default function AddHoldingForm({ onAdd, prefill }: AddHoldingFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Stock');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (prefill) {
      if (prefill.ticker) setTicker(prefill.ticker);
      if (prefill.companyName) setCompanyName(prefill.companyName);
      if (prefill.shares) setShares(String(prefill.shares));
      if (prefill.avgCost) setAvgCost(String(prefill.avgCost));
      if (prefill.purchaseDate) setPurchaseDate(prefill.purchaseDate);
      if (prefill.category) setCategory(prefill.category);
      if (prefill.riskLevel) setRiskLevel(prefill.riskLevel);
      if (prefill.notes) setNotes(prefill.notes);
      setIsOpen(true);
    }
  }, [prefill]);

  const resetForm = () => {
    setTicker('');
    setCompanyName('');
    setShares('');
    setAvgCost('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setCategory('Stock');
    setRiskLevel('medium');
    setNotes('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!ticker.trim()) newErrors.ticker = 'Ticker is required';
    if (!shares || parseFloat(shares) <= 0) newErrors.shares = 'Shares must be positive';
    if (!avgCost || parseFloat(avgCost) <= 0) newErrors.avgCost = 'Avg cost must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onAdd({
      ticker: ticker.toUpperCase().trim(),
      companyName: companyName.trim(),
      shares: parseFloat(shares),
      avgCost: parseFloat(avgCost),
      purchaseDate,
      category,
      riskLevel,
      notes: notes.trim(),
    });

    resetForm();
    setIsOpen(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left font-semibold text-white hover:bg-gray-700 transition-colors flex items-center justify-between"
      >
        <span>➕ Add New Position</span>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Ticker */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ticker *</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
              {errors.ticker && <p className="text-red-400 text-xs mt-1">{errors.ticker}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apple Inc."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Shares */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Shares *</label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="e.g. 100"
                step="any"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
              {errors.shares && <p className="text-red-400 text-xs mt-1">{errors.shares}</p>}
            </div>

            {/* Avg Cost */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Avg Cost ($) *</label>
              <input
                type="number"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                placeholder="e.g. 150.00"
                step="any"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
              {errors.avgCost && <p className="text-red-400 text-xs mt-1">{errors.avgCost}</p>}
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Risk Level */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Risk Level</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                {RISK_LEVELS.map((level) => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this position..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white resize-none h-20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded transition-colors"
            >
              Add to Portfolio
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); setIsOpen(false); }}
              className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
