import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Disclaimer } from './Disclaimer';

describe('Disclaimer', () => {
  it('renders the disclaimer text "This is not investment advice"', () => {
    render(<Disclaimer />);
    expect(screen.getByText(/This is not investment advice/)).toBeInTheDocument();
  });

  it('renders as a footer element', () => {
    render(<Disclaimer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('has appropriate styling classes', () => {
    render(<Disclaimer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('text-center', 'text-gray-500', 'text-sm', 'py-4', 'border-t', 'border-gray-700', 'mt-8');
  });
});
