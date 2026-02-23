/**
 * GET /api/bank/reconciliation/[account_id]
 * Get reconciliation history for a bank account
 */
import { NextResponse } from "next/server";
import { getReconciliationHistory } from "@/lib/services/bank-reconciliation-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ account_id: string }> },
) {
  try {
    const { account_id } = await params;
    const reconciliationHistory = getReconciliationHistory(account_id);

    return NextResponse.json({
      success: true,
      data: reconciliationHistory,
      count: reconciliationHistory.length,
    });
  } catch (error) {
    console.error("Error fetching reconciliation history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reconciliation history",
      },
      { status: 500 },
    );
  }
}
