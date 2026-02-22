/**
 * Bank Account Service
 *
 * Business logic layer for BankAccount entity.
 */

import { BankAccountRepository } from "@/lib/repositories/bank-account-repository";
import {
  CreateBankAccountInput,
  UpdateBankAccountInput,
} from "@/lib/repositories/bank-account-repository";
import { v4 as uuidv4 } from "uuid";

export interface BankAccountDTO {
  id: string;
  name: string;
  account_number: string;
  bank_name?: string;
  balance: number;
  currency: string;
  created_at: number;
  updated_at: number;
}

export class BankAccountService {
  constructor(private bankAccountRepository: BankAccountRepository) {}

  /**
   * Create a new bank account
   */
  create(data: CreateBankAccountInput): BankAccountDTO {
    // Check if account number already exists
    const existing = this.bankAccountRepository.findByAccountNumber(
      data.account_number,
    );
    if (existing) {
      throw new Error("Bank account with this number already exists");
    }

    const bankAccount = this.bankAccountRepository.create(data);

    return {
      id: bankAccount.id,
      name: bankAccount.name,
      account_number: bankAccount.account_number,
      bank_name: bankAccount.bank_name,
      balance: bankAccount.balance,
      currency: bankAccount.currency,
      created_at: bankAccount.created_at,
      updated_at: bankAccount.updated_at,
    };
  }

  /**
   * Get bank account by ID
   */
  getById(id: string): BankAccountDTO | undefined {
    const bankAccount = this.bankAccountRepository.findById(id);
    if (!bankAccount) {
      return undefined;
    }

    return {
      id: bankAccount.id,
      name: bankAccount.name,
      account_number: bankAccount.account_number,
      bank_name: bankAccount.bank_name,
      balance: bankAccount.balance,
      currency: bankAccount.currency,
      created_at: bankAccount.created_at,
      updated_at: bankAccount.updated_at,
    };
  }

  /**
   * Get all bank accounts
   */
  getAll(): BankAccountDTO[] {
    const bankAccounts = this.bankAccountRepository.findAll();
    return bankAccounts.map((bankAccount) => ({
      id: bankAccount.id,
      name: bankAccount.name,
      account_number: bankAccount.account_number,
      bank_name: bankAccount.bank_name,
      balance: bankAccount.balance,
      currency: bankAccount.currency,
      created_at: bankAccount.created_at,
      updated_at: bankAccount.updated_at,
    }));
  }

  /**
   * Get bank account by name
   */
  getByName(name: string): BankAccountDTO[] {
    const bankAccounts = this.bankAccountRepository.findByName(name);
    return bankAccounts.map((bankAccount) => ({
      id: bankAccount.id,
      name: bankAccount.name,
      account_number: bankAccount.account_number,
      bank_name: bankAccount.bank_name,
      balance: bankAccount.balance,
      currency: bankAccount.currency,
      created_at: bankAccount.created_at,
      updated_at: bankAccount.updated_at,
    }));
  }

  /**
   * Get primary bank account
   */
  getPrimary(): BankAccountDTO | undefined {
    const primary = this.bankAccountRepository.getPrimary();
    if (!primary) return undefined;

    return {
      id: primary.id,
      name: primary.name,
      account_number: primary.account_number,
      bank_name: primary.bank_name,
      balance: primary.balance,
      currency: primary.currency,
      created_at: primary.created_at,
      updated_at: primary.updated_at,
    };
  }

  /**
   * Update bank account
   */
  update(id: string, data: UpdateBankAccountInput): BankAccountDTO | undefined {
    // Check if bank account exists
    const existing = this.bankAccountRepository.findById(id);
    if (!existing) {
      return undefined;
    }

    // Check if account number is being changed to an existing account's number
    if (
      data.account_number &&
      data.account_number !== existing.account_number
    ) {
      const numberExists = this.bankAccountRepository.findByAccountNumber(
        data.account_number,
      );
      if (numberExists && numberExists.id !== id) {
        throw new Error("Bank account with this number already exists");
      }
    }

    const updated = this.bankAccountRepository.update(id, data);

    if (!updated) {
      return undefined;
    }

    return {
      id: updated.id,
      name: updated.name,
      account_number: updated.account_number,
      bank_name: updated.bank_name,
      balance: updated.balance,
      currency: updated.currency,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }

  /**
   * Delete bank account
   */
  delete(id: string): boolean {
    return this.bankAccountRepository.delete(id);
  }

  /**
   * Get bank account count
   */
  count(): number {
    return this.bankAccountRepository.count();
  }
}
