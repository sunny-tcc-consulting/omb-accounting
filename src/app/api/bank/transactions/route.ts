/**
 * Bank Transactions API - GET, POST
 * Part of Phase 4.6: Bank Reconciliation
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllBankTransactions,
  getBankTransactionsByStatementId,
  getUnmatchedBankTransactions,
  getMatchedBankTransactions,
} from "@/lib/bank-service";

/**
 * GET /api/bank/transactions
 * Get all bank transactions with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get filter parameters
    const status = searchParams.get("status") as "pending" | "matched" | null;
    const statementId = searchParams.get("statementId") as string | null;

    let transactions;

    if (statementId) {
      transactions = getBankTransactionsByStatementId(statementId);
    } else if (status) {
      if (status === "pending") {
        transactions = getUnmatchedBankTransactions();
      } else if (status === "matched") {
        transactions = getMatchedBankTransactions();
      } else {
        transactions = getAllBankTransactions();
      }
    } else {
      transactions = getAllBankTransactions();
    }

    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching bank transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank transactions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
