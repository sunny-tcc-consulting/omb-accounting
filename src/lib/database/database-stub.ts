/**
 * Database Abstraction Layer Interface
 *
 * Defines the contract for database implementations.
 * Allows swapping between SQLite and other databases without
 * changing application logic.
 *
 * This is the server-side version - does NOT import better-sqlite3
 * to avoid native module issues in client components.
 */

export type DatabaseConnection = unknown;

export interface DatabaseInterface {
  getDatabase(): DatabaseConnection;
  close(): void;
}

export class DatabaseManagerStub implements DatabaseInterface {
  private static instance: DatabaseManagerStub | null = null;
  private db: DatabaseConnection | null = null;

  private constructor() {
    // Private constructor - use getInstance() instead
  }

  /**
   * Get or create the database singleton instance
   */
  public static getInstance(): DatabaseManagerStub {
    if (!DatabaseManagerStub.instance) {
      DatabaseManagerStub.instance = new DatabaseManagerStub();
    }
    return DatabaseManagerStub.instance;
  }

  /**
   * Initialize or get the database connection
   * Note: This is a stub for client-side use
   */
  public getDatabase(): DatabaseConnection {
    // This should never be called in a client component
    throw new Error(
      "DatabaseManager.getDatabase() is not available in client components",
    );
  }

  /**
   * Close the database connection
   */
  public close(): void {
    // No-op for client-side stub
  }

  /**
   * Run a SQL query
   */
  public query<T = unknown>(_sql: string, _params: unknown[] = []): T[] {
    // This should never be called in a client component
    throw new Error(
      "DatabaseManager.query() is not available in client components",
    );
  }

  /**
   * Execute a SQL statement (INSERT, UPDATE, DELETE)
   */
  public execute(_sql: string, _params: unknown[] = []): unknown {
    // This should never be called in a client component
    throw new Error(
      "DatabaseManager.execute() is not available in client components",
    );
  }

  /**
   * Start a transaction
   */
  public transaction<T>(fn: () => T): T {
    // This should never be called in a client component
    throw new Error(
      "DatabaseManager.transaction() is not available in client components",
    );
  }
}

/**
 * Export a singleton instance
 */
export const dbManager = DatabaseManagerStub.getInstance();

/**
 * Export the DatabaseManagerStub class for testing
 */
export { DatabaseManagerStub as DatabaseManager };
