/**
 * Password Hashing Utilities
 *
 * Provides password hashing and verification using bcrypt.
 */

import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  password_hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, password_hash);
}

/**
 * Generate a random password
 */
export function generatePassword(length: number = 12): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
