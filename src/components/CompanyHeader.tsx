import React from 'react';

interface CompanyHeaderProps {
  ticker: string;
  companyName: string;
  price: number;
  priceChange: number; // percentage, negative = down
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ ticker, companyName, price, priceChange }) => {
  const isPositive = priceChange >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white">
        {ticker} - {companyName}
      </h2>
      <div className="flex items-baseline gap-3 mt-2">
        <span className="text-4xl font-bold text-white">
          ${price.toFixed(2)}
        </span>
        <span className={`text-xl font-semibold ${colorClass}`}>
          {arrow} {Math.abs(priceChange).toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default CompanyHeader;
