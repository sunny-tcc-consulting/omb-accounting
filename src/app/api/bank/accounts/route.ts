/**
 * GET /api/bank/accounts
 * Get all bank accounts
 */
import { NextRequest, NextResponse } from "next/server";
import { BankAccountService } from "@/lib/services/bank-account-service";
import { BankAccountRepository } from "@/lib/repositories/bank-account-repository";
import { dbManager } from "@/lib/database/database-server";
import { createBankAccountSchema } from "@/lib/validations/bank.validation";

export async function GET(_request: NextRequest) {
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
  console.log('[BANK API] POST /api/bank/accounts - Creating bank account');
  console.log('[BANK API] Request headers:', Object.fromEntries(request.headers));
  
  try {
    const body = await request.json();
    console.log('[BANK API] Request body:', JSON.stringify(body, null, 2));

    // Validate input
    const validation = createBankAccountSchema.safeParse(body);
    if (!validation.success) {
      console.log('[BANK API] Validation failed:', validation.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    console.log('[BANK API] Validation passed');
    console.log('[BANK API] Getting database connection...');
    
    const db = dbManager.getDatabase();
    console.log('[BANK API] Database connection obtained:', !!db);
    console.log('[BANK API] Database type:', typeof db);
    const dbAny = db as any;
    console.log('[BANK API] Database has run method:', typeof dbAny?.run);
    console.log('[BANK API] Database has get method:', typeof dbAny?.get);
    
    const bankAccountService = new BankAccountService(
      new BankAccountRepository(db),
    );
    console.log('[BANK API] BankAccountService created');

    console.log('[BANK API] Creating bank account...');
    const bankAccount = bankAccountService.create(validation.data);
    console.log('[BANK API] Bank account created:', bankAccount);

    return NextResponse.json(
      {
        success: true,
        data: bankAccount,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[BANK API] Error creating bank account:', error);
    console.error('[BANK API] Error stack:', (error as Error).stack);
    console.error('[BANK API] Error message:', (error as Error).message);

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
        error: error instanceof Error ? error.message : "Failed to create bank account",
      },
      { status: 500 },
    );
  }
}
