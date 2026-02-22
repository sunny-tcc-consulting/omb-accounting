/**
 * Permission Element - Show/hide elements based on permissions
 * Part of Phase 4.3: Permission System Integration
 */

"use client";

import React, { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";
import { PermissionCheck } from "@/types";

interface PermissionElementProps {
  /** Child element to show/hide */
  children: ReactNode;
  /** Permission required to show element */
  permission?: PermissionCheck;
  /** One of multiple permissions - show if user has any */
  oneOf?: PermissionCheck[];
  /** All of multiple permissions - show if user has all */
  allOf?: PermissionCheck[];
  /** Hide element if user doesn't have permission */
  fallback?: ReactNode;
  /** Disable element if user doesn't have permission */
  disabled?: boolean;
}

/**
 * Component that conditionally shows/hides content based on permissions
 *
 * @example
 * // Show button only if user can create invoices
 * <PermissionElement permission={{ resource: 'invoices', action: 'create' }}>
 *   <button>Create Invoice</button>
 * </PermissionElement>
 *
 * @example
 * // Show element if user has any of multiple permissions
 * <PermissionElement oneOf={['invoices.read', 'invoices.update']}>
 *   <EditInvoiceButton />
 * </PermissionElement>
 *
 * @example
 * // Show element if user has all permissions
 * <PermissionElement allOf={['reports.read', 'reports.update']}>
 *   <ExportButton />
 * </PermissionElement>
 *
 * @example
 * // Custom fallback content
 * <PermissionElement
 *   permission={{ resource: 'invoices', action: 'delete' }}
 *   fallback={<span className="text-gray-400">No access</span>}
 * >
 *   <DeleteButton />
 * </PermissionElement>
 *
 * @example
 * // Disabled button when no permission
 * <PermissionElement
 *   permission={{ resource: 'invoices', action: 'delete' }}
 *   disabled
 * >
 *   <DeleteButton />
 * </PermissionElement>
 */
export function PermissionElement({
  children,
  permission,
  oneOf,
  allOf,
  fallback,
  disabled = false,
}: PermissionElementProps) {
  const { can, canAll, canAny } = usePermission();

  let hasAccess = true;

  if (permission) {
    hasAccess = can(permission.resource, permission.action);
  } else if (oneOf && oneOf.length > 0) {
    hasAccess = canAny(oneOf);
  } else if (allOf && allOf.length > 0) {
    hasAccess = canAll(allOf);
  }

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Permission Button - Button that's disabled when user lacks permission
 * Convenience component for permission-protected buttons
 *
 * @example
 * <PermissionButton permission={{ resource: 'invoices', action: 'delete' }}>
 *   <button>Delete Invoice</button>
 * </PermissionButton>
 */
export function PermissionButton({
  children,
  permission,
  oneOf,
  allOf,
}: PermissionElementProps) {
  const { can, canAll, canAny } = usePermission();

  let hasAccess = true;

  if (permission) {
    hasAccess = can(permission.resource, permission.action);
  } else if (oneOf && oneOf.length > 0) {
    hasAccess = canAny(oneOf);
  } else if (allOf && allOf.length > 0) {
    hasAccess = canAll(allOf);
  }

  return (
    <PermissionElement
      permission={permission}
      oneOf={oneOf}
      allOf={allOf}
      disabled={!hasAccess}
    >
      {children}
    </PermissionElement>
  );
}

export default PermissionElement;
