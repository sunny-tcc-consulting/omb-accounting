/**
 * Dynamic Import Utility for Code Splitting
 *
 * This module provides utilities for lazy loading heavy components
 * to improve initial bundle size and page load performance.
 */

import { lazy, Suspense, ReactNode } from "react";

/**
 * Default loading skeleton for lazy loaded components
 */
export function DefaultLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-32 bg-muted rounded" />
    </div>
  );
}

/**
 * Card loading skeleton
 */
export function CardSkeleton() {
  return (
    <div className="bg-card text-card-foreground rounded-lg border p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/3 mb-4" />
      <div className="h-8 bg-muted rounded w-1/2 mb-2" />
      <div className="h-3 bg-muted rounded w-2/3" />
    </div>
  );
}

/**
 * Table loading skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 p-4 bg-muted/50 rounded-t-lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-t">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-4 bg-muted rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Chart loading skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="bg-card text-card-foreground rounded-lg border p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/4 mb-6" />
      <div className="h-48 bg-muted rounded" />
    </div>
  );
}

/**
 * Lazy load a component with Suspense
 * Usage: const HeavyComponent = lazyLoad(() => import('./HeavyComponent'))
 */
export function lazyLoad<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
) {
  const LazyComponent = lazy(importFn);

  // Return the lazy component directly - use Suspense in parent
  return LazyComponent;
}
