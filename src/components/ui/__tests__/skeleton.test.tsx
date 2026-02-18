import { render, screen } from '@testing-library/react';
import { SkeletonScreen } from '../skeleton';
import { CustomerSkeleton, QuotationSkeleton, InvoiceSkeleton, DashboardSkeleton } from '../skeleton';

describe('SkeletonScreen', () => {
  it('renders customer skeletons', () => {
    render(<SkeletonScreen type="customer" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders multiple customer skeletons', () => {
    render(<SkeletonScreen type="customer" count={3} />);
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(3);
  });

  it('renders quotation skeletons', () => {
    render(<SkeletonScreen type="quotation" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders invoice skeletons', () => {
    render(<SkeletonScreen type="invoice" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders dashboard skeletons', () => {
    render(<SkeletonScreen type="dashboard" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders dashboard skeletons with count', () => {
    render(<SkeletonScreen type="dashboard" count={2} />);
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(2);
  });

  it('has correct ARIA attributes', () => {
    render(<SkeletonScreen type="customer" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-label', 'loading');
  });

  it('renders customer skeleton with correct structure', () => {
    render(<CustomerSkeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('renders quotation skeleton with correct structure', () => {
    render(<QuotationSkeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders invoice skeleton with correct structure', () => {
    render(<InvoiceSkeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders dashboard skeleton with correct structure', () => {
    render(<DashboardSkeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders multiple dashboard skeletons', () => {
    render(<DashboardSkeleton count={3} />);
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(3);
  });
});
