/**
 * Session Repository
 *
 * Data access layer for Session entity.
 */

import { SQLiteDatabase } from "../sqlite";
import { Session } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface CreateSessionInput {
  user_id: string;
  expires_at: number;
}

export class SessionRepository {
  constructor(private db: SQLiteDatabase) {}

  /**
   * Create a new session
   */
  create(data: CreateSessionInput): Session {
    const session: Session = {
      id: uuidv4(),
      user_id: data.user_id,
      token: uuidv4(),
      expires_at: data.expires_at,
      created_at: Date.now(),
    };

    this.db.run(
      "INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
      [
        session.id,
        session.user_id,
        session.token,
        session.expires_at,
        session.created_at,
      ],
    );

    return session;
  }

  /**
   * Get session by token
   */
  findByToken(token: string): Session | undefined {
    return this.db.get<Session>("SELECT * FROM sessions WHERE token = ?", [
      token,
    ]);
  }

  /**
   * Get all sessions for a user
   */
  findByUserId(user_id: string): Session[] {
    return this.db.query<Session>(
      "SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC",
      [user_id],
    );
  }

  /**
   * Delete session by token
   */
  delete(token: string): boolean {
    const result = this.db.run("DELETE FROM sessions WHERE token = ?", [token]);
    return result.changes > 0;
  }

  /**
   * Delete all sessions for a user
   */
  deleteByUserId(user_id: string): boolean {
    const result = this.db.run("DELETE FROM sessions WHERE user_id = ?", [
      user_id,
    ]);
    return result.changes > 0;
  }

  /**
   * Delete expired sessions
   */
  deleteExpired(): number {
    const result = this.db.run("DELETE FROM sessions WHERE expires_at < ?", [
      Date.now(),
    ]);
    return result.changes;
  }

  /**
   * Check if session is expired
   */
  isExpired(expires_at: number): boolean {
    return expires_at < Date.now();
  }

  /**
   * Clean up expired sessions (cleanup task)
   */
  cleanup(): number {
    return this.deleteExpired();
  }
}
