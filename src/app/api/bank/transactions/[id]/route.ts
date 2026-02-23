/**
 * GET /api/bank/transactions/[id]
 * Get bank transaction by ID
 */
import { NextRequest, NextResponse } from "next/server";
import { BankTransactionService } from "@/lib/services/bank-transaction-service";
import { BankTransactionRepository } from "@/lib/repositories/bank-transaction-repository";
import { dbManager } from "@/lib/database/database";
import { updateBankTransactionSchema } from "@/lib/validations/bank.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const db = dbManager.getDatabase();
    const bankTransactionService = new BankTransactionService(
      new BankTransactionRepository(db),
    );

    const bankTransaction = bankTransactionService.getById(id);

    if (!bankTransaction) {
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
      data: bankTransaction,
    });
  } catch (error) {
    console.error("Error fetching bank transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank transaction",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/bank/transactions/[id]
 * Update bank transaction
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateBankTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const db = dbManager.getDatabase();
    const bankTransactionService = new BankTransactionService(
      new BankTransactionRepository(db),
    );

    const bankTransaction = bankTransactionService.update(id, validation.data);

    if (!bankTransaction) {
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
      data: bankTransaction,
    });
  } catch (error) {
    console.error("Error updating bank transaction:", error);

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
        error: "Failed to update bank transaction",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/bank/transactions/[id]
 * Delete bank transaction
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const db = dbManager.getDatabase();
    const bankTransactionService = new BankTransactionService(
      new BankTransactionRepository(db),
    );

    const deleted = bankTransactionService.delete(id);

    if (!deleted) {
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
      message: "Bank transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bank transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete bank transaction",
      },
      { status: 500 },
    );
  }
}
