import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TabBar, { TabId } from './TabBar';

describe('TabBar', () => {
  const defaultProps = {
    activeTab: 'buffett' as TabId,
    onTabChange: vi.fn(),
  };

  it('renders all six tabs in correct order: Buffett, Munger, Lynch, Rothschild, Technical, ⚡ Actions', () => {
    render(<TabBar {...defaultProps} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(6);
    expect(tabs[0]).toHaveTextContent('Buffett');
    expect(tabs[1]).toHaveTextContent('Munger');
    expect(tabs[2]).toHaveTextContent('Lynch');
    expect(tabs[3]).toHaveTextContent('Rothschild');
    expect(tabs[4]).toHaveTextContent('Technical');
    expect(tabs[5]).toHaveTextContent('⚡ Actions');
  });

  it('applies active styling classes to the active tab', () => {
    render(<TabBar {...defaultProps} activeTab="buffett" />);
    const tabs = screen.getAllByRole('tab');
    const activeTab = tabs[0];
    expect(activeTab).toHaveClass('bg-blue-500', 'text-white', 'font-bold', 'border-b-4', 'border-blue-400');
  });

  it('applies inactive styling classes to non-active tabs', () => {
    render(<TabBar {...defaultProps} activeTab="buffett" />);
    const tabs = screen.getAllByRole('tab');
    // Tabs at index 1-4 should be inactive
    for (let i = 1; i < tabs.length; i++) {
      expect(tabs[i]).toHaveClass('text-gray-400');
      expect(tabs[i]).not.toHaveClass('bg-blue-500');
    }
  });

  it('calls onTabChange with correct TabId when clicking each tab', () => {
    const onTabChange = vi.fn();
    render(<TabBar activeTab="buffett" onTabChange={onTabChange} />);
    const tabs = screen.getAllByRole('tab');

    const expectedIds: TabId[] = ['buffett', 'munger', 'lynch', 'rothschild', 'technical', 'actions'];

    expectedIds.forEach((id, index) => {
      fireEvent.click(tabs[index]);
      expect(onTabChange).toHaveBeenCalledWith(id);
    });

    expect(onTabChange).toHaveBeenCalledTimes(6);
  });

  it('updates active styling when a different tab is active', () => {
    render(<TabBar activeTab="technical" onTabChange={defaultProps.onTabChange} />);
    const tabs = screen.getAllByRole('tab');
    // Technical tab (index 4) should be active
    expect(tabs[4]).toHaveClass('bg-blue-500', 'text-white', 'font-bold');
    // Buffett tab (index 0) should be inactive
    expect(tabs[0]).toHaveClass('text-gray-400');
    expect(tabs[0]).not.toHaveClass('bg-blue-500');
  });
});
