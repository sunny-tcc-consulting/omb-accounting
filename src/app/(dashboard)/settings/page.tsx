"use client";
import { useState } from "react";
import { useTranslation } from "@/contexts/I18nContext";
import { Locale, locales } from "@/lib/i18n/i18n";

/**
 * Settings Page
 * Includes language selection with browser detection
 */
export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation();

  // Mock user data for video testing
  const mockUser = {
    name: "Admin User",
    email: "admin@omb.com",
    role: "Administrator",
  };

  const [activeTab, setActiveTab] = useState("appearance");

  // List of existing pages in the app
  const navPages = [
    { path: "/", label: t("nav.dashboard"), icon: "📊" },
    { path: "/customers", label: t("nav.customers"), icon: "👥" },
    { path: "/quotations", label: t("nav.quotations"), icon: "📄" },
    { path: "/invoices", label: t("nav.invoices"), icon: "🧾" },
    { path: "/reports", label: t("nav.reports"), icon: "📈" },
    { path: "/bank", label: t("nav.bank"), icon: "🏦" },
    { path: "/users", label: t("nav.users"), icon: "👤" },
    { path: "/roles", label: t("nav.roles"), icon: "🔐" },
  ];

  // Locale names mapping
  const localeNames: Record<Locale, string> = {
    en: "English",
    "zh-HK": "繁體中文 (Hong Kong)",
    "zh-CN": "简体中文 (Mainland)",
  };

  const localeFlags: Record<Locale, string> = {
    en: "🇺🇸",
    "zh-HK": "🇭🇰",
    "zh-CN": "🇨🇳",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("settings.title", { defaultValue: "Settings" })}
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your account and system preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                {t("settings.title", { defaultValue: "Settings" })}
              </h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {[
                {
                  id: "profile",
                  label: t("auth.login", { defaultValue: "Profile" }),
                  icon: "👤",
                },
                {
                  id: "security",
                  label: t("settings.security", { defaultValue: "Security" }),
                  icon: "🔒",
                },
                {
                  id: "notifications",
                  label: t("settings.notifications", {
                    defaultValue: "Notifications",
                  }),
                  icon: "🔔",
                },
                {
                  id: "appearance",
                  label: t("settings.appearance"),
                  icon: "🎨",
                },
                {
                  id: "integrations",
                  label: t("settings.integrations"),
                  icon: "🔗",
                },
                { id: "data", label: t("settings.dataManagement"), icon: "💾" },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick Links */}
          <nav className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                {t("settings.quickLinks")}
              </h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {navPages.map((page) => (
                <li key={page.path}>
                  <a
                    href={page.path}
                    className="px-4 py-3 text-left flex items-center gap-3 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span>{page.icon}</span>
                    <span>{page.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Appearance Tab with Language Selection */}
            {activeTab === "appearance" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t("settings.appearanceSettings")}
                </h2>

                <div className="space-y-6">
                  {/* Language Selection */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {t("settings.language", { defaultValue: "Language" })}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Select your preferred language. The interface will adapt
                      to your choice.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {locales.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => setLocale(loc)}
                          className={`p-4 border rounded-lg text-left transition-all ${
                            locale === loc
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{localeFlags[loc]}</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {localeNames[loc]}
                              </div>
                              {locale === loc && (
                                <span className="text-xs text-blue-600">
                                  ✓ Selected
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡{" "}
                        {t("messages.loading", {
                          defaultValue:
                            "Current language detected from browser settings",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Theme Selection (placeholder) */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {t("settings.theme", { defaultValue: "Theme" })}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Choose your preferred color theme.
                    </p>
                    <div className="flex gap-4">
                      <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        ☀️ {t("settings.themeLight", { defaultValue: "Light" })}
                      </button>
                      <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        🌙 {t("settings.themeDark", { defaultValue: "Dark" })}
                      </button>
                      <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        💻{" "}
                        {t("settings.themeSystem", { defaultValue: "System" })}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Profile Settings
                </h2>
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                      {mockUser.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Change Avatar
                      </button>
                      <p className="mt-1 text-sm text-gray-500">
                        JPG, PNG or GIF. Max 2MB
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={mockUser.name || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={mockUser.email || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        defaultValue={mockUser.role || "Admin"}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        defaultValue="OMB Accounting"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      {t("common.save", { defaultValue: "Save Changes" })}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Security Settings
                </h2>
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {t("settings.twoFactor", {
                            defaultValue: "Two-Factor Authentication",
                          })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security
                        </p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  {/* Session Management */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">
                      {t("users.sessionActivity", {
                        defaultValue: "Active Sessions",
                      })}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            Current Session
                          </p>
                          <p className="text-sm text-gray-500">
                            Chrome on macOS • Hong Kong
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== "profile" &&
              activeTab !== "security" &&
              activeTab !== "appearance" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                    Settings
                  </h2>
                  <p className="text-gray-600">
                    This section is under construction. Check back later for
                    updates.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
