"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { appCache, LocalStorageCache } from "@/lib/cache";
import {
  Transaction,
  Category,
  TransactionFilters,
  FinancialSummary,
} from "@/types";
import {
  getCategories as getMockCategories,
  calculateFinancialSummary,
  generateTransactions,
} from "@/lib/mock-data";

interface DataContextType {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getFilteredTransactions: (filters?: TransactionFilters) => Transaction[];
  getTransactionsByCategory: (
    category: string,
    type: "income" | "expense",
  ) => Transaction[];
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getFinancialSummary: (days?: number) => FinancialSummary;
  getCategories: (type?: "income" | "expense") => Category[];
  refreshTransactions: () => void;
  clearCache: () => void;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined,
);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInitialData = useCallback(() => {
    setLoading(true);
    try {
      // Try to load from cache first
      const cachedTransactions =
        LocalStorageCache.get<Transaction[]>("transactions");
      const cachedCategories = LocalStorageCache.get<Category[]>("categories");

      if (cachedTransactions && cachedCategories) {
        setTransactions(cachedTransactions);
        setCategories(cachedCategories);
      } else {
        // Generate mock transactions
        const newTransactions = generateTransactions(100);
        setTransactions(newTransactions);

        // Load categories
        const newCategories = getMockCategories();
        setCategories(newCategories);

        // Cache the data for 30 minutes
        LocalStorageCache.set("transactions", newTransactions, 1800000);
        LocalStorageCache.set("categories", newCategories, 1800000);
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getFilteredTransactions = (
    filters?: TransactionFilters,
  ): Transaction[] => {
    let filtered = [...transactions];

    if (filters?.type && filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters?.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (filters?.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(search) ||
          t.category.toLowerCase().includes(search) ||
          (t.reference && t.reference.toLowerCase().includes(search)),
      );
    }

    if (filters?.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    return filtered;
  };

  const getTransactionsByCategory = (
    category: string,
    type: "income" | "expense",
  ): Transaction[] => {
    return transactions.filter(
      (t) => t.category === category && t.type === type,
    );
  };

  const getTransactionsByDateRange = (
    startDate: Date,
    endDate: Date,
  ): Transaction[] => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  };

  const getFinancialSummary = (days: number = 30): FinancialSummary => {
    return calculateFinancialSummary(transactions, days);
  };

  const getCategories = (type?: "income" | "expense"): Category[] => {
    if (type) {
      return getMockCategories(type);
    }
    return categories;
  };

  const refreshTransactions = useCallback(() => {
    setLoading(true);
    try {
      // Generate new mock transactions
      const newTransactions = generateTransactions(100);
      setTransactions(newTransactions);

      // Load categories
      const newCategories = getMockCategories();
      setCategories(newCategories);

      // Cache the data for 30 minutes
      LocalStorageCache.set("transactions", newTransactions, 1800000);
      LocalStorageCache.set("categories", newCategories, 1800000);
    } catch (error) {
      console.error("Failed to refresh transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    appCache.clear();
    LocalStorageCache.clear();
    // Reload fresh data
    loadInitialData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        transactions,
        categories,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getFilteredTransactions,
        getTransactionsByCategory,
        getTransactionsByDateRange,
        getFinancialSummary,
        getCategories,
        refreshTransactions,
        clearCache,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
