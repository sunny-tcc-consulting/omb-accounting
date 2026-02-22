/**
 * User Service - User CRUD operations and management
 * Part of Phase 4: User & Roles module
 */

import {
  User,
  UserFormData,
  UserFilters,
  UserStatus,
  Role,
  UserPreferences,
} from "@/types";

// In-memory user store (replace with database in production)
const users: Map<string, User> = new Map();

// In-memory role store (replace with database in production)
const roles: Map<string, Role> = new Map();

// Initialize default roles
const initializeDefaultRoles = () => {
  const adminRole: Role = {
    id: "role-admin",
    name: "Admin",
    description: "Full system access",
    permissions: [
      {
        id: "perm-users-create",
        resource: "users",
        action: "create",
        description: "Create new users",
        name: "Create Users",
      },
      {
        id: "perm-users-read",
        resource: "users",
        action: "read",
        description: "View user information",
        name: "Read Users",
      },
      {
        id: "perm-users-update",
        resource: "users",
        action: "update",
        description: "Update user information",
        name: "Update Users",
      },
      {
        id: "perm-users-delete",
        resource: "users",
        action: "delete",
        description: "Delete users",
        name: "Delete Users",
      },
      {
        id: "perm-roles-create",
        resource: "roles",
        action: "create",
        description: "Create new roles",
        name: "Create Roles",
      },
      {
        id: "perm-roles-read",
        resource: "roles",
        action: "read",
        description: "View role information",
        name: "Read Roles",
      },
      {
        id: "perm-roles-update",
        resource: "roles",
        action: "update",
        description: "Update role permissions",
        name: "Update Roles",
      },
      {
        id: "perm-roles-delete",
        resource: "roles",
        action: "delete",
        description: "Delete roles",
        name: "Delete Roles",
      },
      {
        id: "perm-invoices-create",
        resource: "invoices",
        action: "create",
        description: "Create new invoices",
        name: "Create Invoices",
      },
      {
        id: "perm-invoices-read",
        resource: "invoices",
        action: "read",
        description: "View invoice information",
        name: "Read Invoices",
      },
      {
        id: "perm-invoices-update",
        resource: "invoices",
        action: "update",
        description: "Update invoice information",
        name: "Update Invoices",
      },
      {
        id: "perm-invoices-delete",
        resource: "invoices",
        action: "delete",
        description: "Delete invoices",
        name: "Delete Invoices",
      },
      {
        id: "perm-quotations-create",
        resource: "quotations",
        action: "create",
        description: "Create new quotations",
        name: "Create Quotations",
      },
      {
        id: "perm-quotations-read",
        resource: "quotations",
        action: "read",
        description: "View quotation information",
        name: "Read Quotations",
      },
      {
        id: "perm-quotations-update",
        resource: "quotations",
        action: "update",
        description: "Update quotation information",
        name: "Update Quotations",
      },
      {
        id: "perm-quotations-delete",
        resource: "quotations",
        action: "delete",
        description: "Delete quotations",
        name: "Delete Quotations",
      },
      {
        id: "perm-reports-read",
        resource: "reports",
        action: "read",
        description: "View reports",
        name: "Read Reports",
      },
      {
        id: "perm-reports-update",
        resource: "reports",
        action: "update",
        description: "Update reports",
        name: "Update Reports",
      },
      {
        id: "perm-customers-create",
        resource: "customers",
        action: "create",
        description: "Create new customers",
        name: "Create Customers",
      },
      {
        id: "perm-customers-read",
        resource: "customers",
        action: "read",
        description: "View customer information",
        name: "Read Customers",
      },
      {
        id: "perm-customers-update",
        resource: "customers",
        action: "update",
        description: "Update customer information",
        name: "Update Customers",
      },
      {
        id: "perm-customers-delete",
        resource: "customers",
        action: "delete",
        description: "Delete customers",
        name: "Delete Customers",
      },
    ],
    isSystem: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const userRole: Role = {
    id: "role-user",
    name: "User",
    description: "Standard user access",
    permissions: [
      {
        id: "perm-invoices-create",
        resource: "invoices",
        action: "create",
        description: "Create new invoices",
        name: "Create Invoices",
      },
      {
        id: "perm-invoices-read",
        resource: "invoices",
        action: "read",
        description: "View invoice information",
        name: "Read Invoices",
      },
      {
        id: "perm-invoices-update",
        resource: "invoices",
        action: "update",
        description: "Update invoice information",
        name: "Update Invoices",
      },
      {
        id: "perm-quotations-create",
        resource: "quotations",
        action: "create",
        description: "Create new quotations",
        name: "Create Quotations",
      },
      {
        id: "perm-quotations-read",
        resource: "quotations",
        action: "read",
        description: "View quotation information",
        name: "Read Quotations",
      },
      {
        id: "perm-quotations-update",
        resource: "quotations",
        action: "update",
        description: "Update quotation information",
        name: "Update Quotations",
      },
      {
        id: "perm-customers-create",
        resource: "customers",
        action: "create",
        description: "Create new customers",
        name: "Create Customers",
      },
      {
        id: "perm-customers-read",
        resource: "customers",
        action: "read",
        description: "View customer information",
        name: "Read Customers",
      },
      {
        id: "perm-customers-update",
        resource: "customers",
        action: "update",
        description: "Update customer information",
        name: "Update Customers",
      },
      {
        id: "perm-reports-read",
        resource: "reports",
        action: "read",
        description: "View reports",
        name: "Read Reports",
      },
    ],
    isSystem: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  roles.set(adminRole.id, adminRole);
  roles.set(userRole.id, userRole);
};

// Initialize with default admin user
const initializeDefaultUsers = () => {
  const adminUser: User = {
    id: "user-admin-001",
    email: "admin@omb-accounting.com",
    name: "System Administrator",
    roleId: "role-admin",
    roleName: "Admin",
    status: "active",
    avatar: undefined,
    phone: undefined,
    lastLoginAt: undefined,
    loginCount: 0,
    failedLoginAttempts: 0,
    passwordHash: "$2b$10$dummyAdminHashForInitialSetup", // Placeholder
    passwordChangedAt: new Date(),
    twoFactorEnabled: false,
    preferences: {
      theme: "system",
      language: "zh-HK",
      timezone: "Asia/Hong_Kong",
      dateFormat: "YYYY-MM-DD",
      currency: "HKD",
      notificationEmail: true,
      notificationInApp: true,
      emailDigest: "weekly",
    },
    permissions: [
      {
        id: "perm-users-create",
        resource: "users",
        action: "create",
        description: "Create new users",
        name: "Create Users",
      },
      {
        id: "perm-users-read",
        resource: "users",
        action: "read",
        description: "View user information",
        name: "Read Users",
      },
      {
        id: "perm-users-update",
        resource: "users",
        action: "update",
        description: "Update user information",
        name: "Update Users",
      },
      {
        id: "perm-users-delete",
        resource: "users",
        action: "delete",
        description: "Delete users",
        name: "Delete Users",
      },
      {
        id: "perm-roles-create",
        resource: "roles",
        action: "create",
        description: "Create new roles",
        name: "Create Roles",
      },
      {
        id: "perm-roles-read",
        resource: "roles",
        action: "read",
        description: "View role information",
        name: "Read Roles",
      },
      {
        id: "perm-roles-update",
        resource: "roles",
        action: "update",
        description: "Update role permissions",
        name: "Update Roles",
      },
      {
        id: "perm-roles-delete",
        resource: "roles",
        action: "delete",
        description: "Delete roles",
        name: "Delete Roles",
      },
      {
        id: "perm-invoices-create",
        resource: "invoices",
        action: "create",
        description: "Create new invoices",
        name: "Create Invoices",
      },
      {
        id: "perm-invoices-read",
        resource: "invoices",
        action: "read",
        description: "View invoice information",
        name: "Read Invoices",
      },
      {
        id: "perm-invoices-update",
        resource: "invoices",
        action: "update",
        description: "Update invoice information",
        name: "Update Invoices",
      },
      {
        id: "perm-invoices-delete",
        resource: "invoices",
        action: "delete",
        description: "Delete invoices",
        name: "Delete Invoices",
      },
      {
        id: "perm-quotations-create",
        resource: "quotations",
        action: "create",
        description: "Create new quotations",
        name: "Create Quotations",
      },
      {
        id: "perm-quotations-read",
        resource: "quotations",
        action: "read",
        description: "View quotation information",
        name: "Read Quotations",
      },
      {
        id: "perm-quotations-update",
        resource: "quotations",
        action: "update",
        description: "Update quotation information",
        name: "Update Quotations",
      },
      {
        id: "perm-quotations-delete",
        resource: "quotations",
        action: "delete",
        description: "Delete quotations",
        name: "Delete Quotations",
      },
      {
        id: "perm-reports-read",
        resource: "reports",
        action: "read",
        description: "View reports",
        name: "Read Reports",
      },
      {
        id: "perm-reports-update",
        resource: "reports",
        action: "update",
        description: "Update reports",
        name: "Update Reports",
      },
      {
        id: "perm-customers-create",
        resource: "customers",
        action: "create",
        description: "Create new customers",
        name: "Create Customers",
      },
      {
        id: "perm-customers-read",
        resource: "customers",
        action: "read",
        description: "View customer information",
        name: "Read Customers",
      },
      {
        id: "perm-customers-update",
        resource: "customers",
        action: "update",
        description: "Update customer information",
        name: "Update Customers",
      },
      {
        id: "perm-customers-delete",
        resource: "customers",
        action: "delete",
        description: "Delete customers",
        name: "Delete Customers",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.set(adminUser.id, adminUser);
};

// Initialize on module load
initializeDefaultUsers();

/**
 * Generate a simple password hash (use bcrypt in production)
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Simple hash for development - use bcrypt in production
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "omb-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

/**
 * Get all users with optional filtering
 */
export const getUsers = (filters?: UserFilters): User[] => {
  let result = Array.from(users.values());

  if (filters) {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search),
      );
    }

    if (filters.roleId) {
      result = result.filter((user) => user.roleId === filters.roleId);
    }

    if (filters.status) {
      result = result.filter((user) => user.status === filters.status);
    }
  }

  // Sort by creation date (newest first)
  result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return result;
};

/**
 * Get user by ID
 */
export const getUserById = (id: string): User | undefined => {
  return users.get(id);
};

/**
 * Get user by email
 */
export const getUserByEmail = (email: string): User | undefined => {
  return Array.from(users.values()).find((user) => user.email === email);
};

/**
 * Create a new user
 */
export const createUser = async (formData: UserFormData): Promise<User> => {
  // Check if email already exists
  const existingUser = getUserByEmail(formData.email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const id = `user-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date();

  // Get role permissions
  const role = roles.get(formData.roleId);
  const permissions = role?.permissions || [];

  const newUser: User = {
    id,
    email: formData.email,
    name: formData.name,
    roleId: formData.roleId,
    status: formData.status || "active",
    avatar: undefined,
    phone: formData.phone,
    lastLoginAt: undefined,
    loginCount: 0,
    failedLoginAttempts: 0,
    passwordHash: "", // Set separately via setPassword
    passwordChangedAt: now,
    twoFactorEnabled: false,
    preferences: {
      theme: "system",
      language: "zh-HK",
      timezone: "Asia/Hong_Kong",
      dateFormat: "YYYY-MM-DD",
      currency: "HKD",
      notificationEmail: true,
      notificationInApp: true,
      emailDigest: "weekly",
    },
    permissions,
    createdAt: now,
    updatedAt: now,
  };

  users.set(id, newUser);
  return newUser;
};

/**
 * Update an existing user
 */
export const updateUser = (
  id: string,
  updates: Partial<UserFormData>,
): User | undefined => {
  const user = users.get(id);
  if (!user) {
    return undefined;
  }

  // Check email uniqueness if email is being updated
  if (updates.email && updates.email !== user.email) {
    const existingUser = getUserByEmail(updates.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }
  }

  // Merge preferences properly
  const mergedPreferences = updates.preferences
    ? { ...user.preferences, ...updates.preferences }
    : user.preferences;

  const updatedUser: User = {
    ...user,
    ...updates,
    id: user.id, // Prevent ID change
    email: updates.email || user.email,
    name: updates.name || user.name,
    roleId: updates.roleId || user.roleId,
    status: updates.status || user.status,
    preferences: mergedPreferences as UserPreferences,
    phone: updates.phone ?? user.phone,
    updatedAt: new Date(),
  };

  users.set(id, updatedUser);
  return updatedUser;
};

/**
 * Delete a user (soft delete - set to inactive)
 */
export const deleteUser = (id: string): boolean => {
  const user = users.get(id);
  if (!user) {
    return false;
  }

  // Soft delete - just set to inactive
  user.status = "inactive";
  user.updatedAt = new Date();
  users.set(id, user);
  return true;
};

/**
 * Hard delete a user (use with caution)
 */
export const hardDeleteUser = (id: string): boolean => {
  return users.delete(id);
};

/**
 * Activate a user
 */
export const activateUser = (id: string): User | undefined => {
  return updateUser(id, { status: "active" });
};

/**
 * Deactivate a user
 */
export const deactivateUser = (id: string): User | undefined => {
  return updateUser(id, { status: "inactive" });
};

/**
 * Lock a user (too many failed login attempts)
 */
export const lockUser = (id: string): User | undefined => {
  return updateUser(id, { status: "locked" });
};

/**
 * Set user password
 */
export const setUserPassword = async (
  userId: string,
  password: string,
): Promise<boolean> => {
  const user = users.get(userId);
  if (!user) {
    return false;
  }

  const hash = await hashPassword(password);
  user.passwordHash = hash;
  user.passwordChangedAt = new Date();
  user.failedLoginAttempts = 0;
  users.set(userId, user);

  return true;
};

/**
 * Record a successful login
 */
export const recordLogin = (userId: string): void => {
  const user = users.get(userId);
  if (user) {
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    user.failedLoginAttempts = 0;
    users.set(userId, user);
  }
};

/**
 * Record a failed login attempt
 */
export const recordFailedLogin = (userId: string): number => {
  const user = users.get(userId);
  if (!user) {
    return 0;
  }

  user.failedLoginAttempts += 1;

  // Lock user after 5 failed attempts
  if (user.failedLoginAttempts >= 5) {
    user.status = "locked";
  }

  users.set(userId, user);
  return user.failedLoginAttempts;
};

/**
 * Update user preferences
 */
export const updateUserPreferences = (
  userId: string,
  preferences: Partial<UserPreferences>,
): User | undefined => {
  const user = users.get(userId);
  if (!user) {
    return undefined;
  }

  user.preferences = {
    ...user.preferences,
    ...preferences,
  };
  user.updatedAt = new Date();
  users.set(userId, user);
  return user;
};

/**
 * Get user count by status
 */
export const getUserCountByStatus = (): Record<UserStatus, number> => {
  const counts: Record<UserStatus, number> = {
    active: 0,
    inactive: 0,
    locked: 0,
  };

  users.forEach((user) => {
    counts[user.status]++;
  });

  return counts;
};

/**
 * Get total user count
 */
export const getTotalUserCount = (): number => {
  return users.size;
};

/**
 * Check if email is available
 */
export const isEmailAvailable = (
  email: string,
  excludeUserId?: string,
): boolean => {
  const user = getUserByEmail(email);
  if (!user) {
    return true;
  }
  return excludeUserId ? user.id === excludeUserId : false;
};

/**
 * Format user for display
 */
export const formatUserDisplay = (user: User): string => {
  return `${user.name} (${user.email})`;
};

/**
 * Get users by role
 */
export const getUsersByRole = (roleId: string): User[] => {
  return Array.from(users.values()).filter((user) => user.roleId === roleId);
};

/**
 * Get active users
 */
export const getActiveUsers = (): User[] => {
  return Array.from(users.values()).filter((user) => user.status === "active");
};

/**
 * Reset user failed attempts
 */
export const resetFailedAttempts = (userId: string): void => {
  const user = users.get(userId);
  if (user) {
    user.failedLoginAttempts = 0;
    users.set(userId, user);
  }
};
