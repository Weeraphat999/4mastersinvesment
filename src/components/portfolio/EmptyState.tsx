interface EmptyStateProps {
  onAddFirst: () => void;
}

export default function EmptyState({ onAddFirst }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="bg-gray-800 rounded-xl p-10 text-center max-w-md shadow-lg">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-white mb-3">No Holdings Yet</h3>
        <p className="text-gray-400 mb-6">
          Start tracking your portfolio by adding your first position above.
        </p>
        <button
          onClick={onAddFirst}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          ➕ Add Your First Holding
        </button>
      </div>
    </div>
  );
}
