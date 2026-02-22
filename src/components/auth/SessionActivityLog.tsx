/**
 * Session Activity Log - Display recent session activity
 * Part of Phase 4.4: Session Management
 */

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Activity, getRecentActivities } from "@/lib/activity-logger";
import {
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Globe,
  Monitor,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SessionActivityLogProps {
  /** Maximum number of activities to show */
  limit?: number;
  /** Show session-specific activities only */
  sessionOnly?: boolean;
  /** Auto-refresh interval in milliseconds */
  autoRefreshMs?: number;
  /** Custom class name */
  className?: string;
}

/**
 * Session Activity Log Component
 * Shows recent session activity for the current user
 *
 * @example
 * // Basic usage
 * <SessionActivityLog />
 *
 * @example
 * // With custom options
 * <SessionActivityLog
 *   limit={10}
 *   sessionOnly={true}
 *   autoRefreshMs={5000}
 * />
 */
export function SessionActivityLog({
  limit = 10,
  sessionOnly = true,
  autoRefreshMs = 0,
  className = "",
}: SessionActivityLogProps) {
  const { currentUser } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load activities
  useEffect(() => {
    if (!currentUser) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const recentActivities = getRecentActivities({
        userId: currentUser.id,
        limit,
        activityTypes: sessionOnly
          ? ["login", "logout", "session_expire", "session_extend"]
          : undefined,
      });

      setActivities(recentActivities);
    } catch (error) {
      console.error("Failed to load session activities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, limit, sessionOnly]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshMs <= 0) return;

    const intervalId = setInterval(() => {
      setIsRefreshing(true);
      // Reload activities
      if (currentUser) {
        const recentActivities = getRecentActivities({
          userId: currentUser.id,
          limit,
          activityTypes: sessionOnly
            ? ["login", "logout", "session_expire", "session_extend"]
            : undefined,
        });
        setActivities(recentActivities);
      }
      setIsRefreshing(false);
    }, autoRefreshMs);

    return () => clearInterval(intervalId);
  }, [autoRefreshMs, currentUser, limit, sessionOnly]);

  // Get activity icon
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "login":
        return <LogIn className="w-4 h-4 text-green-500" />;
      case "logout":
        return <LogOut className="w-4 h-4 text-gray-500" />;
      case "session_expire":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "session_extend":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get activity description
  const getActivityDescription = (activity: Activity) => {
    switch (activity.action) {
      case "login":
        return "Logged in successfully";
      case "logout":
        return "Logged out";
      case "session_expire":
        return "Session expired due to inactivity";
      case "session_extend":
        return "Session extended";
      default:
        return activity.action.replace(/_/g, " ");
    }
  };

  // Get activity color
  const getActivityColor = (action: string) => {
    switch (action) {
      case "login":
        return "border-green-200 bg-green-50";
      case "logout":
        return "border-gray-200 bg-gray-50";
      case "session_expire":
        return "border-orange-200 bg-orange-50";
      case "session_extend":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Session Activity</h3>
          {isRefreshing && (
            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Recent login, logout, and session activities
        </p>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No session activity yet</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={`${activity.id}-${index}`}
              className={`p-4 ${getActivityColor(activity.action)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getActivityIcon(activity.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {getActivityDescription(activity)}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), true)}
                    </span>
                    {activity.ipAddress && (
                      <>
                        <span className="text-gray-300">•</span>
                        <Globe className="w-3 h-3" />
                        <span>{activity.ipAddress}</span>
                      </>
                    )}
                    {activity.userAgent && (
                      <span className="flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">
                          {activity.userAgent.includes("Chrome")
                            ? "Chrome"
                            : activity.userAgent.includes("Firefox")
                              ? "Firefox"
                              : "Browser"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
}

export default SessionActivityLog;
