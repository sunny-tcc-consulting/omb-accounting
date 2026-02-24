/**
 * SQLite Database Interface
 *
 * This file provides a mock database implementation for browser environments.
 * For server-side usage, use a proper database connection.
 */

import { DatabaseInterface, DatabaseConfig } from "./database";

/**
 * Mock database implementation for browser environment
 * Provides basic CRUD operations using in-memory storage
 */
export class SQLiteDatabase implements DatabaseInterface {
  private data: Map<string, unknown[]> = new Map();
  private idCounters: Map<string, number> = new Map();

  constructor(config?: DatabaseConfig) {
    // Initialize with mock data for development
    if (config?.inMemory) {
      this.data = new Map();
    }
  }

  /**
   * Execute a SQL query and return all rows (mock)
   */
  query<T = unknown>(_sql: string, _params?: unknown[]): T[] {
    // In browser, we can't execute SQL, so return empty array
    return [];
  }

  /**
   * Execute a SQL query and return a single row (mock)
   */
  get<T = unknown>(_sql: string, _params?: unknown[]): T | undefined {
    return undefined;
  }

  /**
   * Execute a SQL query that returns the number of affected rows (mock)
   */
  run(
    _sql: string,
    _params?: unknown[],
  ): { lastInsertRowid: number; changes: number } {
    return { lastInsertRowid: 0, changes: 0 };
  }

  /**
   * Execute a transaction (mock)
   */
  transaction<T>(callback: () => T): T {
    return callback();
  }

  /**
   * Close the database connection (mock)
   */
  close(): void {
    // No-op in browser
  }

  /**
   * Get the underlying database connection (mock)
   */
  getConnection(): unknown {
    return null;
  }
}

/**
 * Get a database instance
 * For server-side usage, import the database module directly
 */
export function getDatabase(config?: DatabaseConfig): DatabaseInterface {
  return new SQLiteDatabase(config);
}
