/**
 * Audit Log Service
 *
 * Business logic layer for AuditLog entity.
 */

import { AuditLogRepository } from "@/lib/repositories/audit-log-repository";
import { CreateAuditLogInput } from "@/lib/repositories/audit-log-repository";
import { v4 as uuidv4 } from "uuid";

export interface AuditLogDTO {
  id: string;
  user_id?: string;
  operation: "create" | "update" | "delete";
  table_name: string;
  record_id: string;
  changes?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: number;
}

export class AuditLogService {
  constructor(private auditLogRepository: AuditLogRepository) {}

  /**
   * Create a new audit log
   */
  create(data: CreateAuditLogInput): AuditLogDTO {
    const auditLog = this.auditLogRepository.create(data);

    return {
      id: auditLog.id,
      user_id: auditLog.user_id,
      operation: auditLog.operation,
      table_name: auditLog.table_name,
      record_id: auditLog.record_id,
      changes: auditLog.changes,
      ip_address: auditLog.ip_address,
      user_agent: auditLog.user_agent,
      created_at: auditLog.created_at,
    };
  }

  /**
   * Get audit log by ID
   */
  getById(id: string): AuditLogDTO | undefined {
    const auditLog = this.auditLogRepository.findById(id);
    if (!auditLog) {
      return undefined;
    }

    return {
      id: auditLog.id,
      user_id: auditLog.user_id,
      operation: auditLog.operation,
      table_name: auditLog.table_name,
      record_id: auditLog.record_id,
      changes: auditLog.changes,
      ip_address: auditLog.ip_address,
      user_agent: auditLog.user_agent,
      created_at: auditLog.created_at,
    };
  }

  /**
   * Get all audit logs
   */
  getAll(): AuditLogDTO[] {
    const auditLogs = this.auditLogRepository.findAll();
    return auditLogs.map((auditLog) => ({
      id: auditLog.id,
      user_id: auditLog.user_id,
      operation: auditLog.operation,
      table_name: auditLog.table_name,
      record_id: auditLog.record_id,
      changes: auditLog.changes,
      ip_address: auditLog.ip_address,
      user_agent: auditLog.user_agent,
      created_at: auditLog.created_at,
    }));
  }

  /**
   * Get audit logs by user
   */
  getByUser(user_id: string): AuditLogDTO[] {
    const auditLogs = this.auditLogRepository.findByUser(user_id);
    return auditLogs.map((auditLog) => ({
      id: auditLog.id,
      user_id: auditLog.user_id,
      operation: auditLog.operation,
      table_name: auditLog.table_name,
      record_id: auditLog.record_id,
      changes: auditLog.changes,
      ip_address: auditLog.ip_address,
      user_agent: auditLog.user_agent,
      created_at: auditLog.created_at,
    }));
  }

  /**
   * Get audit logs by table
   */
  getByTable(table_name: string): AuditLogDTO[] {
    const auditLogs = this.auditLogRepository.findByTable(table_name);
    return auditLogs.map((auditLog) => ({
      id: auditLog.id,
      user_id: auditLog.user_id,
      operation: auditLog.operation,
      table_name: auditLog.table_name,
      record_id: auditLog.record_id,
      changes: auditLog.changes,
      ip_address: auditLog.ip_address,
      user_agent: auditLog.user_agent,
      created_at: auditLog.created_at,
    }));
  }

  /**
   * Get audit logs by operation
   */
  getByOperation(operation: string): AuditLogDTO[] {
    const auditLogs = this.auditLogRepository.findByOperation(operation);
    return auditLogs.map((auditLog) => ({
      id: auditLog.id,
      user_id: auditLog.user_id,
      operation: auditLog.operation,
      table_name: auditLog.table_name,
      record_id: auditLog.record_id,
      changes: auditLog.changes,
      ip_address: auditLog.ip_address,
      user_agent: auditLog.user_agent,
      created_at: auditLog.created_at,
    }));
  }

  /**
   * Get audit logs by date range
   */
  getByDateRange(startDate: number, endDate: number): AuditLogDTO[] {
    const auditLogs = this.auditLogRepository.findByDateRange(
      startDate,
      endDate,
    );
    return auditLogs.map((auditLog) => ({
      id: auditLog.id,
      user_id: auditLog.user_id,
      operation: auditLog.operation,
      table_name: auditLog.table_name,
      record_id: auditLog.record_id,
      changes: auditLog.changes,
      ip_address: auditLog.ip_address,
      user_agent: auditLog.user_agent,
      created_at: auditLog.created_at,
    }));
  }

  /**
   * Get audit log count
   */
  count(): number {
    return this.auditLogRepository.count();
  }
}
