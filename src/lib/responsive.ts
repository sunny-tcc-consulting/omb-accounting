/**
 * Responsive design utilities
 */

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Breakpoint definitions
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

/**
 * Device type detection
 */
export type DeviceType = "mobile" | "tablet" | "desktop";

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const checkDevice = () => {
      const width = window.innerWidth;
      let newType: DeviceType = "desktop";
      if (width < 768) {
        newType = "mobile";
      } else if (width < 1024) {
        newType = "tablet";
      }
      // Use requestAnimationFrame to defer state update
      requestAnimationFrame(() => {
        setDeviceType(newType);
      });
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return deviceType;
}

/**
 * Check if current viewport matches a media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // Use requestAnimationFrame to defer state update
    requestAnimationFrame(() => {
      setMatches(media.matches);
    });

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/**
 * Common media query hooks
 */
export const useIsMobile = () =>
  useMediaQuery(`(max-width: ${breakpoints.md})`);
export const useIsTablet = () =>
  useMediaQuery(
    `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  );
export const useIsDesktop = () =>
  useMediaQuery(`(min-width: ${breakpoints.lg})`);

/**
 * Get current viewport dimensions
 */
export function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const updateSize = () => {
      requestAnimationFrame(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate responsive class names based on breakpoints
 */
export function responsive(values: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  "2xl"?: string;
}): string {
  const classes: string[] = [];

  if (values.base) classes.push(values.base);
  if (values.sm) classes.push(`sm:${values.sm}`);
  if (values.md) classes.push(`md:${values.md}`);
  if (values.lg) classes.push(`lg:${values.lg}`);
  if (values.xl) classes.push(`xl:${values.xl}`);
  if (values["2xl"]) classes.push(`2xl:${values["2xl"]}`);

  return classes.join(" ");
}

/**
 * Touch-friendly sizing helpers
 */
export const touchTargets = {
  // Minimum touch target size (44x44px per WCAG)
  minSize: 44,
  // Spacing between touch targets
  gap: 8,
};

/**
 * Check if device supports hover (for touch devices)
 */
export function useSupportsHover(): boolean {
  const [supportsHover, setSupportsHover] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(hover: none)");

    // Use requestAnimationFrame to defer state update
    requestAnimationFrame(() => {
      setSupportsHover(!mediaQuery.matches);
    });

    const listener = (e: MediaQueryListEvent) => {
      setSupportsHover(!e.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return supportsHover;
}

/**
 * Debounce resize handler
 */
export function useDebouncedResize<T extends (...args: never[]) => void>(
  callback: T,
  delay: number = 150,
): T {
  const timeoutRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      callbackRef.current();
    }, delay);
  }, [delay, callbackRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback as T;
}
