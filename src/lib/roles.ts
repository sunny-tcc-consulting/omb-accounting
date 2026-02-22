/**
 * Role Service - Role and Permission management
 * Part of Phase 4: User & Roles module
 */

import {
  Role,
  Permission,
  RoleFormData,
  PermissionAction,
  PermissionResource,
} from "@/types";

// In-memory role store
const roles: Map<string, Role> = new Map();

// In-memory permission store
const permissions: Map<string, Permission> = new Map();

/**
 * Initialize default permissions
 */
const initializeDefaultPermissions = () => {
  const defaultPermissions: Permission[] = [
    // Dashboard
    {
      id: "perm-dashboard-read",
      resource: "dashboard",
      action: "read",
      name: "View Dashboard",
      description: "Access dashboard and view metrics",
    },

    // Customers
    {
      id: "perm-customers-create",
      resource: "customers",
      action: "create",
      name: "Create Customer",
      description: "Add new customers",
    },
    {
      id: "perm-customers-read",
      resource: "customers",
      action: "read",
      name: "View Customers",
      description: "View customer list and details",
    },
    {
      id: "perm-customers-update",
      resource: "customers",
      action: "update",
      name: "Edit Customer",
      description: "Edit customer information",
    },
    {
      id: "perm-customers-delete",
      resource: "customers",
      action: "delete",
      name: "Delete Customer",
      description: "Remove customers",
    },

    // Quotations
    {
      id: "perm-quotations-create",
      resource: "quotations",
      action: "create",
      name: "Create Quotation",
      description: "Create new quotations",
    },
    {
      id: "perm-quotations-read",
      resource: "quotations",
      action: "read",
      name: "View Quotations",
      description: "View quotation list and details",
    },
    {
      id: "perm-quotations-update",
      resource: "quotations",
      action: "update",
      name: "Edit Quotation",
      description: "Edit quotation information",
    },
    {
      id: "perm-quotations-delete",
      resource: "quotations",
      action: "delete",
      name: "Delete Quotation",
      description: "Remove quotations",
    },

    // Invoices
    {
      id: "perm-invoices-create",
      resource: "invoices",
      action: "create",
      name: "Create Invoice",
      description: "Create new invoices",
    },
    {
      id: "perm-invoices-read",
      resource: "invoices",
      action: "read",
      name: "View Invoices",
      description: "View invoice list and details",
    },
    {
      id: "perm-invoices-update",
      resource: "invoices",
      action: "update",
      name: "Edit Invoice",
      description: "Edit invoice information",
    },
    {
      id: "perm-invoices-delete",
      resource: "invoices",
      action: "delete",
      name: "Delete Invoice",
      description: "Remove invoices",
    },

    // Reports
    {
      id: "perm-reports-read",
      resource: "reports",
      action: "read",
      name: "View Reports",
      description: "Access audit reports",
    },
    {
      id: "perm-reports-export",
      resource: "reports",
      action: "update",
      name: "Export Reports",
      description: "Export reports to PDF/CSV",
    },

    // Settings
    {
      id: "perm-settings-read",
      resource: "settings",
      action: "read",
      name: "View Settings",
      description: "Access settings page",
    },
    {
      id: "perm-settings-update",
      resource: "settings",
      action: "update",
      name: "Edit Settings",
      description: "Modify system settings",
    },

    // Users
    {
      id: "perm-users-create",
      resource: "users",
      action: "create",
      name: "Create User",
      description: "Add new users",
    },
    {
      id: "perm-users-read",
      resource: "users",
      action: "read",
      name: "View Users",
      description: "View user list and details",
    },
    {
      id: "perm-users-update",
      resource: "users",
      action: "update",
      name: "Edit User",
      description: "Edit user information",
    },
    {
      id: "perm-users-delete",
      resource: "users",
      action: "delete",
      name: "Delete User",
      description: "Remove users",
    },

    // Roles
    {
      id: "perm-roles-create",
      resource: "roles",
      action: "create",
      name: "Create Role",
      description: "Add new roles",
    },
    {
      id: "perm-roles-read",
      resource: "roles",
      action: "read",
      name: "View Roles",
      description: "View role list and details",
    },
    {
      id: "perm-roles-update",
      resource: "roles",
      action: "update",
      name: "Edit Role",
      description: "Edit role and permissions",
    },
    {
      id: "perm-roles-delete",
      resource: "roles",
      action: "delete",
      name: "Delete Role",
      description: "Remove roles",
    },

    // Audit
    {
      id: "perm-audit-read",
      resource: "audit",
      action: "read",
      name: "View Audit Log",
      description: "Access activity audit logs",
    },
  ];

  defaultPermissions.forEach((perm) => {
    permissions.set(perm.id, perm);
  });
};

/**
 * Initialize default roles
 */
const initializeDefaultRoles = () => {
  const adminPermissions = Array.from(permissions.values()).map((p) => p.id);
  const managerPermissions = Array.from(permissions.values())
    .filter(
      (p) =>
        !["users", "roles", "audit"].includes(p.resource) ||
        p.action === "read",
    )
    .map((p) => p.id);
  const accountantPermissions = Array.from(permissions.values())
    .filter(
      (p) => !["users", "roles", "settings", "audit"].includes(p.resource),
    )
    .map((p) => p.id);
  const viewerPermissions = Array.from(permissions.values())
    .filter(
      (p) =>
        p.action === "read" &&
        !["users", "roles", "settings"].includes(p.resource),
    )
    .map((p) => p.id);

  const defaultRoles: Role[] = [
    {
      id: "role-admin",
      name: "Admin",
      description: "Full system access - can manage all features and users",
      isSystem: true,
      isActive: true,
      permissions: adminPermissions
        .map((id) => permissions.get(id)!)
        .filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "role-manager",
      name: "Manager",
      description: "Management access - can manage all business data",
      isSystem: true,
      isActive: true,
      permissions: managerPermissions
        .map((id) => permissions.get(id)!)
        .filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "role-accountant",
      name: "Accountant",
      description: "Accounting access - can manage transactions and reports",
      isSystem: true,
      isActive: true,
      permissions: accountantPermissions
        .map((id) => permissions.get(id)!)
        .filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "role-viewer",
      name: "Viewer",
      description: "Read-only access - can view data but not modify",
      isSystem: true,
      isActive: true,
      permissions: viewerPermissions
        .map((id) => permissions.get(id)!)
        .filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  defaultRoles.forEach((role) => {
    roles.set(role.id, role);
  });
};

// Initialize on module load
initializeDefaultPermissions();
initializeDefaultRoles();

/**
 * Get all roles
 */
export const getRoles = (includeInactive = false): Role[] => {
  let result = Array.from(roles.values());

  if (!includeInactive) {
    result = result.filter((role) => role.isActive);
  }

  // Sort by isSystem (system roles first) then by name
  result.sort((a, b) => {
    if (a.isSystem && !b.isSystem) return -1;
    if (!a.isSystem && b.isSystem) return 1;
    return a.name.localeCompare(b.name);
  });

  return result;
};

/**
 * Get role by ID
 */
export const getRoleById = (id: string): Role | undefined => {
  return roles.get(id);
};

/**
 * Get role by name
 */
export const getRoleByName = (name: string): Role | undefined => {
  return Array.from(roles.values()).find((role) => role.name === name);
};

/**
 * Create a new role
 */
export const createRole = (formData: RoleFormData): Role => {
  // Check if name already exists
  const existingRole = getRoleByName(formData.name);
  if (existingRole) {
    throw new Error("Role name already exists");
  }

  const id = `role-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date();

  const newRole: Role = {
    id,
    name: formData.name,
    description: formData.description,
    isSystem: false,
    isActive: formData.isActive ?? true,
    permissions: formData.permissionIds
      .map((pid) => permissions.get(pid))
      .filter((p): p is Permission => p !== undefined),
    createdAt: now,
    updatedAt: now,
  };

  roles.set(id, newRole);
  return newRole;
};

/**
 * Update an existing role
 */
export const updateRole = (
  id: string,
  updates: Partial<RoleFormData>,
): Role | undefined => {
  const role = roles.get(id);
  if (!role) {
    return undefined;
  }

  // Check name uniqueness if name is being updated
  if (updates.name && updates.name !== role.name) {
    const existingRole = getRoleByName(updates.name);
    if (existingRole) {
      throw new Error("Role name already exists");
    }
  }

  // Prevent modification of system roles
  if (
    role.isSystem &&
    (updates.name !== undefined || updates.permissionIds !== undefined)
  ) {
    throw new Error("Cannot modify system role name or permissions");
  }

  const updatedRole: Role = {
    ...role,
    name: updates.name || role.name,
    description: updates.description || role.description,
    isActive: updates.isActive ?? role.isActive,
    permissions: updates.permissionIds
      ? updates.permissionIds
          .map((pid) => permissions.get(pid))
          .filter((p): p is Permission => p !== undefined)
      : role.permissions,
    updatedAt: new Date(),
  };

  roles.set(id, updatedRole);
  return updatedRole;
};

/**
 * Delete a role (soft delete - set to inactive)
 */
export const deleteRole = (id: string): boolean => {
  const role = roles.get(id);
  if (!role) {
    return false;
  }

  // Prevent deletion of system roles
  if (role.isSystem) {
    throw new Error("Cannot delete system role");
  }

  // Soft delete - just set to inactive
  role.isActive = false;
  role.updatedAt = new Date();
  roles.set(id, role);
  return true;
};

/**
 * Hard delete a role (use with caution)
 */
export const hardDeleteRole = (id: string): boolean => {
  const role = roles.get(id);
  if (!role) {
    return false;
  }

  if (role.isSystem) {
    throw new Error("Cannot delete system role");
  }

  return roles.delete(id);
};

/**
 * Get all permissions
 */
export const getPermissions = (): Permission[] => {
  return Array.from(permissions.values());
};

/**
 * Get permissions by resource
 */
export const getPermissionsByResource = (
  resource: PermissionResource,
): Permission[] => {
  return Array.from(permissions.values()).filter(
    (p) => p.resource === resource,
  );
};

/**
 * Get permissions by action
 */
export const getPermissionsByAction = (
  action: PermissionAction,
): Permission[] => {
  return Array.from(permissions.values()).filter((p) => p.action === action);
};

/**
 * Get permission by ID
 */
export const getPermissionById = (id: string): Permission | undefined => {
  return permissions.get(id);
};

/**
 * Check if user permissions include the required permission
 */
export const hasPermission = (
  userPermissions: Permission[],
  required: { resource: PermissionResource; action: PermissionAction },
): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Admin role has all permissions
  const isAdmin = userPermissions.some(
    (p) => p.resource === "users" && p.action === "delete",
  );
  if (isAdmin) return true;

  return userPermissions.some(
    (p) => p.resource === required.resource && p.action === required.action,
  );
};

/**
 * Get role permissions as a set for quick lookup
 */
export const getRolePermissionSet = (roleId: string): Set<string> => {
  const role = roles.get(roleId);
  if (!role) {
    return new Set();
  }

  return new Set(role.permissions.map((p) => `${p.resource}:${p.action}`));
};

/**
 * Check if role has permission
 */
export const roleHasPermission = (
  roleId: string,
  resource: PermissionResource,
  action: PermissionAction,
): boolean => {
  const permissionSet = getRolePermissionSet(roleId);
  return permissionSet.has(`${resource}:${action}`);
};

/**
 * Add permission to role
 */
export const addPermissionToRole = (
  roleId: string,
  permissionId: string,
): Role | undefined => {
  const role = roles.get(roleId);
  const permission = permissions.get(permissionId);

  if (!role || !permission) {
    return undefined;
  }

  // Prevent modification of system roles
  if (role.isSystem) {
    throw new Error("Cannot modify system role permissions");
  }

  // Check if permission already exists
  const exists = role.permissions.some((p) => p.id === permissionId);
  if (exists) {
    return role;
  }

  role.permissions.push(permission);
  role.updatedAt = new Date();
  roles.set(roleId, role);
  return role;
};

/**
 * Remove permission from role
 */
export const removePermissionFromRole = (
  roleId: string,
  permissionId: string,
): Role | undefined => {
  const role = roles.get(roleId);
  if (!role) {
    return undefined;
  }

  // Prevent modification of system roles
  if (role.isSystem) {
    throw new Error("Cannot modify system role permissions");
  }

  role.permissions = role.permissions.filter((p) => p.id !== permissionId);
  role.updatedAt = new Date();
  roles.set(roleId, role);
  return role;
};

/**
 * Get permission matrix grouped by resource
 */
export const getPermissionMatrix = (): Record<string, Permission[]> => {
  const matrix: Record<string, Permission[]> = {};

  permissions.forEach((permission) => {
    if (!matrix[permission.resource]) {
      matrix[permission.resource] = [];
    }
    matrix[permission.resource].push(permission);
  });

  return matrix;
};

/**
 * Get role count
 */
export const getRoleCount = (): number => {
  return roles.size;
};

/**
 * Get system roles
 */
export const getSystemRoles = (): Role[] => {
  return Array.from(roles.values()).filter((role) => role.isSystem);
};

/**
 * Get custom roles
 */
export const getCustomRoles = (): Role[] => {
  return Array.from(roles.values()).filter((role) => !role.isSystem);
};

/**
 * Clone a role
 */
export const cloneRole = (
  sourceRoleId: string,
  newName: string,
): Role | undefined => {
  const sourceRole = roles.get(sourceRoleId);
  if (!sourceRole) {
    return undefined;
  }

  const id = `role-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date();

  const clonedRole: Role = {
    ...sourceRole,
    id,
    name: newName,
    description: `${sourceRole.description} (Copy)`,
    isSystem: false,
    isActive: true,
    permissions: [...sourceRole.permissions],
    createdAt: now,
    updatedAt: now,
  };

  roles.set(id, clonedRole);
  return clonedRole;
};

/**
 * Validate role can be deleted
 */
export const canDeleteRole = (
  roleId: string,
): { can: boolean; reason?: string } => {
  const role = roles.get(roleId);
  if (!role) {
    return { can: false, reason: "Role not found" };
  }

  if (role.isSystem) {
    return { can: false, reason: "Cannot delete system role" };
  }

  return { can: true };
};

/**
 * Get permission summary for role
 */
export const getRolePermissionSummary = (
  roleId: string,
): Record<string, number> => {
  const role = roles.get(roleId);
  if (!role) {
    return {};
  }

  const summary: Record<string, number> = {};
  role.permissions.forEach((p) => {
    summary[p.resource] = (summary[p.resource] || 0) + 1;
  });

  return summary;
};
