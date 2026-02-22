/**
 * Permission Hook - Check user permissions
 * Part of Phase 4.3: Permission System Integration
 */

"use client";

import { useUser } from "@/contexts/UserContext";
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
  currentUser: typeof import("@/types").User | null;
}

/**
 * Hook to check user permissions
 * @returns Permission checking functions
 *
 * @example
 * const { can } = usePermission();
 * if (can('invoices', 'create')) { ... }
 */
export function usePermission(): UsePermissionReturn {
  const { currentUser } = useUser();

  const can = (resource: string, action?: string): boolean => {
    if (!currentUser) return false;
    const permission: Permission = {
      resource,
      action: (action as PermissionAction) || "read",
    };
    return hasPermission(currentUser.permissions, permission);
  };

  const canAll = (permissions: Permission[]): boolean => {
    if (!currentUser) return false;
    return permissions.every((permission) =>
      hasPermission(currentUser.permissions, permission),
    );
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!currentUser) return false;
    return permissions.some((permission) =>
      hasPermission(currentUser.permissions, permission),
    );
  };

  return {
    can,
    canAll,
    canAny,
    userPermissions: currentUser?.permissions || [],
    currentUser,
  };
}

/**
 * Hook to check user permission level for a specific resource
 * @param resource - The resource to check
 * @returns The highest permission level for the resource
 */
export function usePermissionLevel(
  resource: PermissionResource,
): PermissionLevel {
  const { currentUser } = useUser();

  if (!currentUser) return "none";

  const resourcePermissions = currentUser.permissions.filter(
    (p) => p.resource === resource,
  );

  if (!resourcePermissions.length) return "none";

  const actionLevels: Record<PermissionAction, PermissionLevel> = {
    none: "none",
    read: "read",
    create: "create",
    update: "write",
    delete: "delete",
  };

  // Find the highest level permission
  const levels = resourcePermissions.map(
    (p) => actionLevels[p.action] || "none",
  );
  if (levels.includes("delete")) return "delete";
  if (levels.includes("write")) return "write";
  if (levels.includes("create")) return "create";
  if (levels.includes("read")) return "read";
  return "none";
}

export default usePermission;
