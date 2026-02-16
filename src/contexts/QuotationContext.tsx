'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quotation, QuotationFilters, Invoice } from '@/types';
import { generateQuotations } from '@/lib/mock-data';
import { convertQuotationToInvoice, validateQuotationForConversion } from '@/lib/quotation-utils';

interface QuotationContextType {
  quotations: Quotation[];
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  getFilteredQuotations: (filters?: QuotationFilters) => Quotation[];
  getQuotationById: (id: string) => Quotation | undefined;
  generateQuotationNumber: () => string;
  convertToInvoice: (quotationId: string) => Invoice | undefined;
  refreshQuotations: () => void;
}

export const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

export function QuotationProvider({ children }: { children: React.ReactNode }) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    setLoading(true);
    try {
      // Generate mock quotations
      const newQuotations = generateQuotations(20);
      setQuotations(newQuotations);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuotation = (quotation: Quotation) => {
    setQuotations((prev) => [quotation, ...prev]);
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
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
    const lastNumber = quotations.length > 0
      ? parseInt(quotations[0].quotationNumber.split('-')[1])
      : 0;
    const newNumber = lastNumber + 1;
    return `QT-${String(newNumber).padStart(6, '0')}`;
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

  const refreshQuotations = () => {
    loadInitialData();
  };

  return (
    <QuotationContext.Provider
      value={{
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        getFilteredQuotations,
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
