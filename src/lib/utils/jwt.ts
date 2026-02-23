/**
 * JWT Token Utilities
 *
 * Provides JWT token generation and validation.
 */

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "30m";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Get token expiry time
 */
export function getExpiryTime(): number {
  const now = Date.now();
  const expiry = parseInt(JWT_EXPIRY);
  const unit = JWT_EXPIRY.slice(-1);

  switch (unit) {
    case "s":
      return now + expiry * 1000;
    case "m":
      return now + expiry * 60 * 1000;
    case "h":
      return now + expiry * 60 * 60 * 1000;
    case "d":
      return now + expiry * 24 * 60 * 60 * 1000;
    default:
      return now + 30 * 60 * 1000; // Default 30 minutes
  }
}
