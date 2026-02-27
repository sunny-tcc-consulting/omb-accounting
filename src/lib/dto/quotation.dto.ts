/**
 * Quotation DTO
 *
 * Converts between database Quotation entities and frontend Quotation formats.
 */

import { Quotation as DbQuotation } from "@/lib/types/database";
import {
  Quotation as FrontendQuotation,
  QuotationItem as FrontendQuotationItem,
} from "@/types";

/**
 * Parse JSON items from database
 */
interface DbQuotationItem {
  id?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  unitPrice?: number;
  tax_rate?: number;
  taxRate?: number;
  discount?: number;
  total?: number;
}

function parseItems(
  itemsJson: string | null | undefined,
): FrontendQuotationItem[] {
  if (!itemsJson) return [];
  try {
    const items = JSON.parse(itemsJson) as DbQuotationItem[];
    return items.map((item) => ({
      id: item.id || crypto.randomUUID(),
      description: item.description || "",
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || item.unitPrice || 0,
      taxRate: item.tax_rate || item.taxRate,
      discount: item.discount,
      total: item.total || 0,
    }));
  } catch {
    return [];
  }
}

/**
 * Convert database quotation to frontend format
 */
export function toFrontendQuotation(
  dbQuotation: DbQuotation,
): FrontendQuotation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbAny = dbQuotation as any;
  return {
    id: dbQuotation.id,
    quotationNumber: dbQuotation.quotation_number,
    customerId: dbQuotation.customer_id,
    customerName: dbQuotation.customer_name || "",
    customerEmail: dbQuotation.customer_email || "",
    customerPhone: dbQuotation.customer_phone || undefined,
    customerAddress: dbAny.customer_address || undefined,
    items: parseItems(dbQuotation.items),
    currency: dbQuotation.currency || "CNY",
    subtotal: dbQuotation.subtotal || 0,
    tax: dbQuotation.tax || undefined,
    discount: dbAny.discount || undefined,
    total: dbQuotation.total_amount,
    validityPeriod: dbQuotation.validity_period
      ? new Date(dbQuotation.validity_period)
      : new Date(),
    status: dbQuotation.status as FrontendQuotation["status"],
    issuedDate: dbQuotation.issued_date
      ? new Date(dbQuotation.issued_date)
      : new Date(),
    notes: dbQuotation.notes || undefined,
    termsAndConditions: dbQuotation.terms_and_conditions || undefined,
  };
}

/**
 * Convert list of database quotations to frontend format
 */
export function toFrontendQuotationList(
  dbQuotations: DbQuotation[],
): FrontendQuotation[] {
  return dbQuotations.map(toFrontendQuotation);
}

/**
 * Convert frontend quotation to database format for creation
 */
export function toDbQuotationInput(frontendData: {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string | null;
  items?: FrontendQuotationItem[];
  currency?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  validityPeriod?: Date;
  status?: "draft" | "sent" | "accepted" | "rejected";
  issuedDate?: Date;
  termsAndConditions?: string;
  notes?: string;
}): Omit<DbQuotation, "id" | "created_at" | "updated_at"> {
  return {
    customer_id: frontendData.customerId || "",
    quotation_number: `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    customer_name: frontendData.customerName || "",
    customer_email: frontendData.customerEmail || "",
    customer_phone: frontendData.customerPhone || null,
    currency: frontendData.currency || "CNY",
    subtotal: frontendData.subtotal || 0,
    tax: frontendData.tax || 0,
    total_amount: frontendData.total || 0,
    items: JSON.stringify(
      (frontendData.items || []).map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        discount: item.discount,
        total: item.total,
      })),
    ),
    validity_period: frontendData.validityPeriod?.getTime() || null,
    issued_date: frontendData.issuedDate?.getTime() || null,
    terms_and_conditions: frontendData.termsAndConditions || null,
    notes: frontendData.notes || null,
    status: frontendData.status || "draft",
  };
}
