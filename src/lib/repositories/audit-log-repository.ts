/**
 * Audit Log Repository
 *
 * Data access layer for audit logs.
 */

import { AuditLog } from "../types/database";

interface CreateAuditLogInput {
  user_id: string;
  operation: "create" | "update" | "delete";
  table_name: string;
  record_id: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

interface AuditLogFilters {
  userId?: string;
  entityType?: string;
  entityId?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbAny = any;

export class AuditLogRepository {
  private db: unknown;
  private tableName = "audit_logs";

  constructor(database: unknown) {
    this.db = database;
  }

  /**
   * Create a new audit log entry
   */
  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const now = Date.now();
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      user_id: input.user_id,
      operation: input.operation,
      table_name: input.table_name,
      record_id: input.record_id,
      changes: input.changes ? JSON.stringify(input.changes) : undefined,
      ip_address: input.ip_address,
      user_agent: input.user_agent,
      created_at: now,
    };

    const sql = `
      INSERT INTO ${this.tableName}
      (id, user_id, operation, table_name, record_id, changes, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await (this.db as DbAny).execute(sql, [
      auditLog.id,
      auditLog.user_id,
      auditLog.operation,
      auditLog.table_name,
      auditLog.record_id,
      auditLog.changes || null,
      auditLog.ip_address || null,
      auditLog.user_agent || null,
      auditLog.created_at,
    ]);

    return auditLog;
  }

  /**
   * Get audit log by ID
   */
  async getById(id: string): Promise<AuditLog | null> {
    const result = (this.db as DbAny).execute(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id],
    );
    return result[0] || null;
  }

  /**
   * Get all audit logs with optional filters
   */
  async getAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    let sql = `SELECT * FROM ${this.tableName}`;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters?.userId) {
      conditions.push("user_id = ?");
      params.push(filters.userId);
    }

    if (filters?.entityType) {
      conditions.push("table_name = ?");
      params.push(filters.entityType);
    }

    if (filters?.entityId) {
      conditions.push("record_id = ?");
      params.push(filters.entityId);
    }

    if (filters?.startDate) {
      conditions.push("created_at >= ?");
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      conditions.push("created_at <= ?");
      params.push(filters.endDate);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      sql += ` LIMIT ?`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      sql += ` OFFSET ?`;
      params.push(filters.offset);
    }

    const result = (this.db as DbAny).execute(sql, params);
    return result as AuditLog[];
  }

  /**
   * Get audit logs by user ID
   */
  async getByUserId(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.getAll({ userId, limit });
  }

  /**
   * Get audit logs by entity type and ID
   */
  async getByEntity(tableName: string, recordId: string): Promise<AuditLog[]> {
    return this.getAll({ entityType: tableName, entityId: recordId });
  }

  /**
   * Get audit logs within date range
   */
  async getByDateRange(
    startDate: number,
    endDate: number,
    limit = 1000,
  ): Promise<AuditLog[]> {
    return this.getAll({ startDate, endDate, limit });
  }

  /**
   * Get count of audit logs matching filters
   */
  async count(filters?: AuditLogFilters): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters?.userId) {
      conditions.push("user_id = ?");
      params.push(filters.userId);
    }

    if (filters?.entityType) {
      conditions.push("table_name = ?");
      params.push(filters.entityType);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = (this.db as DbAny).execute(sql, params) as Array<{
      count: number;
    }>;
    return result[0]?.count ?? 0;
  }

  /**
   * Delete old audit logs (for maintenance)
   */
  async deleteOlderThan(timestamp: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableName} WHERE created_at < ?`;
    const result = (this.db as DbAny).execute(sql, [timestamp]) as {
      changes: number;
    };
    return result?.changes ?? 0;
  }
}
