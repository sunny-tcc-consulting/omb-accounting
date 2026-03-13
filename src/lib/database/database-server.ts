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
      const dbPath = process.env.DATABASE_PATH || "data/omb-accounting.db";
      
      console.log('[DATABASE] Initializing database...');
      console.log('[DATABASE] DATABASE_PATH env:', process.env.DATABASE_PATH);
      console.log('[DATABASE] Using dbPath:', dbPath);
      console.log('[DATABASE] Current working directory:', process.cwd());
      
      // Ensure directory exists using Node.js path module
      const path = require('path');
      const fs = require('fs');
      const dir = path.dirname(dbPath);
      
      console.log('[DATABASE] Checking directory:', dir);
      console.log('[DATABASE] Directory exists:', fs.existsSync(dir));
      
      if (!fs.existsSync(dir)) {
        console.log('[DATABASE] Creating directory:', dir);
        try {
          fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
          console.log('[DATABASE] Directory created successfully');
        } catch (err) {
          console.error('[DATABASE] Failed to create directory:', err);
          throw new Error(`Failed to create database directory: ${dir}`);
        }
      }
      
      // Check permissions
      try {
        fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK);
        console.log('[DATABASE] Directory permissions OK');
      } catch (err) {
        console.error('[DATABASE] No read/write permissions:', err);
      }
      
      console.log('[DATABASE] Opening database connection...');
      console.log('[DATABASE] Database constructor:', typeof Database);
      console.log('[DATABASE] Database constructor name:', Database.name);
      
      try {
        this.db = new Database(dbPath);
        console.log('[DATABASE] Database opened successfully!');
        console.log('[DATABASE] Database object:', this.db);
        console.log('[DATABASE] Database type:', typeof this.db);
        console.log('[DATABASE] Database has run method:', typeof (this.db as any).run);
        console.log('[DATABASE] Database has get method:', typeof (this.db as any).get);
        console.log('[DATABASE] Database file exists:', fs.existsSync(dbPath));
      } catch (err) {
        console.error('[DATABASE] Failed to open database:', err);
        console.error('[DATABASE] Error stack:', (err as Error).stack);
        throw err;
      }
    }
    console.log('[DATABASE] Returning database instance');
    console.log('[DATABASE] Database has run:', typeof (this.db as any).run);
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
    const result = stmt.run(...params);
    return {
      lastInsertRowid: Number(result.lastInsertRowid),
      changes: result.changes,
    };
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
