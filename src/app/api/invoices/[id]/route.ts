/**
 * GET /api/invoices/[id]
 * Get invoice by ID
 */
import { NextRequest, NextResponse } from "next/server";
import { InvoiceService } from "@/lib/services/invoice-service";
import { InvoiceRepository } from "@/lib/repositories/invoice-repository";
import { dbManager } from "@/lib/database/database-server";
import { updateInvoiceSchema } from "@/lib/validations/invoice.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const db = dbManager.getDatabase();
    const invoiceService = new InvoiceService(new InvoiceRepository(db));

    const invoice = invoiceService.getById(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch invoice",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/invoices/[id]
 * Update invoice
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateInvoiceSchema.safeParse(body);
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
    const invoiceService = new InvoiceService(new InvoiceRepository(db));

    const invoice = invoiceService.update(id, validation.data);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);

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
        error: "Failed to update invoice",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/invoices/[id]
 * Delete invoice
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const db = dbManager.getDatabase();
    const invoiceService = new InvoiceService(new InvoiceRepository(db));

    const deleted = invoiceService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete invoice",
      },
      { status: 500 },
    );
  }
}
