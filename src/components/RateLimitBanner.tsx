import React from 'react';

interface RateLimitBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

const RateLimitBanner: React.FC<RateLimitBannerProps> = ({ visible, onDismiss }) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      role="alert"
      className="w-full bg-yellow-900/50 border border-yellow-600 text-yellow-200 px-4 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 text-lg" aria-hidden="true">⚠️</span>
        <p className="text-sm">
          Daily API limit reached (25 requests). Showing cached or estimated data.
        </p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss rate limit warning"
        className="text-yellow-400 hover:text-yellow-200 text-xl font-bold leading-none px-2"
      >
        ×
      </button>
    </div>
  );
};

export default RateLimitBanner;
