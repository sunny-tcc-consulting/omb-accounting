/**
 * GET /api/quotations
 * Get all quotations
 */
import { NextRequest, NextResponse } from "next/server";
import { QuotationService } from "@/lib/services/quotation-service";
import { QuotationRepository } from "@/lib/repositories/quotation-repository";
import { dbManager } from "@/lib/database/database-server";
import { createQuotationSchema } from "@/lib/validations/quotation.validation";

export async function GET() {
  try {
    const db = dbManager.getDatabase();
    const quotationService = new QuotationService(new QuotationRepository(db));

    const quotations = quotationService.getAll();

    return NextResponse.json({
      success: true,
      data: quotations,
      count: quotations.length,
    });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quotations",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/quotations
 * Create a new quotation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createQuotationSchema.safeParse(body);
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
    const quotationService = new QuotationService(new QuotationRepository(db));

    const quotation = quotationService.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: quotation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating quotation:", error);

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
        error: "Failed to create quotation",
      },
      { status: 500 },
    );
  }
}
