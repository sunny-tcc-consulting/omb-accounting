/**
 * Reconciliation Report API - GET
 * Part of Phase 4.6: Bank Reconciliation
 */

import { NextRequest, NextResponse } from "next/server";
import { generateReconciliationReport } from "@/lib/reconciliation-service";

/**
 * GET /api/bank/reconciliation/report
 * Generate reconciliation report for a bank account
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bankAccountId = searchParams.get("bankAccountId");

    if (!bankAccountId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank account ID is required",
        },
        { status: 400 },
      );
    }

    const report = generateReconciliationReport(bankAccountId);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error generating reconciliation report:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate reconciliation report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
