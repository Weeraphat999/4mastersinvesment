import { useState } from 'react';

interface PortfolioCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocationPercent: number;
}

export function PortfolioCalculatorModal({
  isOpen,
  onClose,
  allocationPercent,
}: PortfolioCalculatorModalProps) {
  const [portfolioValue, setPortfolioValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const parsedValue = parseFloat(portfolioValue);
  const isValid = !isNaN(parsedValue) && parsedValue > 0;
  const positionSize = isValid ? (parsedValue * allocationPercent) / 100 : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPortfolioValue(e.target.value);
    setError('');
  };

  const handleCalculate = () => {
    if (!portfolioValue.trim()) {
      setError('Please enter a portfolio value');
      return;
    }
    if (!isValid) {
      setError('Please enter a valid positive number');
      return;
    }
    setError('');
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Portfolio Calculator</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Recommended allocation: {allocationPercent}% of your portfolio
        </p>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">
            Total Portfolio Value ($)
          </label>
          <input
            type="number"
            value={portfolioValue}
            onChange={handleInputChange}
            placeholder="e.g. 100000"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>

        <button
          onClick={handleCalculate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-4"
        >
          Calculate
        </button>

        {isValid && (
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Position Size</p>
            <p className="text-2xl font-bold text-green-400">
              ${positionSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {allocationPercent}% of ${parsedValue.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioCalculatorModal;
