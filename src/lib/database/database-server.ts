/**
 * Database Abstraction Layer - Server Side
 * Used by API routes and server components
 * Only imports native modules (better-sqlite3) on the server
 */

import Database, { Database as DatabaseType } from "better-sqlite3";

export type DatabaseConnection = DatabaseType | null;

export interface DatabaseInterface {
  getDatabase(): DatabaseType;
  close(): void;
}

export class DatabaseManagerImpl implements DatabaseInterface {
  private static instance: DatabaseManagerImpl | null = null;
  private db: DatabaseType | null = null;

  private constructor() {
    // Private constructor - use getInstance() instead
  }

  /**
   * Get or create the database singleton instance
   */
  public static getInstance(): DatabaseManagerImpl {
    if (!DatabaseManagerImpl.instance) {
      DatabaseManagerImpl.instance = new DatabaseManagerImpl();
    }
    return DatabaseManagerImpl.instance;
  }

  /**
   * Initialize or get the database connection
   */
  public getDatabase(): DatabaseType {
    if (!this.db) {
      this.db = new Database("data/omb-accounting.db");
    }
    return this.db;
  }

  /**
   * Close the database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Run a SQL query
   */
  public query<T = unknown>(sql: string, params: unknown[] = []): T[] {
    const db = this.getDatabase();
    const stmt = db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  /**
   * Execute a SQL statement (INSERT, UPDATE, DELETE)
   */
  public execute(
    sql: string,
    params: unknown[] = [],
  ): { lastInsertRowid: number; changes: number } {
    const db = this.getDatabase();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }

  /**
   * Start a transaction
   */
  public transaction<T>(fn: () => T): T {
    const db = this.getDatabase();
    return db.transaction(fn)();
  }
}

/**
 * Export a singleton instance
 */
export const dbManager = DatabaseManagerImpl.getInstance();

/**
 * Export the DatabaseManagerImpl class for testing
 */
export { DatabaseManagerImpl as DatabaseManager };
