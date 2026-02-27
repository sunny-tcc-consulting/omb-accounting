/**
 * Audit Log Service Tests
 */

import { AuditLogService } from "../audit-log-service";

// Mock AuditLogRepository
interface MockLog {
  id: string;
  user_id: string;
  operation: string;
  table_name: string;
  record_id: string;
  created_at: number;
  [key: string]: unknown;
}

class MockAuditLogRepository {
  private logs: MockLog[] = [];

  async create(input: Record<string, unknown>): Promise<MockLog> {
    const log: MockLog = {
      id: crypto.randomUUID(),
      ...input,
      created_at: Date.now(),
    } as MockLog;
    this.logs.push(log);
    return log;
  }

  async getById(id: string): Promise<MockLog | null> {
    return this.logs.find((l) => l.id === id) || null;
  }

  async getAll(filters?: Record<string, unknown>): Promise<MockLog[]> {
    let filtered = [...this.logs];

    if (filters?.userId) {
      filtered = filtered.filter((l) => l.user_id === filters.userId);
    }
    if (filters?.entityType) {
      filtered = filtered.filter((l) => l.table_name === filters.entityType);
    }
    if (filters?.entityId) {
      filtered = filtered.filter((l) => l.record_id === filters.entityId);
    }
    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit as number);
    }
    if (filters?.offset) {
      filtered = filtered.slice(filters.offset as number);
    }

    return filtered.reverse();
  }

  async getByUserId(userId: string, limit?: number): Promise<MockLog[]> {
    return this.getAll({ userId, limit });
  }

  async getByEntity(tableName: string, recordId: string): Promise<MockLog[]> {
    return this.getAll({ entityType: tableName, entityId: recordId });
  }

  async getByDateRange(
    startDate: number,
    endDate: number,
    limit?: number,
  ): Promise<MockLog[]> {
    return this.logs
      .filter((l) => l.created_at >= startDate && l.created_at <= endDate)
      .slice(0, limit)
      .reverse();
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    let filtered = [...this.logs];
    if (filters?.userId) {
      filtered = filtered.filter((l) => l.user_id === filters.userId);
    }
    if (filters?.entityType) {
      filtered = filtered.filter((l) => l.table_name === filters.entityType);
    }
    return filtered.length;
  }

  async deleteOlderThan(timestamp: number): Promise<number> {
    const before = this.logs.length;
    this.logs = this.logs.filter((l) => l.created_at >= timestamp);
    return before - this.logs.length;
  }
}

describe("AuditLogService", () => {
  let service: AuditLogService;
  let mockRepository: MockAuditLogRepository;

  beforeEach(() => {
    mockRepository = new MockAuditLogRepository();
    service = new AuditLogService(
      mockRepository as unknown as Parameters<typeof AuditLogService>[0],
    );
  });

  describe("log", () => {
    it("should create an audit log", async () => {
      const result = await service.log({
        userId: "user-1",
        operation: "create",
        entityType: "customers",
        entityId: "customer-1",
        changes: { name: "Test" },
        ipAddress: "127.0.0.1",
        userAgent: "Test Agent",
      });

      expect(result).toHaveProperty("id");
      expect(result.user_id).toBe("user-1");
      expect(result.operation).toBe("create");
      expect(result.table_name).toBe("customers");
    });
  });

  describe("logCustomerOperation", () => {
    it("should log customer operation", async () => {
      const result = await service.logCustomerOperation(
        "user-1",
        "create",
        "customer-123",
        { name: "New Customer" },
      );

      expect(result.table_name).toBe("customers");
      expect(result.record_id).toBe("customer-123");
    });
  });

  describe("logQuotationOperation", () => {
    it("should log quotation operation", async () => {
      const result = await service.logQuotationOperation(
        "user-1",
        "update",
        "quotation-456",
        { status: "sent" },
      );

      expect(result.table_name).toBe("quotations");
      expect(result.record_id).toBe("quotation-456");
    });
  });

  describe("logInvoiceOperation", () => {
    it("should log invoice operation", async () => {
      const result = await service.logInvoiceOperation(
        "user-1",
        "delete",
        "invoice-789",
        { status: "cancelled" },
      );

      expect(result.table_name).toBe("invoices");
      expect(result.record_id).toBe("invoice-789");
    });
  });

  describe("getAuditLogs", () => {
    it("should return paginated audit logs", async () => {
      await service.log({
        userId: "user-1",
        operation: "create",
        entityType: "customers",
        entityId: "c-1",
      });
      await service.log({
        userId: "user-2",
        operation: "update",
        entityType: "invoices",
        entityId: "i-1",
      });

      const result = await service.getAuditLogs({ limit: 1, offset: 0 });

      expect(result.data.length).toBe(1);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(1);
      expect(result.offset).toBe(0);
    });

    it("should filter by entityType", async () => {
      await service.log({
        userId: "user-1",
        operation: "create",
        entityType: "customers",
        entityId: "c-1",
      });
      await service.log({
        userId: "user-1",
        operation: "create",
        entityType: "invoices",
        entityId: "i-1",
      });

      const result = await service.getAuditLogs({ entityType: "invoices" });

      expect(result.data.length).toBe(1);
      expect(result.data[0].table_name).toBe("invoices");
    });
  });

  describe("getByUser", () => {
    it("should return logs for specific user", async () => {
      await service.log({
        userId: "user-search-1",
        operation: "create",
        entityType: "customers",
        entityId: "c-1",
      });
      await service.log({
        userId: "user-search-2",
        operation: "create",
        entityType: "customers",
        entityId: "c-2",
      });

      const result = await service.getByUser("user-search-1");

      expect(result.length).toBe(1);
      expect(result[0].user_id).toBe("user-search-1");
    });
  });

  describe("getAuditTrail", () => {
    it("should return audit trail for an entity", async () => {
      await service.log({
        userId: "user-1",
        operation: "create",
        entityType: "customers",
        entityId: "trail-customer",
      });
      await service.log({
        userId: "user-2",
        operation: "update",
        entityType: "customers",
        entityId: "trail-customer",
      });
      await service.log({
        userId: "user-1",
        operation: "delete",
        entityType: "other-entity",
        entityId: "other-id",
      });

      const result = await service.getAuditTrail("customers", "trail-customer");

      expect(result.length).toBe(2);
      expect(result.every((l) => l.table_name === "customers")).toBe(true);
    });
  });

  describe("cleanupOldLogs", () => {
    it("should delete logs older than specified time", async () => {
      // Create a log
      await service.log({
        userId: "user-1",
        operation: "create",
        entityType: "test",
        entityId: "test-1",
      });

      // Delete logs older than now (should not delete recent logs)
      const deleted = await service.cleanupOldLogs(0);
      expect(deleted).toBe(0);
    });
  });
});
