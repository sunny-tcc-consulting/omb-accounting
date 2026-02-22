/**
 * Session Hook - Advanced session management with keep-alive and activity tracking
 * Part of Phase 4.4: Session Management
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { logActivity } from "@/lib/activity-logger";

interface SessionState {
  isActive: boolean;
  lastActivity: Date | null;
  timeRemaining: number;
  isExpiringSoon: boolean;
}

interface SessionConfig {
  timeoutMs: number;
  warningMs: number;
  keepAliveIntervalMs: number;
  maxConcurrentSessions: number;
}

const DEFAULT_CONFIG: SessionConfig = {
  timeoutMs: 30 * 60 * 1000, // 30 minutes
  warningMs: 5 * 60 * 1000, // 5 minutes warning
  keepAliveIntervalMs: 60 * 1000, // Keep-alive every minute
  maxConcurrentSessions: 3, // Maximum concurrent sessions per user
};

export function useSession(config: Partial<SessionConfig> = {}) {
  const { currentUser, isAuthenticated } = useUser();

  // Memoize config to prevent unnecessary re-renders
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config],
  );

  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    lastActivity: null,
    timeRemaining: mergedConfig.timeoutMs,
    isExpiringSoon: false,
  });

  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Handle session expiration
  const handleSessionExpire = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
    }

    setSessionState((prev) => ({
      ...prev,
      isActive: false,
      isExpiringSoon: false,
      timeRemaining: 0,
    }));

    // Log session expiration
    if (currentUser) {
      logActivity(
        currentUser.id,
        currentUser.name,
        "session_expire",
        "sessions",
        currentUser.id,
        { reason: "inactivity_timeout" },
        "client-ip",
        navigator.userAgent,
      );
    }

    // Trigger session expiration event
    window.dispatchEvent(
      new CustomEvent("session-expire", {
        detail: { userId: currentUser?.id },
      }),
    );
  }, [currentUser]);

  // Track user activity
  const trackActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    setSessionState((prev) => ({
      ...prev,
      lastActivity: lastActivityRef.current,
      isActive: true,
    }));

    // Clear existing timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // Set new timeout for session expiration
    activityTimeoutRef.current = setTimeout(() => {
      handleSessionExpire();
    }, mergedConfig.timeoutMs);

    // Check if approaching warning time
    const timeSinceLastActivity =
      Date.now() - lastActivityRef.current.getTime();
    const remainingTime = mergedConfig.timeoutMs - timeSinceLastActivity;

    setSessionState((prev) => ({
      ...prev,
      timeRemaining: Math.max(0, remainingTime),
      isExpiringSoon: remainingTime <= mergedConfig.warningMs,
    }));
  }, [mergedConfig, handleSessionExpire]);

  // Extend session (keep-alive)
  const extendSession = useCallback(() => {
    if (!currentUser) return;

    // Log activity for session extension
    logActivity(
      currentUser.id,
      currentUser.name,
      "session_extend",
      "sessions",
      currentUser.id,
      {},
      "client-ip",
      navigator.userAgent,
    );

    trackActivity("mousemove");
  }, [currentUser, trackActivity]);

  // Start keep-alive ping
  const startKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
    }

    keepAliveIntervalRef.current = setInterval(() => {
      if (isAuthenticated && lastActivityRef.current) {
        const timeSinceLastActivity =
          Date.now() - lastActivityRef.current.getTime();
        // Only extend if user has been active recently
        if (timeSinceLastActivity < mergedConfig.timeoutMs) {
          extendSession();
        }
      }
    }, mergedConfig.keepAliveIntervalMs);
  }, [isAuthenticated, mergedConfig, extendSession]);

  // Stop keep-alive
  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityHandler = () => trackActivity("mousemove");
    const keyHandler = () => trackActivity("keydown");
    const clickHandler = () => trackActivity("click");
    const scrollHandler = () => trackActivity("scroll");
    const touchHandler = () => trackActivity("touchstart");

    // Add event listeners for activity tracking
    document.addEventListener("mousemove", activityHandler);
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("click", clickHandler);
    document.addEventListener("scroll", scrollHandler, { passive: true });
    document.addEventListener("touchstart", touchHandler, { passive: true });

    // Track visibility changes
    const visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        trackActivity("visibilitychange");
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    // Initial activity tracking
    trackActivity("mousemove");
    startKeepAlive();

    return () => {
      // Cleanup
      document.removeEventListener("mousemove", activityHandler);
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("click", clickHandler);
      document.removeEventListener("scroll", scrollHandler);
      document.removeEventListener("touchstart", touchHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);

      stopKeepAlive();

      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [isAuthenticated, trackActivity, startKeepAlive, stopKeepAlive]);

  // Update time remaining every second
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      if (lastActivityRef.current) {
        const timeSinceLastActivity =
          Date.now() - lastActivityRef.current.getTime();
        const remainingTime = Math.max(
          0,
          mergedConfig.timeoutMs - timeSinceLastActivity,
        );

        setSessionState((prev) => ({
          ...prev,
          timeRemaining: remainingTime,
          isExpiringSoon: remainingTime <= mergedConfig.warningMs,
        }));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, mergedConfig]);

  return {
    sessionState,
    trackActivity,
    extendSession,
    handleSessionExpire,
    startKeepAlive,
    stopKeepAlive,
  };
}

/**
 * Hook to get session time remaining in milliseconds
 */
export function useSessionTimeRemaining() {
  const { sessionState } = useSession();
  return sessionState.timeRemaining;
}

/**
 * Hook to check if session is expiring soon
 */
export function useSessionExpiringSoon() {
  const { sessionState } = useSession();
  return sessionState.isExpiringSoon;
}

/**
 * Hook to get session status
 */
export function useSessionStatus() {
  const { sessionState } = useSession();
  return {
    isActive: sessionState.isActive,
    lastActivity: sessionState.lastActivity,
    timeRemaining: sessionState.timeRemaining,
    isExpiringSoon: sessionState.isExpiringSoon,
  };
}

export default useSession;
