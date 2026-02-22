/**
 * Quotation Validation Schemas
 *
 * Zod schemas for quotation validation.
 */

import { z } from "zod";

export const createQuotationSchema = z.object({
  customer_id: z.string().min(1, "Customer ID is required"),
  quotation_number: z
    .string()
    .min(1, "Quotation number is required")
    .max(50, "Quotation number is too long"),
  status: z.enum(["draft", "sent", "accepted", "rejected"]).optional(),
  total_amount: z
    .number()
    .min(0, "Total amount must be non-negative")
    .optional(),
});

export const updateQuotationSchema = z.object({
  customer_id: z.string().min(1, "Customer ID is required").optional(),
  quotation_number: z
    .string()
    .min(1, "Quotation number is required")
    .max(50, "Quotation number is too long")
    .optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected"]).optional(),
  total_amount: z
    .number()
    .min(0, "Total amount must be non-negative")
    .optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
