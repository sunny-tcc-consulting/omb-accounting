/**
 * Data Transfer Objects (DTO)
 *
 * Converts between database entities and API response formats
 * ensuring backward compatibility with frontend expectations.
 */

import { Customer } from "@/lib/types/database";
import { Customer as FrontendCustomer } from "@/types";

/**
 * Convert database Customer to frontend Customer
 */
export function toFrontendCustomer(dbCustomer: Customer): FrontendCustomer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbAny = dbCustomer as any;
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    email: dbCustomer.email || "",
    phone: dbCustomer.phone,
    address: dbCustomer.address,
    company: dbAny.company || undefined,
    taxId: dbAny.tax_id || undefined,
    notes: dbAny.notes || undefined,
    createdAt: new Date(dbCustomer.created_at),
  };
}

/**
 * Convert list of database customers to frontend format
 */
export function toFrontendCustomerList(
  dbCustomers: Customer[],
): FrontendCustomer[] {
  return dbCustomers.map(toFrontendCustomer);
}

/**
 * Convert frontend customer to database format for creation
 */
export function toDbCustomerInput(frontendData: {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  company?: string | null;
  taxId?: string | null;
  notes?: string | null;
}): Omit<Customer, "id" | "created_at" | "updated_at"> {
  return {
    name: frontendData.name || "",
    email: frontendData.email || undefined,
    phone: frontendData.phone || undefined,
    address: frontendData.address || undefined,
  };
}
