/**
 * GET /api/bank/statements
 * Get all bank statements
 */
import { NextRequest, NextResponse } from "next/server";
import { BankStatementService } from "@/lib/services/bank-statement-service";
import { BankStatementRepository } from "@/lib/repositories/bank-statement-repository";
import { dbManager } from "@/lib/database/database-server";
import { createBankStatementSchema } from "@/lib/validations/bank.validation";

export async function GET(_request: NextRequest) {
  try {
    const db = dbManager.getDatabase();
    const bankStatementService = new BankStatementService(
      new BankStatementRepository(db),
    );

    const bankStatements = bankStatementService.getAll();

    return NextResponse.json({
      success: true,
      data: bankStatements,
      count: bankStatements.length,
    });
  } catch (error) {
    console.error("Error fetching bank statements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank statements",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bank/statements
 * Create a new bank statement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createBankStatementSchema.safeParse(body);
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
    const bankStatementService = new BankStatementService(
      new BankStatementRepository(db),
    );

    const bankStatement = bankStatementService.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: bankStatement,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating bank statement:", error);

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
        error: "Failed to create bank statement",
      },
      { status: 500 },
    );
  }
}
