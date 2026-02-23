/**
 * GET /api/bank/overview
 * Get all bank accounts and primary account
 */
import { NextResponse } from "next/server";
import { dbManager } from "@/lib/database/database";
import { BankAccountRepository } from "@/lib/repositories/bank-account-repository";
import { BankStatementRepository } from "@/lib/repositories/bank-statement-repository";
import { BankTransactionRepository } from "@/lib/repositories/bank-transaction-repository";
import { BankService } from "@/lib/services/bank-service";
import {
  getAllBankAccounts,
  getPrimaryBankAccount,
} from "@/lib/services/bank-service";

export async function GET() {
  try {
    const db = dbManager.getDatabase();
    const bankAccountRepository = new BankAccountRepository(db);
    const bankAccountService = new BankService(
      bankAccountRepository,
      new BankStatementRepository(db),
      new BankTransactionRepository(db),
    );

    const accounts = getAllBankAccounts();
    const primaryAccount = getPrimaryBankAccount();

    return NextResponse.json({
      success: true,
      data: {
        accounts,
        primaryAccount,
        count: accounts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching bank overview:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank overview",
      },
      { status: 500 },
    );
  }
}
