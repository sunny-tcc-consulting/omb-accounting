/**
 * SQLite Database Implementation
 *
 * Implements the Database interface using better-sqlite3.
 * File-based database with ACID compliance.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  DatabaseInterface,
  DatabaseConfig,
  DatabaseConnection,
} from "./database";

export class SQLiteDatabase implements DatabaseInterface {
  private connection: DatabaseConnection;

  constructor(config?: DatabaseConfig) {
    const dbPath =
      config?.path || path.join(process.cwd(), "data", "omb-accounting.db");

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Open or create database
    const options: Record<string, unknown> = { verbose: false };
    if (config?.inMemory) {
      options.memory = true;
    }

    this.connection = new Database(dbPath, options);

    // Enable foreign keys
    this.connection.pragma("foreign_keys = ON");

    // Set busy timeout (milliseconds)
    this.connection.pragma("busy_timeout = 5000");

    console.log(
      `Database connected: ${config?.inMemory ? "in-memory" : dbPath}`,
    );
  }

  /**
   * Execute a SQL query and return all rows
   */
  query<T = unknown>(sql: string, params?: unknown[]): T[] {
    const stmt = this.connection.prepare(sql);
    return stmt.all(...(params || [])) as T[];
  }

  /**
   * Execute a SQL query and return a single row
   */
  get<T = unknown>(sql: string, params?: unknown[]): T | undefined {
    const stmt = this.connection.prepare(sql);
    return stmt.get(...(params || [])) as T | undefined;
  }

  /**
   * Execute a SQL query that returns the number of affected rows
   */
  run(
    sql: string,
    params?: unknown[],
  ): { lastInsertRowid: number; changes: number } {
    const stmt = this.connection.prepare(sql);
    const result = stmt.run(...(params || []));
    return {
      lastInsertRowid: result.lastInsertRowid,
      changes: result.changes,
    };
  }

  /**
   * Execute a transaction
   */
  transaction<T>(callback: () => T): T {
    return this.connection.transaction(callback)();
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.connection.close();
    console.log("Database connection closed");
  }

  /**
   * Get the underlying database connection
   */
  getConnection(): DatabaseConnection {
    return this.connection;
  }
}
