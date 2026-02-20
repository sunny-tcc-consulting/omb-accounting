"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Caching utilities for Phase 2.8 performance optimization
 */

// In-memory cache with TTL
class Cache {
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();

  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  deleteByPattern(pattern: RegExp): void {
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    });
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.getStats().size;
  }

  getStats(): { size: number; averageTtl: number } {
    let count = 0;
    let totalTtl = 0;
    this.cache.forEach((item) => {
      if (Date.now() - item.timestamp <= item.ttl) {
        count++;
        totalTtl += item.ttl;
      }
    });
    return { size: count, averageTtl: count > 0 ? totalTtl / count : 0 };
  }
}

// Singleton cache instance
export const appCache = new Cache();

// React Query-like hook for data fetching with caching
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    staleWhileRevalidate?: boolean;
    refetchOnWindowFocus?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {},
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(appCache.get<T>(key));
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      appCache.set(key, result, options.ttl || 300000);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err as Error);
      options.onError?.(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options.ttl, options.onSuccess, options.onError]);

  // Auto refetch on window focus if enabled
  useEffect(() => {
    if (options.refetchOnWindowFocus !== false) {
      const handleFocus = () => {
        if (!loading && !data) {
          fetchData();
        }
      };
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, [loading, data, fetchData, options.refetchOnWindowFocus]);

  // Return cache data immediately if available
  const cachedData = appCache.get<T>(key);
  useEffect(() => {
    if (cachedData && !data) {
      setData(cachedData);
    }
  }, [cachedData, data]);

  return {
    data: data ?? cachedData,
    error,
    loading,
    refetch: fetchData,
  };
}

// SWR-like hook for client-side caching
export function useStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    refetchOnWindowFocus?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {},
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(appCache.get<T>(key));
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      appCache.set(key, result, options.ttl || 300000);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err as Error);
      options.onError?.(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options.ttl, options.onSuccess, options.onError]);

  // Auto refetch on window focus if enabled
  useEffect(() => {
    if (options.refetchOnWindowFocus !== false) {
      const handleFocus = () => {
        if (!loading && !data) {
          fetchData();
        }
      };
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, [loading, data, fetchData, options.refetchOnWindowFocus]);

  // Return cached data immediately, refetch in background
  useEffect(() => {
    if (!data && appCache.has(key)) {
      const cached = appCache.get<T>(key);
      if (cached) {
        setData(cached);
      }
      // Refetch in background to keep cache fresh
      fetchData().catch(() => {});
    }
  }, [key, data, fetchData]);

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  };
}

// HTTP caching utilities
export class HttpCache {
  private static cache: Map<
    string,
    {
      response: Response;
      timestamp: number;
      ttl: number;
    }
  > = new Map();

  static async fetchWithCache(
    url: string,
    options?: RequestInit,
    ttl: number = 300000,
  ): Promise<Response> {
    const cacheKey = JSON.stringify({ url, options });
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.response.clone();
    }

    const response = await fetch(url, options);
    const clonedResponse = response.clone();

    this.cache.set(cacheKey, {
      response: clonedResponse,
      timestamp: Date.now(),
      ttl,
    });

    return response;
  }

  static clear(): void {
    this.cache.clear();
  }

  static size(): number {
    return this.cache.size;
  }
}

// Local storage caching
export class LocalStorageCache {
  private static prefix = "omb-accounting-cache-";

  static set<T>(key: string, data: T, ttl: number = 300000): void {
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(this.prefix + key);
    if (!itemStr) return null;

    try {
      const item: { data: T; timestamp: number; ttl: number } =
        JSON.parse(itemStr);

      if (Date.now() - item.timestamp > item.ttl) {
        this.delete(key);
        return null;
      }

      return item.data;
    } catch {
      return null;
    }
  }

  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  static delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  static size(): number {
    const keys = Object.keys(localStorage);
    return keys.filter((key) => key.startsWith(this.prefix)).length;
  }
}

// Cache warming utilities
export function warmCache(keys: string[]): void {
  keys.forEach((key) => {
    if (appCache.has(key)) {
      // Access the cache to keep it warm
      appCache.get(key);
    }
  });
}

// Cache invalidation
export function invalidateCache(key: string | RegExp): void {
  if (key instanceof RegExp) {
    appCache.deleteByPattern(key);
  } else {
    appCache.delete(key);
  }
}

// Cache statistics
export function getCacheStats(): {
  size: number;
  hitRate: number;
  missRate: number;
  averageTtl: number;
} {
  const stats = appCache.getStats();
  const entries = Array.from(appCache.keys())
    .map((key) => ({ key, item: appCache.get(key) }))
    .filter((entry) => entry.item !== null);

  return {
    size: stats.size,
    hitRate: 0, // Need to track hits/misses separately
    missRate: 0, // Need to track hits/misses separately
    averageTtl: stats.averageTtl,
  };
}
