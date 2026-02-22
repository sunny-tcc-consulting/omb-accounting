/**
 * Session Service
 *
 * Handles session management.
 */

import { SessionRepository } from "@/lib/repositories/session-repository";
import { getExpiryTime } from "@/lib/utils/jwt";

export interface CreateSessionInput {
  user_id: string;
}

export interface SessionData {
  id: string;
  user_id: string;
  token: string;
  expires_at: number;
  created_at: number;
}

export class SessionService {
  constructor(private sessionRepository: SessionRepository) {}

  /**
   * Create a new session
   */
  create(user_id: string): SessionData {
    const expires_at = getExpiryTime();
    const session = this.sessionRepository.create({
      user_id,
      expires_at,
    });

    return {
      id: session.id,
      user_id: session.user_id,
      token: session.token,
      expires_at: session.expires_at,
      created_at: session.created_at,
    };
  }

  /**
   * Validate session token
   */
  validateToken(token: string): {
    valid: boolean;
    session?: SessionData;
    expired?: boolean;
  } {
    const session = this.sessionRepository.findByToken(token);

    if (!session) {
      return { valid: false };
    }

    if (this.sessionRepository.isExpired(session.expires_at)) {
      this.sessionRepository.delete(token);
      return { valid: false, expired: true };
    }

    return {
      valid: true,
      session: {
        id: session.id,
        user_id: session.user_id,
        token: session.token,
        expires_at: session.expires_at,
        created_at: session.created_at,
      },
    };
  }

  /**
   * Get session by token
   */
  getSession(token: string): SessionData | undefined {
    const session = this.sessionRepository.findByToken(token);
    if (!session) return undefined;

    if (this.sessionRepository.isExpired(session.expires_at)) {
      this.sessionRepository.delete(token);
      return undefined;
    }

    return {
      id: session.id,
      user_id: session.user_id,
      token: session.token,
      expires_at: session.expires_at,
      created_at: session.created_at,
    };
  }

  /**
   * Delete session
   */
  delete(token: string): boolean {
    return this.sessionRepository.delete(token);
  }

  /**
   * Delete all sessions for a user
   */
  deleteByUserId(user_id: string): boolean {
    return this.sessionRepository.deleteByUserId(user_id);
  }

  /**
   * Cleanup expired sessions
   */
  cleanup(): number {
    return this.sessionRepository.cleanup();
  }

  /**
   * Get session count for a user
   */
  countByUserId(user_id: string): number {
    return this.sessionRepository.findByUserId(user_id).length;
  }
}
