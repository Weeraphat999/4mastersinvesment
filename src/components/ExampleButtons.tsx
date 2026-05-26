import React from 'react';

interface ExampleButtonsProps {
  onSelect: (ticker: string) => void;
}

const EXAMPLE_TICKERS = ['QTUM', 'AAPL', 'NVDA'];

const ExampleButtons: React.FC<ExampleButtonsProps> = ({ onSelect }) => {
  return (
    <div className="flex gap-3">
      {EXAMPLE_TICKERS.map((ticker) => (
        <button
          key={ticker}
          onClick={() => onSelect(ticker)}
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-white transition-all duration-300"
        >
          {ticker}
        </button>
      ))}
    </div>
  );
};

export default ExampleButtons;
