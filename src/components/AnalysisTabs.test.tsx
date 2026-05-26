import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import AnalysisTabs from './AnalysisTabs';
import { PREDEFINED_DETAILED_DATA } from '../data/detailedMockData';
import { PREDEFINED_DATA } from '../data/mockData';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

const mockData = PREDEFINED_DETAILED_DATA['AAPL'];
const mockScores = { buffett: 9, munger: 8, lynch: 7, rothschild: 5 };
const mockAnalysisResult = PREDEFINED_DATA['AAPL'];

describe('AnalysisTabs', () => {
  it('renders Buffett tab content by default', () => {
    render(<AnalysisTabs data={mockData} masterScores={mockScores} analysisResult={mockAnalysisResult} />);
    expect(screen.getByText('🎩 Warren Buffett Analysis')).toBeInTheDocument();
  });

  it('renders Munger content when Munger tab is clicked', () => {
    render(<AnalysisTabs data={mockData} masterScores={mockScores} analysisResult={mockAnalysisResult} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Munger' }));
    expect(screen.getByText('🧠 Charlie Munger Analysis')).toBeInTheDocument();
    expect(screen.queryByText('🎩 Warren Buffett Analysis')).not.toBeInTheDocument();
  });

  it('renders Lynch content when Lynch tab is clicked', () => {
    render(<AnalysisTabs data={mockData} masterScores={mockScores} analysisResult={mockAnalysisResult} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Lynch' }));
    expect(screen.getByText('🔍 Peter Lynch Analysis')).toBeInTheDocument();
  });

  it('renders Rothschild content when Rothschild tab is clicked', () => {
    render(<AnalysisTabs data={mockData} masterScores={mockScores} analysisResult={mockAnalysisResult} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Rothschild' }));
    expect(screen.getByText('🌍 Rothschild Timing Analysis')).toBeInTheDocument();
  });

  it('renders Technical content when Technical tab is clicked', () => {
    render(<AnalysisTabs data={mockData} masterScores={mockScores} analysisResult={mockAnalysisResult} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Technical' }));
    expect(screen.getByText('📈 Technical Analysis')).toBeInTheDocument();
  });

  it('displays only one tab content at a time', () => {
    render(<AnalysisTabs data={mockData} masterScores={mockScores} analysisResult={mockAnalysisResult} />);

    // Initially only Buffett is visible
    expect(screen.getByText('🎩 Warren Buffett Analysis')).toBeInTheDocument();
    expect(screen.queryByText('🧠 Charlie Munger Analysis')).not.toBeInTheDocument();
    expect(screen.queryByText('🔍 Peter Lynch Analysis')).not.toBeInTheDocument();
    expect(screen.queryByText('🌍 Rothschild Timing Analysis')).not.toBeInTheDocument();
    expect(screen.queryByText('📈 Technical Analysis')).not.toBeInTheDocument();

    // Switch to Lynch - only Lynch visible
    fireEvent.click(screen.getByRole('tab', { name: 'Lynch' }));
    expect(screen.queryByText('🎩 Warren Buffett Analysis')).not.toBeInTheDocument();
    expect(screen.queryByText('🧠 Charlie Munger Analysis')).not.toBeInTheDocument();
    expect(screen.getByText('🔍 Peter Lynch Analysis')).toBeInTheDocument();
    expect(screen.queryByText('🌍 Rothschild Timing Analysis')).not.toBeInTheDocument();
    expect(screen.queryByText('📈 Technical Analysis')).not.toBeInTheDocument();
  });

  it('does not change content when clicking the already-active tab', () => {
    render(<AnalysisTabs data={mockData} masterScores={mockScores} analysisResult={mockAnalysisResult} />);

    // Buffett is active by default
    expect(screen.getByText('🎩 Warren Buffett Analysis')).toBeInTheDocument();

    // Click Buffett again
    fireEvent.click(screen.getByRole('tab', { name: 'Buffett' }));

    // Content should remain unchanged
    expect(screen.getByText('🎩 Warren Buffett Analysis')).toBeInTheDocument();
    expect(screen.queryByText('🧠 Charlie Munger Analysis')).not.toBeInTheDocument();
  });
});
