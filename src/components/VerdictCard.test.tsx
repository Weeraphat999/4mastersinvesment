import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerdictCard from './VerdictCard';

describe('VerdictCard unit tests', () => {
  const defaultProps = {
    verdict: 'STRONG BUY',
    positionSize: '5% of portfolio',
    entryStrategy: 'Dollar-cost average over 3 months',
    riskLevel: 'High',
    timeHorizon: '3-5 years',
  };

  it('displays "🎯 FINAL VERDICT" title', () => {
    render(<VerdictCard {...defaultProps} />);
    expect(screen.getByText('🎯 FINAL VERDICT')).toBeInTheDocument();
  });

  it('displays verdict text', () => {
    render(<VerdictCard {...defaultProps} />);
    expect(screen.getByText('STRONG BUY')).toBeInTheDocument();
  });

  it('displays position size', () => {
    render(<VerdictCard {...defaultProps} />);
    expect(screen.getByText('5% of portfolio')).toBeInTheDocument();
  });

  it('displays entry strategy', () => {
    render(<VerdictCard {...defaultProps} />);
    expect(screen.getByText('Dollar-cost average over 3 months')).toBeInTheDocument();
  });

  it('displays risk level with ⚠️', () => {
    const { container } = render(<VerdictCard {...defaultProps} />);
    const riskText = container.textContent;
    expect(riskText).toContain('⚠️');
    expect(riskText).toContain('High');
  });

  it('displays time horizon', () => {
    render(<VerdictCard {...defaultProps} />);
    expect(screen.getByText('3-5 years')).toBeInTheDocument();
  });
});
