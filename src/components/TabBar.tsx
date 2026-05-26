import React from 'react';

export type TabId = 'buffett' | 'munger' | 'lynch' | 'rothschild' | 'technical' | 'actions';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'buffett', label: 'Buffett', icon: '🎩' },
  { id: 'munger', label: 'Munger', icon: '🧠' },
  { id: 'lynch', label: 'Lynch', icon: '🔍' },
  { id: 'rothschild', label: 'Rothschild', icon: '🌍' },
  { id: 'technical', label: 'Technical', icon: '📈' },
  { id: 'actions', label: 'Actions', icon: '⚡' },
];

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="sticky top-0 bg-gray-800 z-10 overflow-x-auto whitespace-nowrap rounded-t-lg">
      <div className="flex gap-1 p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                isActive
                  ? tab.id === 'actions'
                    ? 'bg-red-500 text-white font-semibold shadow-md'
                    : 'bg-blue-500 text-white font-semibold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              onClick={() => onTabChange(tab.id)}
              aria-selected={isActive}
              role="tab"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;
