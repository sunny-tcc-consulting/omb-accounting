/**
 * Bank Import API - POST
 * Part of Phase 4.6: Bank Reconciliation
 */

import { NextRequest, NextResponse } from "next/server";
import { importBankStatement, validateBankStatement } from "@/lib/bank-import";

/**
 * POST /api/bank/import
 * Import bank statement from file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const bankAccountId = formData.get("bankAccountId") as string;
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as "csv" | "qif" | "ofx";

    if (!bankAccountId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank account ID is required",
        },
        { status: 400 },
      );
    }

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "File is required",
        },
        { status: 400 },
      );
    }

    // Validate file
    const validation = validateBankStatement(file, fileType);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    // Import statement
    const result = await importBankStatement(bankAccountId, file, fileType);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully imported ${result.importedCount} transactions`,
    });
  } catch (error) {
    console.error("Error importing bank statement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to import bank statement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
