import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header', () => {
  it('renders the title text "🎯 4 Masters Investment Advisor"', () => {
    render(<Header />);
    expect(screen.getByText('🎯 4 Masters Investment Advisor')).toBeInTheDocument();
  });

  it('renders the title as an h1 element with correct styling classes', () => {
    render(<Header />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-2xl', 'font-bold');
  });

  it('renders a header element with full-width dark styling', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('w-full', 'bg-gray-900', 'text-white', 'p-6');
  });
});
