/**
 * Invoice Validation Schemas
 *
 * Zod schemas for invoice validation.
 */

import { z } from "zod";

export const createInvoiceSchema = z.object({
  customer_id: z.string().min(1, "Customer ID is required"),
  invoice_number: z
    .string()
    .min(1, "Invoice number is required")
    .max(50, "Invoice number is too long"),
  quotation_id: z.string().optional(),
  status: z.enum(["draft", "pending", "partial", "paid", "overdue"]).optional(),
  total_amount: z.number().min(0, "Total amount must be non-negative"),
  amount_paid: z.number().min(0, "Amount paid must be non-negative"),
  due_date: z.number().min(0, "Due date must be a valid timestamp"),
});

export const updateInvoiceSchema = z.object({
  customer_id: z.string().min(1, "Customer ID is required").optional(),
  invoice_number: z
    .string()
    .min(1, "Invoice number is required")
    .max(50, "Invoice number is too long")
    .optional(),
  quotation_id: z.string().optional(),
  status: z.enum(["draft", "pending", "partial", "paid", "overdue"]).optional(),
  total_amount: z
    .number()
    .min(0, "Total amount must be non-negative")
    .optional(),
  amount_paid: z.number().min(0, "Amount paid must be non-negative").optional(),
  due_date: z.number().min(0, "Due date must be a valid timestamp").optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
