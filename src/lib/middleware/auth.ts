/**
 * Authentication Middleware
 *
 * Provides authentication utilities for API routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "@/lib/utils/jwt";

/**
 * Get user from request
 */
export async function getUserFromRequest(request: NextRequest): Promise<{
  user?: JWTPayload;
  error?: string;
}> {
  // Get token from Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid authorization header" };
  }

  const token = authHeader.substring(7);

  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    return { error: "Invalid or expired token" };
  }

  return { user: payload };
}

/**
 * Create a response with user data
 */
export function successResponse(user: JWTPayload) {
  return NextResponse.json({
    success: true,
    user: {
      id: user.userId,
      name: user.email, // In production, fetch user details from DB
      email: user.email,
      role: user.role,
    },
  });
}

/**
 * Create an error response
 */
export function errorResponse(message: string, status: number = 401) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

/**
 * Protected route wrapper
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>,
): Promise<NextResponse> {
  const result = await getUserFromRequest(request);

  if (result.error) {
    return errorResponse(result.error);
  }

  return await handler(request, result.user!);
}

/**
 * Check if user has required role
 */
export function hasRole(user: JWTPayload, roles: string[]): boolean {
  return roles.includes(user.role);
}
