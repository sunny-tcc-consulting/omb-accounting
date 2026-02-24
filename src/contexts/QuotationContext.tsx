'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quotation, QuotationFilters, Invoice, QuotationItem } from '@/types';
import { generateQuotations } from '@/lib/mock-data';
import { convertQuotationToInvoice, validateQuotationForConversion } from '@/lib/quotation-utils';

interface QuotationContextType {
  quotations: Quotation[];
  loading: boolean;
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  getFilteredQuotations: (filters?: QuotationFilters) => Quotation[];
  getFilteredCustomers: () => any[];
  getQuotationById: (id: string) => Quotation | undefined;
  generateQuotationNumber: () => string;
  convertToInvoice: (quotationId: string) => Invoice | undefined;
  refreshQuotations: () => void;
}

export const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export function QuotationProvider({ children }: { children: React.ReactNode }) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load initial data only once
  useEffect(() => {
    if (!initialized) {
      loadInitialData();
      setInitialized(true);
    }
  }, [initialized]);

  const loadInitialData = () => {
    setLoading(true);
    try {
      // Load from localStorage first
      const savedQuotations = typeof window !== 'undefined'
        ? localStorage.getItem('quotations')
        : null;

      if (savedQuotations) {
        const parsed = JSON.parse(savedQuotations);
        setQuotations(parsed.map((q: any) => ({
          ...q,
          issuedDate: new Date(q.issuedDate),
          validityPeriod: new Date(q.validityPeriod),
          createdAt: new Date(q.createdAt),
          updatedAt: new Date(q.updatedAt),
        })));
      } else {
        // Generate mock quotations if none exist
        const newQuotations = generateQuotations(10);
        setQuotations(newQuotations);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('quotations', JSON.stringify(newQuotations));
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Fallback to mock data on error
      const newQuotations = generateQuotations(10);
      setQuotations(newQuotations);
    } finally {
      setLoading(false);
    }
  };

  const addQuotation = (quotation: Quotation) => {
    const updatedQuotations = [quotation, ...quotations];
    setQuotations(updatedQuotations);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('quotations', JSON.stringify(updatedQuotations));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    const updatedQuotations = quotations.map((q) =>
      q.id === id ? { ...q, ...updates, updatedAt: new Date() } : q
    );
    setQuotations(updatedQuotations);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('quotations', JSON.stringify(updatedQuotations));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  };

  const deleteQuotation = (id: string) => {
    const updatedQuotations = quotations.filter((q) => q.id !== id);
    setQuotations(updatedQuotations);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('quotations', JSON.stringify(updatedQuotations));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  };

  const getFilteredQuotations = (filters?: QuotationFilters): Quotation[] => {
    let filtered = [...quotations];

    if (filters?.status) {
      filtered = filtered.filter((q) => q.status === filters.status);
    }

    if (filters?.customerId) {
      filtered = filtered.filter((q) => q.customerId === filters.customerId);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.customerName.toLowerCase().includes(search) ||
          q.quotationNumber.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const getQuotationById = (id: string): Quotation | undefined => {
    return quotations.find((q) => q.id === id);
  };

  const generateQuotationNumber = (): string => {
    // Get the year for the quotation number
    const year = new Date().getFullYear();

    // Find the highest existing number for this year
    let maxNumber = 0;
    quotations.forEach((q) => {
      // Format: QT-2025-00001
      const parts = q.quotationNumber.split('-');
      if (parts.length === 3 && parseInt(parts[1]) === year) {
        const num = parseInt(parts[2]);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const newNumber = maxNumber + 1;
    return `QT-${year}-${String(newNumber).padStart(5, '0')}`;
  };

  const convertToInvoice = (quotationId: string): Invoice | undefined => {
    const quotation = quotations.find((q) => q.id === quotationId);

    if (!quotation) {
      console.error('Quotation not found:', quotationId);
      return undefined;
    }

    // Validate quotation before conversion
    if (!validateQuotationForConversion(quotation)) {
      console.error('Invalid quotation for conversion');
      return undefined;
    }

    // Convert quotation to invoice
    const invoice = convertQuotationToInvoice(quotation);

    console.log('Converted quotation to invoice:', invoice);
    return invoice;
  };

  const getFilteredCustomers = () => {
    // Get all customers for dropdown selection
    // This function will be implemented when CustomerContext is integrated
    return [];
  };

  const refreshQuotations = () => {
    loadInitialData();
  };

  return (
    <QuotationContext.Provider
      value={{
        quotations,
        loading,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        getFilteredQuotations,
        getFilteredCustomers,
        getQuotationById,
        generateQuotationNumber,
        convertToInvoice,
        refreshQuotations,
      }}
    >
      {children}
    </QuotationContext.Provider>
  );
}

export function useQuotations() {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotations must be used within a QuotationProvider');
  }
  return context;
}
