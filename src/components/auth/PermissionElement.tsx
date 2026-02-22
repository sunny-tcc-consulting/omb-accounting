/**
 * Permission Element - Show/hide elements based on permissions
 * Part of Phase 4.3: Permission System Integration
 */

"use client";

import { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/types";

interface PermissionElementProps {
  /** Child element to show/hide */
  children: ReactNode;
  /** Permission required to show element */
  permission?: Permission;
  /** One of multiple permissions - show if user has any */
  oneOf?: Permission[];
  /** All of multiple permissions - show if user has all */
  allOf?: Permission[];
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

  const clonedChildren = React.Children.map(children, (child) => {
    if (
      disabled &&
      typeof child === "object" &&
      child !== null &&
      "type" in child
    ) {
      // Check if it's a button-like element
      const type = (child as React.ReactElement).type;
      if (typeof type === "function") {
        const typeObj = type as { displayName?: string };
        const displayName = typeObj.displayName;
        if (displayName?.includes("Button")) {
          return React.cloneElement(child as React.ReactElement, {
            disabled: true,
            title: "You do not have permission to perform this action",
          });
        }
      }
    }
    return child;
  });

  return <>{clonedChildren}</>;
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
