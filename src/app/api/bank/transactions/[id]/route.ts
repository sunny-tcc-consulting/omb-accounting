/**
 * Bank Transaction API - GET, PUT, DELETE
 * Part of Phase 4.6: Bank Reconciliation
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getBankTransactionById,
  matchBankTransaction,
  unmatchBankTransaction,
} from "@/lib/bank-service";

/**
 * GET /api/bank/transactions/[id]
 * Get bank transaction by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const transaction = getBankTransactionById(id);

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank transaction not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching bank transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bank transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/bank/transactions/[id]/match
 * Match bank transaction with book transaction
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { bookTransactionId } = body;

    if (!bookTransactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Book transaction ID is required",
        },
        { status: 400 },
      );
    }

    const success = matchBankTransaction(id, bookTransactionId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank transaction not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bank transaction matched successfully",
    });
  } catch (error) {
    console.error("Error matching bank transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to match bank transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/bank/transactions/[id]/unmatch
 * Unmatch bank transaction
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const success = unmatchBankTransaction(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Bank transaction not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bank transaction unmatched successfully",
    });
  } catch (error) {
    console.error("Error unmatching bank transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to unmatch bank transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
