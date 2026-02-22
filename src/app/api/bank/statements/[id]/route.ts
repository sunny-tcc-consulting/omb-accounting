/**
 * GET /api/bank/statements/[id]
 * Get bank statement by ID
 */
import { NextResponse } from "next/server";
import { BankStatementService } from "@/lib/services/bank-statement-service";
import { BankStatementRepository } from "@/lib/repositories/bank-statement-repository";
import { dbManager } from "@/lib/database/database";
import { updateBankStatementSchema } from "@/lib/validations/bank.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const db = dbManager.getDatabase();
    const bankStatementService = new BankStatementService(
      new BankStatementRepository(db),
    );

    const bankStatement = bankStatementService.getById(id);

    if (!bankStatement) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank statement not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: bankStatement,
    });
  } catch (error) {
    console.error("Error fetching bank statement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank statement",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/bank/statements/[id]
 * Update bank statement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const validation = updateBankStatementSchema.safeParse(body);
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
    const bankStatementService = new BankStatementService(
      new BankStatementRepository(db),
    );

    const bankStatement = bankStatementService.update(id, validation.data);

    if (!bankStatement) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank statement not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: bankStatement,
    });
  } catch (error) {
    console.error("Error updating bank statement:", error);

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
        error: "Failed to update bank statement",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/bank/statements/[id]
 * Delete bank statement
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const db = dbManager.getDatabase();
    const bankStatementService = new BankStatementService(
      new BankStatementRepository(db),
    );

    const deleted = bankStatementService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank statement not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bank statement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bank statement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete bank statement",
      },
      { status: 500 },
    );
  }
}
