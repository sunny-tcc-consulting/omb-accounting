/**
 * GET /api/bank/accounts
 * Get all bank accounts
 */
import { NextRequest, NextResponse } from "next/server";
import { BankAccountService } from "@/lib/services/bank-account-service";
import { BankAccountRepository } from "@/lib/repositories/bank-account-repository";
import { dbManager } from "@/lib/database/database";
import { createBankAccountSchema } from "@/lib/validations/bank.validation";

export async function GET(request: NextRequest) {
  try {
    const db = dbManager.getDatabase();
    const bankAccountService = new BankAccountService(
      new BankAccountRepository(db),
    );

    const bankAccounts = bankAccountService.getAll();

    return NextResponse.json({
      success: true,
      data: bankAccounts,
      count: bankAccounts.length,
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank accounts",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bank/accounts
 * Create a new bank account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createBankAccountSchema.safeParse(body);
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

    const bankAccount = bankAccountService.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: bankAccount,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating bank account:", error);

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
        error: "Failed to create bank account",
      },
      { status: 500 },
    );
  }
}
