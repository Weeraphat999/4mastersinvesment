import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { getAnalysis } from './data/getAnalysis';
import { getDetailedAnalysis } from './data/getDetailedAnalysis';

// Mock yahooFinanceService to prevent real API calls from SearchAutocomplete
vi.mock('./services/yahooFinanceService', () => ({
  searchTickers: vi.fn(() => Promise.resolve([])),
  fetchQuote: vi.fn(() => Promise.resolve(null)),
  fetchHistorical: vi.fn(() => Promise.resolve([])),
}));

// Mock the analysisOrchestrator to avoid real API calls
vi.mock('./services/analysisOrchestrator', () => ({
  analyzeStock: vi.fn((ticker: string, onProgress: (p: unknown) => void) => {
    // Simulate progress callback with all stages complete
    onProgress({
      stages: [
        { id: 'quote', label: 'Fetching Quote', status: 'success' },
        { id: 'historical', label: 'Fetching Historical Data', status: 'success' },
        { id: 'financials', label: 'Fetching Financials', status: 'success' },
        { id: 'indicators', label: 'Computing Indicators', status: 'success' },
        { id: 'scoring', label: 'Scoring Analysis', status: 'success' },
      ],
      currentStageIndex: 4,
    });

    const normalizedTicker = ticker.trim().toUpperCase();

    return Promise.resolve({
      analysisResult: getAnalysis(normalizedTicker),
      detailedAnalysis: getDetailedAnalysis(normalizedTicker),
      dataSource: {
        quoteSource: 'live' as const,
        historicalSource: 'live' as const,
        financialsSource: 'live' as const,
        indicatorsComputed: true,
      },
    });
  }),
}));

describe('App integration - state transitions', () => {
  beforeEach(() => {
    // Mock scrollIntoView since jsdom doesn't implement it
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('search flow: enter ticker → press Enter → results appear with correct data', async () => {
    render(<App />);

    const input = screen.getByPlaceholderText('Enter stock ticker (e.g., QTUM, AAPL, NVDA)');
    fireEvent.change(input, { target: { value: 'AAPL' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Results should appear with correct company data (async)
    await waitFor(() => {
      expect(screen.getByText('AAPL - Apple Inc.')).toBeInTheDocument();
    });
    // Search input should no longer be visible
    expect(screen.queryByPlaceholderText('Enter stock ticker (e.g., QTUM, AAPL, NVDA)')).not.toBeInTheDocument();
  });

  it('example button flow: click QTUM → results appear', async () => {
    render(<App />);

    const qtumButton = screen.getByRole('button', { name: 'QTUM' });
    fireEvent.click(qtumButton);

    // Results should appear with QTUM data (async)
    await waitFor(() => {
      expect(screen.getByText('QTUM - IonQ Inc.')).toBeInTheDocument();
    });
  });

  it('new search flow: click New Search → returns to search view', async () => {
    render(<App />);

    // First trigger a search
    const qtumButton = screen.getByRole('button', { name: 'QTUM' });
    fireEvent.click(qtumButton);

    // Verify results are shown (async)
    await waitFor(() => {
      expect(screen.getByText('QTUM - IonQ Inc.')).toBeInTheDocument();
    });

    // Click New Search
    const newSearchButton = screen.getByRole('button', { name: 'New Search' });
    fireEvent.click(newSearchButton);

    // Should return to search view
    expect(screen.getByPlaceholderText('Enter stock ticker (e.g., QTUM, AAPL, NVDA)')).toBeInTheDocument();
    expect(screen.queryByText('QTUM - IonQ Inc.')).not.toBeInTheDocument();
  });

  it('case-insensitive search: "qtum" and "QTUM" produce same results', async () => {
    const { unmount } = render(<App />);

    // Search with lowercase
    const input = screen.getByPlaceholderText('Enter stock ticker (e.g., QTUM, AAPL, NVDA)');
    fireEvent.change(input, { target: { value: 'qtum' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Should show same result as uppercase QTUM (async)
    await waitFor(() => {
      expect(screen.getByText('QTUM - IonQ Inc.')).toBeInTheDocument();
    });

    unmount();

    // Now search with uppercase
    render(<App />);
    const input2 = screen.getByPlaceholderText('Enter stock ticker (e.g., QTUM, AAPL, NVDA)');
    fireEvent.change(input2, { target: { value: 'QTUM' } });
    fireEvent.keyDown(input2, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('QTUM - IonQ Inc.')).toBeInTheDocument();
    });
  });

  it('fade-in animation class is applied to results container', async () => {
    render(<App />);

    const qtumButton = screen.getByRole('button', { name: 'QTUM' });
    fireEvent.click(qtumButton);

    // Wait for results to appear (async)
    await waitFor(() => {
      expect(screen.getByText('QTUM - IonQ Inc.')).toBeInTheDocument();
    });

    // The results main container should have animate-fade-in class
    const resultsContainer = screen.getByText('QTUM - IonQ Inc.').closest('main');
    expect(resultsContainer).toHaveClass('animate-fade-in');
  });

  it('scrollIntoView is called when results appear', async () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    render(<App />);

    const qtumButton = screen.getByRole('button', { name: 'QTUM' });
    fireEvent.click(qtumButton);

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });
});
