/**
 * GET /api/bank/overview
 * Get all bank accounts and primary account
 */
import { NextResponse } from "next/server";
import {
  getAllBankAccounts,
  getPrimaryBankAccount,
} from "@/lib/services/bank-service";

export async function GET() {
  try {
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
