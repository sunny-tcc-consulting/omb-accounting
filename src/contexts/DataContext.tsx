'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, TransactionFilters, FinancialSummary } from '@/types';
import {
  getCategories,
  getFilteredTransactions,
  calculateFinancialSummary,
  generateTransactions,
} from '@/lib/mock-data';

interface DataContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getFilteredTransactions: (filters?: TransactionFilters) => Transaction[];
  getTransactionsByCategory: (category: string, type: 'income' | 'expense') => Transaction[];
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getFinancialSummary: (days?: number) => FinancialSummary;
  getCategories: (type?: 'income' | 'expense') => Category[];
  refreshTransactions: () => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    setLoading(true);
    try {
      // Generate mock transactions
      const newTransactions = generateTransactions(100);
      setTransactions(newTransactions);

      // Load categories
      const newCategories = getCategories();
      setCategories(newCategories);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getFilteredTransactions = (filters?: TransactionFilters): Transaction[] => {
    let filtered = [...transactions];

    if (filters?.type && filters.type !== 'all') {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters?.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (filters?.dateRange) {
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return date >= filters.dateRange.start && date <= filters.dateRange.end;
      });
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(search) ||
          t.category.toLowerCase().includes(search) ||
          (t.reference && t.reference.toLowerCase().includes(search))
      );
    }

    if (filters?.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    return filtered;
  };

  const getTransactionsByCategory = (
    category: string,
    type: 'income' | 'expense'
  ): Transaction[] => {
    return transactions.filter((t) => t.category === category && t.type === type);
  };

  const getTransactionsByDateRange = (
    startDate: Date,
    endDate: Date
  ): Transaction[] => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  };

  const getFinancialSummary = (days: number = 30): FinancialSummary => {
    return calculateFinancialSummary(transactions, days);
  };

  const getCategories = (type?: 'income' | 'expense'): Category[] => {
    if (type) {
      return getCategories(type);
    }
    return categories;
  };

  const refreshTransactions = () => {
    loadInitialData();
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        categories,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getFilteredTransactions,
        getTransactionsByCategory,
        getTransactionsByDateRange,
        getFinancialSummary,
        getCategories,
        refreshTransactions,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
