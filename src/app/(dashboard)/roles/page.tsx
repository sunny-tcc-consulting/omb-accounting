/**
 * Role Management Page - Admin UI for managing roles and permissions
 * Part of Phase 4: User & Roles module
 */

"use client";

import { useState, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Role,
  Permission,
  PermissionAction,
  PermissionResource,
} from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Shield,
  Check,
  X,
  Info,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  getPermissionMatrix,
  getRoles,
} from "@/lib/roles";
import { logActivity } from "@/lib/activity-logger";

// Form validation schema
const roleFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  permissionIds: z.array(z.string()),
  isActive: z.boolean(),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

// Group permissions by resource
const permissionGroups = [
  { key: "dashboard", label: "Dashboard", permissions: ["read"] },
  {
    key: "customers",
    label: "Customers",
    permissions: ["create", "read", "update", "delete"],
  },
  {
    key: "quotations",
    label: "Quotations",
    permissions: ["create", "read", "update", "delete"],
  },
  {
    key: "invoices",
    label: "Invoices",
    permissions: ["create", "read", "update", "delete"],
  },
  { key: "reports", label: "Reports", permissions: ["read", "update"] },
  { key: "settings", label: "Settings", permissions: ["read", "update"] },
  {
    key: "users",
    label: "Users",
    permissions: ["create", "read", "update", "delete"],
  },
  {
    key: "roles",
    label: "Roles",
    permissions: ["create", "read", "update", "delete"],
  },
  { key: "audit", label: "Audit", permissions: ["read"] },
];

export default function RolesPage() {
  const { currentUser, users } = useUser();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["customers", "quotations", "invoices"]),
  );
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(),
  );

  const roles = getRoles();
  const permissions = getPermissions();
  const permissionMatrix = getPermissionMatrix();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
      isActive: true,
    },
  });

  // Filter roles
  const filteredRoles = roles.filter((role) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        role.name.toLowerCase().includes(searchLower) ||
        role.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Permission count per role
  const getPermissionCount = (role: Role) => role.permissions.length;

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const selectAllInGroup = (groupKey: string) => {
    const groupPerms = permissions.filter((p) => p.resource === groupKey);
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      groupPerms.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const clearAllInGroup = (groupKey: string) => {
    const groupPerms = permissions.filter((p) => p.resource === groupKey);
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      groupPerms.forEach((p) => next.delete(p.id));
      return next;
    });
  };

  const openCreateModal = () => {
    setEditingRole(null);
    reset({ name: "", description: "", permissionIds: [], isActive: true });
    setSelectedPermissions(new Set());
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    reset({
      name: role.name,
      description: role.description,
      permissionIds: role.permissions.map((p) => p.id),
      isActive: role.isActive,
    });
    setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
    setIsModalOpen(true);
  };

  const handleSave = async (data: RoleFormData) => {
    setIsLoading(true);

    if (editingRole) {
      try {
        updateRole(editingRole.id, {
          name: data.name,
          description: data.description,
          permissionIds: Array.from(selectedPermissions),
          isActive: data.isActive,
        });

        logActivity(
          currentUser?.id || "system",
          currentUser?.name || "System",
          "update",
          "roles",
          editingRole.id,
          { name: data.name },
          "client-ip",
          navigator.userAgent,
        );

        toast.success("Role updated successfully");
        setIsModalOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update role",
        );
      }
    } else {
      try {
        createRole({
          name: data.name,
          description: data.description,
          permissionIds: Array.from(selectedPermissions),
          isActive: data.isActive,
        });

        logActivity(
          currentUser?.id || "system",
          currentUser?.name || "System",
          "create",
          "roles",
          "new",
          { name: data.name },
          "client-ip",
          navigator.userAgent,
        );

        toast.success("Role created successfully");
        setIsModalOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create role",
        );
      }
    }

    setIsLoading(false);
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    // Check if any users have this role
    const usersWithRole = users.filter((u) => u.roleId === roleId);
    if (usersWithRole.length > 0) {
      toast.error(
        `Cannot delete ${roleName}. ${usersWithRole.length} user(s) have this role.`,
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete "${roleName}"?`)) return;

    try {
      deleteRole(roleId);
      logActivity(
        currentUser?.id || "system",
        currentUser?.name || "System",
        "delete",
        "roles",
        roleId,
        { name: roleName },
        "client-ip",
        navigator.userAgent,
      );
      toast.success("Role deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete role",
      );
    }
  };

  const getPermissionActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: "Create",
      read: "View",
      update: "Edit",
      delete: "Delete",
    };
    return labels[action] || action;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">
            Configure roles and permissions for access control
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Role
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      role.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600",
                    )}
                  >
                    {role.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              {role.isSystem && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  System
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {role.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">
                  {role.permissions.length}
                </span>{" "}
                permissions
              </div>
              <div className="flex items-center gap-2">
                {!role.isSystem && (
                  <>
                    <button
                      onClick={() => openEditModal(role)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(role.id, role.name)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Permission summary */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 4).map((perm) => (
                  <span
                    key={perm.id}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                  >
                    {perm.name}
                  </span>
                ))}
                {role.permissions.length > 4 && (
                  <span className="text-xs text-gray-500">
                    +{role.permissions.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No roles found</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingRole
                  ? `Edit Role: ${editingRole.name}`
                  : "Create New Role"}
              </h2>

              <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name
                    </label>
                    <input
                      {...register("name")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g., Manager"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      {...register("isActive")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                    placeholder="Describe what this role can do..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Permissions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Permissions
                    </label>
                    <span className="text-sm text-gray-500">
                      {selectedPermissions.size} selected
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-lg divide-y">
                    {permissionGroups.map((group) => {
                      const groupPerms = permissions.filter(
                        (p) => p.resource === group.key,
                      );
                      const isExpanded = expandedGroups.has(group.key);
                      const allSelected = groupPerms.every((p) =>
                        selectedPermissions.has(p.id),
                      );
                      const someSelected = groupPerms.some((p) =>
                        selectedPermissions.has(p.id),
                      );

                      return (
                        <div key={group.key}>
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.key)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="font-medium text-gray-900">
                                {group.label}
                              </span>
                              <span className="text-sm text-gray-500">
                                (
                                {
                                  groupPerms.filter((p) =>
                                    selectedPermissions.has(p.id),
                                  ).length
                                }
                                /{groupPerms.length})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  allSelected
                                    ? clearAllInGroup(group.key)
                                    : selectAllInGroup(group.key);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                {allSelected ? "Clear all" : "Select all"}
                              </button>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-4 py-2 bg-gray-50 grid grid-cols-2 gap-2">
                              {groupPerms.map((perm) => {
                                const isSelected = selectedPermissions.has(
                                  perm.id,
                                );

                                return (
                                  <label
                                    key={perm.id}
                                    className={cn(
                                      "flex items-start gap-2 p-2 rounded cursor-pointer transition-colors",
                                      isSelected
                                        ? "bg-blue-50"
                                        : "hover:bg-gray-100",
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => togglePermission(perm.id)}
                                      className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                                    />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {getPermissionActionLabel(perm.action)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {perm.description}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || selectedPermissions.size === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading
                      ? "Saving..."
                      : editingRole
                        ? "Update Role"
                        : "Create Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
