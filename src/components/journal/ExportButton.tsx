import { useState } from 'react';
import type { DecisionEntry } from '../../data/types';
import { generateCsvContent, generateJsonContent, generateExportFilename } from '../../utils/journalExport';
import { downloadFile } from '../../utils/downloadFile';

interface ExportButtonProps {
  decisions: DecisionEntry[];
}

export default function ExportButton({ decisions }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCsv = () => {
    const content = generateCsvContent(decisions);
    const filename = generateExportFilename('csv');
    downloadFile(content, filename, 'text/csv');
    setIsOpen(false);
  };

  const handleExportJson = () => {
    const content = generateJsonContent(decisions);
    const filename = generateExportFilename('json');
    downloadFile(content, filename, 'application/json');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-gray-700 rounded-lg shadow-lg z-10">
          <button
            onClick={handleExportCsv}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 rounded-t-lg transition-colors"
          >
            Export as CSV
          </button>
          <button
            onClick={handleExportJson}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 rounded-b-lg transition-colors"
          >
            Export as JSON
          </button>
        </div>
      )}
    </div>
  );
}
