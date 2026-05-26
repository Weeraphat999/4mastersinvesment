import { useState } from 'react';
import { saveToStorage } from '../../../utils/storageUtils';

interface PriceAlertsCardProps {
  ticker: string;
  currentPrice: number;
}

export function PriceAlertsCard({ ticker, currentPrice }: PriceAlertsCardProps) {
  const suggestedPrice = Math.round(currentPrice * 0.7 * 100) / 100;
  const [targetPrice, setTargetPrice] = useState<string>(suggestedPrice.toString());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSetAlert = () => {
    const value = parseFloat(targetPrice);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid positive number');
      setSaved(false);
      return;
    }

    setError('');
    saveToStorage(`price_alert_${ticker}`, { targetPrice: value });
    setSaved(true);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-semibold mb-4">🔔 Set Price Alert</h2>

      <p className="text-gray-300 mb-2">Alert me if price drops to:</p>

      <input
        type="number"
        value={targetPrice}
        onChange={(e) => {
          setTargetPrice(e.target.value);
          setSaved(false);
          setError('');
        }}
        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white w-full mb-2"
      />

      <p className="text-gray-400 text-sm mb-4">
        We recommend ${suggestedPrice} (30% below current)
      </p>

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

      <button
        onClick={handleSetAlert}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
      >
        Set Alert
      </button>

      {saved && <p className="text-green-400 mt-2">✅ Alert set!</p>}
    </div>
  );
}
