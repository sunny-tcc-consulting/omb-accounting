/**
 * Journal Entries Service - Mock data for bank matching
 * Part of Phase 4.6: Bank Reconciliation
 */

import { JournalEntry } from "@/types";

// In-memory journal entries store
const journalEntries: Map<string, JournalEntry> = new Map();

// Generate unique ID
const generateJournalEntryId = (): string => {
  return `jrn-${crypto.randomUUID().slice(0, 8)}`;
};

/**
 * Create a journal entry
 */
export const createJournalEntry = (data: {
  date: Date;
  description: string;
  amount: number;
  type: "debit" | "credit";
  category?: string;
  reference?: string;
}): JournalEntry => {
  const id = generateJournalEntryId();
  const now = new Date();

  const entry: JournalEntry = {
    id,
    date: data.date,
    description: data.description,
    amount: data.amount,
    type: data.type,
    category: data.category,
    reference: data.reference,
    status: "completed",
    createdAt: now,
    updatedAt: now,
  };

  journalEntries.set(id, entry);
  return entry;
};

/**
 * Get all journal entries
 */
export const getAllJournalEntries = (): JournalEntry[] => {
  return Array.from(journalEntries.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
};

/**
 * Get journal entries by date range
 */
export const getJournalEntriesByDateRange = (
  startDate: Date,
  endDate: Date,
): JournalEntry[] => {
  return getAllJournalEntries().filter(
    (entry) => entry.date >= startDate && entry.date <= endDate,
  );
};

/**
 * Get journal entries by type
 */
export const getJournalEntriesByType = (
  type: "debit" | "credit",
): JournalEntry[] => {
  return getAllJournalEntries().filter((entry) => entry.type === type);
};

// Initialize with some mock data
createJournalEntry({
  date: new Date("2026-02-01"),
  description: "Sales - Invoice INV-2026-0001",
  amount: 15000,
  type: "credit",
  category: "Sales",
  reference: "INV-2026-0001",
});

createJournalEntry({
  date: new Date("2026-02-05"),
  description: "Office Rent",
  amount: 5000,
  type: "debit",
  category: "Rent",
  reference: "OFF-001",
});

createJournalEntry({
  date: new Date("2026-02-10"),
  description: "Software Subscription",
  amount: 2000,
  type: "debit",
  category: "Software",
  reference: "SW-001",
});

createJournalEntry({
  date: new Date("2026-02-15"),
  description: "Consulting Fees",
  amount: 8000,
  type: "credit",
  category: "Consulting",
  reference: "CON-001",
});

createJournalEntry({
  date: new Date("2026-02-20"),
  description: "Utilities",
  amount: 1200,
  type: "debit",
  category: "Utilities",
  reference: "UTIL-001",
});
