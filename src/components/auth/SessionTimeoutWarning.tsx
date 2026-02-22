/**
 * Session Timeout Warning - Shows warning when session is about to expire
 * Part of Phase 4.4: Session Management
 */

"use client";

import {
  useSessionExpiringSoon,
  useSessionTimeRemaining,
  useSession,
} from "@/hooks/useSession";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { AlertTriangle, Clock, LogOut, RefreshCw } from "lucide-react";

interface SessionTimeoutWarningProps {
  /** Show warning modal instead of banner */
  variant?: "banner" | "modal";
  /** Custom class name */
  className?: string;
  /** Show extend and logout buttons */
  showActions?: boolean;
  /** Callback when user clicks extend */
  onExtend?: () => void;
  /** Callback when user clicks logout */
  onLogout?: () => void;
}

/**
 * Session Timeout Warning Component
 * Shows a warning when session is about to expire
 *
 * @example
 * // Basic banner usage
 * <SessionTimeoutWarning />
 *
 * @example
 * // Modal with custom actions
 * <SessionTimeoutWarning
 *   variant="modal"
 *   onExtend={() => extendSession()}
 *   onLogout={() => logout()}
 * />
 */
export function SessionTimeoutWarning({
  variant = "banner",
  className = "",
  showActions = true,
  onExtend,
  onLogout,
}: SessionTimeoutWarningProps) {
  const isExpiringSoon = useSessionExpiringSoon();
  const rawTimeRemaining = useSessionTimeRemaining();
  const { extendSession, handleSessionExpire } = useSession();
  const { logout } = useUser();

  // Use refs to track values without triggering re-renders
  const rawTimeRemainingRef = useRef(rawTimeRemaining);
  const isExpiringSoonRef = useRef(isExpiringSoon);

  // Update refs when values change
  useEffect(() => {
    rawTimeRemainingRef.current = rawTimeRemaining;
  }, [rawTimeRemaining]);

  useEffect(() => {
    isExpiringSoonRef.current = isExpiringSoon;
  }, [isExpiringSoon]);

  // Use local state for visibility
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(rawTimeRemaining);

  // Update visibility when expiring soon changes
  useEffect(() => {
    const timerId = setTimeout(() => {
      setIsVisible(isExpiringSoonRef.current);
    }, 0);
    return () => clearTimeout(timerId);
  }, [isExpiringSoon]);

  // Update countdown every second
  useEffect(() => {
    if (!isVisible) {
      setCountdown(rawTimeRemainingRef.current);
      return;
    }

    const intervalId = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isVisible]);

  // Format time remaining
  const formatTimeRemaining = useCallback((ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const handleExtend = useCallback(() => {
    extendSession();
    setIsVisible(false);
    onExtend?.();
  }, [extendSession, onExtend]);

  const handleLogout = useCallback(() => {
    handleSessionExpire();
    logout();
    onLogout?.();
  }, [handleSessionExpire, logout, onLogout]);

  if (!isVisible) return null;

  // Modal variant
  if (variant === "modal") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Session Expiring Soon
              </h3>
              <p className="text-gray-600 mb-4">
                Your session will expire in{" "}
                <span className="font-semibold text-orange-600">
                  {formatTimeRemaining(countdown)}
                </span>
                . Do you want to continue?
              </p>

              {showActions && (
                <div className="flex gap-3">
                  <button
                    onClick={handleExtend}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Continue Session
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Banner variant (default)
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-orange-50 border-t border-orange-200 px-4 py-3 z-40 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <div className="flex items-center gap-2">
            <span className="text-orange-800 font-medium">
              Session expiring
            </span>
            <span className="text-orange-700">
              in{" "}
              <span className="font-mono font-bold">
                {formatTimeRemaining(countdown)}
              </span>
            </span>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleExtend}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Stay Logged In
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 border border-orange-300 text-orange-700 text-sm rounded-lg hover:bg-orange-100 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionTimeoutWarning;
