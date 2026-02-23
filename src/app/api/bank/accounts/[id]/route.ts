/**
 * GET /api/bank/accounts/[id]
 * Get bank account by ID
 */
import { NextRequest, NextResponse } from "next/server";
import { BankAccountService } from "@/lib/services/bank-account-service";
import { BankAccountRepository } from "@/lib/repositories/bank-account-repository";
import { dbManager } from "@/lib/database/database-server";
import { updateBankAccountSchema } from "@/lib/validations/bank.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const db = dbManager.getDatabase();
    const bankAccountService = new BankAccountService(
      new BankAccountRepository(db),
    );

    const bankAccount = bankAccountService.getById(id);

    if (!bankAccount) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank account not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: bankAccount,
    });
  } catch (error) {
    console.error("Error fetching bank account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank account",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/bank/accounts/[id]
 * Update bank account
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateBankAccountSchema.safeParse(body);
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
    const bankAccountService = new BankAccountService(
      new BankAccountRepository(db),
    );

    const bankAccount = bankAccountService.update(id, validation.data);

    if (!bankAccount) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank account not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: bankAccount,
    });
  } catch (error) {
    console.error("Error updating bank account:", error);

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
        error: "Failed to update bank account",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/bank/accounts/[id]
 * Delete bank account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const db = dbManager.getDatabase();
    const bankAccountService = new BankAccountService(
      new BankAccountRepository(db),
    );

    const deleted = bankAccountService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank account not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete bank account",
      },
      { status: 500 },
    );
  }
}
