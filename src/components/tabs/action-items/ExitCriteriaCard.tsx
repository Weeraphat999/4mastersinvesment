interface ExitCriteriaCardProps {
  riskLevel: string;
}

export function ExitCriteriaCard({ riskLevel }: ExitCriteriaCardProps) {
  const baseConditions = [
    'Technology fundamentally broken (experts consensus)',
    'Company runs out of cash, bad financing terms',
    'Competition clearly winning (market share lost)',
    'Your investment thesis invalidated',
    'Management scandal or major change',
  ];

  const isHighRisk = riskLevel.toLowerCase() === 'high';

  return (
    <div className="bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-semibold text-red-400 mb-4">⛔ Sell If...</h2>

      <ul className="space-y-2">
        {baseConditions.map((condition) => (
          <li key={condition} className="flex items-start gap-2">
            <span>❌</span>
            <span>{condition}</span>
          </li>
        ))}
        {isHighRisk && (
          <li className="flex items-start gap-2">
            <span>❌</span>
            <span>Price drops 30% below entry (tight stop-loss)</span>
          </li>
        )}
      </ul>

      <p className="text-gray-400 italic mt-4">
        Set these as mental stop-losses, not just price targets
      </p>
    </div>
  );
}
