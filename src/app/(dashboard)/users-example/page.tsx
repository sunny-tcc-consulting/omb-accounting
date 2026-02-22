/**
 * Example: Protected Users Management Page
 * Demonstrates using PermissionGuard for user management
 * Part of Phase 4.3: Permission System Integration
 */

"use client";

import { PermissionElement } from "@/components/auth";
import { usePermission } from "@/hooks/usePermission";
import { Search, Edit, Shield, UserPlus, Lock } from "lucide-react";

export default function ProtectedUsersPage() {
  const { can } = usePermission();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Add User Button - requires users.create permission */}
        <PermissionElement permission={{ resource: "users", action: "create" }}>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
        </PermissionElement>
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Sample user row */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">A</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Admin User</div>
                    <div className="text-sm text-gray-500">
                      admin@example.com
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">Admin</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  Active
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {/* Edit Button - requires users.update */}
                  <PermissionElement
                    permission={{ resource: "users", action: "update" }}
                    disabled
                  >
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </PermissionElement>

                  {/* Lock Button - requires users.delete */}
                  <PermissionElement
                    permission={{ resource: "users", action: "delete" }}
                    disabled
                  >
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Lock className="w-4 h-4" />
                    </button>
                  </PermissionElement>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Permission Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">
          Permission Requirements
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>View Users:</strong>{" "}
            {can("users", "read") ? "✅ Granted" : "❌ Denied"}
          </li>
          <li>
            • <strong>Create User:</strong>{" "}
            {can("users", "create") ? "✅ Granted" : "❌ Denied"}
          </li>
          <li>
            • <strong>Edit User:</strong>{" "}
            {can("users", "update") ? "✅ Granted" : "❌ Denied"}
          </li>
          <li>
            • <strong>Delete User:</strong>{" "}
            {can("users", "delete") ? "✅ Granted" : "❌ Denied"}
          </li>
        </ul>
      </div>
    </div>
  );
}
