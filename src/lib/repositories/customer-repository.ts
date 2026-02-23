/**
 * Customer Repository
 *
 * Data access layer for Customer entity.
 */

import { SQLiteDatabase } from "../database/sqlite";
import { Customer } from "@/lib/types/database";
import { v4 as uuidv4 } from "uuid";

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

export class CustomerRepository {
  constructor(private db: SQLiteDatabase) {}

  /**
   * Create a new customer
   */
  create(data: CreateCustomerInput): Customer {
    const now = Date.now();
    const customer: Customer = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      created_at: now,
      updated_at: now,
    };

    this.db.run(
      "INSERT INTO customers (id, name, email, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        customer.id,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.created_at,
        customer.updated_at,
      ],
    );

    return customer;
  }

  /**
   * Get customer by ID
   */
  findById(id: string): Customer | undefined {
    return this.db.get<Customer>("SELECT * FROM customers WHERE id = ?", [id]);
  }

  /**
   * Get customer by email
   */
  findByEmail(email: string): Customer | undefined {
    return this.db.get<Customer>("SELECT * FROM customers WHERE email = ?", [
      email,
    ]);
  }

  /**
   * Get all customers
   */
  findAll(): Customer[] {
    return this.db.query<Customer>(
      "SELECT * FROM customers ORDER BY created_at DESC",
    );
  }

  /**
   * Get customers by name (search)
   */
  searchByName(name: string): Customer[] {
    return this.db.query<Customer>(
      "SELECT * FROM customers WHERE name LIKE ? ORDER BY created_at DESC",
      [`%${name}%`],
    );
  }

  /**
   * Get customers by email (search)
   */
  searchByEmail(email: string): Customer[] {
    return this.db.query<Customer>(
      "SELECT * FROM customers WHERE email LIKE ? ORDER BY created_at DESC",
      [`%${email}%`],
    );
  }

  /**
   * Get customers by phone (search)
   */
  searchByPhone(phone: string): Customer[] {
    return this.db.query<Customer>(
      "SELECT * FROM customers WHERE phone LIKE ? ORDER BY created_at DESC",
      [`%${phone}%`],
    );
  }

  /**
   * Update customer
   */
  update(id: string, data: UpdateCustomerInput): Customer | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push("email = ?");
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      updates.push("phone = ?");
      values.push(data.phone);
    }
    if (data.address !== undefined) {
      updates.push("address = ?");
      values.push(data.address);
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = ?");
    values.push(Date.now());
    values.push(id);

    this.db.run(
      `UPDATE customers SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }

  /**
   * Delete customer
   */
  delete(id: string): boolean {
    const result = this.db.run("DELETE FROM customers WHERE id = ?", [id]);
    return result.changes > 0;
  }

  /**
   * Check if customer exists
   */
  exists(id: string): boolean {
    const result = this.db.get<Record<string, unknown>>(
      "SELECT 1 FROM customers WHERE id = ?",
      [id],
    );
    return !!result;
  }

  /**
   * Get customer count
   */
  count(): number {
    const result = this.db.get<Record<string, unknown>>(
      "SELECT COUNT(*) as count FROM customers",
    );
    return (result as Record<string, unknown>).count as number;
  }
}
