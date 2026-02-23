/**
 * GET /api/customers/[id]
 * Get customer by ID
 */
import { NextRequest, NextResponse } from "next/server";
import { CustomerService } from "@/lib/services/customer-service";
import { CustomerRepository } from "@/lib/repositories/customer-repository";
import { dbManager } from "@/lib/database/database";
import { updateCustomerSchema } from "@/lib/validations/customer.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const db = dbManager.getDatabase();
    const customerService = new CustomerService(new CustomerRepository(db));

    const customer = customerService.getById(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/customers/[id]
 * Update customer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateCustomerSchema.safeParse(body);
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
    const customerService = new CustomerService(new CustomerRepository(db));

    const customer = customerService.update(id, validation.data);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);

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
        error: "Failed to update customer",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const db = dbManager.getDatabase();
    const customerService = new CustomerService(new CustomerRepository(db));

    const deleted = customerService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete customer",
      },
      { status: 500 },
    );
  }
}
