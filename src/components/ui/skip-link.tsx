"use client";

import React, { useEffect, useState, useRef } from "react";
import { skipLinkStyles } from "@/lib/a11y";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  /** Target content area ID (default: main-content) */
  targetId?: string;
  /** Link text */
  children?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export function SkipLink({
  targetId = "main-content",
  children,
  className,
}: SkipLinkProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show skip link when user presses Tab for the first time
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsVisible(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Auto-hide after navigating
    const handleFocus = () => {
      setIsVisible(false);
    };

    const target = document.getElementById(targetId);
    target?.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      target?.removeEventListener("focus", handleFocus);
    };
  }, [targetId]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    target?.focus();
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsVisible(false);
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        skipLinkStyles,
        "bg-blue-600 text-white px-4 py-2 rounded-md font-medium",
        !isVisible && "sr-only focus:not-sr-only",
        className,
      )}
      onFocus={() => setIsVisible(true)}
    >
      {children || "Skip to main content"}
    </a>
  );
}

/**
 * Live Region component for screen reader announcements
 */
interface LiveRegionProps {
  /** Message to announce */
  message?: string;
  /** Priority: 'polite' for non-urgent, 'assertive' for urgent */
  priority?: "polite" | "assertive";
  /** Unique ID for the region */
  id?: string;
}

let regionCounter = 0;

export function LiveRegion({
  message,
  priority = "polite",
  id,
}: LiveRegionProps) {
  const regionIdRef = useRef(id || `live-region-${++regionCounter}`);

  if (!message) return null;

  return (
    <div
      id={regionIdRef.current}
      role={priority === "assertive" ? "alert" : "status"}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Focus management hook for modal/dialog focus trap
 */
export function useFocusTrap(isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    // Find all focusable elements in the document
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = document.querySelectorAll(focusableSelector);
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Store the element that had focus before the trap was activated
    const previousActiveElement = document.activeElement as HTMLElement;

    // Focus the first focusable element
    firstFocusable?.focus();

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

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus when trap is deactivated
      previousActiveElement?.focus();
    };
  }, [isActive]);
}

/**
 * Announce to screen reader helper
 */
export function announce(
  message: string,
  priority: "polite" | "assertive" = "polite",
) {
  if (typeof document === "undefined") return;

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
