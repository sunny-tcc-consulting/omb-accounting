/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Focus ring styles for keyboard navigation
 */
export const focusRing =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Focus ring styles for destructive actions
 */
export const focusRingDestructive =
  "focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Skip link for keyboard users to bypass navigation
 */
export const skipLinkStyles =
  "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white";

/**
 * Screen reader only text
 */
export const srOnly = "sr-only";

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0;
export const generateA11yId = (prefix: string = "a11y"): string => {
  return `${prefix}-${++idCounter}-${Date.now()}`;
};

/**
 * Get error message ID for aria-describedby
 */
export const getErrorId = (inputId: string): string => `${inputId}-error`;

/**
 * Get helper text ID for aria-describedby
 */
export const getHelperId = (inputId: string): string => `${inputId}-helper`;

/**
 * Get success message ID for aria-describedby
 */
export const getSuccessId = (inputId: string): string => `${inputId}-success`;

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite",
): void {
  const announcement = document.createElement("div");
  announcement.setAttribute(
    "role",
    priority === "assertive" ? "alert" : "status",
  );
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}

/**
 * Focus trap for modals/dialogs
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  element.addEventListener("keydown", handleKeyDown);
  firstFocusable?.focus();

  return () => element.removeEventListener("keydown", handleKeyDown);
}

/**
 * Reduced motion preference hook result
 */
export function useReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches;
}

/**
 * High contrast mode detection
 */
export function useHighContrastMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(forced-colors: active)").matches ||
    window.matchMedia("(-ms-high-contrast: active)").matches
  );
}

/**
 * Announce loading state to screen readers
 */
export function announceLoading(message: string = "Loading"): void {
  announceToScreenReader(message, "polite");
}

/**
 * Announce success to screen readers
 */
export function announceSuccess(message: string): void {
  announceToScreenReader(message, "polite");
}

/**
 * Announce error to screen readers
 */
export function announceError(message: string): void {
  announceToScreenReader(message, "assertive");
}
