/**
 * Authentication Service
 *
 * Handles user authentication logic.
 */

import { UserRepository } from "@/lib/repositories/user-repository";
import { hashPassword, verifyPassword } from "@/lib/utils/password";
import { generateToken } from "@/lib/utils/jwt";
import { JWTPayload } from "@/lib/utils/jwt";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * User login
   */
  async login(input: LoginInput): Promise<{
    success: boolean;
    user?: JWTPayload;
    error?: string;
  }> {
    // Find user by email
    const user = this.userRepository.findByEmail(input.email);
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isValid = await verifyPassword(input.password, user.password_hash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Generate token
    generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * User registration
   */
  async register(input: RegisterInput): Promise<{
    success: boolean;
    user?: { id: string; email: string; role: string };
    error?: string;
  }> {
    // Check if user already exists
    const existing = this.userRepository.findByEmail(input.email);
    if (existing) {
      return { success: false, error: "User already exists" };
    }

    // Hash password
    const password_hash = await hashPassword(input.password);

    // Create user
    const user = this.userRepository.create({
      name: input.name,
      email: input.email,
      password_hash,
      role: input.role || "user",
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Get user by ID
   */
  getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  /**
   * Get all users
   */
  getAllUsers() {
    return this.userRepository.findAll();
  }

  /**
   * Update user
   */
  updateUser(_id: string, data: Record<string, unknown>) {
    return this.userRepository.update(_id, data);
  }

  /**
   * Delete user
   */
  deleteUser(id: string) {
    return this.userRepository.delete(id);
  }
}
