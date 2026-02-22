/**
 * Customer Types
 *
 * TypeScript type definitions for customer-related entities.
 */

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: number;
  updated_at: number;
}

export interface CustomerDTO {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: number;
  updated_at: number;
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
