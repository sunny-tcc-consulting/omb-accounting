/**
 * GET /api/invoices
 * Get all invoices
 */
import { NextRequest, NextResponse } from "next/server";
import { InvoiceService } from "@/lib/services/invoice-service";
import { InvoiceRepository } from "@/lib/repositories/invoice-repository";
import { dbManager } from "@/lib/database/database-server";
import { createInvoiceSchema } from "@/lib/validations/invoice.validation";
import { toFrontendInvoiceList, toFrontendInvoice } from "@/lib/dto";
import type { CreateInvoiceInput } from "@/lib/validations/invoice.validation";

export async function GET() {
  try {
    const db = dbManager.getDatabase();
    const invoiceService = new InvoiceService(new InvoiceRepository(db));

    const invoices = invoiceService.getAll();

    // Convert to frontend format for backward compatibility
    const frontendInvoices = toFrontendInvoiceList(invoices);

    return NextResponse.json({
      success: true,
      data: frontendInvoices,
      count: frontendInvoices.length,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch invoices",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createInvoiceSchema.safeParse(body);
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

    // Validation schema uses database format, pass directly
    const invoice = invoiceService.create(
      validation.data as CreateInvoiceInput,
    );

    // Convert to frontend format for response
    const frontendInvoice = toFrontendInvoice(invoice);

    return NextResponse.json(
      {
        success: true,
        data: frontendInvoice,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating invoice:", error);

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
        error: "Failed to create invoice",
      },
      { status: 500 },
    );
  }
}
