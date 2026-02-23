/**
 * User Repository
 *
 * Data access layer for User entity.
 *
 * eslint-disable-next-line @typescript-eslint/no-explicit-any - Required for database operations
 */

import { SQLiteDatabase } from "../database/sqlite";
import { User } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface CreateUserInput {
  name: string;
  email: string;
  password_hash: string;
  role?: "admin" | "user";
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: "admin" | "user";
}

export class UserRepository {
  constructor(private db: unknown) {}

  /**
   * Create a new user
   */
  create(data: CreateUserInput): User {
    const now = Date.now();
    const user: User = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role || "user",
      created_at: now,
      updated_at: now,
    };

    (this.db as any).run(
      "INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        user.id,
        user.name,
        user.email,
        user.password_hash,
        user.role,
        user.created_at,
        user.updated_at,
      ],
    );

    return user;
  }

  /**
   * Get user by ID
   */
  findById(id: string): User | undefined {
    return (this.db as any).get("SELECT * FROM users WHERE id = ?", [id]) as
      | User
      | undefined;
  }

  /**
   * Get user by email
   */
  findByEmail(email: string): User | undefined {
    return (this.db as any).get("SELECT * FROM users WHERE email = ?", [email]) as
      | User
      | undefined;
  }

  /**
   * Get all users
   */
  findAll(): User[] {
    return (this.db as any).query(
      "SELECT * FROM users ORDER BY created_at DESC",
    ) as User[];
  }

  /**
   * Update user
   */
  update(id: string, data: UpdateUserInput): User | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push("email = ?");
      values.push(data.email);
    }
    if (data.role !== undefined) {
      updates.push("role = ?");
      values.push(data.role);
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = ?");
    values.push(Date.now());
    values.push(id);

    (this.db as any).run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

    return this.findById(id);
  }

  /**
   * Delete user
   */
  delete(id: string): boolean {
    const result = (this.db as any).run("DELETE FROM users WHERE id = ?", [id]);
    return result.changes > 0;
  }

  /**
   * Check if user exists
   */
  exists(id: string): boolean {
    const result = (this.db as any).get("SELECT 1 FROM users WHERE id = ?", [
      id,
    ]) as Record<string, unknown>;
    return !!result;
  }
}
