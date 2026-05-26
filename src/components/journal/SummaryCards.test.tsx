import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SummaryCards from './SummaryCards';
import type { JournalMetrics } from '../../utils/journalCalculations';

describe('SummaryCards', () => {
  it('displays all four cards with metrics when closed decisions exist', () => {
    const metrics: JournalMetrics = {
      totalDecisions: 12,
      winRate: 66.7,
      avgReturn: 8.3,
      bestTrade: { ticker: 'AAPL', returnPct: 25.4 },
    };

    render(<SummaryCards metrics={metrics} />);

    expect(screen.getByText('Total Decisions')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('66.7%')).toBeInTheDocument();
    expect(screen.getByText('Avg Return')).toBeInTheDocument();
    expect(screen.getByText('+8.3%')).toBeInTheDocument();
    expect(screen.getByText('Best Trade')).toBeInTheDocument();
    expect(screen.getByText('AAPL +25.4%')).toBeInTheDocument();
  });

  it('displays dash values when metrics are null (no closed decisions)', () => {
    const metrics: JournalMetrics = {
      totalDecisions: 5,
      winRate: null,
      avgReturn: null,
      bestTrade: null,
    };

    render(<SummaryCards metrics={metrics} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    // Win Rate, Avg Return, Best Trade should show dashes
    const dashes = screen.getAllByText('—');
    expect(dashes).toHaveLength(3);
  });

  it('displays negative avg return without extra plus sign', () => {
    const metrics: JournalMetrics = {
      totalDecisions: 3,
      winRate: 33.3,
      avgReturn: -5.2,
      bestTrade: { ticker: 'TSLA', returnPct: 10.0 },
    };

    render(<SummaryCards metrics={metrics} />);

    expect(screen.getByText('-5.2%')).toBeInTheDocument();
  });

  it('renders responsive grid classes', () => {
    const metrics: JournalMetrics = {
      totalDecisions: 0,
      winRate: null,
      avgReturn: null,
      bestTrade: null,
    };

    const { container } = render(<SummaryCards metrics={metrics} />);
    const grid = container.firstElementChild;
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-4');
  });
});
