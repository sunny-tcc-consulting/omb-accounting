/**
 * Audit Log Repository
 *
 * Data access layer for AuditLog entity.
 */

import { SQLiteDatabase } from "../database/sqlite";
import { AuditLog } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

export interface CreateAuditLogInput {
  user_id: string;
  operation: "create" | "update" | "delete";
  table_name: string;
  record_id: string;
  changes?: string;
  ip_address?: string;
  user_agent?: string;
}

export class AuditLogRepository {
  constructor(private db: SQLiteDatabase) {}

  /**
   * Create a new audit log
   */
  create(data: CreateAuditLogInput): AuditLog {
    const now = Date.now();
    const auditLog: AuditLog = {
      id: uuidv4(),
      user_id: data.user_id || "system",
      operation: data.operation,
      table_name: data.table_name,
      record_id: data.record_id,
      changes: data.changes,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      created_at: now,
    };

    this.db.run(
      "INSERT INTO audit_logs (id, user_id, operation, table_name, record_id, changes, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        auditLog.id,
        auditLog.user_id,
        auditLog.operation,
        auditLog.table_name,
        auditLog.record_id,
        auditLog.changes,
        auditLog.ip_address,
        auditLog.user_agent,
        auditLog.created_at,
      ],
    );

    return auditLog;
  }

  /**
   * Get audit log by ID
   */
  findById(id: string): AuditLog | undefined {
    return this.db.get<AuditLog>("SELECT * FROM audit_logs WHERE id = ?", [id]);
  }

  /**
   * Get all audit logs
   */
  findAll(): AuditLog[] {
    return this.db.query<AuditLog>(
      "SELECT * FROM audit_logs ORDER BY created_at DESC",
    );
  }

  /**
   * Get audit logs by user
   */
  findByUser(user_id: string): AuditLog[] {
    return this.db.query<AuditLog>(
      "SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC",
      [user_id],
    );
  }

  /**
   * Get audit logs by table
   */
  findByTable(table_name: string): AuditLog[] {
    return this.db.query<AuditLog>(
      "SELECT * FROM audit_logs WHERE table_name = ? ORDER BY created_at DESC",
      [table_name],
    );
  }

  /**
   * Get audit logs by operation
   */
  findByOperation(operation: string): AuditLog[] {
    return this.db.query<AuditLog>(
      "SELECT * FROM audit_logs WHERE operation = ? ORDER BY created_at DESC",
      [operation],
    );
  }

  /**
   * Get audit logs by date range
   */
  findByDateRange(startDate: number, endDate: number): AuditLog[] {
    return this.db.query<AuditLog>(
      "SELECT * FROM audit_logs WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC",
      [startDate, endDate],
    );
  }

  /**
   * Get audit logs by date
   */
  findByDate(created_at: number): AuditLog[] {
    return this.db.query<AuditLog>(
      "SELECT * FROM audit_logs WHERE created_at = ? ORDER BY created_at DESC",
      [created_at],
    );
  }

  /**
   * Get audit log count
   */
  count(): number {
    const result = this.db.get<Record<string, unknown>>(
      "SELECT COUNT(*) as count FROM audit_logs",
    );
    return (result as Record<string, unknown>).count as number;
  }
}
