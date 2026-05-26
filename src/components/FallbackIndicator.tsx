import type { DataSourceInfo } from '../services/types';

interface FallbackIndicatorProps {
  dataSource: DataSourceInfo;
}

type BadgeType = 'live' | 'cached' | 'estimated';

function determineBadgeType(dataSource: DataSourceInfo): BadgeType {
  const sources = [
    dataSource.quoteSource,
    dataSource.historicalSource,
    dataSource.financialsSource,
  ];

  if (sources.some((s) => s === 'fallback')) {
    return 'estimated';
  }

  if (sources.some((s) => s === 'cached')) {
    return 'cached';
  }

  return 'live';
}

const badgeConfig: Record<BadgeType, { label: string; dotClass: string; badgeClass: string }> = {
  live: {
    label: 'Live data',
    dotClass: 'bg-green-400',
    badgeClass: 'bg-green-900/50 text-green-400 border-green-600',
  },
  cached: {
    label: 'Cached data',
    dotClass: 'bg-blue-400',
    badgeClass: 'bg-blue-900/50 text-blue-400 border-blue-600',
  },
  estimated: {
    label: 'Estimated data',
    dotClass: 'bg-gray-400',
    badgeClass: 'bg-gray-700 text-gray-400 border-gray-600',
  },
};

export function FallbackIndicator({ dataSource }: FallbackIndicatorProps) {
  const badgeType = determineBadgeType(dataSource);

  // Only visible when at least one source is not 'live'
  if (badgeType === 'live') {
    return null;
  }

  const config = badgeConfig[badgeType];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${config.badgeClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

export default FallbackIndicator;
