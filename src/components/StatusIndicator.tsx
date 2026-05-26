import React from 'react';

interface StatusIndicatorProps {
  type: 'success' | 'error' | 'warning';
  children: React.ReactNode;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ type, children }) => {
  const config = {
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      dot: 'bg-green-500',
      symbol: '✓',
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      dot: 'bg-red-500',
      symbol: '×',
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      dot: 'bg-yellow-500',
      symbol: '!',
    },
  };

  const { bg, border, dot, symbol } = config[type];

  return (
    <div className={`flex items-center gap-3 ${bg} ${border} border rounded-lg px-3 py-2`}>
      <span className={`flex-shrink-0 w-6 h-6 rounded-full ${dot} flex items-center justify-center text-white text-xs font-bold`}>
        {symbol}
      </span>
      <span className="text-sm leading-relaxed">{children}</span>
    </div>
  );
};

export default StatusIndicator;
