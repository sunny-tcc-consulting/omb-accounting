/**
 * Audit Log Middleware
 *
 * Provides audit logging utilities for API routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditLogService } from "@/lib/services/audit-log-service";
import { AuditLogRepository } from "@/lib/repositories/audit-log-repository";
import { dbManager } from "@/lib/database/database";

/**
 * Log audit entry
 */
export async function logAuditEntry(
  operation: "create" | "update" | "delete",
  table_name: string,
  record_id: string,
  changes?: string,
  user_id?: string,
  ip_address?: string,
  user_agent?: string,
): Promise<void> {
  const db = dbManager.getDatabase();
  const auditLogRepository = new AuditLogRepository(db);
  const auditLogService = new AuditLogService(auditLogRepository);

  auditLogService.create({
    user_id,
    operation,
    table_name,
    record_id,
    changes,
    ip_address,
    user_agent,
  });
}

/**
 * Create audit log for create operation
 */
export async function logCreate(
  table_name: string,
  record_id: string,
  user_id?: string,
  ip_address?: string,
  user_agent?: string,
): Promise<void> {
  await logAuditEntry(
    "create",
    table_name,
    record_id,
    undefined,
    user_id,
    ip_address,
    user_agent,
  );
}

/**
 * Create audit log for update operation
 */
export async function logUpdate(
  table_name: string,
  record_id: string,
  changes?: string,
  user_id?: string,
  ip_address?: string,
  user_agent?: string,
): Promise<void> {
  await logAuditEntry(
    "update",
    table_name,
    record_id,
    changes,
    user_id,
    ip_address,
    user_agent,
  );
}

/**
 * Create audit log for delete operation
 */
export async function logDelete(
  table_name: string,
  record_id: string,
  user_id?: string,
  ip_address?: string,
  user_agent?: string,
): Promise<void> {
  await logAuditEntry(
    "delete",
    table_name,
    record_id,
    undefined,
    user_id,
    ip_address,
    user_agent,
  );
}

/**
 * Create audit log for match operation
 */
export async function logMatch(
  table_name: string,
  record_id: string,
  user_id?: string,
  ip_address?: string,
  user_agent?: string,
): Promise<void> {
  await logAuditEntry(
    "update",
    table_name,
    record_id,
    "Transaction matched",
    user_id,
    ip_address,
    user_agent,
  );
}

/**
 * Create audit log for reconcile operation
 */
export async function logReconcile(
  table_name: string,
  record_id: string,
  user_id?: string,
  ip_address?: string,
  user_agent?: string,
): Promise<void> {
  await logAuditEntry(
    "update",
    table_name,
    record_id,
    "Statement reconciled",
    user_id,
    ip_address,
    user_agent,
  );
}
