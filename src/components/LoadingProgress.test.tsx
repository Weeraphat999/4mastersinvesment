import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingProgress from './LoadingProgress';
import type { AnalysisStage } from '../services/types';

const mockStages: AnalysisStage[] = [
  { id: 'quote', label: 'Fetching Quote', status: 'success' },
  { id: 'historical', label: 'Fetching Historical Data', status: 'success' },
  { id: 'financials', label: 'Fetching Financials', status: 'loading' },
  { id: 'indicators', label: 'Computing Indicators', status: 'pending' },
  { id: 'scoring', label: 'Scoring Analysis', status: 'pending' },
];

describe('LoadingProgress', () => {
  it('renders all 5 stages with their labels', () => {
    render(<LoadingProgress stages={mockStages} currentStageIndex={2} />);

    expect(screen.getByText('Fetching Quote')).toBeInTheDocument();
    expect(screen.getByText('Fetching Historical Data')).toBeInTheDocument();
    expect(screen.getByText('Fetching Financials')).toBeInTheDocument();
    expect(screen.getByText('Computing Indicators')).toBeInTheDocument();
    expect(screen.getByText('Scoring Analysis')).toBeInTheDocument();
  });

  it('renders success icon (✓) for completed stages', () => {
    const { container } = render(<LoadingProgress stages={mockStages} currentStageIndex={2} />);

    const successIcons = container.querySelectorAll('.border-green-400');
    expect(successIcons.length).toBe(2);
    expect(successIcons[0].textContent).toContain('✓');
  });

  it('renders spinning icon for loading stage', () => {
    const { container } = render(<LoadingProgress stages={mockStages} currentStageIndex={2} />);

    const loadingIcon = container.querySelector('.animate-spin');
    expect(loadingIcon).not.toBeNull();
    expect(loadingIcon!.classList.contains('border-blue-400')).toBe(true);
  });

  it('renders gray circle for pending stages', () => {
    const { container } = render(<LoadingProgress stages={mockStages} currentStageIndex={2} />);

    const pendingIcons = container.querySelectorAll('.border-gray-500');
    expect(pendingIcons.length).toBe(2);
    expect(pendingIcons[0].textContent).toContain('○');
  });

  it('renders warning icon (⚠) for warning stages', () => {
    const warningStages: AnalysisStage[] = [
      { id: 'quote', label: 'Fetching Quote', status: 'success' },
      { id: 'historical', label: 'Fetching Historical Data', status: 'warning' },
      { id: 'financials', label: 'Fetching Financials', status: 'loading' },
      { id: 'indicators', label: 'Computing Indicators', status: 'pending' },
      { id: 'scoring', label: 'Scoring Analysis', status: 'pending' },
    ];

    const { container } = render(<LoadingProgress stages={warningStages} currentStageIndex={2} />);

    const warningIcon = container.querySelector('.border-yellow-400');
    expect(warningIcon).not.toBeNull();
    expect(warningIcon!.textContent).toContain('⚠');
  });

  it('highlights the current stage with scale transform', () => {
    const { container } = render(<LoadingProgress stages={mockStages} currentStageIndex={2} />);

    const listItems = container.querySelectorAll('li');
    expect(listItems[2].classList.contains('scale-105')).toBe(true);
    expect(listItems[0].classList.contains('scale-105')).toBe(false);
  });

  it('applies correct label colors based on status', () => {
    const { container } = render(<LoadingProgress stages={mockStages} currentStageIndex={2} />);

    const labels = container.querySelectorAll('li span:last-child');
    // success stages get green text
    expect(labels[0].classList.contains('text-green-400')).toBe(true);
    // loading + current stage gets blue text
    expect(labels[2].classList.contains('text-blue-400')).toBe(true);
    // pending stages get gray text
    expect(labels[3].classList.contains('text-gray-400')).toBe(true);
  });

  it('wraps content in a dark card container', () => {
    const { container } = render(<LoadingProgress stages={mockStages} currentStageIndex={0} />);

    const card = container.firstElementChild;
    expect(card!.classList.contains('bg-gray-800')).toBe(true);
    expect(card!.classList.contains('rounded-lg')).toBe(true);
    expect(card!.classList.contains('p-4')).toBe(true);
  });
});
