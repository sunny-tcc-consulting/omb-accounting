/**
 * Quotation Service
 *
 * Business logic layer for Quotation entity.
 */

import { QuotationRepository } from "@/lib/repositories/quotation-repository";
import {
  CreateQuotationInput,
  UpdateQuotationInput,
} from "@/lib/repositories/quotation-repository";
import { v4 as uuidv4 } from "uuid";

export interface QuotationDTO {
  id: string;
  customer_id: string;
  quotation_number: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  total_amount: number;
  created_at: number;
  updated_at: number;
}

export class QuotationService {
  constructor(private quotationRepository: QuotationRepository) {}

  /**
   * Create a new quotation
   */
  create(data: CreateQuotationInput): QuotationDTO {
    // Check if quotation number already exists
    const existing = this.quotationRepository.findByNumber(
      data.quotation_number,
    );
    if (existing) {
      throw new Error("Quotation with this number already exists");
    }

    const quotation = this.quotationRepository.create(data);

    return {
      id: quotation.id,
      customer_id: quotation.customer_id,
      quotation_number: quotation.quotation_number,
      status: quotation.status,
      total_amount: quotation.total_amount,
      created_at: quotation.created_at,
      updated_at: quotation.updated_at,
    };
  }

  /**
   * Get quotation by ID
   */
  getById(id: string): QuotationDTO | undefined {
    const quotation = this.quotationRepository.findById(id);
    if (!quotation) {
      return undefined;
    }

    return {
      id: quotation.id,
      customer_id: quotation.customer_id,
      quotation_number: quotation.quotation_number,
      status: quotation.status,
      total_amount: quotation.total_amount,
      created_at: quotation.created_at,
      updated_at: quotation.updated_at,
    };
  }

  /**
   * Get all quotations
   */
  getAll(): QuotationDTO[] {
    const quotations = this.quotationRepository.findAll();
    return quotations.map((quotation) => ({
      id: quotation.id,
      customer_id: quotation.customer_id,
      quotation_number: quotation.quotation_number,
      status: quotation.status,
      total_amount: quotation.total_amount,
      created_at: quotation.created_at,
      updated_at: quotation.updated_at,
    }));
  }

  /**
   * Get quotations by customer
   */
  getByCustomer(customer_id: string): QuotationDTO[] {
    const quotations = this.quotationRepository.findByCustomer(customer_id);
    return quotations.map((quotation) => ({
      id: quotation.id,
      customer_id: quotation.customer_id,
      quotation_number: quotation.quotation_number,
      status: quotation.status,
      total_amount: quotation.total_amount,
      created_at: quotation.created_at,
      updated_at: quotation.updated_at,
    }));
  }

  /**
   * Get quotations by status
   */
  getByStatus(status: string): QuotationDTO[] {
    const quotations = this.quotationRepository.findByStatus(status);
    return quotations.map((quotation) => ({
      id: quotation.id,
      customer_id: quotation.customer_id,
      quotation_number: quotation.quotation_number,
      status: quotation.status,
      total_amount: quotation.total_amount,
      created_at: quotation.created_at,
      updated_at: quotation.updated_at,
    }));
  }

  /**
   * Update quotation
   */
  update(id: string, data: UpdateQuotationInput): QuotationDTO | undefined {
    // Check if quotation exists
    const existing = this.quotationRepository.findById(id);
    if (!existing) {
      return undefined;
    }

    // Check if quotation number is being changed to an existing quotation's number
    if (
      data.quotation_number &&
      data.quotation_number !== existing.quotation_number
    ) {
      const numberExists = this.quotationRepository.findByNumber(
        data.quotation_number,
      );
      if (numberExists && numberExists.id !== id) {
        throw new Error("Quotation with this number already exists");
      }
    }

    const updated = this.quotationRepository.update(id, data);

    if (!updated) {
      return undefined;
    }

    return {
      id: updated.id,
      customer_id: updated.customer_id,
      quotation_number: updated.quotation_number,
      status: updated.status,
      total_amount: updated.total_amount,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }

  /**
   * Delete quotation
   */
  delete(id: string): boolean {
    return this.quotationRepository.delete(id);
  }

  /**
   * Get quotation count
   */
  count(): number {
    return this.quotationRepository.count();
  }
}
