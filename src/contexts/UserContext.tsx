/**
 * User Context - Authentication state management
 * Part of Phase 4: User & Roles module
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  UserFormData,
  UserPreferences,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "@/types";
import {
  getUserById,
  createUser,
  updateUser,
  recordLogin,
  recordFailedLogin,
  resetFailedAttempts,
  hashPassword,
} from "@/lib/users";
import { logActivity, logLogin, logLogout } from "@/lib/activity-logger";
import { useRouter } from "next/navigation";

interface UserContextType {
  // Current user
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Login/Logout
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    credentials: RegisterCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // User CRUD
  users: User[];
  getUser: (id: string) => User | undefined;
  addUser: (
    data: UserFormData,
  ) => Promise<{ success: boolean; error?: string }>;
  editUser: (
    id: string,
    data: Partial<UserFormData>,
  ) => Promise<{ success: boolean; error?: string }>;
  removeUser: (id: string) => Promise<{ success: boolean; error?: string }>;

  // User status management
  activateUser: (id: string) => Promise<boolean>;
  deactivateUser: (id: string) => Promise<boolean>;
  lockUser: (id: string) => Promise<boolean>;

  // Preferences
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<boolean>;

  // Password
  changePassword: (
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;

  // Session
  sessionTimeout: number | null;
  extendSession: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING = 5 * 60 * 1000; // 5 minutes before timeout

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const router = useRouter();

  // Initialize - check for existing session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for stored session
        const storedUser = localStorage.getItem("omb_currentUser");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          // Verify user still exists and is active
          const dbUser = getUserById(user.id);
          if (dbUser && dbUser.status === "active") {
            setCurrentUser(dbUser);
            startSessionTimer();
          } else {
            localStorage.removeItem("omb_currentUser");
          }
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Session timer
  const startSessionTimer = useCallback(() => {
    // Clear existing timer
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    // Set new timeout
    const timeoutId = window.setTimeout(() => {
      // Auto logout on session timeout
      logout();
    }, SESSION_TIMEOUT);

    setSessionTimeout(timeoutId);
  }, [sessionTimeout]);

  const extendSession = useCallback(() => {
    startSessionTimer();
  }, [startSessionTimer]);

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);

      try {
        // For demo: accept admin@omb-accounting.com / admin123
        if (
          credentials.email === "admin@omb-accounting.com" &&
          credentials.password === "admin123"
        ) {
          const user = getUserById("user-admin-001");
          if (user) {
            if (user.status === "locked") {
              return {
                success: false,
                error: "Account is locked. Please contact administrator.",
              };
            }

            // Update login tracking
            recordLogin(user.id);

            // Set current user
            setCurrentUser(user);
            localStorage.setItem("omb_currentUser", JSON.stringify(user));

            // Log activity
            logLogin(
              user.id,
              user.name,
              "client-ip",
              navigator.userAgent,
              true,
            );

            startSessionTimer();
            setIsLoading(false);
            return { success: true };
          }
        }

        // Demo login for other users (check credentials against demo users)
        const user = users.find((u) => u.email === credentials.email);
        if (user) {
          if (user.status === "locked") {
            return {
              success: false,
              error: "Account is locked. Please contact administrator.",
            };
          }

          // For demo: any password works for demo users
          recordLogin(user.id);
          setCurrentUser(user);
          localStorage.setItem("omb_currentUser", JSON.stringify(user));
          logLogin(user.id, user.name, "client-ip", navigator.userAgent, true);
          startSessionTimer();
          setIsLoading(false);
          return { success: true };
        }

        // Log failed attempt
        logLogin(
          "unknown",
          credentials.email,
          "client-ip",
          navigator.userAgent,
          false,
        );
        setIsLoading(false);
        return { success: false, error: "Invalid email or password" };
      } catch (error) {
        console.error("Login error:", error);
        setIsLoading(false);
        return { success: false, error: "An error occurred during login" };
      }
    },
    [users, startSessionTimer],
  );

  // Register
  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      setIsLoading(true);

      try {
        // Check if email already exists
        const existingUser = users.find((u) => u.email === credentials.email);
        if (existingUser) {
          setIsLoading(false);
          return { success: false, error: "Email already registered" };
        }

        // Create new user (auto-approved, active status)
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: credentials.email,
          name: credentials.name,
          roleId: "role-user-001", // Default user role
          status: "active",
          phone: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          loginCount: 1,
          failedLoginAttempts: 0,
          passwordHash: "", // No password for demo
          twoFactorEnabled: false,
          permissions: [],
          preferences: {
            language: "en",
            timezone: "Asia/Hong_Kong",
            currency: "HKD",
            dateFormat: "YYYY-MM-DD",
            theme: "light",
            notificationEmail: true,
            notificationInApp: true,
            emailDigest: "daily",
          },
          avatar: undefined,
          passwordChangedAt: new Date(),
        };

        setUsers((prev) => [...prev, newUser]);

        // Set current user
        setCurrentUser(newUser);
        localStorage.setItem("omb_currentUser", JSON.stringify(newUser));

        // Log activity
        logActivity(
          newUser.id,
          newUser.name,
          "register",
          "users",
          newUser.id,
          { email: newUser.email },
          "client-ip",
          navigator.userAgent,
        );

        logLogin(
          newUser.id,
          newUser.name,
          "client-ip",
          navigator.userAgent,
          true,
        );

        startSessionTimer();
        setIsLoading(false);
        return { success: true };
      } catch (error) {
        console.error("Registration error:", error);
        setIsLoading(false);
        return {
          success: false,
          error: "An error occurred during registration",
        };
      }
    },
    [users, startSessionTimer],
  );

  // Logout
  const logout = useCallback(async () => {
    if (currentUser) {
      await logLogout(
        currentUser.id,
        currentUser.name,
        "client-ip",
        navigator.userAgent,
      );
    }

    setCurrentUser(null);
    localStorage.removeItem("omb_currentUser");

    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }

    router.push("/login");
  }, [currentUser, sessionTimeout, router]);

  // Get all users
  const getUser = useCallback((id: string) => {
    return getUserById(id);
  }, []);

  // Add user
  const addUser = useCallback(
    async (data: UserFormData) => {
      try {
        // Check if email already exists
        const existingUser = users.find((u) => u.email === data.email);
        if (existingUser) {
          return { success: false, error: "Email already registered" };
        }

        const newUser = await createUser(data);
        setUsers((prev) => [...prev, newUser]);

        logActivity(
          currentUser?.id || "system",
          currentUser?.name || "System",
          "create",
          "users",
          newUser.id,
          { email: newUser.email },
          "client-ip",
          navigator.userAgent,
        );

        return { success: true };
      } catch (error) {
        console.error("Failed to create user:", error);
        return { success: false, error: "Failed to create user" };
      }
    },
    [users, currentUser],
  );

  // Edit user
  const editUser = useCallback(
    async (id: string, data: Partial<UserFormData>) => {
      try {
        const updated = updateUser(id, data);
        if (!updated) {
          return { success: false, error: "User not found" };
        }

        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));

        if (currentUser?.id === id) {
          setCurrentUser(updated);
          localStorage.setItem("omb_currentUser", JSON.stringify(updated));
        }

        logActivity(
          currentUser?.id || "system",
          currentUser?.name || "System",
          "update",
          "users",
          id,
          data,
          "client-ip",
          navigator.userAgent,
        );

        return { success: true };
      } catch (error) {
        console.error("Failed to update user:", error);
        return { success: false, error: "Failed to update user" };
      }
    },
    [currentUser],
  );

  // Remove user
  const removeUser = useCallback(
    async (id: string) => {
      try {
        const user = getUserById(id);
        if (!user) {
          return { success: false, error: "User not found" };
        }

        // Prevent self-deletion
        if (currentUser?.id === id) {
          return {
            success: false,
            error: "You cannot delete your own account",
          };
        }

        const success = updateUser(id, { status: "inactive" });
        if (!success) {
          return { success: false, error: "Failed to delete user" };
        }

        setUsers((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, status: "inactive" as const } : u,
          ),
        );

        logActivity(
          currentUser?.id || "system",
          currentUser?.name || "System",
          "delete",
          "users",
          id,
          { email: user.email },
          "client-ip",
          navigator.userAgent,
        );

        return { success: true };
      } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Failed to delete user" };
      }
    },
    [currentUser],
  );

  // Activate user
  const activateUser = useCallback(
    async (id: string) => {
      const user = updateUser(id, { status: "active" });
      if (user) {
        setUsers((prev) => prev.map((u) => (u.id === id ? user : u)));
        logActivity(
          currentUser?.id || "system",
          currentUser?.name || "System",
          "activate",
          "users",
          id,
        );
        return true;
      }
      return false;
    },
    [currentUser],
  );

  // Deactivate user
  const deactivateUser = useCallback(
    async (id: string) => {
      if (currentUser?.id === id) {
        return false;
      }
      const user = updateUser(id, { status: "inactive" });
      if (user) {
        setUsers((prev) => prev.map((u) => (u.id === id ? user : u)));
        logActivity(
          currentUser?.id || "system",
          currentUser?.name || "System",
          "deactivate",
          "users",
          id,
        );
        return true;
      }
      return false;
    },
    [currentUser],
  );

  // Lock user
  const lockUser = useCallback(
    async (id: string) => {
      const user = updateUser(id, { status: "locked" });
      if (user) {
        setUsers((prev) => prev.map((u) => (u.id === id ? user : u)));
        logActivity(
          currentUser?.id || "system",
          currentUser?.name || "System",
          "lock",
          "users",
          id,
        );
        return true;
      }
      return false;
    },
    [currentUser],
  );

  // Update preferences
  const updatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      if (!currentUser) return false;

      const user = updateUser(currentUser.id, {
        preferences: { ...currentUser.preferences, ...prefs },
      });
      if (user) {
        setCurrentUser(user);
        localStorage.setItem("omb_currentUser", JSON.stringify(user));
        return true;
      }
      return false;
    },
    [currentUser],
  );

  // Change password
  const changePassword = useCallback(
    async (userId: string, oldPassword: string, newPassword: string) => {
      try {
        const user = getUserById(userId);
        if (!user) {
          return { success: false, error: "User not found" };
        }

        // For demo: admin123 is the password
        if (oldPassword !== "admin123") {
          return { success: false, error: "Current password is incorrect" };
        }

        const hash = await hashPassword(newPassword);
        user.passwordHash = hash;
        user.passwordChangedAt = new Date();

        setUsers((prev) => prev.map((u) => (u.id === userId ? user : u)));

        if (currentUser?.id === userId) {
          setCurrentUser(user);
        }

        logActivity(
          currentUser?.id || userId,
          currentUser?.name || user.name,
          "change_password",
          "users",
          userId,
        );
        return { success: true };
      } catch (error) {
        console.error("Failed to change password:", error);
        return { success: false, error: "Failed to change password" };
      }
    },
    [currentUser],
  );

  const value: UserContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    logout,
    users: users.filter((u) => u.status !== "inactive"),
    getUser,
    addUser,
    editUser,
    removeUser,
    activateUser,
    deactivateUser,
    lockUser,
    updatePreferences,
    changePassword,
    sessionTimeout,
    extendSession,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export default UserContext;
