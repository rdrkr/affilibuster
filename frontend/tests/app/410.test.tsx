// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for 410 Gone page
 */

import { render, screen } from '@testing-library/react';
import GonePage from '@/app/410/page';

describe('410 Gone Page', () => {
  it('should render 410 heading', () => {
    render(<GonePage />);

    expect(screen.getByText('410')).toBeInTheDocument();
  });

  it('should render "Page Gone" title', () => {
    render(<GonePage />);

    expect(screen.getByText('Page Gone')).toBeInTheDocument();
  });

  it('should render explanation message', () => {
    render(<GonePage />);

    expect(
      screen.getByText(
        /This page has been permanently removed and is no longer available/i
      )
    ).toBeInTheDocument();
  });

  it('should render link to homepage', () => {
    render(<GonePage />);

    const link = screen.getByText('Go to Homepage');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('should render contact support message', () => {
    render(<GonePage />);

    expect(
      screen.getByText(/If you believe this is an error, please contact support/i)
    ).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<GonePage />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('min-h-screen');
    expect(mainDiv).toHaveClass('flex');
  });
});
