import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExampleButtons from './ExampleButtons';

describe('ExampleButtons', () => {
  it('renders three buttons with tickers QTUM, AAPL, and NVDA', () => {
    render(<ExampleButtons onSelect={vi.fn()} />);
    expect(screen.getByText('QTUM')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('NVDA')).toBeInTheDocument();
  });

  it('calls onSelect with "QTUM" when the QTUM button is clicked', () => {
    const onSelect = vi.fn();
    render(<ExampleButtons onSelect={onSelect} />);
    fireEvent.click(screen.getByText('QTUM'));
    expect(onSelect).toHaveBeenCalledWith('QTUM');
  });

  it('calls onSelect with "AAPL" when the AAPL button is clicked', () => {
    const onSelect = vi.fn();
    render(<ExampleButtons onSelect={onSelect} />);
    fireEvent.click(screen.getByText('AAPL'));
    expect(onSelect).toHaveBeenCalledWith('AAPL');
  });

  it('calls onSelect with "NVDA" when the NVDA button is clicked', () => {
    const onSelect = vi.fn();
    render(<ExampleButtons onSelect={onSelect} />);
    fireEvent.click(screen.getByText('NVDA'));
    expect(onSelect).toHaveBeenCalledWith('NVDA');
  });

  it('renders exactly three buttons', () => {
    render(<ExampleButtons onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });
});
