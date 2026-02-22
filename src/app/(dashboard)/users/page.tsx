/**
 * User Management Page - Admin UI for managing users
 * Part of Phase 4: User & Roles module
 */

"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { User, UserStatus, UserFormData } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Shield,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Form validation schema
const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Please select a role"),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "locked"]),
});

type UserFormData = z.infer<typeof userFormSchema>;

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  inactive: {
    label: "Inactive",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
  },
  locked: { label: "Locked", color: "bg-red-100 text-red-800", icon: Lock },
};

export default function UsersPage() {
  const {
    currentUser,
    users,
    addUser,
    editUser,
    removeUser,
    activateUser,
    deactivateUser,
    lockUser,
  } = useUser();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    reset({ name: "", email: "", roleId: "", phone: "", status: "active" });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      phone: user.phone || "",
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (data: UserFormData) => {
    setIsLoading(true);

    if (editingUser) {
      const result = await editUser(editingUser.id, data);
      if (result.success) {
        toast.success("User updated successfully");
        setIsModalOpen(false);
      } else {
        toast.error(result.error || "Failed to update user");
      }
    } else {
      const result = await addUser(data);
      if (result.success) {
        toast.success("User created successfully");
        setIsModalOpen(false);
      } else {
        toast.error(result.error || "Failed to create user");
      }
    }

    setIsLoading(false);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    const result = await removeUser(userId);
    if (result.success) {
      toast.success("User deactivated");
    } else {
      toast.error(result.error || "Failed to deactivate user");
    }
  };

  const handleStatusChange = async (
    userId: string,
    action: "activate" | "deactivate" | "lock",
  ) => {
    let success = false;

    switch (action) {
      case "activate":
        success = await activateUser(userId);
        break;
      case "deactivate":
        success = await deactivateUser(userId);
        break;
      case "lock":
        success = await lockUser(userId);
        break;
    }

    if (success) {
      toast.success(`User ${action}d successfully`);
    } else {
      toast.error(`Failed to ${action} user`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage user accounts and access permissions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const status = statusConfig[user.status as UserStatus];
              const StatusIcon = status.icon;

              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{user.roleName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                        status.color,
                      )}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastLoginAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.lastLoginAt).toLocaleDateString()}
                      </div>
                    ) : (
                      "Never"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {user.status === "active" ? (
                        <button
                          onClick={() => handleStatusChange(user.id, "lock")}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Lock"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : user.status === "locked" ? (
                        <button
                          onClick={() =>
                            handleStatusChange(user.id, "activate")
                          }
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Unlock"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      ) : null}

                      {user.status !== "inactive" ? (
                        <button
                          onClick={() =>
                            handleStatusChange(user.id, "deactivate")
                          }
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleStatusChange(user.id, "activate")
                          }
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Activate"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>

            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  {...register("name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  {...register("roleId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a role</option>
                  <option value="role-admin">Admin</option>
                  <option value="role-manager">Manager</option>
                  <option value="role-accountant">Accountant</option>
                  <option value="role-viewer">Viewer</option>
                </select>
                {errors.roleId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.roleId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  {...register("phone")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>
              )}

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
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : editingUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
