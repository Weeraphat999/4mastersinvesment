import { useState } from 'react';

interface CatalystChecklistProps {
  ticker: string;
  verdict: string;
}

const CATALYST_ITEMS = [
  'First revenue announced',
  'Major partnership (e.g., with tech giant)',
  'Sector recovery (sentiment improves)',
  'Technical reversal (price crosses EMA 50)',
  'Insider buying increases',
];

export default function CatalystChecklist({ ticker: _ticker, verdict: _verdict }: CatalystChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-semibold mb-4">⏰ Wait For These Events</h2>
      <div>
        {CATALYST_ITEMS.map((item) => (
          <div
            key={item}
            onClick={() => toggleItem(item)}
            className="text-lg py-2 cursor-pointer flex items-center gap-3"
          >
            <span>{checkedItems[item] ? '☑' : '☐'}</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white mt-4">
        Enable Catalyst Alerts
      </button>
    </div>
  );
}
