import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchAutocomplete from './SearchAutocomplete';

// Mock the yahooFinanceService
vi.mock('../services/yahooFinanceService', () => ({
  searchTickers: vi.fn(),
}));

import { searchTickers } from '../services/yahooFinanceService';

const mockSearchTickers = vi.mocked(searchTickers);

describe('SearchAutocomplete', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSearch: vi.fn(),
  };

  beforeEach(() => {
    mockSearchTickers.mockReset();
  });

  it('renders the input with correct placeholder', () => {
    render(<SearchAutocomplete {...defaultProps} />);
    expect(
      screen.getByPlaceholderText('Enter stock ticker (e.g., QTUM, AAPL, NVDA)')
    ).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<SearchAutocomplete {...defaultProps} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'AA' } });
    expect(onChange).toHaveBeenCalledWith('AA');
  });

  it('triggers onSearch on Enter key with non-empty value', () => {
    const onSearch = vi.fn();
    render(<SearchAutocomplete value="AAPL" onChange={vi.fn()} onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('AAPL');
  });

  it('does NOT trigger onSearch on Enter key with empty value', () => {
    const onSearch = vi.fn();
    render(<SearchAutocomplete value="" onChange={vi.fn()} onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does not show dropdown when input has fewer than 2 characters', () => {
    render(<SearchAutocomplete value="A" onChange={vi.fn()} onSearch={vi.fn()} />);
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
    expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
  });

  it('debounces search API calls by 300ms', async () => {
    mockSearchTickers.mockResolvedValue([
      { symbol: 'AAPL', shortname: 'Apple Inc.', exchange: 'NMS', quoteType: 'EQUITY' },
    ]);

    render(<SearchAutocomplete value="AA" onChange={vi.fn()} onSearch={vi.fn()} />);

    // Should not call immediately
    expect(mockSearchTickers).not.toHaveBeenCalled();

    // Wait for debounce to fire (300ms + buffer)
    await waitFor(() => {
      expect(mockSearchTickers).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });

    expect(mockSearchTickers).toHaveBeenCalledWith('AA');
  });

  it('shows dropdown with results when API returns matches', async () => {
    mockSearchTickers.mockResolvedValue([
      { symbol: 'AAPL', shortname: 'Apple Inc.', exchange: 'NMS', quoteType: 'EQUITY' },
      { symbol: 'AMZN', shortname: 'Amazon.com Inc.', exchange: 'NMS', quoteType: 'EQUITY' },
    ]);

    render(<SearchAutocomplete value="AA" onChange={vi.fn()} onSearch={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    }, { timeout: 1000 });

    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('AMZN')).toBeInTheDocument();
    expect(screen.getByText('Amazon.com Inc.')).toBeInTheDocument();
  });

  it('displays ticker symbol, company name, and exchange for each result', async () => {
    mockSearchTickers.mockResolvedValue([
      { symbol: 'TSLA', shortname: 'Tesla Inc.', exchange: 'NMS', quoteType: 'EQUITY' },
    ]);

    render(<SearchAutocomplete value="TS" onChange={vi.fn()} onSearch={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('TSLA')).toBeInTheDocument();
    }, { timeout: 1000 });

    expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
    expect(screen.getByText('NMS')).toBeInTheDocument();
  });

  it('shows "No results found" when API returns empty array', async () => {
    mockSearchTickers.mockResolvedValue([]);

    render(<SearchAutocomplete value="XYZ" onChange={vi.fn()} onSearch={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('selecting an item populates input and triggers onSearch', async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    mockSearchTickers.mockResolvedValue([
      { symbol: 'AAPL', shortname: 'Apple Inc.', exchange: 'NMS', quoteType: 'EQUITY' },
    ]);

    render(<SearchAutocomplete value="AA" onChange={onChange} onSearch={onSearch} />);

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.click(screen.getByText('AAPL'));

    expect(onChange).toHaveBeenCalledWith('AAPL');
    expect(onSearch).toHaveBeenCalledWith('AAPL');
  });

  it('hides dropdown when user clicks outside', async () => {
    mockSearchTickers.mockResolvedValue([
      { symbol: 'AAPL', shortname: 'Apple Inc.', exchange: 'NMS', quoteType: 'EQUITY' },
    ]);

    render(
      <div>
        <SearchAutocomplete value="AA" onChange={vi.fn()} onSearch={vi.fn()} />
        <button>Outside</button>
      </div>
    );

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Click outside the component
    act(() => {
      fireEvent.mouseDown(screen.getByText('Outside'));
    });

    expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
  });

  it('hides dropdown when input has fewer than 2 characters', async () => {
    mockSearchTickers.mockResolvedValue([
      { symbol: 'AAPL', shortname: 'Apple Inc.', exchange: 'NMS', quoteType: 'EQUITY' },
    ]);

    const { rerender } = render(
      <SearchAutocomplete value="AA" onChange={vi.fn()} onSearch={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Rerender with fewer than 2 chars
    rerender(<SearchAutocomplete value="A" onChange={vi.fn()} onSearch={vi.fn()} />);

    expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
  });

  it('shows loading spinner while searching', async () => {
    // Make searchTickers return a pending promise that never resolves
    mockSearchTickers.mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    render(<SearchAutocomplete value="AA" onChange={vi.fn()} onSearch={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
