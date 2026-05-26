import { useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../../../utils/storageUtils';

interface AlertsChecklistProps {
  ticker: string;
}

const ALERT_ITEMS = [
  'Price drops below buy zone',
  'Price rises above resistance',
  'First revenue milestone',
  'Insider selling detected',
  'Share dilution event',
];

export default function AlertsChecklist({ ticker }: AlertsChecklistProps) {
  const [checkedAlerts, setCheckedAlerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = loadFromStorage<Record<string, boolean>>(`alert_preferences_${ticker}`, {});
    setCheckedAlerts(saved);
  }, [ticker]);

  const toggleAlert = (alert: string) => {
    const updated = { ...checkedAlerts, [alert]: !checkedAlerts[alert] };
    setCheckedAlerts(updated);
    saveToStorage(`alert_preferences_${ticker}`, updated);
  };

  const enableAll = () => {
    const allEnabled: Record<string, boolean> = {};
    ALERT_ITEMS.forEach((item) => {
      allEnabled[item] = true;
    });
    setCheckedAlerts(allEnabled);
    saveToStorage(`alert_preferences_${ticker}`, allEnabled);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-semibold mb-4">🔔 Set These Alerts</h2>
      <div className="space-y-3">
        {ALERT_ITEMS.map((alert) => (
          <div
            key={alert}
            onClick={() => toggleAlert(alert)}
            className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                checkedAlerts[alert]
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-500'
              }`}
            >
              {checkedAlerts[alert] && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-lg ${checkedAlerts[alert] ? 'line-through text-gray-400' : 'text-white'}`}>
              {alert}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={enableAll}
        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white mt-4"
      >
        Enable All Alerts
      </button>
    </div>
  );
}
