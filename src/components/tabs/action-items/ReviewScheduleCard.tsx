import React from 'react';
import { generateICSEvent } from '../../../utils/icsUtils';
import { downloadFile } from '../../../utils/downloadFile';

interface ReviewScheduleCardProps {
  ticker: string;
}

interface Checkpoint {
  months: number;
  label: string;
  description: string;
  date: Date;
}

function getCheckpoints(): Checkpoint[] {
  const now = new Date();

  const threeMonths = new Date(now);
  threeMonths.setMonth(threeMonths.getMonth() + 3);

  const sixMonths = new Date(now);
  sixMonths.setMonth(sixMonths.getMonth() + 6);

  const twelveMonths = new Date(now);
  twelveMonths.setMonth(twelveMonths.getMonth() + 12);

  return [
    {
      months: 3,
      label: '3-Month Review',
      description: 'Quick check: Is thesis still valid?',
      date: threeMonths,
    },
    {
      months: 6,
      label: '6-Month Review',
      description: 'Deep review: Performance vs expectations',
      date: sixMonths,
    },
    {
      months: 12,
      label: '12-Month Review',
      description: 'Major review: Hold/Add/Exit decision',
      date: twelveMonths,
    },
  ];
}

const ReviewScheduleCard: React.FC<ReviewScheduleCardProps> = ({ ticker }) => {
  const checkpoints = getCheckpoints();

  const handleAddToCalendar = (checkpoint: Checkpoint) => {
    const icsContent = generateICSEvent(ticker, checkpoint.label, checkpoint.date);
    const filename = `${ticker}_review_${checkpoint.months}m.ics`;
    downloadFile(icsContent, filename, 'text/calendar');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4">
      <h3 className="text-2xl font-semibold text-white mb-4">📅 Review Checkpoints</h3>

      {/* Timeline visual */}
      <div className="relative flex items-center justify-between mb-8 px-4">
        <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-gray-600 -translate-y-1/2" />
        {checkpoints.map((cp) => (
          <div key={cp.months} className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-300" />
            <span className="text-xs text-gray-400 mt-1">{cp.months}mo</span>
          </div>
        ))}
      </div>

      {/* Checkpoint details */}
      <div className="space-y-4">
        {checkpoints.map((cp) => (
          <div
            key={cp.months}
            className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
          >
            <div>
              <p className="text-white font-medium">
                {cp.date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-gray-400 text-sm">{cp.description}</p>
            </div>
            <button
              onClick={() => handleAddToCalendar(cp)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
            >
              Add to Calendar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewScheduleCard;
