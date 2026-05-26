import { useState } from 'react';
import { DecisionEntry } from '../../../data/types';
import { loadFromStorage, saveToStorage } from '../../../utils/storageUtils';

interface DecisionJournalProps {
  ticker: string;
  companyName: string;
  currentPrice: number;
  overallScore: number;
  masterScores: { buffett: number; munger: number; lynch: number; rothschild: number };
  alertsSet: string[];
}

type DecisionType = 'BUY' | 'PASS' | 'WATCHLIST';

const OUTCOME_CHIPS = [
  '2x in 2 years',
  '50% gain in 1 year',
  'Steady dividends',
  'Market outperformance',
  'Capital preservation',
];

function generateReviewDates(): string[] {
  const now = new Date();
  const threeMonths = new Date(now);
  threeMonths.setMonth(threeMonths.getMonth() + 3);
  const sixMonths = new Date(now);
  sixMonths.setMonth(sixMonths.getMonth() + 6);
  const twelveMonths = new Date(now);
  twelveMonths.setMonth(twelveMonths.getMonth() + 12);
  return [
    threeMonths.toISOString().split('T')[0],
    sixMonths.toISOString().split('T')[0],
    twelveMonths.toISOString().split('T')[0],
  ];
}

function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export default function DecisionJournal({
  ticker,
  companyName,
  currentPrice,
  overallScore,
  masterScores,
  alertsSet,
}: DecisionJournalProps) {
  const [decision, setDecision] = useState<DecisionType | ''>('');
  const [positionSizePercent, setPositionSizePercent] = useState('');
  const [positionSizeAmount, setPositionSizeAmount] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [entryPriceTarget, setEntryPriceTarget] = useState('');
  const [exitPlan, setExitPlan] = useState('');
  const [errors, setErrors] = useState<{ decision?: string; reasoning?: string }>({});
  const [showToast, setShowToast] = useState(false);
  const [savedDecision, setSavedDecision] = useState<DecisionType | null>(null);

  const reviewDates = generateReviewDates();

  const handleChipClick = (chip: string) => {
    setExpectedOutcome((prev) => (prev ? `${prev}, ${chip}` : chip));
  };

  const validate = (): boolean => {
    const newErrors: { decision?: string; reasoning?: string } = {};
    if (!decision) {
      newErrors.decision = 'Please select a decision';
    }
    if (!reasoning.trim()) {
      newErrors.reasoning = 'Please provide your reasoning';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const entry: DecisionEntry = {
      id: generateUniqueId(),
      date: new Date().toISOString(),
      ticker,
      companyName,
      decision: decision as DecisionType,
      positionSizePercent: parseFloat(positionSizePercent) || 0,
      positionSizeAmount: parseFloat(positionSizeAmount) || 0,
      entryPriceTarget: parseFloat(entryPriceTarget) || 0,
      currentPrice,
      reasoning: reasoning.trim(),
      expectedOutcome,
      exitPlan,
      reviewDates,
      scores: {
        buffett: masterScores.buffett,
        munger: masterScores.munger,
        lynch: masterScores.lynch,
        rothschild: masterScores.rothschild,
        overall: overallScore,
      },
      alertsSet,
      status: 'active',
      actualOutcome: '',
      lessonsLearned: '',
    };

    const existing = loadFromStorage<DecisionEntry[]>('investment_decisions', []);
    existing.push(entry);
    saveToStorage('investment_decisions', existing);

    // If BUY decision, save pending portfolio add flag
    if (decision === 'BUY') {
      const pendingAdd = {
        ticker: entry.ticker,
        companyName: entry.companyName,
        price: entry.entryPriceTarget || entry.currentPrice,
        shares: entry.entryPriceTarget > 0
          ? Math.floor(entry.positionSizeAmount / entry.entryPriceTarget)
          : 0,
      };
      saveToStorage('pending_portfolio_add', pendingAdd);
    }

    setSavedDecision(decision as DecisionType);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="border-t-2 mt-12 pt-8">
      <h2 className="text-3xl font-bold mb-6">📝 SAVE TO DECISION JOURNAL</h2>
      <p className="text-gray-300 mb-6">
        Record your investment decision for future reference. Track your reasoning, expected outcomes,
        and review dates to improve your investment process over time.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Decision Radio Buttons */}
        <div>
          <label className="block text-lg font-semibold mb-3">Decision *</label>
          <div className="flex gap-4 flex-wrap">
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded cursor-pointer border-2 ${
                decision === 'BUY' ? 'bg-green-600 border-green-500' : 'border-gray-600 hover:border-green-500'
              }`}
            >
              <input
                type="radio"
                name="decision"
                value="BUY"
                checked={decision === 'BUY'}
                onChange={() => setDecision('BUY')}
                className="sr-only"
              />
              <span className="text-green-400 font-bold">BUY</span>
            </label>
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded cursor-pointer border-2 ${
                decision === 'PASS' ? 'bg-yellow-600 border-yellow-500' : 'border-gray-600 hover:border-yellow-500'
              }`}
            >
              <input
                type="radio"
                name="decision"
                value="PASS"
                checked={decision === 'PASS'}
                onChange={() => setDecision('PASS')}
                className="sr-only"
              />
              <span className="text-yellow-400 font-bold">PASS</span>
            </label>
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded cursor-pointer border-2 ${
                decision === 'WATCHLIST' ? 'bg-blue-600 border-blue-500' : 'border-gray-600 hover:border-blue-500'
              }`}
            >
              <input
                type="radio"
                name="decision"
                value="WATCHLIST"
                checked={decision === 'WATCHLIST'}
                onChange={() => setDecision('WATCHLIST')}
                className="sr-only"
              />
              <span className="text-blue-400 font-bold">WATCHLIST</span>
            </label>
          </div>
          {errors.decision && (
            <p className="text-red-400 text-sm mt-2">{errors.decision}</p>
          )}
        </div>

        {/* Position Size - shown only if BUY */}
        {decision === 'BUY' && (
          <div>
            <label className="block text-lg font-semibold mb-3">Position Size</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Allocation %</label>
                <input
                  type="number"
                  value={positionSizePercent}
                  onChange={(e) => setPositionSizePercent(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Dollar Amount</label>
                <input
                  type="number"
                  value={positionSizeAmount}
                  onChange={(e) => setPositionSizeAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Reasoning Textarea */}
        <div>
          <label className="block text-lg font-semibold mb-3">Reasoning *</label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Why are you making this decision? What factors influenced your analysis?"
            className="h-32 w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white resize-none"
          />
          {errors.reasoning && (
            <p className="text-red-400 text-sm mt-2">{errors.reasoning}</p>
          )}
        </div>

        {/* Expected Outcome */}
        <div>
          <label className="block text-lg font-semibold mb-3">Expected Outcome</label>
          <input
            type="text"
            value={expectedOutcome}
            onChange={(e) => setExpectedOutcome(e.target.value)}
            placeholder="What do you expect to happen?"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white mb-2"
          />
          <div className="flex gap-2 flex-wrap">
            {OUTCOME_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-full text-sm text-gray-200 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Entry Price Target - shown only if BUY */}
        {decision === 'BUY' && (
          <div>
            <label className="block text-lg font-semibold mb-3">Entry Price Target</label>
            <input
              type="number"
              value={entryPriceTarget}
              onChange={(e) => setEntryPriceTarget(e.target.value)}
              placeholder={`Current: $${currentPrice.toFixed(2)}`}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
        )}

        {/* Exit Plan - shown only if BUY */}
        {decision === 'BUY' && (
          <div>
            <label className="block text-lg font-semibold mb-3">Exit Plan</label>
            <textarea
              value={exitPlan}
              onChange={(e) => setExitPlan(e.target.value)}
              placeholder="When will you sell? What conditions would trigger an exit?"
              className="h-32 w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white resize-none"
            />
          </div>
        )}

        {/* Review Dates */}
        <div>
          <label className="block text-lg font-semibold mb-3">Review Dates</label>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-gray-700 border border-gray-600 rounded px-4 py-2">
              <span className="text-sm text-gray-400">3 months:</span>{' '}
              <span className="text-white">{reviewDates[0]}</span>
            </div>
            <div className="bg-gray-700 border border-gray-600 rounded px-4 py-2">
              <span className="text-sm text-gray-400">6 months:</span>{' '}
              <span className="text-white">{reviewDates[1]}</span>
            </div>
            <div className="bg-gray-700 border border-gray-600 rounded px-4 py-2">
              <span className="text-sm text-gray-400">12 months:</span>{' '}
              <span className="text-white">{reviewDates[2]}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 py-4 text-xl font-bold rounded text-white transition-colors"
        >
          💾 SAVE TO JOURNAL
        </button>
      </form>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-700 border border-green-500 rounded-lg p-4 shadow-lg z-50 max-w-sm">
          <p className="text-lg font-bold text-white">✅ Decision Saved Successfully!</p>
          <p className="text-gray-200 mt-1">
            {ticker} — {savedDecision}
          </p>
          <p className="text-gray-300 text-sm mt-1">
            Next review: {reviewDates[0]}
          </p>
        </div>
      )}
    </div>
  );
}
