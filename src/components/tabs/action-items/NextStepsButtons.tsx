interface NextStepsButtonsProps {
  onSaveToJournal: () => void;
  onExportPlan: () => void;
  onSetAlerts: () => void;
}

export function NextStepsButtons({
  onSaveToJournal,
  onExportPlan,
  onSetAlerts,
}: NextStepsButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
      <button
        onClick={onSaveToJournal}
        className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 min-h-[48px] w-full sm:w-auto"
      >
        💾 Save to Journal
      </button>
      <button
        onClick={onExportPlan}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 min-h-[48px] w-full sm:w-auto"
      >
        📋 Export Plan
      </button>
      <button
        onClick={onSetAlerts}
        className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-semibold text-gray-900 transition-all duration-300 min-h-[48px] w-full sm:w-auto"
      >
        🔔 Set Alerts
      </button>
    </div>
  );
}
