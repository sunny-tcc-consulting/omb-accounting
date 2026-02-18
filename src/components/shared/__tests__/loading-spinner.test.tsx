import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingOverlay } from '../loading-spinner';

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with sm size', () => {
    render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with md size', () => {
    render(<LoadingSpinner size="md" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with lg size', () => {
    render(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'loading');
    expect(spinner).toHaveAttribute('role', 'status');
  });

  it('has sr-only text for screen readers', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="#3b82f6" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-[#3b82f6]');
  });
});

describe('LoadingOverlay', () => {
  it('renders with default message', () => {
    render(<LoadingOverlay />);
    expect(screen.getByText('Loading...', { exact: false })).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingOverlay message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<LoadingOverlay />);
    const overlays = screen.getAllByRole('status');
    expect(overlays.length).toBeGreaterThanOrEqual(1);
  });

  it('has full-screen overlay', () => {
    render(<LoadingOverlay />);
    const overlays = screen.getAllByRole('status');
    const overlay = overlays.find(el => el.tagName === 'DIV');
    expect(overlay).toHaveClass('fixed');
    expect(overlay).toHaveClass('inset-0');
    expect(overlay).toHaveClass('z-50');
  });

  it('has backdrop blur', () => {
    render(<LoadingOverlay />);
    const overlays = screen.getAllByRole('status');
    const overlay = overlays.find(el => el.tagName === 'DIV');
    expect(overlay).toHaveClass('backdrop-blur-sm');
  });

  it('displays spinner', () => {
    render(<LoadingOverlay />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('displays message below spinner', () => {
    render(<LoadingOverlay message="Custom message" />);
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('has correct default size', () => {
    render(<LoadingOverlay />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('h-8');
    expect(spinner).toHaveClass('w-8');
  });

  it('accepts custom size', () => {
    render(<LoadingOverlay size="lg" />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('w-12');
  });
});
