import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import MasterScoresCard from './MasterScoresCard';

describe('MasterScoresCard unit tests', () => {
  const defaultScores = [
    { name: 'Buffett', score: 8.5, color: 'bg-blue-500' },
    { name: 'Munger', score: 7.2, color: 'bg-purple-500' },
    { name: 'Lynch', score: 6.8, color: 'bg-green-500' },
    { name: 'Rothschild', score: 9.1, color: 'bg-yellow-500' },
  ];

  it('renders four bars with correct colors', () => {
    const { container } = render(
      <MasterScoresCard scores={defaultScores} overallScore={7.9} />
    );
    expect(container.querySelector('.bg-blue-500')).not.toBeNull();
    expect(container.querySelector('.bg-purple-500')).not.toBeNull();
    expect(container.querySelector('.bg-green-500')).not.toBeNull();
    expect(container.querySelector('.bg-yellow-500')).not.toBeNull();
  });

  it('displays all master names', () => {
    render(<MasterScoresCard scores={defaultScores} overallScore={7.9} />);
    expect(screen.getByText('Buffett')).toBeInTheDocument();
    expect(screen.getByText('Munger')).toBeInTheDocument();
    expect(screen.getByText('Lynch')).toBeInTheDocument();
    expect(screen.getByText('Rothschild')).toBeInTheDocument();
  });

  it('shows overall score', () => {
    render(<MasterScoresCard scores={defaultScores} overallScore={7.9} />);
    expect(screen.getByText('Overall')).toBeInTheDocument();
    expect(screen.getByText('7.9')).toBeInTheDocument();
  });
});

// Feature: four-masters-investor, Property 6: Score bar proportionality
describe('Property 6: Score bar proportionality', () => {
  /**
   * Validates: Requirements 7.4, 7.5
   *
   * For any score value in the range [0, 10], the rendered score bar
   * width percentage SHALL equal (score / 10) * 100.
   */
  it('renders bar width equal to (score / 10) * 100 percent for all scores in [0, 10]', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 10, noNaN: true }),
        fc.double({ min: 0, max: 10, noNaN: true }),
        fc.double({ min: 0, max: 10, noNaN: true }),
        fc.double({ min: 0, max: 10, noNaN: true }),
        fc.double({ min: 0, max: 10, noNaN: true }),
        (buffettScore, mungerScore, lynchScore, rothschildScore, overallScore) => {
          const scores = [
            { name: 'Buffett', score: buffettScore, color: 'bg-blue-500' },
            { name: 'Munger', score: mungerScore, color: 'bg-purple-500' },
            { name: 'Lynch', score: lynchScore, color: 'bg-green-500' },
            { name: 'Rothschild', score: rothschildScore, color: 'bg-yellow-500' },
          ];

          const { container } = render(
            <MasterScoresCard scores={scores} overallScore={overallScore} />
          );

          // Find all bar fill elements (divs with inline width style inside the progress bars)
          const barFills = container.querySelectorAll<HTMLElement>('[style*="width"]');

          // There should be 5 bars: 4 master scores + 1 overall
          expect(barFills.length).toBe(5);

          // Verify each master score bar width
          const allScores = [...scores.map(s => s.score), overallScore];
          barFills.forEach((barFill, index) => {
            const expectedWidth = `${(allScores[index] / 10) * 100}%`;
            expect(barFill.style.width).toBe(expectedWidth);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
