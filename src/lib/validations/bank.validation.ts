/**
 * Bank Validation Schemas
 *
 * Zod schemas for bank entity validation.
 */

import { z } from "zod";

export const createBankAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  account_number: z
    .string()
    .min(1, "Account number is required")
    .max(50, "Account number is too long"),
  bank_name: z.string().optional(),
  balance: z.number().min(0, "Balance must be non-negative").optional(),
  currency: z.string().default("HKD").optional(),
});

export const updateBankAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long")
    .optional(),
  account_number: z
    .string()
    .min(1, "Account number is required")
    .max(50, "Account number is too long")
    .optional(),
  bank_name: z.string().optional(),
  balance: z.number().min(0, "Balance must be non-negative").optional(),
  currency: z.string().optional(),
});

export const createBankStatementSchema = z.object({
  bank_account_id: z.string().min(1, "Bank account ID is required"),
  statement_number: z
    .string()
    .min(1, "Statement number is required")
    .max(50, "Statement number is too long"),
  statement_date: z.number().min(0, "Statement date must be a valid timestamp"),
  closing_balance: z.number().min(0, "Closing balance must be non-negative"),
  file_path: z.string().optional(),
  status: z.enum(["pending", "processed"]).optional(),
});

export const updateBankStatementSchema = z.object({
  bank_account_id: z.string().min(1, "Bank account ID is required").optional(),
  statement_number: z
    .string()
    .min(1, "Statement number is required")
    .max(50, "Statement number is too long")
    .optional(),
  statement_date: z
    .number()
    .min(0, "Statement date must be a valid timestamp")
    .optional(),
  closing_balance: z
    .number()
    .min(0, "Closing balance must be non-negative")
    .optional(),
  file_path: z.string().optional(),
  status: z.enum(["pending", "processed"]).optional(),
});

export const createBankTransactionSchema = z.object({
  statement_id: z.string().min(1, "Statement ID is required"),
  transaction_date: z
    .number()
    .min(0, "Transaction date must be a valid timestamp"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
  amount: z.number().min(0, "Amount must be non-negative"),
  type: z.enum(["credit", "debit"]),
  status: z.enum(["unmatched", "matched", "rejected"]).optional(),
  matched_to_journal_entry_id: z.string().optional(),
});

export const updateBankTransactionSchema = z.object({
  statement_id: z.string().min(1, "Statement ID is required").optional(),
  transaction_date: z
    .number()
    .min(0, "Transaction date must be a valid timestamp")
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long")
    .optional(),
  amount: z.number().min(0, "Amount must be non-negative").optional(),
  type: z.enum(["credit", "debit"]).optional(),
  status: z.enum(["unmatched", "matched", "rejected"]).optional(),
  matched_to_journal_entry_id: z.string().optional(),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
export type CreateBankStatementInput = z.infer<
  typeof createBankStatementSchema
>;
export type UpdateBankStatementInput = z.infer<
  typeof updateBankStatementSchema
>;
export type CreateBankTransactionInput = z.infer<
  typeof createBankTransactionSchema
>;
export type UpdateBankTransactionInput = z.infer<
  typeof updateBankTransactionSchema
>;
