/**
 * GET /api/audit-logs
 * Get all audit logs
 */
import { NextResponse } from "next/server";
import { AuditLogService } from "@/lib/services/audit-log-service";
import { AuditLogRepository } from "@/lib/repositories/audit-log-repository";
import { dbManager } from "@/lib/database/database";

export async function GET() {
  try {
    const db = dbManager.getDatabase();
    const auditLogService = new AuditLogService(new AuditLogRepository(db));

    const auditLogs = auditLogService.getAll();

    return NextResponse.json({
      success: true,
      data: auditLogs,
      count: auditLogs.length,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch audit logs",
      },
      { status: 500 },
    );
  }
}
