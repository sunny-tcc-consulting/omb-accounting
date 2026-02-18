'use client';

import { cn } from '@/lib/utils';

interface SkeletonScreenProps {
  type: 'customer' | 'quotation' | 'invoice' | 'dashboard';
  count?: number;
}

/**
 * SkeletonScreen - Reusable loading skeleton component
 * Displays animated skeleton placeholders matching actual component layouts
 */
export function SkeletonScreen({ type, count = 1 }: SkeletonScreenProps) {
  const skeletons = Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      className={cn('animate-pulse', getSkeletonClasses(type))}
      role="status"
      aria-label="loading"
    >
      {getSkeletonContent(type)}
    </div>
  ));

  return <div className="skeleton-container">{skeletons}</div>;
}

/**
 * Gets CSS classes for skeleton based on type
 */
function getSkeletonClasses(type: string): string {
  const classes: Record<string, string> = {
    customer: 'space-y-3 p-4 bg-gray-100 rounded-lg',
    quotation: 'space-y-2 p-4 bg-gray-100 rounded-lg',
    invoice: 'space-y-2 p-4 bg-gray-100 rounded-lg',
    dashboard: 'grid gap-4',
  };
  return classes[type] || classes.dashboard;
}

/**
 * Gets skeleton content based on type
 */
function getSkeletonContent(type: string): React.ReactNode {
  switch (type) {
    case 'customer':
      return (
        <>
          <div className="h-6 bg-gray-300 rounded w-1/3" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
        </>
      );

    case 'quotation':
      return (
        <>
          <div className="h-6 bg-gray-300 rounded w-1/4" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-2/3" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </>
      );

    case 'invoice':
      return (
        <>
          <div className="h-6 bg-gray-300 rounded w-1/3" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </>
      );

    case 'dashboard':
      return (
        <>
          <div className="h-24 bg-gray-300 rounded-lg" />
          <div className="h-24 bg-gray-300 rounded-lg" />
          <div className="h-24 bg-gray-300 rounded-lg" />
        </>
      );

    default:
      return null;
  }
}

// Export individual skeleton components for more granular control
export function CustomerSkeleton() {
  return <SkeletonScreen type="customer" count={1} />;
}

export function QuotationSkeleton() {
  return <SkeletonScreen type="quotation" count={1} />;
}

export function InvoiceSkeleton() {
  return <SkeletonScreen type="invoice" count={1} />;
}

export function DashboardSkeleton({ count = 1 }: { count?: number }) {
  return <SkeletonScreen type="dashboard" count={count} />;
}
