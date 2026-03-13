/**
 * Bank Accounts API Integration Tests
 * Tests bank account CRUD operations from empty database
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Bank Accounts API - Empty Database', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@omb.com',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  describe('GET /api/bank/accounts', () => {
    it('should return empty list from empty database', async () => {
      const response = await fetch(`${BASE_URL}/api/bank/accounts`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.count).toBe(0);
    });
  });

  describe('POST /api/bank/accounts', () => {
    const testAccount = {
      name: 'Test Business Account',
      account_number: 'TEST001',
      bank_name: 'Test Bank',
      balance: 10000,
      currency: 'HKD',
    };

    it('should create new bank account', async () => {
      const response = await fetch(`${BASE_URL}/api/bank/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(testAccount),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.name).toBe(testAccount.name);
      expect(data.data.account_number).toBe(testAccount.account_number);
      expect(data.data.balance).toBe(testAccount.balance);
    });

    it('should reject duplicate account number', async () => {
      // Create first account
      await fetch(`${BASE_URL}/api/bank/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(testAccount),
      });

      // Try to create duplicate
      const response = await fetch(`${BASE_URL}/api/bank/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(testAccount),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('already exists');
    });

    it('should reject invalid account data', async () => {
      const invalidAccount = {
        name: '', // Empty name
        account_number: '', // Empty account number
      };

      const response = await fetch(`${BASE_URL}/api/bank/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(invalidAccount),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('GET /api/bank/accounts/:id', () => {
    let createdAccountId: string;

    beforeAll(async () => {
      const response = await fetch(`${BASE_URL}/api/bank/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: 'Test Account',
          account_number: 'TEST002',
          bank_name: 'Test Bank',
          balance: 5000,
          currency: 'HKD',
        }),
      });

      const data = await response.json();
      createdAccountId = data.data.id;
    });

    it('should get bank account by id', async () => {
      const response = await fetch(`${BASE_URL}/api/bank/accounts/${createdAccountId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(createdAccountId);
    });

    it('should return 404 for non-existent account', async () => {
      const response = await fetch(`${BASE_URL}/api/bank/accounts/non-existent-id`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/bank/accounts/:id', () => {
    let createdAccountId: string;

    beforeAll(async () => {
      const response = await fetch(`${BASE_URL}/api/bank/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: 'Original Name',
          account_number: 'TEST003',
          bank_name: 'Original Bank',
          balance: 1000,
          currency: 'HKD',
        }),
      });

      const data = await response.json();
      createdAccountId = data.data.id;
    });

    it('should update bank account', async () => {
      const updateData = {
        name: 'Updated Name',
        balance: 2000,
      };

      const response = await fetch(`${BASE_URL}/api/bank/accounts/${createdAccountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(updateData.name);
      expect(data.data.balance).toBe(updateData.balance);
    });
  });

  describe('DELETE /api/bank/accounts/:id', () => {
    let createdAccountId: string;

    beforeAll(async () => {
      const response = await fetch(`${BASE_URL}/api/bank/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: 'To Delete',
          account_number: 'TEST004',
          bank_name: 'Test Bank',
          balance: 0,
          currency: 'HKD',
        }),
      });

      const data = await response.json();
      createdAccountId = data.data.id;
    });

    it('should delete bank account', async () => {
      const response = await fetch(`${BASE_URL}/api/bank/accounts/${createdAccountId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should not show deleted account', async () => {
      const response = await fetch(`${BASE_URL}/api/bank/accounts`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      const data = await response.json();
      const deletedAccount = data.data.find((acc: any) => acc.id === createdAccountId);
      expect(deletedAccount).toBeUndefined();
    });
  });
});
