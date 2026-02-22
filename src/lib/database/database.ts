/**
 * Database Abstraction Layer Interface
 *
 * Defines the contract for database implementations.
 * Allows swapping between SQLite and other databases without
 * changing application logic.
 */

import { Database as SQLiteDatabase } from "better-sqlite3";

export type DatabaseConnection = SQLiteDatabase;

export interface Database {
  /**
   * Execute a SQL query and return all rows
   */
  query<T = unknown>(sql: string, params?: unknown[]): T[];

  /**
   * Execute a SQL query and return a single row
   */
  get<T = unknown>(sql: string, params?: unknown[]): T | undefined;

  /**
   * Execute a SQL query that returns the number of affected rows
   */
  run(
    sql: string,
    params?: unknown[],
  ): { lastInsertRowid: number; changes: number };

  /**
   * Execute a transaction
   */
  transaction<T>(callback: () => T): T;

  /**
   * Close the database connection
   */
  close(): void;

  /**
   * Get the underlying database connection
   */
  getConnection(): DatabaseConnection;
}

export interface DatabaseConfig {
  path?: string;
  inMemory?: boolean;
}

/**
 * Database connection manager
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize the database connection
   */
  async initialize(config?: DatabaseConfig): Promise<Database> {
    if (this.db) {
      return this.db;
    }

    // Import here to avoid circular dependencies
    const { SQLiteDatabase } = await import("./sqlite");

    this.db = new SQLiteDatabase(config);
    console.log("Database initialized successfully");
    return this.db;
  }

  /**
   * Get the database instance
   */
  getDatabase(): Database {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log("Database connection closed");
    }
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();
