import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (ticker: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onSearch }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() !== '') {
      onSearch(value.trim());
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Enter stock ticker (e.g., QTUM, AAPL, NVDA)"
      className="w-full text-xl rounded-lg p-4 border-2 border-blue-500 bg-gray-800 text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
    />
  );
};

export default SearchInput;
