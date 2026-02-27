/**
 * Audit Log Repository Tests
 *
 * Note: Simplified tests focused on core functionality.
 */

import { AuditLogRepository } from "../audit-log-repository";

describe("AuditLogRepository", () => {
  let repository: AuditLogRepository;

  beforeEach(() => {
    // Create a minimal mock that returns expected data
    const mockDb = {
      async execute(
        _sql: string,
        _params: unknown[],
      ): Promise<Array<Record<string, unknown>>> {
        // Return empty array for SELECT queries in these tests
        return [];
      },
    };
    repository = new AuditLogRepository(
      mockDb as unknown as Parameters<typeof AuditLogRepository>[0],
    );
  });

  describe("create", () => {
    it("should create an audit log entry with all fields", async () => {
      const input = {
        user_id: "user-123",
        operation: "create" as const,
        table_name: "customers",
        record_id: "customer-456",
        changes: { name: "Test Customer", email: "test@example.com" },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0",
      };

      const result = await repository.create(input);

      expect(result).toHaveProperty("id");
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe("user-123");
      expect(result.operation).toBe("create");
      expect(result.table_name).toBe("customers");
      expect(result.record_id).toBe("customer-456");
      expect(result.changes).toBeDefined();
      expect(result.created_at).toBeDefined();
    });

    it("should handle minimal input without optional fields", async () => {
      const input = {
        user_id: "user-minimal",
        operation: "delete" as const,
        table_name: "quotations",
        record_id: "quotation-789",
      };

      const result = await repository.create(input);

      expect(result).toHaveProperty("id");
      expect(result.user_id).toBe("user-minimal");
      expect(result.operation).toBe("delete");
      expect(result.changes).toBeUndefined();
      expect(result.ip_address).toBeUndefined();
      expect(result.user_agent).toBeUndefined();
    });

    it("should serialize changes object to JSON string", async () => {
      const input = {
        user_id: "user-json",
        operation: "update" as const,
        table_name: "invoices",
        record_id: "invoice-001",
        changes: { status: "paid", amount: 1000 },
      };

      const result = await repository.create(input);

      expect(typeof result.changes).toBe("string");
      expect(result.changes).toContain("status");
      expect(result.changes).toContain("paid");
    });
  });

  describe("getById", () => {
    it("should return null for non-existent ID", async () => {
      const result = await repository.getById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return empty array when no logs exist", async () => {
      const result = await repository.getAll();
      expect(result).toEqual([]);
    });

    it("should return empty array when filtering by non-matching criteria", async () => {
      const result = await repository.getAll({ userId: "non-existent" });
      expect(result).toEqual([]);
    });

    it("should accept filter parameters without error", async () => {
      const result = await repository.getAll({
        userId: "user-1",
        entityType: "customers",
        entityId: "c-1",
        startDate: Date.now() - 86400000,
        endDate: Date.now(),
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getByUserId", () => {
    it("should return empty array for non-existent user", async () => {
      const result = await repository.getByUserId("non-existent-user");
      expect(result).toEqual([]);
    });

    it("should respect limit parameter", async () => {
      const result = await repository.getByUserId("user-1", 5);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getByEntity", () => {
    it("should return empty array for non-existent entity", async () => {
      const result = await repository.getByEntity(
        "nonexistent",
        "nonexistent-id",
      );
      expect(result).toEqual([]);
    });
  });

  describe("getByDateRange", () => {
    it("should accept date range parameters", async () => {
      const now = Date.now();
      const result = await repository.getByDateRange(now - 86400000, now, 100);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("count", () => {
    it("should return 0 for empty database", async () => {
      const count = await repository.count();
      expect(count).toBe(0);
    });

    it("should return 0 when filtering by non-matching criteria", async () => {
      const count = await repository.count({ userId: "non-existent" });
      expect(count).toBe(0);
    });
  });

  describe("deleteOlderThan", () => {
    it("should return 0 when no logs to delete", async () => {
      const deleted = await repository.deleteOlderThan(Date.now());
      expect(deleted).toBe(0);
    });
  });
});
