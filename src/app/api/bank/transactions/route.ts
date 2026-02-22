/**
 * GET /api/bank/transactions
 * Get all bank transactions
 */
import { NextResponse } from "next/server";
import { BankTransactionService } from "@/lib/services/bank-transaction-service";
import { BankTransactionRepository } from "@/lib/repositories/bank-transaction-repository";
import { dbManager } from "@/lib/database/database";
import { createBankTransactionSchema } from "@/lib/validations/bank.validation";

export async function GET(request: NextRequest) {
  try {
    const db = dbManager.getDatabase();
    const bankTransactionService = new BankTransactionService(
      new BankTransactionRepository(db),
    );

    const bankTransactions = bankTransactionService.getAll();

    return NextResponse.json({
      success: true,
      data: bankTransactions,
      count: bankTransactions.length,
    });
  } catch (error) {
    console.error("Error fetching bank transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank transactions",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bank/transactions
 * Create a new bank transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createBankTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const db = dbManager.getDatabase();
    const bankTransactionService = new BankTransactionService(
      new BankTransactionRepository(db),
    );

    const bankTransaction = bankTransactionService.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: bankTransaction,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating bank transaction:", error);

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create bank transaction",
      },
      { status: 500 },
    );
  }
}
