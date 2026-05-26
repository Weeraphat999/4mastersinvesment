import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NewSearchButton from './NewSearchButton';

describe('NewSearchButton unit tests', () => {
  it('renders button text', () => {
    render(<NewSearchButton onClick={() => {}} />);
    expect(screen.getByText('New Search')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<NewSearchButton onClick={handleClick} />);
    fireEvent.click(screen.getByText('New Search'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
