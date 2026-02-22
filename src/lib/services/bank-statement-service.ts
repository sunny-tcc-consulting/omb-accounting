/**
 * Bank Statement Service
 *
 * Business logic layer for BankStatement entity.
 */

import { BankStatementRepository } from "@/lib/repositories/bank-statement-repository";
import {
  CreateBankStatementInput,
  UpdateBankStatementInput,
} from "@/lib/repositories/bank-statement-repository";
import { v4 as uuidv4 } from "uuid";

export interface BankStatementDTO {
  id: string;
  bank_account_id: string;
  statement_number: string;
  statement_date: number;
  closing_balance: number;
  file_path?: string;
  status: "pending" | "processed";
  created_at: number;
  updated_at: number;
}

export class BankStatementService {
  constructor(private bankStatementRepository: BankStatementRepository) {}

  /**
   * Create a new bank statement
   */
  create(data: CreateBankStatementInput): BankStatementDTO {
    // Check if statement number already exists
    const existing = this.bankStatementRepository.findByNumber(
      data.statement_number,
    );
    if (existing) {
      throw new Error("Bank statement with this number already exists");
    }

    // Validate statement date is in the future
    if (data.statement_date < Date.now()) {
      throw new Error("Statement date must be in the future");
    }

    const bankStatement = this.bankStatementRepository.create(data);

    return {
      id: bankStatement.id,
      bank_account_id: bankStatement.bank_account_id,
      statement_number: bankStatement.statement_number,
      statement_date: bankStatement.statement_date,
      closing_balance: bankStatement.closing_balance,
      file_path: bankStatement.file_path,
      status: bankStatement.status,
      created_at: bankStatement.created_at,
      updated_at: bankStatement.updated_at,
    };
  }

  /**
   * Get bank statement by ID
   */
  getById(id: string): BankStatementDTO | undefined {
    const bankStatement = this.bankStatementRepository.findById(id);
    if (!bankStatement) {
      return undefined;
    }

    return {
      id: bankStatement.id,
      bank_account_id: bankStatement.bank_account_id,
      statement_number: bankStatement.statement_number,
      statement_date: bankStatement.statement_date,
      closing_balance: bankStatement.closing_balance,
      file_path: bankStatement.file_path,
      status: bankStatement.status,
      created_at: bankStatement.created_at,
      updated_at: bankStatement.updated_at,
    };
  }

  /**
   * Get all bank statements
   */
  getAll(): BankStatementDTO[] {
    const bankStatements = this.bankStatementRepository.findAll();
    return bankStatements.map((bankStatement) => ({
      id: bankStatement.id,
      bank_account_id: bankStatement.bank_account_id,
      statement_number: bankStatement.statement_number,
      statement_date: bankStatement.statement_date,
      closing_balance: bankStatement.closing_balance,
      file_path: bankStatement.file_path,
      status: bankStatement.status,
      created_at: bankStatement.created_at,
      updated_at: bankStatement.updated_at,
    }));
  }

  /**
   * Get bank statements by bank account
   */
  getByBankAccount(bank_account_id: string): BankStatementDTO[] {
    const bankStatements =
      this.bankStatementRepository.findByBankAccount(bank_account_id);
    return bankStatements.map((bankStatement) => ({
      id: bankStatement.id,
      bank_account_id: bankStatement.bank_account_id,
      statement_number: bankStatement.statement_number,
      statement_date: bankStatement.statement_date,
      closing_balance: bankStatement.closing_balance,
      file_path: bankStatement.file_path,
      status: bankStatement.status,
      created_at: bankStatement.created_at,
      updated_at: bankStatement.updated_at,
    }));
  }

  /**
   * Get bank statements by status
   */
  getByStatus(status: string): BankStatementDTO[] {
    const bankStatements = this.bankStatementRepository.findByStatus(status);
    return bankStatements.map((bankStatement) => ({
      id: bankStatement.id,
      bank_account_id: bankStatement.bank_account_id,
      statement_number: bankStatement.statement_number,
      statement_date: bankStatement.statement_date,
      closing_balance: bankStatement.closing_balance,
      file_path: bankStatement.file_path,
      status: bankStatement.status,
      created_at: bankStatement.created_at,
      updated_at: bankStatement.updated_at,
    }));
  }

  /**
   * Get bank statements by date range
   */
  getByDateRange(startDate: number, endDate: number): BankStatementDTO[] {
    const bankStatements = this.bankStatementRepository.findByDateRange(
      startDate,
      endDate,
    );
    return bankStatements.map((bankStatement) => ({
      id: bankStatement.id,
      bank_account_id: bankStatement.bank_account_id,
      statement_number: bankStatement.statement_number,
      statement_date: bankStatement.statement_date,
      closing_balance: bankStatement.closing_balance,
      file_path: bankStatement.file_path,
      status: bankStatement.status,
      created_at: bankStatement.created_at,
      updated_at: bankStatement.updated_at,
    }));
  }

  /**
   * Get bank statements by date
   */
  getByDate(statement_date: number): BankStatementDTO[] {
    const bankStatements =
      this.bankStatementRepository.findByDate(statement_date);
    return bankStatements.map((bankStatement) => ({
      id: bankStatement.id,
      bank_account_id: bankStatement.bank_account_id,
      statement_number: bankStatement.statement_number,
      statement_date: bankStatement.statement_date,
      closing_balance: bankStatement.closing_balance,
      file_path: bankStatement.file_path,
      status: bankStatement.status,
      created_at: bankStatement.created_at,
      updated_at: bankStatement.updated_at,
    }));
  }

  /**
   * Update bank statement
   */
  update(
    id: string,
    data: UpdateBankStatementInput,
  ): BankStatementDTO | undefined {
    // Check if bank statement exists
    const existing = this.bankStatementRepository.findById(id);
    if (!existing) {
      return undefined;
    }

    // Check if statement number is being changed to an existing statement's number
    if (
      data.statement_number &&
      data.statement_number !== existing.statement_number
    ) {
      const numberExists = this.bankStatementRepository.findByNumber(
        data.statement_number,
      );
      if (numberExists && numberExists.id !== id) {
        throw new Error("Bank statement with this number already exists");
      }
    }

    // Validate statement date is in the future
    if (data.statement_date && data.statement_date < Date.now()) {
      throw new Error("Statement date must be in the future");
    }

    const updated = this.bankStatementRepository.update(id, data);

    if (!updated) {
      return undefined;
    }

    return {
      id: updated.id,
      bank_account_id: updated.bank_account_id,
      statement_number: updated.statement_number,
      statement_date: updated.statement_date,
      closing_balance: updated.closing_balance,
      file_path: updated.file_path,
      status: updated.status,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }

  /**
   * Delete bank statement
   */
  delete(id: string): boolean {
    return this.bankStatementRepository.delete(id);
  }

  /**
   * Get bank statement count
   */
  count(): number {
    return this.bankStatementRepository.count();
  }
}
