interface FloatingActionButtonsProps {
  onExportCSV: () => void;
  onRefreshPrices: () => void;
  onSettings: () => void;
  isRefreshing?: boolean;
}

export default function FloatingActionButtons({ onExportCSV, onRefreshPrices, onSettings, isRefreshing = false }: FloatingActionButtonsProps) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      <button
        onClick={onExportCSV}
        className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-500 shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-xl"
        title="Export CSV"
      >
        📊
      </button>
      <button
        onClick={onRefreshPrices}
        disabled={isRefreshing}
        className={`h-14 w-14 rounded-full shadow-lg transition-transform flex items-center justify-center text-xl ${
          isRefreshing
            ? 'bg-green-800 cursor-wait animate-spin'
            : 'bg-green-600 hover:bg-green-500 hover:scale-110'
        }`}
        title={isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
      >
        🔄
      </button>
      <button
        onClick={onSettings}
        className="h-14 w-14 rounded-full bg-gray-600 hover:bg-gray-500 shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-xl"
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
}
