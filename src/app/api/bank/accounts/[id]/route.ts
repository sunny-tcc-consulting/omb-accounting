/**
 * Bank Account API - GET, PUT, DELETE
 * Part of Phase 4.6: Bank Reconciliation
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getBankAccountById,
  updateBankAccount,
  deleteBankAccount,
} from "@/lib/bank-service";

/**
 * GET /api/bank/accounts/[id]
 * Get bank account by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const account = getBankAccountById(id);

    if (!account) {
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
      data: account,
    });
  } catch (error) {
    console.error("Error fetching bank account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank account",
        message: error instanceof Error ? error.message : "Unknown error",
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
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Update bank account
    const account = updateBankAccount(id, body);

    if (!account) {
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
      data: account,
      message: "Bank account updated successfully",
    });
  } catch (error) {
    console.error("Error updating bank account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update bank account",
        message: error instanceof Error ? error.message : "Unknown error",
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
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const success = deleteBankAccount(id);

    if (!success) {
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
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
