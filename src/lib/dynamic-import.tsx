/**
 * Dynamic Import Utility for Code Splitting & Bundle Optimization
 *
 * This module provides utilities for:
 * - Lazy loading heavy components (code splitting)
 * - Bundle size analysis and optimization
 * - Tree-shaking helpers
 * - Dynamic import with preload hints
 */

import { lazy, Suspense, ReactNode, type ComponentType } from "react";

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

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

// ============================================================================
// BUNDLE SIZE OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Preload hints for critical route components
 * Usage: preloadComponent(() => import('./HeavyComponent'))
 */
export function preloadComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    // Browser idle time preload
    (
      window as unknown as { requestIdleCallback: (cb: () => void) => void }
    ).requestIdleCallback(() => {
      importFn();
    });
  } else if (typeof window !== "undefined") {
    // Immediate preload for browsers without requestIdleCallback
    importFn();
  }
}

/**
 * Load component on interaction (click/hovers)
 * Usage: const HeavyChart = lazy(() => import('./HeavyChart'))
 *        onClick={() => loadOnInteraction(() => import('./HeavyChart'))}
 */
const prefetched: Set<string> = new Set();

export function loadOnInteraction(
  importFn: () => Promise<unknown>,
  options?: { once?: boolean; timeout?: number },
) {
  const key = importFn.toString();
  const once = options?.once ?? true;
  const timeout = options?.timeout ?? 3000;

  if (once && prefetched.has(key)) {
    return Promise.resolve();
  }

  const timeoutId = setTimeout(() => {
    if (once) prefetched.add(key);
  }, timeout);

  return importFn()
    .then(() => {
      clearTimeout(timeoutId);
      if (once) prefetched.add(key);
    })
    .catch(() => {
      clearTimeout(timeoutId);
    });
}

/**
 * Bundle size analysis - track which chunks are loaded
 */
export const bundleTracker = {
  loaded: new Set<string>(),

  track(name: string) {
    this.loaded.add(name);
    if (typeof window !== "undefined") {
      (
        window as unknown as { __BUNDLE_TRACKER__?: Set<string> }
      ).__BUNDLE_TRACKER__ = this.loaded;
    }
  },

  getLoaded(): string[] {
    return Array.from(this.loaded);
  },

  print() {
    console.log("[Bundle Tracker] Loaded chunks:", this.getLoaded());
  },
};

// ============================================================================
// DYNAMIC IMPORT WRAPPERS FOR HEAVY COMPONENTS
// ============================================================================

/**
 * Chart components are heavy (~100KB+ with recharts)
 * Use these lazy wrappers to split them into separate chunks
 */
export function createLazyChart<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  name: string,
): React.LazyExoticComponent<T> {
  bundleTracker.track(name);
  return lazy(importFn);
}

// Reusable Suspense wrapper with consistent loading state
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback ?? <ChartSkeleton />}>{children}</Suspense>
  );
}

// ============================================================================
// TREE-SHAKING HELPERS
// ============================================================================

/**
 * Named exports for better tree-shaking
 * Usage: import { RevenueChart, ExpenseBreakdown } from '@/components/dashboard/charts'
 */
export {
  RevenueChart,
  ExpenseBreakdown,
  TransactionTrend,
  QuickStats,
  RecentTransactionsChart,
  FinancialHealthChart,
} from "@/components/dashboard/charts";

export { OverviewCard } from "@/components/dashboard/OverviewCard";
export { RecentTransactions } from "@/components/dashboard/RecentTransactions";

export { DataTable, useTableSort } from "@/components/ui/data-table";
export type { TableColumn } from "@/components/ui/data-table";

export {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  ConfirmDialog,
} from "@/components/ui/modal";

export {
  Toaster,
  toast,
  toastVariants,
  toastPromise,
  CustomToast,
  NotificationCenter,
} from "@/components/ui/notification";
export type {
  NotificationOptions,
  NotificationPriority,
} from "@/components/ui/notification";

export {
  EmptyState,
  SearchEmptyState,
  DataEmptyState,
  CreateEmptyState,
  ErrorEmptyState,
} from "@/components/ui/empty-state";

// ============================================================================
// COMPONENT LAZY IMPORTS (For manual code splitting)
// ============================================================================

// Heavy dashboard components - load on demand
export const lazyCharts = () =>
  import("@/components/dashboard/charts").then((m) => ({
    default: m.RevenueChart,
  }));

export const lazyOverviewCard = () =>
  import("@/components/dashboard/OverviewCard").then((m) => ({
    default: m.OverviewCard,
  }));

export const lazyRecentTransactions = () =>
  import("@/components/dashboard/RecentTransactions").then((m) => ({
    default: m.RecentTransactions,
  }));

// Data table - used across multiple pages
export const lazyDataTable = () =>
  import("@/components/ui/data-table").then((m) => ({
    default: m.DataTable,
  }));

// Modal/Notification - can be loaded on demand
export const lazyDialog = () =>
  import("@/components/ui/modal").then((m) => ({
    default: m.Dialog,
  }));

export const lazyNotification = () =>
  import("@/components/ui/notification").then((m) => ({
    default: m.Toaster,
  }));

export const lazyEmptyState = () =>
  import("@/components/ui/empty-state").then((m) => ({
    default: m.EmptyState,
  }));
