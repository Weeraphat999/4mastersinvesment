import React from 'react';

interface WisdomQuoteCardProps {
  currentPrice: number;
  targetPrice: number;
}

/**
 * WisdomQuoteCard displays investment wisdom quotes styled as a quote box.
 * Shows relevant quotes from famous investors with context about the current situation.
 */
export const WisdomQuoteCard: React.FC<WisdomQuoteCardProps> = ({ currentPrice, targetPrice }) => {
  return (
    <div className="bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-6 mb-4 italic">
      <div className="text-gray-300">
        <div className="mb-3">
          <p>Rothschild: 'Buy when there's blood in the streets'</p>
          <p>Right now: Not enough blood yet (${currentPrice} vs ${targetPrice})</p>
        </div>

        <div className="mb-3">
          <p>Peter Lynch: 'Know what you own'</p>
          <p>Right now: Too much uncertainty</p>
        </div>

        <div className="mb-3">
          <p>Warren Buffett: 'Price is what you pay, value is what you get'</p>
          <p>Right now: Price too high vs uncertain value</p>
        </div>
      </div>
    </div>
  );
};

export default WisdomQuoteCard;
