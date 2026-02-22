/**
 * GET /api/quotations/[id]
 * Get quotation by ID
 */
import { NextResponse } from "next/server";
import { QuotationService } from "@/lib/services/quotation-service";
import { dbManager } from "@/lib/database/database";
import { updateQuotationSchema } from "@/lib/validations/quotation.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const db = dbManager.getDatabase();
    const quotationService = new QuotationService(new QuotationRepository(db));

    const quotation = quotationService.getById(id);

    if (!quotation) {
      return NextResponse.json(
        {
          success: false,
          error: "Quotation not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quotation",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/quotations/[id]
 * Update quotation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const validation = updateQuotationSchema.safeParse(body);
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
    const quotationService = new QuotationService(new QuotationRepository(db));

    const quotation = quotationService.update(id, validation.data);

    if (!quotation) {
      return NextResponse.json(
        {
          success: false,
          error: "Quotation not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error("Error updating quotation:", error);

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
        error: "Failed to update quotation",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/quotations/[id]
 * Delete quotation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const db = dbManager.getDatabase();
    const quotationService = new QuotationService(new QuotationRepository(db));

    const deleted = quotationService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Quotation not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete quotation",
      },
      { status: 500 },
    );
  }
}
