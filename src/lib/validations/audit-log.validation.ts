/**
 * Audit Log Validation Schemas
 *
 * Zod schemas for audit log validation.
 */

import { z } from "zod";

export const createAuditLogSchema = z.object({
  user_id: z.string().optional(),
  operation: z.enum(["create", "update", "delete"]),
  table_name: z
    .string()
    .min(1, "Table name is required")
    .max(100, "Table name is too long"),
  record_id: z
    .string()
    .min(1, "Record ID is required")
    .max(100, "Record ID is too long"),
  changes: z.string().max(1000, "Changes is too long").optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().max(500, "User agent is too long").optional(),
});

export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
