/**
 * Permission Guard - Protect pages and routes based on permissions
 * Part of Phase 4.3: Permission System Integration
 */

"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/types";
import { ShieldAlert, Lock } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  /** Require specific permission to access */
  requirePermission?: Permission;
  /** Require one of multiple permissions */
  requireOneOf?: Permission[];
  /** Require all of multiple permissions */
  requireAllOf?: Permission[];
  /** Show loading state while checking permissions */
  loading?: boolean;
  /** Show unauthorized message when access denied */
  showUnauthorized?: boolean;
  /** Custom unauthorized component */
  UnauthorizedComponent?: React.ComponentType<{
    requiredPermissions?: Permission[];
  }>;
}

/**
 * Guard component that protects pages based on permissions
 *
 * @example
 * // Require specific permission
 * <PermissionGuard requirePermission="invoices.create">
 *   <CreateInvoicePage />
 * </PermissionGuard>
 *
 * @example
 * // Require one of multiple permissions
 * <PermissionGuard requireOneOf={['invoices.read', 'invoices.update']}>
 *   <InvoicePage />
 * </PermissionGuard>
 *
 * @example
 * // Require all permissions
 * <PermissionGuard requireAllOf={['reports.read', 'reports.update']}>
 *   <ReportsPage />
 * </PermissionGuard>
 *
 * @example
 * // Custom unauthorized component
 * <PermissionGuard
 *   requirePermission="invoices.create"
 *   UnauthorizedComponent={MyUnauthorizedPage}
 * >
 *   <CreateInvoicePage />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  requirePermission,
  requireOneOf,
  requireAllOf,
  loading = true,
  showUnauthorized = true,
  UnauthorizedComponent,
}: PermissionGuardProps) {
  const { isLoading: userLoading } = useUser();
  const { can, canAll, canAny } = usePermission();

  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!userLoading && !checking) return;

    let access = false;

    if (requirePermission) {
      access = can(requirePermission.resource, requirePermission.action);
    } else if (requireOneOf && requireOneOf.length > 0) {
      access = canAny(requireOneOf);
    } else if (requireAllOf && requireAllOf.length > 0) {
      access = canAll(requireAllOf);
    } else {
      access = true;
    }

    // Use setTimeout to avoid calling setState synchronously in effect
    setTimeout(() => {
      setChecking(false);
      setHasAccess(access);
    }, 0);
  }, [
    requirePermission,
    requireOneOf,
    requireAllOf,
    can,
    canAll,
    canAny,
    userLoading,
    checking,
  ]);

  if (loading && checking) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Lock className="w-5 h-5 animate-spin" />
          <span>Checking permissions...</span>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (showUnauthorized && UnauthorizedComponent) {
      return (
        <UnauthorizedComponent
          requiredPermissions={
            requirePermission || requireOneOf || requireAllOf
          }
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600 mb-4">
          You don&apos;t have permission to access this page.
        </p>
        {requirePermission && (
          <p className="text-sm text-gray-500">
            Required:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">{`${requirePermission.resource}.${requirePermission.action}`}</code>
          </p>
        )}
        {requireOneOf && (
          <p className="text-sm text-gray-500">
            Required one of:{" "}
            {requireOneOf.map((p) => `${p.resource}.${p.action}`).join(", ")}
          </p>
        )}
        {requireAllOf && (
          <p className="text-sm text-gray-500">
            Required all of:{" "}
            {requireAllOf.map((p) => `${p.resource}.${p.action}`).join(", ")}
          </p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Page-level permission guard for Next.js routes
 * Wraps the entire page component
 *
 * @example
 * // In page.tsx
 * export default function ProtectedPage() {
 *   return (
 *     <PermissionGuard requirePermission="invoices.read">
 *       <InvoicePage />
 *     </PermissionGuard>
 *   );
 * }
 */
export default PermissionGuard;
