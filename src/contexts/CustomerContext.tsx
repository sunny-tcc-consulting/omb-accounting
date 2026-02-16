'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, CustomerFilters } from '@/types';
import { generateCustomers } from '@/lib/mock-data';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getFilteredCustomers: (filters?: CustomerFilters) => Customer[];
  getCustomerById: (id: string) => Customer | undefined;
  refreshCustomers: () => void;
}

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    setLoading(true);
    try {
      // Generate mock customers
      const newCustomers = generateCustomers(15);
      setCustomers(newCustomers);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = (customer: Customer) => {
    setCustomers((prev) => [customer, ...prev]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const getFilteredCustomers = (filters?: CustomerFilters): Customer[] => {
    let filtered = [...customers];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.company?.toLowerCase().includes(search)
      );
    }

    if (filters?.company) {
      filtered = filtered.filter((c) => c.company === filters.company);
    }

    return filtered;
  };

  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find((c) => c.id === id);
  };

  const refreshCustomers = () => {
    loadInitialData();
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getFilteredCustomers,
        getCustomerById,
        refreshCustomers,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
