/**
 * GET /api/bank/transactions
 * Get all bank transactions
 */
import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "@/lib/database/database-server";
import { BankTransactionService } from "@/lib/services/bank-transaction-service";
import { BankTransactionRepository } from "@/lib/repositories/bank-transaction-repository";

export async function GET(_request: NextRequest) {
  try {
    const db = dbManager.getDatabase();
    const transactionService = new BankTransactionService(
      new BankTransactionRepository(db),
    );

    const transactions = transactionService.getAll();

    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
      },
      { status: 500 },
    );
  }
}
