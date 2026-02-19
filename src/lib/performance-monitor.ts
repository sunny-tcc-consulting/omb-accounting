/**
 * Performance monitoring utilities
 */

type PerformanceMetric = {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, unknown>;
};

type PerformanceReport = {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

// Performance metrics collection
const metrics: PerformanceMetric[] = [];
const reports: PerformanceReport[] = [];

/**
 * Start measuring a performance metric
 */
export function startMetric(
  name: string,
  metadata?: Record<string, unknown>,
): string {
  const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  metrics.push({
    name,
    startTime: performance.now(),
    metadata,
  });

  return id;
}

/**
 * End measuring a performance metric
 */
export function endMetric(id: string): number | null {
  const metricIndex = metrics.findIndex(
    (m) => m.name + m.startTime === id || m.name.includes(id.split("-")[0]),
  );

  if (metricIndex === -1) return null;

  const metric = metrics[metricIndex];
  const duration = performance.now() - metric.startTime;

  // Store the report
  reports.push({
    name: metric.name,
    duration,
    timestamp: Date.now(),
    metadata: metric.metadata,
  });

  // Remove from active metrics
  metrics.splice(metricIndex, 1);

  return duration;
}

/**
 * Measure a function's execution time
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const id = startMetric(name, metadata);

  try {
    const result = await fn();
    return result;
  } finally {
    endMetric(id);
  }
}

/**
 * Get performance reports
 */
export function getPerformanceReports(): PerformanceReport[] {
  return [...reports];
}

/**
 * Clear performance reports
 */
export function clearPerformanceReports(): void {
  reports.length = 0;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): Record<
  string,
  { avg: number; min: number; max: number; count: number }
> {
  const summary: Record<
    string,
    { total: number; min: number; max: number; count: number }
  > = {};

  reports.forEach((report) => {
    if (!summary[report.name]) {
      summary[report.name] = { total: 0, min: Infinity, max: 0, count: 0 };
    }

    const stats = summary[report.name];
    stats.total += report.duration;
    stats.min = Math.min(stats.min, report.duration);
    stats.max = Math.max(stats.max, report.duration);
    stats.count += 1;
  });

  // Calculate averages
  return Object.fromEntries(
    Object.entries(summary).map(([name, stats]) => [
      name,
      {
        avg: stats.total / stats.count,
        min: stats.min === Infinity ? 0 : stats.min,
        max: stats.max,
        count: stats.count,
      },
    ]),
  );
}

/**
 * Log performance summary to console
 */
export function logPerformanceSummary(): void {
  const summary = getPerformanceSummary();

  console.group("📊 Performance Summary");
  Object.entries(summary).forEach(([name, stats]) => {
    console.log(
      `%c${name}%c avg: ${stats.avg.toFixed(2)}ms | min: ${stats.min.toFixed(2)}ms | max: ${stats.max.toFixed(2)}ms | count: ${stats.count}`,
      "font-weight: bold",
      "color: gray",
    );
  });
  console.groupEnd();
}

/**
 * Monitor Core Web Vitals
 */
export function monitorCoreWebVitals(): void {
  if (typeof window === "undefined") return;

  // Largest Contentful Paint (LCP)
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        console.log(
          `%cLCP: ${lastEntry.startTime.toFixed(2)}ms`,
          "color: green",
        );
        startMetric("LCP", { value: lastEntry.startTime });
      });

      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      console.warn("LCP monitoring not supported");
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
          if (entry instanceof PerformanceEventTiming) {
            const delay = entry.processingStart - entry.startTime;
            console.log(`%cFID: ${delay.toFixed(2)}ms`, "color: blue");
            startMetric("FID", { value: delay });
          }
        });
      });

      fidObserver.observe({ type: "first-input", buffered: true });
    } catch {
      console.warn("FID monitoring not supported");
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry: PerformanceEntry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        console.log(`%cCLS: ${clsValue.toFixed(4)}`, "color: orange");
        startMetric("CLS", { value: clsValue });
      });

      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      console.warn("CLS monitoring not supported");
    }
  }
}

/**
 * Track page load performance
 */
export function trackPageLoad(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("load", () => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;

    if (navigation) {
      console.group("🚀 Page Load Performance");
      console.log(
        `DNS Lookup: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`,
      );
      console.log(
        `TCP Connection: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`,
      );
      console.log(
        `Server Response: ${(navigation.responseStart - navigation.requestStart).toFixed(2)}ms`,
      );
      console.log(
        `Content Download: ${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`,
      );
      console.log(
        `DOM Parse: ${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`,
      );
      console.log(`Total Load Time: ${navigation.duration.toFixed(2)}ms`);
      console.groupEnd();

      startMetric("Page Load", {
        duration: navigation.duration,
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        server: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
      });
    }
  });
}

/**
 * Create a performance logger for API calls
 */
export function createApiLogger() {
  return {
    log: (endpoint: string, duration: number, status: number) => {
      const color =
        status >= 200 && status < 300
          ? "green"
          : status >= 400
            ? "orange"
            : "red";
      console.log(
        `%c[API] ${endpoint}%c ${duration.toFixed(2)}ms ${status}`,
        `color: ${color}`,
        "color: gray",
      );
      startMetric(`API:${endpoint}`, { duration, status });
    },

    error: (endpoint: string, error: Error) => {
      console.error(`[API Error] ${endpoint}:`, error);
      startMetric(`API:${endpoint}`, { error: error.message });
    },
  };
}

/**
 * Check if performance is within acceptable thresholds
 */
export function checkPerformanceThresholds(): {
  passed: boolean;
  issues: string[];
} {
  const summary = getPerformanceSummary();
  const issues: string[] = [];
  let passed = true;

  // Check API response times
  Object.entries(summary).forEach(([name, stats]) => {
    if (name.startsWith("API:")) {
      if (stats.avg > 1000) {
        issues.push(`${name} is slow (avg: ${stats.avg.toFixed(0)}ms)`);
        passed = false;
      }
    }
  });

  return { passed, issues };
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  // Track page load
  trackPageLoad();

  // Monitor Core Web Vitals
  monitorCoreWebVitals();

  // Log performance summary on page unload
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      logPerformanceSummary();
    });
  }

  console.log("✅ Performance monitoring initialized");
}
