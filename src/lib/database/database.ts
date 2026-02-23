/**
 * Database Abstraction Layer Interface (Server-Side)
 *
 * This is a server-side module that does NOT use "use client".
 * It provides a stub for client components to avoid importing
 * native modules (better-sqlite3) in the browser.
 */

import { DatabaseManagerStub } from "./database-stub";

export type DatabaseConnection = unknown;

export interface DatabaseConfig {
  path?: string;
  inMemory?: boolean;
}

export interface DatabaseInterface {
  query<T = unknown>(sql: string, params?: unknown[]): T[];
  get<T = unknown>(sql: string, params?: unknown[]): T | undefined;
  run(
    sql: string,
    params?: unknown[],
  ): { lastInsertRowid: number; changes: number };
  transaction<T>(callback: () => T): T;
  close(): void;
  getConnection(): DatabaseConnection;
}

// Export the singleton instance for convenience
export const dbManager = DatabaseManagerStub.getInstance();

// Re-export from database-stub.ts for client-side use
export { DatabaseManagerStub as DatabaseManager } from "./database-stub";

// Re-export from database-server.ts for server-side use
export { DatabaseManagerImpl as ServerDatabaseManager } from "./database-server";
