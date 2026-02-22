/**
 * Reconciliation API - GET, POST
 * Part of Phase 4.6: Bank Reconciliation
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getReconciliationSummary,
  markStatementReconciled,
} from "@/lib/reconciliation-service";

/**
 * GET /api/bank/reconciliation
 * Get reconciliation summary for a statement
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statementId = searchParams.get("statementId");

    if (!statementId) {
      return NextResponse.json(
        {
          success: false,
          error: "Statement ID is required",
        },
        { status: 400 },
      );
    }

    const summary = getReconciliationSummary(statementId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching reconciliation summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reconciliation summary",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bank/reconciliation/match
 * Match a specific bank transaction with a book transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { statementId, bankTransactionId, bookTransactionId } = body;

    if (!statementId || !bankTransactionId || !bookTransactionId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Statement ID, bank transaction ID, and book transaction ID are required",
        },
        { status: 400 },
      );
    }

    // Import matchBankTransaction function
    const { matchBankTransaction } = await import("@/lib/bank-service");
    const success = matchBankTransaction(bankTransactionId, bookTransactionId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank transaction not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction matched successfully",
    });
  } catch (error) {
    console.error("Error matching transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to match transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bank/reconciliation/unmatch
 * Unmatch a bank transaction
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankTransactionId } = body;

    if (!bankTransactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank transaction ID is required",
        },
        { status: 400 },
      );
    }

    const { unmatchBankTransaction } = await import("@/lib/bank-service");
    const success = unmatchBankTransaction(bankTransactionId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank transaction not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction unmatched successfully",
    });
  } catch (error) {
    console.error("Error unmatching transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to unmatch transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bank/reconciliation/reconcile
 * Mark statement as reconciled
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { statementId } = body;

    if (!statementId) {
      return NextResponse.json(
        {
          success: false,
          error: "Statement ID is required",
        },
        { status: 400 },
      );
    }

    const success = markStatementReconciled(statementId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to reconcile statement",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Statement reconciled successfully",
    });
  } catch (error) {
    console.error("Error reconciling statement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reconcile statement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
