import { useState } from 'react';
import { loadFromStorage, saveToStorage } from '../../../utils/storageUtils';

interface WatchlistCardProps {
  ticker: string;
  companyName: string;
}

export default function WatchlistCard({ ticker, companyName: _companyName }: WatchlistCardProps) {
  const [added, setAdded] = useState(false);

  const handleAddToWatchlist = () => {
    const watchlist = loadFromStorage<string[]>('watchlist', []);
    if (!watchlist.includes(ticker)) {
      watchlist.push(ticker);
      saveToStorage('watchlist', watchlist);
    }
    setAdded(true);
  };

  return (
    <div className="text-center p-8 bg-gray-800 rounded-lg mb-4">
      <p className="text-xl">👀 Add {ticker} to your watchlist</p>
      <p className="text-gray-400">Get notified when conditions improve</p>
      {added ? (
        <p className="mt-4">✅ Added!</p>
      ) : (
        <button
          onClick={handleAddToWatchlist}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 mt-4"
        >
          Add to Watchlist
        </button>
      )}
    </div>
  );
}
