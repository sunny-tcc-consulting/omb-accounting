/**
 * Activity Logger Service - Track user actions for audit trail
 * Part of Phase 4: User & Roles module
 */

import { UserActivity, ActivityFilters } from "@/types";
import { v4 as uuidv4 } from "uuid";

// In-memory activity store
const activities: UserActivity[] = [];

/**
 * Log a user activity
 */
export const logActivity = (
  userId: string,
  userName: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  ipAddress: string = "unknown",
  userAgent: string = "unknown",
): UserActivity => {
  const activity: UserActivity = {
    id: `act-${crypto.randomUUID().slice(0, 8)}`,
    userId,
    userName,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
    createdAt: new Date(),
  };

  activities.push(activity);

  // Keep only last 10000 activities
  if (activities.length > 10000) {
    activities.shift();
  }

  return activity;
};

/**
 * Get activities with optional filtering
 */
export const getActivities = (filters?: ActivityFilters): UserActivity[] => {
  let result = [...activities];

  if (filters) {
    if (filters.userId) {
      result = result.filter((a) => a.userId === filters.userId);
    }

    if (filters.action) {
      result = result.filter((a) => a.action === filters.action);
    }

    if (filters.resource) {
      result = result.filter((a) => a.resource === filters.resource);
    }

    if (filters.dateRange) {
      result = result.filter(
        (a) =>
          a.createdAt >= filters.dateRange!.start &&
          a.createdAt <= filters.dateRange!.end,
      );
    }

    if (filters.limit) {
      result = result.slice(0, filters.limit);
    }
  }

  // Sort by date (newest first)
  result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return result;
};

/**
 * Get activities by user
 */
export const getUserActivities = (
  userId: string,
  limit = 100,
): UserActivity[] => {
  return getActivities({ userId, limit });
};

/**
 * Get recent activities
 */
export const getRecentActivities = (limit = 50): UserActivity[] => {
  return getActivities({ limit });
};

/**
 * Get activities by resource
 */
export const getResourceActivities = (
  resource: string,
  resourceId: string,
): UserActivity[] => {
  return activities.filter(
    (a) => a.resource === resource && a.resourceId === resourceId,
  );
};

/**
 * Get activity count by user
 */
export const getActivityCountByUser = (userId: string): number => {
  return activities.filter((a) => a.userId === userId).length;
};

/**
 * Get activity summary for dashboard
 */
export const getActivitySummary = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayActivities = activities.filter((a) => a.createdAt >= today);
  const weekActivities = activities.filter((a) => a.createdAt >= thisWeek);
  const monthActivities = activities.filter((a) => a.createdAt >= thisMonth);

  // Group by action
  const actionCounts: Record<string, number> = {};
  todayActivities.forEach((a) => {
    actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
  });

  // Group by user
  const userCounts: Record<string, number> = {};
  weekActivities.forEach((a) => {
    userCounts[a.userId] = (userCounts[a.userId] || 0) + 1;
  });

  // Get most active users
  const topUsers = Object.entries(userCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([userId, count]) => {
      const userActivity = weekActivities.find((a) => a.userId === userId);
      return {
        userId,
        userName: userActivity?.userName || "Unknown",
        count,
      };
    });

  return {
    todayCount: todayActivities.length,
    weekCount: weekActivities.length,
    monthCount: monthActivities.length,
    topActions: Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count })),
    topUsers,
  };
};

/**
 * Search activities
 */
export const searchActivities = (query: string): UserActivity[] => {
  const lowerQuery = query.toLowerCase();

  return activities.filter((a) => {
    return (
      (a.userName && a.userName.toLowerCase().includes(lowerQuery)) ||
      a.action.toLowerCase().includes(lowerQuery) ||
      a.resource.toLowerCase().includes(lowerQuery) ||
      (a.resourceId && a.resourceId.toLowerCase().includes(lowerQuery))
    );
  });
};

/**
 * Get activity types for filtering
 */
export const getActivityTypes = (): string[] => {
  const types = new Set(activities.map((a) => a.action));
  return Array.from(types).sort();
};

/**
 * Get resources for filtering
 */
export const getActivityResources = (): string[] => {
  const resources = new Set(activities.map((a) => a.resource));
  return Array.from(resources).sort();
};

/**
 * Export activities to JSON
 */
export const exportActivities = (filters?: ActivityFilters): string => {
  const data = getActivities(filters);
  return JSON.stringify(data, null, 2);
};

/**
 * Clear old activities
 */
export const clearOldActivities = (beforeDate: Date): number => {
  const initialLength = activities.length;
  const filtered = activities.filter((a) => a.createdAt >= beforeDate);
  activities.length = 0;
  activities.push(...filtered);
  return initialLength - activities.length;
};

/**
 * Get activities by date range
 */
export const getActivitiesByDateRange = (
  start: Date,
  end: Date,
): UserActivity[] => {
  return activities.filter((a) => a.createdAt >= start && a.createdAt <= end);
};

/**
 * Log common activities (helper functions)
 */
export const logLogin = (
  userId: string,
  userName: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
) => {
  return logActivity(
    userId,
    userName,
    success ? "login_success" : "login_failed",
    "auth",
    userId,
    { success },
    ipAddress,
    userAgent,
  );
};

export const logLogout = (
  userId: string,
  userName: string,
  ipAddress: string,
  userAgent: string,
) => {
  return logActivity(
    userId,
    userName,
    "logout",
    "auth",
    userId,
    {},
    ipAddress,
    userAgent,
  );
};

export const logCreate = (
  userId: string,
  userName: string,
  resource: string,
  resourceId: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string,
) => {
  return logActivity(
    userId,
    userName,
    "create",
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
  );
};

export const logUpdate = (
  userId: string,
  userName: string,
  resource: string,
  resourceId: string,
  changes?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string,
) => {
  return logActivity(
    userId,
    userName,
    "update",
    resource,
    resourceId,
    { changes },
    ipAddress,
    userAgent,
  );
};

export const logDelete = (
  userId: string,
  userName: string,
  resource: string,
  resourceId: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string,
) => {
  return logActivity(
    userId,
    userName,
    "delete",
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
  );
};

export const logView = (
  userId: string,
  userName: string,
  resource: string,
  resourceId?: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  return logActivity(
    userId,
    userName,
    "view",
    resource,
    resourceId,
    {},
    ipAddress,
    userAgent,
  );
};

export const logExport = (
  userId: string,
  userName: string,
  resource: string,
  format: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  return logActivity(
    userId,
    userName,
    "export",
    resource,
    undefined,
    { format },
    ipAddress,
    userAgent,
  );
};
