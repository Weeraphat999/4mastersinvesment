import React from 'react';

interface QuickFact {
  label: string;
  value: string;
}

interface QuickFactsCardProps {
  facts: QuickFact[];
}

const factIcons: Record<string, string> = {
  'Market Cap': '💰',
  'Price/Sales': '📊',
  'Cash Runway': '🏦',
  'Sector': '🏭',
  '52-Week Range': '📈',
  'Moat': '🏰',
  'Profit Margin': '💵',
  'Debt/Equity': '⚖️',
};

const getValueColor = (label: string, value: string): string => {
  if (label === 'Profit Margin') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (num > 15) return 'text-green-400';
      if (num > 0) return 'text-yellow-400';
      return 'text-red-400';
    }
  }
  if (label === 'Debt/Equity') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (num < 0.5) return 'text-green-400';
      if (num < 1.5) return 'text-yellow-400';
      return 'text-red-400';
    }
  }
  if (label === 'Moat') {
    if (value.includes('Strong')) return 'text-green-400';
    if (value.includes('Moderate')) return 'text-yellow-400';
    if (value.includes('Weak')) return 'text-red-400';
  }
  return 'text-white';
};

const QuickFactsCard: React.FC<QuickFactsCardProps> = ({ facts }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-3">📋 QUICK FACTS</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="bg-gray-800/80 backdrop-blur rounded-xl p-4 border border-gray-700 hover:bg-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span className="text-2xl">{factIcons[fact.label] || '📌'}</span>
            <p className="text-xs uppercase text-gray-400 tracking-wider mt-2 font-medium">{fact.label}</p>
            <p className={`text-lg font-bold mt-1 ${getValueColor(fact.label, fact.value)}`}>{fact.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickFactsCard;
