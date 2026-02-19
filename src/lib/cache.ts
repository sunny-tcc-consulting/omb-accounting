/**
 * Cache utilities for performance optimization
 */

// Cache keys prefix
const CACHE_PREFIX = "omb-accounting";

// Cache duration in milliseconds
const CACHE_DURATIONS = {
  short: 5 * 60 * 1000, // 5 minutes
  medium: 30 * 60 * 1000, // 30 minutes
  long: 24 * 60 * 60 * 1000, // 24 hours
  veryLong: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Get data from cache
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const cacheKey = `${CACHE_PREFIX}:${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const { data, timestamp, expiry } = JSON.parse(cached);

    // Check if cache has expired
    if (Date.now() > timestamp + expiry) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data as T;
  } catch {
    return null;
  }
}

/**
 * Set data in cache
 */
export function setCacheData<T>(
  key: string,
  data: T,
  duration: keyof typeof CACHE_DURATIONS = "medium",
): void {
  if (typeof window === "undefined") return;

  try {
    const cacheKey = `${CACHE_PREFIX}:${key}`;
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_DURATIONS[duration],
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch {
    // Handle quota exceeded or other storage errors
    console.warn("Failed to cache data:", key);
  }
}

/**
 * Remove data from cache
 */
export function removeCachedData(key: string): void {
  if (typeof window === "undefined") return;

  try {
    const cacheKey = `${CACHE_PREFIX}:${key}`;
    localStorage.removeItem(cacheKey);
  } catch {
    // Handle errors gracefully
  }
}

/**
 * Clear all application cache
 */
export function clearAllCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(CACHE_PREFIX),
    );

    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    console.warn("Failed to clear cache");
  }
}

/**
 * Invalidate cache by prefix
 */
export function invalidateCache(prefix: string): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(`${CACHE_PREFIX}:${prefix}`),
    );

    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    console.warn("Failed to invalidate cache:", prefix);
  }
}

/**
 * Memory cache for in-session data
 */
const memoryCache = new Map<string, { data: unknown; expiry: number }>();

/**
 * Get data from memory cache
 */
export function getMemoryCache<T>(key: string): T | null {
  const cached = memoryCache.get(key);

  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    memoryCache.delete(key);
    return null;
  }

  return cached.data as T;
}

/**
 * Set data in memory cache
 */
export function setMemoryCache<T>(
  key: string,
  data: T,
  durationMs: number = CACHE_DURATIONS.medium,
): void {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + durationMs,
  });
}

/**
 * Clear memory cache
 */
export function clearMemoryCache(): void {
  memoryCache.clear();
}

/**
 * API response cache with deduplication
 */
const apiRequestCache = new Map<
  string,
  { promise: Promise<unknown>; expiry: number }
>();

/**
 * Cache API request with deduplication
 */
export async function cachedApiRequest<T>(
  key: string,
  fetchFn: () => Promise<T>,
  durationMs: number = CACHE_DURATIONS.medium,
): Promise<T> {
  // Check if request is already in flight
  const cached = apiRequestCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.promise as Promise<T>;
  }

  // Check memory cache
  const memoryCached = getMemoryCache<T>(key);
  if (memoryCached) {
    return memoryCached;
  }

  // Check localStorage cache
  const storageCached = getCachedData<T>(key);
  if (storageCached) {
    setMemoryCache(key, storageCached, durationMs);
    return storageCached;
  }

  // Make the request
  const promise = fetchFn().then((data) => {
    setMemoryCache(key, data, durationMs);
    setCacheData(
      key,
      data,
      durationMs > CACHE_DURATIONS.medium ? "long" : "medium",
    );
    return data;
  });

  // Cache the promise for deduplication
  apiRequestCache.set(key, {
    promise,
    expiry: Date.now() + durationMs,
  });

  return promise;
}

/**
 * Invalidate all API caches
 */
export function invalidateAllApiCaches(): void {
  apiRequestCache.clear();
  clearMemoryCache();
  clearAllCache();
}
