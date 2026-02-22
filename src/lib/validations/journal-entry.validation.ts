/**
 * Journal Entry Validation Schemas
 *
 * Zod schemas for journal entry validation.
 */

import { z } from "zod";

export const createJournalEntrySchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
  debit: z.number().min(0, "Debit amount must be non-negative"),
  credit: z.number().min(0, "Credit amount must be non-negative"),
  account_id: z.string().min(1, "Account ID is required"),
  transaction_date: z
    .number()
    .min(0, "Transaction date must be a valid timestamp"),
});

export const updateJournalEntrySchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long")
    .optional(),
  debit: z.number().min(0, "Debit amount must be non-negative").optional(),
  credit: z.number().min(0, "Credit amount must be non-negative").optional(),
  account_id: z.string().min(1, "Account ID is required").optional(),
  transaction_date: z
    .number()
    .min(0, "Transaction date must be a valid timestamp")
    .optional(),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;
