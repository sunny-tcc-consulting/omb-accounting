/**
 * Database Abstraction Layer Interface
 *
 * Defines the contract for database implementations.
 * Allows swapping between SQLite and other databases without
 * changing application logic.
 */

import { Database as SQLiteDatabase } from "better-sqlite3";

export type DatabaseConnection = SQLiteDatabase;

export interface DatabaseInterface {
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
}

export class DatabaseManager implements DatabaseInterface {
  private static instance: DatabaseManager;
  private db: SQLiteDatabase | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize the database
   */
  initialize(config?: DatabaseConfig): SQLiteDatabase {
    if (this.db) {
      return this.db;
    }

    const dbPath = config?.path || process.cwd() + "/data/omb-accounting.db";

    // Create data directory if it doesn't exist
    const dataDir = dbPath.substring(0, dbPath.lastIndexOf("/"));
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Open or create database
    const options: Record<string, unknown> = { verbose: false };
    if (config?.inMemory) {
      options.memory = true;
    }

    this.db = new SQLiteDatabase(dbPath, options);

    // Enable foreign keys
    this.db.pragma("foreign_keys = ON");

    // Set busy timeout (milliseconds)
    this.db.pragma("busy_timeout = 5000");

    console.log(
      `Database connected: ${config?.inMemory ? "in-memory" : dbPath}`,
    );

    return this.db;
  }

  /**
   * Get the database instance
   */
  getDatabase(): SQLiteDatabase {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log("Database connection closed");
    }
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();
