/**
 * Journal Entry Service
 *
 * Business logic layer for JournalEntry entity.
 */

import { JournalEntryRepository } from "@/lib/repositories/journal-entry-repository";
import {
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
} from "@/lib/repositories/journal-entry-repository";
import { v4 as uuidv4 } from "uuid";

export interface JournalEntryDTO {
  id: string;
  description: string;
  debit: number;
  credit: number;
  account_id: string;
  transaction_date: number;
  created_at: number;
}

export class JournalEntryService {
  constructor(private journalEntryRepository: JournalEntryRepository) {}

  /**
   * Create a new journal entry
   */
  create(data: CreateJournalEntryInput): JournalEntryDTO {
    // Validate debit equals credit
    if (data.debit !== data.credit) {
      throw new Error("Debit amount must equal credit amount");
    }

    // Validate transaction date
    if (data.transaction_date < 0) {
      throw new Error("Transaction date must be a valid timestamp");
    }

    const journalEntry = this.journalEntryRepository.create(data);

    return {
      id: journalEntry.id,
      description: journalEntry.description,
      debit: journalEntry.debit,
      credit: journalEntry.credit,
      account_id: journalEntry.account_id,
      transaction_date: journalEntry.transaction_date,
      created_at: journalEntry.created_at,
    };
  }

  /**
   * Get journal entry by ID
   */
  getById(id: string): JournalEntryDTO | undefined {
    const journalEntry = this.journalEntryRepository.findById(id);
    if (!journalEntry) {
      return undefined;
    }

    return {
      id: journalEntry.id,
      description: journalEntry.description,
      debit: journalEntry.debit,
      credit: journalEntry.credit,
      account_id: journalEntry.account_id,
      transaction_date: journalEntry.transaction_date,
      created_at: journalEntry.created_at,
    };
  }

  /**
   * Get all journal entries
   */
  getAll(): JournalEntryDTO[] {
    const journalEntries = this.journalEntryRepository.findAll();
    return journalEntries.map((journalEntry) => ({
      id: journalEntry.id,
      description: journalEntry.description,
      debit: journalEntry.debit,
      credit: journalEntry.credit,
      account_id: journalEntry.account_id,
      transaction_date: journalEntry.transaction_date,
      created_at: journalEntry.created_at,
    }));
  }

  /**
   * Get journal entries by account
   */
  getByAccount(account_id: string): JournalEntryDTO[] {
    const journalEntries =
      this.journalEntryRepository.findByAccount(account_id);
    return journalEntries.map((journalEntry) => ({
      id: journalEntry.id,
      description: journalEntry.description,
      debit: journalEntry.debit,
      credit: journalEntry.credit,
      account_id: journalEntry.account_id,
      transaction_date: journalEntry.transaction_date,
      created_at: journalEntry.created_at,
    }));
  }

  /**
   * Get journal entries by date range
   */
  getByDateRange(startDate: number, endDate: number): JournalEntryDTO[] {
    const journalEntries = this.journalEntryRepository.findByDateRange(
      startDate,
      endDate,
    );
    return journalEntries.map((journalEntry) => ({
      id: journalEntry.id,
      description: journalEntry.description,
      debit: journalEntry.debit,
      credit: journalEntry.credit,
      account_id: journalEntry.account_id,
      transaction_date: journalEntry.transaction_date,
      created_at: journalEntry.created_at,
    }));
  }

  /**
   * Get journal entries by date
   */
  getByDate(transaction_date: number): JournalEntryDTO[] {
    const journalEntries =
      this.journalEntryRepository.findByDate(transaction_date);
    return journalEntries.map((journalEntry) => ({
      id: journalEntry.id,
      description: journalEntry.description,
      debit: journalEntry.debit,
      credit: journalEntry.credit,
      account_id: journalEntry.account_id,
      transaction_date: journalEntry.transaction_date,
      created_at: journalEntry.created_at,
    }));
  }

  /**
   * Update journal entry
   */
  update(
    id: string,
    data: UpdateJournalEntryInput,
  ): JournalEntryDTO | undefined {
    // Check if journal entry exists
    const existing = this.journalEntryRepository.findById(id);
    if (!existing) {
      return undefined;
    }

    // Validate debit equals credit
    if (
      data.debit !== undefined &&
      data.credit !== undefined &&
      data.debit !== data.credit
    ) {
      throw new Error("Debit amount must equal credit amount");
    }

    // Validate transaction date
    if (data.transaction_date !== undefined && data.transaction_date < 0) {
      throw new Error("Transaction date must be a valid timestamp");
    }

    const updated = this.journalEntryRepository.update(id, data);

    if (!updated) {
      return undefined;
    }

    return {
      id: updated.id,
      description: updated.description,
      debit: updated.debit,
      credit: updated.credit,
      account_id: updated.account_id,
      transaction_date: updated.transaction_date,
      created_at: updated.created_at,
    };
  }

  /**
   * Delete journal entry
   */
  delete(id: string): boolean {
    return this.journalEntryRepository.delete(id);
  }

  /**
   * Get journal entry count
   */
  count(): number {
    return this.journalEntryRepository.count();
  }
}
