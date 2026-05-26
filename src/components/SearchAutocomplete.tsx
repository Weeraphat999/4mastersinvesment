import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchTickers } from '../services/yahooFinanceService';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (ticker: string) => void;
}

interface AutocompleteItem {
  symbol: string;
  name: string;
  exchange: string;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ value, onChange, onSearch }) => {
  const [results, setResults] = useState<AutocompleteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setShowDropdown(true);
    try {
      const searchResults = await searchTickers(query);
      const items: AutocompleteItem[] = searchResults.map((r) => ({
        symbol: r.symbol,
        name: r.shortname,
        exchange: r.exchange,
      }));
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search when input has 2+ characters
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (value.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(value.trim());
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [value, performSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() !== '') {
      setShowDropdown(false);
      onSearch(value.trim());
    }
  };

  const handleSelect = (item: AutocompleteItem) => {
    onChange(item.symbol);
    setShowDropdown(false);
    onSearch(item.symbol);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter ticker (e.g., AAPL, NVDA, IONQ)"
        className="w-full text-lg sm:text-xl rounded-lg p-3 sm:p-4 border-2 border-blue-500 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
        autoComplete="off"
        autoCapitalize="characters"
      />

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <svg
                className="animate-spin h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="ml-2 text-gray-400">Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-400 text-sm">No results found</p>
              <p className="text-gray-500 text-xs mt-1">Press Enter to search for "{value.toUpperCase()}" directly</p>
            </div>
          ) : (
            <ul>
              {results.map((item) => (
                <li
                  key={`${item.symbol}-${item.exchange}`}
                  onClick={() => handleSelect(item)}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">{item.symbol}</span>
                      <span className="ml-2 text-gray-400 text-sm">{item.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.exchange}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
