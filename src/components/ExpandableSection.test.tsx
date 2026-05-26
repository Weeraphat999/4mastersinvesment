import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpandableSection from './ExpandableSection';

describe('ExpandableSection unit tests', () => {
  it('renders children when defaultExpanded is true (default)', () => {
    render(
      <ExpandableSection title="Test Section">
        <p>Section content</p>
      </ExpandableSection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeVisible();
  });

  it('renders the title in the header', () => {
    render(
      <ExpandableSection title="My Title">
        <p>Content</p>
      </ExpandableSection>
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('clicking header toggles visibility - children become hidden after click', () => {
    render(
      <ExpandableSection title="Toggle Section">
        <p>Visible content</p>
      </ExpandableSection>
    );

    const header = screen.getByRole('button', { name: /Toggle Section/i });
    expect(header).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'false');
    // Content container should have maxHeight set to 0px when collapsed
    const content = screen.getByText('Visible content').closest('div');
    expect(content).toHaveStyle({ maxHeight: '0px' });
  });

  it('starts collapsed when defaultExpanded=false', () => {
    render(
      <ExpandableSection title="Collapsed Section" defaultExpanded={false}>
        <p>Hidden content</p>
      </ExpandableSection>
    );

    const header = screen.getByRole('button', { name: /Collapsed Section/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');

    // Content container should have maxHeight 0px when collapsed
    const content = screen.getByText('Hidden content').closest('div');
    expect(content).toHaveStyle({ maxHeight: '0px' });
  });

  it('clicking header when collapsed makes children visible', () => {
    render(
      <ExpandableSection title="Expand Me" defaultExpanded={false}>
        <p>Now visible</p>
      </ExpandableSection>
    );

    const header = screen.getByRole('button', { name: /Expand Me/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'true');
  });
});
