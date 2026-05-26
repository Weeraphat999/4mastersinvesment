import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSearch: vi.fn(),
  };

  it('displays the correct placeholder text', () => {
    render(<SearchInput {...defaultProps} />);
    expect(
      screen.getByPlaceholderText('Enter stock ticker (e.g., QTUM, AAPL, NVDA)')
    ).toBeInTheDocument();
  });

  it('triggers onSearch with trimmed value when Enter is pressed with non-empty input', () => {
    const onSearch = vi.fn();
    render(<SearchInput value="AAPL" onChange={vi.fn()} onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('AAPL');
  });

  it('does NOT trigger onSearch when Enter is pressed with empty input', () => {
    const onSearch = vi.fn();
    render(<SearchInput value="" onChange={vi.fn()} onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does NOT trigger onSearch when Enter is pressed with whitespace-only input', () => {
    const onSearch = vi.fn();
    render(<SearchInput value="   " onChange={vi.fn()} onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('calls onChange when the input value changes', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} onSearch={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'NVDA' } });
    expect(onChange).toHaveBeenCalledWith('NVDA');
  });
});
