"use client";

import { useEffect, useRef } from "react";

/**
 * Caching utilities for Phase 2.8 performance optimization
 */

// In-memory cache with TTL
type CacheItem<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

export class Cache<T = unknown> {
  private cache: Map<string, CacheItem<T>> = new Map();

  set(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
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
    return this.cache.size;
  }
}

// Singleton cache instance
export const appCache = new Cache();

// Hook to check if component is still mounted
function useIsMounted(): { current: boolean } {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
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

  static set(key: string, data: unknown, ttl: number = 300000): void {
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
  const entries = Array.from(appCache.keys())
    .map((key) => ({ key, item: appCache.get(key) as CacheItem<unknown> }))
    .filter((entry) => entry.item !== null);

  const size = entries.length;
  const totalTtl = entries.reduce((sum, { item }) => sum + item.ttl, 0);

  return {
    size,
    hitRate: 0, // Need to track hits/misses separately
    missRate: 0, // Need to track hits/misses separately
    averageTtl: size > 0 ? totalTtl / size : 0,
  };
}
