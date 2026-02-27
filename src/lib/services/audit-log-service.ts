/**
 * Audit Log Service
 *
 * Business logic layer for audit logging.
 */

import { AuditLogRepository } from "../repositories/audit-log-repository";
import { AuditLog } from "../types/database";

interface CreateAuditLogInput {
  userId: string;
  operation: "create" | "update" | "delete";
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
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

interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export class AuditLogService {
  private repository: AuditLogRepository;

  constructor(repository: AuditLogRepository) {
    this.repository = repository;
  }

  /**
   * Create a new audit log entry
   */
  async log(input: CreateAuditLogInput): Promise<AuditLog> {
    return this.repository.create({
      user_id: input.userId,
      operation: input.operation,
      table_name: input.entityType,
      record_id: input.entityId,
      changes: input.changes,
      ip_address: input.ipAddress,
      user_agent: input.userAgent,
    });
  }

  /**
   * Log customer operation
   */
  async logCustomerOperation(
    userId: string,
    operation: "create" | "update" | "delete",
    customerId: string,
    changes?: Record<string, unknown>,
    request?: { ip?: string; userAgent?: string },
  ): Promise<AuditLog> {
    return this.log({
      userId,
      operation,
      entityType: "customers",
      entityId: customerId,
      changes,
      ipAddress: request?.ip,
      userAgent: request?.userAgent,
    });
  }

  /**
   * Log quotation operation
   */
  async logQuotationOperation(
    userId: string,
    operation: "create" | "update" | "delete",
    quotationId: string,
    changes?: Record<string, unknown>,
    request?: { ip?: string; userAgent?: string },
  ): Promise<AuditLog> {
    return this.log({
      userId,
      operation,
      entityType: "quotations",
      entityId: quotationId,
      changes,
      ipAddress: request?.ip,
      userAgent: request?.userAgent,
    });
  }

  /**
   * Log invoice operation
   */
  async logInvoiceOperation(
    userId: string,
    operation: "create" | "update" | "delete",
    invoiceId: string,
    changes?: Record<string, unknown>,
    request?: { ip?: string; userAgent?: string },
  ): Promise<AuditLog> {
    return this.log({
      userId,
      operation,
      entityType: "invoices",
      entityId: invoiceId,
      changes,
      ipAddress: request?.ip,
      userAgent: request?.userAgent,
    });
  }

  /**
   * Get audit logs with pagination
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedAuditLogs> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const [data, total] = await Promise.all([
      this.repository.getAll({ ...filters, limit, offset }),
      this.repository.count(filters),
    ]);

    return {
      data,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get audit logs by user
   */
  async getByUser(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.repository.getByUserId(userId, limit);
  }

  /**
   * Get audit trail for a specific entity
   */
  async getAuditTrail(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.repository.getByEntity(entityType, entityId);
  }

  /**
   * Get audit logs within date range
   */
  async getByDateRange(
    startDate: number,
    endDate: number,
    limit = 1000,
  ): Promise<AuditLog[]> {
    return this.repository.getByDateRange(startDate, endDate, limit);
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 20): Promise<AuditLog[]> {
    return this.repository.getAll({ limit });
  }

  /**
   * Clean up old audit logs (older than 1 year by default)
   */
  async cleanupOldLogs(
    olderThanMs = 365 * 24 * 60 * 60 * 1000,
  ): Promise<number> {
    const cutoffTime = Date.now() - olderThanMs;
    return this.repository.deleteOlderThan(cutoffTime);
  }
}
