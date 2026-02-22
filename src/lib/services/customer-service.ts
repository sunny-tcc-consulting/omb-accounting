/**
 * Customer Service
 *
 * Business logic layer for Customer entity.
 */

import { CustomerRepository } from "@/lib/repositories/customer-repository";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/lib/repositories/customer-repository";
import { v4 as uuidv4 } from "uuid";

export interface CustomerDTO {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: number;
  updated_at: number;
}

export class CustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  /**
   * Create a new customer
   */
  create(data: CreateCustomerInput): CustomerDTO {
    // Check if email already exists
    if (data.email) {
      const existing = this.customerRepository.findByEmail(data.email);
      if (existing) {
        throw new Error("Customer with this email already exists");
      }
    }

    const customer = this.customerRepository.create(data);

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };
  }

  /**
   * Get customer by ID
   */
  getById(id: string): CustomerDTO | undefined {
    const customer = this.customerRepository.findById(id);
    if (!customer) {
      return undefined;
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };
  }

  /**
   * Get all customers
   */
  getAll(): CustomerDTO[] {
    const customers = this.customerRepository.findAll();
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    }));
  }

  /**
   * Search customers by name
   */
  searchByName(name: string): CustomerDTO[] {
    const customers = this.customerRepository.searchByName(name);
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    }));
  }

  /**
   * Search customers by email
   */
  searchByEmail(email: string): CustomerDTO[] {
    const customers = this.customerRepository.searchByEmail(email);
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    }));
  }

  /**
   * Search customers by phone
   */
  searchByPhone(phone: string): CustomerDTO[] {
    const customers = this.customerRepository.searchByPhone(phone);
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    }));
  }

  /**
   * Update customer
   */
  update(id: string, data: UpdateCustomerInput): CustomerDTO | undefined {
    // Check if customer exists
    const existing = this.customerRepository.findById(id);
    if (!existing) {
      return undefined;
    }

    // Check if email is being changed to an existing customer's email
    if (data.email && data.email !== existing.email) {
      const emailExists = this.customerRepository.findByEmail(data.email);
      if (emailExists && emailExists.id !== id) {
        throw new Error("Customer with this email already exists");
      }
    }

    const updated = this.customerRepository.update(id, data);

    if (!updated) {
      return undefined;
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }

  /**
   * Delete customer
   */
  delete(id: string): boolean {
    return this.customerRepository.delete(id);
  }

  /**
   * Get customer count
   */
  count(): number {
    return this.customerRepository.count();
  }
}
