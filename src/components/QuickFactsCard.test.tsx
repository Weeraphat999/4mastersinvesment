import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuickFactsCard from './QuickFactsCard';

describe('QuickFactsCard unit tests', () => {
  const allFacts = [
    { label: 'Market Cap', value: '$2.5T' },
    { label: 'Price/Sales', value: '12.3x' },
    { label: 'Cash Runway', value: '10+ years' },
    { label: 'Sector', value: 'Technology' },
    { label: '52-Week Range', value: '$120 - $200' },
    { label: 'Moat', value: 'Wide' },
    { label: 'Profit Margin', value: '25.4%' },
    { label: 'Debt/Equity', value: '0.45' },
  ];

  it('renders all 8 fact labels', () => {
    render(<QuickFactsCard facts={allFacts} />);
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText('Price/Sales')).toBeInTheDocument();
    expect(screen.getByText('Cash Runway')).toBeInTheDocument();
    expect(screen.getByText('Sector')).toBeInTheDocument();
    expect(screen.getByText('52-Week Range')).toBeInTheDocument();
    expect(screen.getByText('Moat')).toBeInTheDocument();
    expect(screen.getByText('Profit Margin')).toBeInTheDocument();
    expect(screen.getByText('Debt/Equity')).toBeInTheDocument();
  });

  it('renders all 8 fact values', () => {
    render(<QuickFactsCard facts={allFacts} />);
    expect(screen.getByText('$2.5T')).toBeInTheDocument();
    expect(screen.getByText('12.3x')).toBeInTheDocument();
    expect(screen.getByText('10+ years')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('$120 - $200')).toBeInTheDocument();
    expect(screen.getByText('Wide')).toBeInTheDocument();
    expect(screen.getByText('25.4%')).toBeInTheDocument();
    expect(screen.getByText('0.45')).toBeInTheDocument();
  });
});
