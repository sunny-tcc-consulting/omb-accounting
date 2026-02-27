/**
 * GET /api/audit-logs
 * Get audit logs with pagination and filtering
 */
import { NextRequest, NextResponse } from "next/server";
import { AuditLogService } from "@/lib/services/audit-log-service";
import { AuditLogRepository } from "@/lib/repositories/audit-log-repository";
import { dbManager } from "@/lib/database/database-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const userId = searchParams.get("userId") || undefined;
    const entityType = searchParams.get("entityType") || undefined;
    const entityId = searchParams.get("entityId") || undefined;
    const startDate = searchParams.get("startDate")
      ? parseInt(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? parseInt(searchParams.get("endDate")!)
      : undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : 0;

    const db = dbManager.getDatabase();
    const auditLogRepository = new AuditLogRepository(db);
    const auditLogService = new AuditLogService(auditLogRepository);

    const result = await auditLogService.getAuditLogs({
      userId,
      entityType,
      entityId,
      startDate,
      endDate,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.data.length < result.total,
      },
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
