import { useState } from 'react';
import type { DecisionEntry } from '../../data/types';
import type { DecisionUpdate } from './DecisionDetailModal';

interface UpdatesTabProps {
  entry: DecisionEntry;
  onSubmit: (update: DecisionUpdate) => void;
}

export default function UpdatesTab({ entry, onSubmit }: UpdatesTabProps) {
  const [status, setStatus] = useState<'active' | 'closed'>(entry.status);
  const [exitPrice, setExitPrice] = useState<string>(
    entry.status === 'closed' ? String(entry.currentPrice) : ''
  );
  const [actualOutcome, setActualOutcome] = useState<string>(entry.actualOutcome || '');
  const [lessonsLearned, setLessonsLearned] = useState<string>(entry.lessonsLearned || '');
  const [tagsInput, setTagsInput] = useState<string>('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const update: DecisionUpdate = {
      status,
      exitPrice: exitPrice ? Number(exitPrice) : null,
      actualOutcome,
      lessonsLearned,
      tags,
    };

    onSubmit(update);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase">Update Decision</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status dropdown */}
        <div>
          <label htmlFor="status" className="block text-sm text-gray-400 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'closed')}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Exit price input */}
        <div>
          <label htmlFor="exitPrice" className="block text-sm text-gray-400 mb-1">
            Exit Price
          </label>
          <input
            id="exitPrice"
            type="number"
            step="0.01"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            placeholder="Enter exit price"
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Actual outcome textarea */}
        <div>
          <label htmlFor="actualOutcome" className="block text-sm text-gray-400 mb-1">
            Actual Outcome
          </label>
          <textarea
            id="actualOutcome"
            value={actualOutcome}
            onChange={(e) => setActualOutcome(e.target.value)}
            placeholder="Describe the actual outcome of this decision"
            rows={3}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-vertical"
          />
        </div>

        {/* Lessons learned textarea */}
        <div>
          <label htmlFor="lessonsLearned" className="block text-sm text-gray-400 mb-1">
            Lessons Learned
          </label>
          <textarea
            id="lessonsLearned"
            value={lessonsLearned}
            onChange={(e) => setLessonsLearned(e.target.value)}
            placeholder="What did you learn from this decision?"
            rows={3}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-vertical"
          />
        </div>

        {/* Tags input */}
        <div>
          <label htmlFor="tags" className="block text-sm text-gray-400 mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. tech, growth, earnings-miss"
            className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
        >
          Save Update
        </button>
      </form>
    </div>
  );
}
