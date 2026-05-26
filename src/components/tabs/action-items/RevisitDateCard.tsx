import React from 'react';

/**
 * RevisitDateCard displays a recommended revisit date 6 months from now
 * with a list of conditions to check and a "Set Reminder" button.
 */
export const RevisitDateCard: React.FC = () => {
  const revisitDate = new Date();
  revisitDate.setMonth(revisitDate.getMonth() + 6);

  const formattedDate = revisitDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-semibold mb-4">📆 Check Back Later</h2>
      <p className="text-lg">Recommended: Revisit in 6 months</p>
      <p className="text-gray-400 mt-1 mb-4">{formattedDate}</p>
      <p className="text-gray-300 mb-2">By then, we'll know if:</p>
      <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
        <li>Revenue started</li>
        <li>Market conditions changed</li>
        <li>Technical setup improved</li>
      </ul>
      <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white">
        Set Reminder
      </button>
    </div>
  );
};

export default RevisitDateCard;
