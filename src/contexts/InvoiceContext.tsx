'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice, InvoiceFilters, InvoiceItem, InvoiceFormData, Quotation } from '@/types';
import { generateInvoiceNumber } from '@/lib/utils';
import { convertQuotationToInvoice } from '@/lib/quotation-utils';

// Context Interface
interface InvoiceContextType {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  addInvoice: (invoice: InvoiceFormData) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  getFilteredInvoices: (filters?: InvoiceFilters) => Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;
  generateInvoiceNumber: () => string;
  markAsPaid: (id: string, amount: number) => Promise<Invoice>;
  updatePaymentStatus: (id: string, status: Invoice['status']) => Promise<Invoice>;
}

// Context Provider Props
interface InvoiceProviderProps {
  children: ReactNode;
}

// Create Context
export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

// Mock Data Generator
const generateMockInvoices = (): Invoice[] => {
  const mockInvoices: Invoice[] = [];

  // Generate 30 mock invoices
  for (let i = 1; i <= 30; i++) {
    const id = `inv-${Date.now()}-${i}`;
    const customerId = `cust-${Math.floor(Math.random() * 15) + 1}`;
    const status: Invoice['status'] = ['draft', 'pending', 'partial', 'paid', 'overdue'][Math.floor(Math.random() * 5)];
    const isPaid = status === 'paid' || status === 'partial';
    const amountPaid = isPaid ? Math.floor(Math.random() * 1000) + 500 : 0;
    const amountRemaining = isPaid ? 0 : Math.floor(Math.random() * 1000) + 500;

    const items: InvoiceItem[] = [];
    const itemCount = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < itemCount; j++) {
      items.push({
        id: `item-${Date.now()}-${j}`,
        description: `Service ${j + 1} - ${['Consulting', 'Development', 'Design', 'Maintenance', 'Support'][Math.floor(Math.random() * 5)]}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        unitPrice: Math.floor(Math.random() * 1000) + 100,
        taxRate: Math.random() > 0.5 ? 0.1 : 0,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 200) : 0,
        total: 0,
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const discount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const total = subtotal + tax - discount;

    mockInvoices.push({
      id,
      invoiceNumber: generateInvoiceNumber(),
      customerId,
      customerName: `Customer ${customerId.split('-')[1]}`,
      customerEmail: `customer${customerId.split('-')[1]}@example.com`,
      customerPhone: `+852-${Math.floor(Math.random() * 10000000)}`,
      items,
      currency: 'HKD',
      subtotal,
      tax,
      discount,
      total,
      paymentTerms: 'Due within 30 days',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status,
      issuedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      paidDate: isPaid ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) : undefined,
      amountPaid,
      amountRemaining,
    });
  }

  return mockInvoices;
};

// Create Provider
export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load mock invoices on mount
  useEffect(() => {
    try {
      setLoading(true);
      const mockInvoices = generateMockInvoices();
      setInvoices(mockInvoices);
      setError(null);
    } catch (err) {
      setError('Failed to load invoices');
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Invoice
  const addInvoice = async (invoiceData: InvoiceFormData | Invoice | Quotation): Promise<Invoice> => {
    try {
      setLoading(true);
      setError(null);

      let invoice: Invoice;

      // Handle different input types
      if ('items' in invoiceData && 'quotationNumber' in invoiceData) {
        // It's a Quotation - convert to Invoice
        const quotation = invoiceData as Quotation;
        invoice = convertQuotationToInvoice(quotation);
      } else if ('items' in invoiceData && 'customerId' in invoiceData) {
        // It's an Invoice object
        invoice = invoiceData as Invoice;
      } else {
        // It's InvoiceFormData - convert to Invoice
        const formData = invoiceData as InvoiceFormData;

        // Calculate totals
        const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * (formData.taxRate || 0);
        const discount = formData.items.reduce((sum, item) => sum + (item.discount || 0), 0);
        const total = subtotal + tax - discount;

        invoice = {
          id: `inv-${Date.now()}`,
          invoiceNumber: generateInvoiceNumber(),
          customerId: formData.customerId,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          items: formData.items,
          currency: formData.currency || 'HKD',
          subtotal,
          tax,
          discount,
          total,
          paymentTerms: formData.paymentTerms || 'Due within 30 days',
          dueDate: new Date(formData.dueDate),
          status: 'draft',
          issuedDate: new Date(formData.issuedDate),
          amountPaid: 0,
          amountRemaining: total,
        };
      }

      setInvoices([...invoices, invoice]);
      return invoice;
    } catch (err) {
      setError('Failed to create invoice');
      console.error('Error creating invoice:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update Invoice
  const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
    try {
      setLoading(true);
      setError(null);

      const updatedInvoices = invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      );

      setInvoices(updatedInvoices);

      // Return updated invoice
      return updatedInvoices.find((invoice) => invoice.id === id)!;
    } catch (err) {
      setError('Failed to update invoice');
      console.error('Error updating invoice:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete Invoice
  const deleteInvoice = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const updatedInvoices = invoices.filter((invoice) => invoice.id !== id);
      setInvoices(updatedInvoices);
    } catch (err) {
      setError('Failed to delete invoice');
      console.error('Error deleting invoice:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get Filtered Invoices
  const getFilteredInvoices = (filters?: InvoiceFilters): Invoice[] => {
    if (!filters) return invoices;

    return invoices.filter((invoice) => {
      // Filter by status
      if (filters.status && invoice.status !== filters.status) {
        return false;
      }

      // Filter by customer
      if (filters.customerId && invoice.customerId !== filters.customerId) {
        return false;
      }

      // Search by customer name or invoice number
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          invoice.customerName.toLowerCase().includes(searchLower) ||
          invoice.invoiceNumber.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  };

  // Get Invoice by ID
  const getInvoiceById = (id: string): Invoice | undefined => {
    return invoices.find((invoice) => invoice.id === id);
  };

  // Mark as Paid
  const markAsPaid = async (id: string, amount: number): Promise<Invoice> => {
    try {
      setLoading(true);
      setError(null);

      const updatedInvoices = invoices.map((invoice) => {
        if (invoice.id === id) {
          const newAmountPaid = (invoice.amountPaid || 0) + amount;
          const newAmountRemaining = invoice.total - newAmountPaid;

          // Determine new status
          let newStatus: Invoice['status'] = invoice.status;
          if (newAmountPaid >= invoice.total) {
            newStatus = 'paid';
          } else if (newAmountPaid > 0) {
            newStatus = 'partial';
          }

          return {
            ...invoice,
            amountPaid: newAmountPaid,
            amountRemaining: newAmountRemaining,
            status: newStatus,
            paidDate: newStatus === 'paid' ? new Date() : invoice.paidDate,
          };
        }
        return invoice;
      });

      setInvoices(updatedInvoices);

      return updatedInvoices.find((invoice) => invoice.id === id)!;
    } catch (err) {
      setError('Failed to mark invoice as paid');
      console.error('Error marking invoice as paid:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update Payment Status
  const updatePaymentStatus = async (id: string, status: Invoice['status']): Promise<Invoice> => {
    try {
      setLoading(true);
      setError(null);

      const updatedInvoices = invoices.map((invoice) => {
        if (invoice.id === id) {
          const isPaid = status === 'paid' || status === 'partial';
          return {
            ...invoice,
            status,
            paidDate: isPaid ? new Date() : invoice.paidDate,
            amountPaid: isPaid ? invoice.total : 0,
            amountRemaining: isPaid ? 0 : invoice.total,
          };
        }
        return invoice;
      });

      setInvoices(updatedInvoices);

      return updatedInvoices.find((invoice) => invoice.id === id)!;
    } catch (err) {
      setError('Failed to update payment status');
      console.error('Error updating payment status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Provider Value
  const value: InvoiceContextType = {
    invoices,
    loading,
    error,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getFilteredInvoices,
    getInvoiceById,
    generateInvoiceNumber,
    markAsPaid,
    updatePaymentStatus,
  };

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
};

// Custom Hook
export const useInvoices = (): InvoiceContextType => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};
