import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import CompanyHeader from './CompanyHeader';

describe('CompanyHeader unit tests', () => {
  it('displays ticker and company name', () => {
    render(
      <CompanyHeader ticker="AAPL" companyName="Apple Inc." price={150.25} priceChange={2.5} />
    );
    expect(screen.getByText('AAPL - Apple Inc.')).toBeInTheDocument();
  });

  it('displays formatted price with dollar sign and two decimals', () => {
    render(
      <CompanyHeader ticker="NVDA" companyName="NVIDIA Corp." price={875.5} priceChange={1.2} />
    );
    expect(screen.getByText('$875.50')).toBeInTheDocument();
  });

  it('renders green ▲ for positive price change', () => {
    const { container } = render(
      <CompanyHeader ticker="TEST" companyName="Test Corp." price={100} priceChange={3.45} />
    );
    const indicator = container.querySelector('.text-green-500');
    expect(indicator).not.toBeNull();
    expect(indicator!.textContent).toContain('▲');
    expect(indicator!.textContent).toContain('3.45%');
  });

  it('renders red ▼ for negative price change', () => {
    const { container } = render(
      <CompanyHeader ticker="TEST" companyName="Test Corp." price={100} priceChange={-2.1} />
    );
    const indicator = container.querySelector('.text-red-500');
    expect(indicator).not.toBeNull();
    expect(indicator!.textContent).toContain('▼');
    expect(indicator!.textContent).toContain('2.10%');
  });
});

// Feature: four-masters-investor, Property 5: Price change indicator correctness
describe('Property 5: Price change indicator correctness', () => {
  /**
   * Validates: Requirements 5.3, 5.4
   *
   * For any priceChange value, the CompanyHeader component SHALL render
   * a down arrow (▼) with text-red-500 class when priceChange < 0,
   * and an up arrow (▲) with text-green-500 class when priceChange > 0.
   */
  it('renders ▼ with text-red-500 for any negative priceChange', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: -0.01, noNaN: true }),
        (priceChange: number) => {
          const { container } = render(
            <CompanyHeader
              ticker="TEST"
              companyName="Test Corp."
              price={100}
              priceChange={priceChange}
            />
          );

          const indicator = container.querySelector('.text-red-500');
          expect(indicator).not.toBeNull();
          expect(indicator!.textContent).toContain('▼');
          expect(container.querySelector('.text-green-500')).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('renders ▲ with text-green-500 for any positive priceChange', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        (priceChange: number) => {
          const { container } = render(
            <CompanyHeader
              ticker="TEST"
              companyName="Test Corp."
              price={100}
              priceChange={priceChange}
            />
          );

          const indicator = container.querySelector('.text-green-500');
          expect(indicator).not.toBeNull();
          expect(indicator!.textContent).toContain('▲');
          expect(container.querySelector('.text-red-500')).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
