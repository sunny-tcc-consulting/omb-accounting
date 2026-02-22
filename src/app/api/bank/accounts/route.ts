/**
 * Bank Accounts API - GET, POST
 * Part of Phase 4.6: Bank Reconciliation
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllBankAccounts, createBankAccount } from "@/lib/bank-service";
import { z } from "zod";

// Validation schema
const createBankAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountType: z.enum(["checking", "savings"]),
  currency: z.string().default("HKD"),
  openingBalance: z.number().optional(),
  isPrimary: z.boolean().default(false),
});

/**
 * GET /api/bank/accounts
 * Get all bank accounts
 */
export async function GET(_request: NextRequest) {
  try {
    const accounts = getAllBankAccounts();

    return NextResponse.json({
      success: true,
      data: accounts,
      count: accounts.length,
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank accounts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bank/accounts
 * Create a new bank account
 */
export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json();

    // Validate input
    const validated = createBankAccountSchema.parse(body);

    // Create bank account
    const account = createBankAccount(validated);

    return NextResponse.json({
      success: true,
      data: account,
      message: "Bank account created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Error creating bank account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create bank account",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
