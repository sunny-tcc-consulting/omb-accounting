/**
 * Example: Protected Dashboard Page
 * Demonstrates using PermissionGuard for route protection
 * Part of Phase 4.3: Permission System Integration
 */

"use client";

import { PermissionGuard, PermissionElement } from "@/components/auth";
import { TrendingUp, Users, Settings } from "lucide-react";

export default function ProtectedDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Show dashboard content only if user has read access */}
      <PermissionGuard
        requirePermission={{ resource: "dashboard", action: "read" }}
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 - Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Revenue</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">$45,231</p>
            <p className="text-sm text-green-600">+20.1% from last month</p>
          </div>

          {/* Card 2 - Expenses */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Expenses</h3>
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">$12,839</p>
            <p className="text-sm text-red-600">+10.5% from last month</p>
          </div>

          {/* Card 3 - Customers */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Customers</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">1,245</p>
            <p className="text-sm text-gray-600">+12 new this month</p>
          </div>

          {/* Card 4 - Settings */}
          <PermissionElement
            permission={{ resource: "settings", action: "read" }}
          >
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <Settings className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600">Manage system settings</p>
            </div>
          </PermissionElement>
        </div>
      </PermissionGuard>
    </div>
  );
}
