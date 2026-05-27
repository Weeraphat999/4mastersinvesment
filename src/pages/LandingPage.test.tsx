import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../contexts/AuthContext';

const mockedUseAuth = vi.mocked(useAuth);

function renderLandingPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when unauthenticated', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });
    });

    it('displays app description of investment analysis capabilities', () => {
      renderLandingPage();

      expect(screen.getByText('Four Masters Investor')).toBeInTheDocument();
      expect(screen.getByText(/four legendary investment masters/i)).toBeInTheDocument();
    });

    it('shows CTA button linking to /signup', () => {
      renderLandingPage();

      const ctaLink = screen.getByRole('link', { name: /get started/i });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute('href', '/signup');
    });

    it('displays legal disclaimer', () => {
      renderLandingPage();

      expect(screen.getByText(/this is not investment advice/i)).toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: { id: 'user-123' } as any,
        session: { access_token: 'token' } as any,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });
    });

    it('shows CTA button linking to /analyze', () => {
      renderLandingPage();

      const ctaLink = screen.getByRole('link', { name: /go to analysis/i });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute('href', '/analyze');
    });

    it('still displays app description', () => {
      renderLandingPage();

      expect(screen.getByText('Four Masters Investor')).toBeInTheDocument();
    });

    it('still displays legal disclaimer', () => {
      renderLandingPage();

      expect(screen.getByText(/this is not investment advice/i)).toBeInTheDocument();
    });
  });
});
