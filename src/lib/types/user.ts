/**
 * User Types
 *
 * TypeScript type definitions for user-related entities.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "user";
  created_at: number;
  updated_at: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: number;
  updated_at: number;
}
