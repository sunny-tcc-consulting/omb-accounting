/**
 * GET /api/customers
 * Get all customers
 */
import { NextRequest, NextResponse } from "next/server";
import { CustomerService } from "@/lib/services/customer-service";
import { CustomerRepository } from "@/lib/repositories/customer-repository";
import { dbManager } from "@/lib/database/database-server";
import { createCustomerSchema } from "@/lib/validations/customer.validation";

export async function GET() {
  try {
    const db = dbManager.getDatabase();
    const customerService = new CustomerService(new CustomerRepository(db));

    const customers = customerService.getAll();

    return NextResponse.json({
      success: true,
      data: customers,
      count: customers.length,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customers",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createCustomerSchema.safeParse(body);
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

    const customer = customerService.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: customer,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating customer:", error);

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
        error: "Failed to create customer",
      },
      { status: 500 },
    );
  }
}
