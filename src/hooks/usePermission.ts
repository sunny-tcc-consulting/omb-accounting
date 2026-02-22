/**
 * Permission Hook - Check user permissions
 * Part of Phase 4.3: Permission System Integration
 */

"use client";

import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import {
  Permission,
  PermissionAction,
  PermissionResource,
  PermissionLevel,
} from "@/types";
import { hasPermission } from "@/lib/roles";

interface UsePermissionReturn {
  can: (resource: string, action?: string) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  userPermissions: Permission[];
  currentUser: typeof import("@/types").User;
}

/**
 * Hook to check user permissions
 * @returns Permission checking functions
 *
 * @example
 * // Check if user can read invoices
 * const { can } = usePermission();
 * if (can('invoices', 'read')) {
 *   // Show invoice list
 * }
 *
 * @example
 * // Check if user has any of multiple permissions
 * const { canAny } = usePermission();
 * if (canAny(['invoices.read', 'customers.create'])) {
 *   // Show action button
 * }
 *
 * @example
 * // Check if user has all permissions
 * const { canAll } = usePermission();
 * if (canAll(['reports.read', 'reports.update'])) {
 *   // Show admin features
 * }
 */
export function usePermission(): UsePermissionReturn {
  const { currentUser, users } = useContext(UserContext);

  if (!currentUser) {
    return {
      can: () => false,
      canAll: () => false,
      canAny: () => false,
      hasPermission: () => false,
      userPermissions: [],
      currentUser: null,
    };
  }

  const userPermissions =
    users.find((u) => u.id === currentUser.id)?.permissions ||
    currentUser.permissions ||
    [];

  const can = (
    resource: PermissionResource,
    action?: PermissionAction,
  ): boolean => {
    return hasPermission(userPermissions, resource, action);
  };

  const canAll = (permissions: Permission[]): boolean => {
    return permissions.every((perm) =>
      hasPermission(userPermissions, perm.resource, perm.action),
    );
  };

  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some((perm) =>
      hasPermission(userPermissions, perm.resource, perm.action),
    );
  };

  return {
    can,
    canAll,
    canAny,
    userPermissions,
    currentUser,
  };
}

/**
 * Hook to check permission level
 * @param level - Permission level to check
 * @returns True if user has at least this level
 */
export function usePermissionLevel(level: PermissionLevel): boolean {
  const { currentUser } = useContext(UserContext);
  if (!currentUser) return false;

  const levelOrder: PermissionLevel[] = [
    "none",
    "read",
    "update",
    "create",
    "delete",
    "admin",
  ];
  const userLevel = levelOrder.indexOf(currentUser.roleLevel || "read");
  const targetLevel = levelOrder.indexOf(level);

  return userLevel >= targetLevel;
}

export default usePermission;
